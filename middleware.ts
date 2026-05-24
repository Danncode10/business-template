import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const PROTECTED_ROUTES = ['/dashboard']
const AUTH_ROUTES = ['/login', '/signup']
const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? 'business-template'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // Unauthenticated → protected route: redirect to /login?next=<path>
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    const redirect = NextResponse.redirect(url)
    // Copy refreshed session cookies and x-app-id header
    response.cookies.getAll().forEach(c => redirect.cookies.set(c.name, c.value))
    redirect.headers.set('x-app-id', APP_ID)
    return redirect
  }

  // Authenticated → auth route: redirect to /dashboard
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach(c => redirect.cookies.set(c.name, c.value))
    redirect.headers.set('x-app-id', APP_ID)
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
