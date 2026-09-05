import { NextResponse, type NextRequest } from 'next/server'
import { isGone } from '@/lib/gonePaths'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

type Role = 'client' | 'lawyer' | 'admin'

/**
 * Route protection map. Each entry guards a path prefix and lists the roles
 * allowed through. Order matters: the first matching prefix wins, so more
 * specific paths must come before their parents.
 *
 * This is a UX guard, not the security boundary — every /api route enforces its
 * own auth server-side. Its job is to stop someone filling in a booking form
 * they can never submit.
 */
const GUARDED: { prefix: string; roles: Role[] }[] = [
  { prefix: '/admin',            roles: ['admin'] },
  { prefix: '/lawyer-dashboard', roles: ['lawyer'] },
  { prefix: '/onboarding/lawyer',roles: ['lawyer'] },
  // Both parties need to reach the call room.
  { prefix: '/consultation',     roles: ['client', 'lawyer'] },
  // Booking flows — clients only. A lawyer cannot buy their own services.
  { prefix: '/request',          roles: ['client'] },
  { prefix: '/book',             roles: ['client'] },
]

/** Where to send someone who is signed in but holds the wrong role. */
const HOME_FOR_ROLE: Record<Role, string> = {
  admin: '/admin',
  lawyer: '/lawyer-dashboard',
  client: '/',
}

function matchGuard(pathname: string) {
  return GUARDED.find(g => pathname === g.prefix || pathname.startsWith(g.prefix + '/'))
}

/**
 * Withdrawn pages answer 410 Gone.
 *
 * A 404 says "not here right now" and is re-checked for months; a 410 says
 * "gone" and is dropped far faster. Unpublishing the card alone would only ever
 * produce a 404, which is why this sits in front of the route rather than being
 * left to the card page's notFound().
 */
function goneResponse(): NextResponse {
  return new NextResponse(
    '<!doctype html><meta charset="utf-8"><title>Page removed</title>' +
    '<p>This page has been permanently removed. ' +
    '<a href="/knowledge-center">Browse the Knowledge Center</a>.</p>',
    {
      status: 410,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Crawlers and the CDN should not keep serving a cached 200 for it.
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    }
  )
}

/**
 * Booking a lawyer lives at /talk-to-lawyer/<slug>/book — the directory and
 * profile pages above it must stay public so prospects can browse before
 * signing up.
 */
function isLawyerBookingPath(pathname: string): boolean {
  return /^\/talk-to-lawyer\/[^/]+\/book(\/|$)/.test(pathname)
}

/**
 * Replays Set-Cookie headers from a refresh onto the outgoing response, so the
 * browser stores the rotated tokens rather than retrying with the expired ones.
 */
function withRefreshedCookies(response: NextResponse, cookies: string[]): NextResponse {
  for (const cookie of cookies) response.headers.append('set-cookie', cookie)
  return response
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = ''
  // Preserve the full path *and* query so the user lands back exactly where
  // they were — a booking URL without its query is a different page.
  loginUrl.searchParams.set('redirect_to', pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Before anything else: withdrawn pages answer 410 whether or not the card
  // still exists in the database.
  if (isGone(pathname)) return goneResponse()

  const guard = matchGuard(pathname)
  const needsClient = isLawyerBookingPath(pathname)
  if (!guard && !needsClient) return NextResponse.next()

  const allowedRoles: Role[] = guard ? guard.roles : ['client']

  const accessToken = request.cookies.get('lx_access_token')?.value
  const refreshToken = request.cookies.get('lx_refresh_token')?.value

  // Only truly anonymous if BOTH are gone. Bailing on a missing access token
  // alone stranded users whose access cookie had expired while a perfectly
  // valid refresh token sat unused beside it.
  if (!accessToken && !refreshToken) return redirectToLogin(request, pathname)

  try {
    let authRes: Response
    if (accessToken) {
      // Ask the backend to validate the token — it uses Supabase service_role internally
      authRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        // Short timeout so invalid sessions don't hang the page
        signal: AbortSignal.timeout(3000),
      })
    } else {
      // No access token, but a refresh token exists — go straight to refresh.
      authRes = new Response(null, { status: 401 })
    }
    // Access tokens expire hourly. Before bouncing someone to login, spend the
    // refresh cookie — otherwise navigating after an hour idle looks like the
    // session broke, even though the refresh token is still valid for 30 days.
    let refreshedCookies: string[] = []
    if (!authRes.ok && refreshToken) {
      const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: `lx_refresh_token=${refreshToken}` },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null)

      if (refreshRes?.ok) {
        // Carry the rotated cookies back to the browser, or the next request
        // arrives with the same expired token and refreshes all over again.
        refreshedCookies = refreshRes.headers.getSetCookie?.() ?? []
        authRes = refreshRes
      }
    }

    if (!authRes.ok) {
      // Genuinely signed out → back to login, and clear the stale cookies
      const response = redirectToLogin(request, pathname)
      response.cookies.delete('lx_access_token')
      response.cookies.delete('lx_refresh_token')
      return response
    }

    const body = await authRes.json().catch(() => null)
    const role = body?.user?.role as Role | undefined

    if (!role) return redirectToLogin(request, pathname)

    if (!allowedRoles.includes(role)) {
      // Signed in, wrong role. Send them to their own home rather than to
      // login, which would look like the session had broken.
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = HOME_FOR_ROLE[role] ?? '/'
      homeUrl.search = ''
      return withRefreshedCookies(NextResponse.redirect(homeUrl), refreshedCookies)
    }

    return withRefreshedCookies(NextResponse.next(), refreshedCookies)
  } catch {
    // Backend unreachable — fail open in dev, fail closed in production
    if (process.env.NODE_ENV === 'production') {
      return redirectToLogin(request, pathname)
    }
    // Dev: let through so the UI is testable without a running backend
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
