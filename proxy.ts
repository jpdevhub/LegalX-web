import { NextResponse, type NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
const PROTECTED_ROUTES = ['/admin', '/dashboard']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run auth check on protected routes
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  // Forward the HttpOnly cookie to the backend for validation
  const accessToken = request.cookies.get('lx_access_token')?.value

  if (!accessToken) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(loginUrl)
  }

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
      // Token invalid or expired → redirect to login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect_to', pathname)
      const response = NextResponse.redirect(loginUrl)
      // Clear stale cookies
      response.cookies.delete('lx_access_token')
      response.cookies.delete('lx_refresh_token')
      return response
    }

    // Token valid — allow the request through
    return NextResponse.next()
  } catch {
    // Backend unreachable — fail open in dev, fail closed in production
    if (process.env.NODE_ENV === 'production') {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect_to', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Dev: let through so the admin UI is testable without a running backend
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
