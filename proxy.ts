import { NextResponse, type NextRequest } from 'next/server'

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
 * Booking a lawyer lives at /talk-to-lawyer/<slug>/book — the directory and
 * profile pages above it must stay public so prospects can browse before
 * signing up.
 */
function isLawyerBookingPath(pathname: string): boolean {
  return /^\/talk-to-lawyer\/[^/]+\/book(\/|$)/.test(pathname)
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

  const guard = matchGuard(pathname)
  const needsClient = isLawyerBookingPath(pathname)
  if (!guard && !needsClient) return NextResponse.next()

  const allowedRoles: Role[] = guard ? guard.roles : ['client']

  const accessToken = request.cookies.get('lx_access_token')?.value
  if (!accessToken) return redirectToLogin(request, pathname)

  try {
    // Ask the backend to validate the token — it uses Supabase service_role internally
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // Short timeout so invalid sessions don't hang the page
      signal: AbortSignal.timeout(3000),
    })

    if (!res.ok) {
      // Token invalid or expired → back to login, and clear the stale cookies
      const response = redirectToLogin(request, pathname)
      response.cookies.delete('lx_access_token')
      response.cookies.delete('lx_refresh_token')
      return response
    }

    const body = await res.json().catch(() => null)
    const role = body?.user?.role as Role | undefined

    if (!role) return redirectToLogin(request, pathname)

    if (!allowedRoles.includes(role)) {
      // Signed in, wrong role. Send them to their own home rather than to
      // login, which would look like the session had broken.
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = HOME_FOR_ROLE[role] ?? '/'
      homeUrl.search = ''
      return NextResponse.redirect(homeUrl)
    }

    return NextResponse.next()
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
