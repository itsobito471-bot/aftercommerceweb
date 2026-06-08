import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Routing Middleware
 * Guards administrative panels by screening incoming requests for authorization cookies
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the token from request cookies
  const token = request.cookies.get('admin_token')?.value;

  // Guard any route starting with /admin (excluding login paths)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin-login') {
    if (!token) {
      // Redirect to admin login screen
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from the login page to the dashboard root
  if ((pathname === '/admin-login' || pathname === '/admin/login') && token) {
    const dashboardUrl = new URL('/admin', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

/**
 * Route Matcher Configuration
 * Specifies paths on which this middleware will execute
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-login',
    '/admin/login',
  ],
};
