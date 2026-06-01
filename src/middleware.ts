import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * Edge gate (layer 1 of defense in depth).
 *
 * Refreshes the Supabase session on every request and blocks unauthenticated
 * access to /dashboard before any server component runs. The deeper membership
 * check (does this user belong to THIS deployment's org/app?) happens
 * server-side in services/auth-guard.ts — that needs a DB read and runs in the
 * dashboard layout, not here.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  if (isDashboard && !user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and image optimization files so
     * the session stays fresh app-wide, while the redirect logic above only
     * targets /dashboard.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
