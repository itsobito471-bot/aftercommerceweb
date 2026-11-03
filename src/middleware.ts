import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Routing Middleware
 * Guards administrative panels and redirects authenticated users from login/onboarding to dashboard
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve tokens from request cookies
  const adminToken = request.cookies.get('admin_token')?.value;
  const studentToken = request.cookies.get('student_token')?.value;

  // Guard any route starting with /admin (excluding login paths)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin-login') {
    if (!adminToken) {
      // Redirect to admin login screen
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from the login page to the dashboard root
  if ((pathname === '/admin-login' || pathname === '/admin/login') && adminToken) {
    const dashboardUrl = new URL('/admin', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // When manually navigating to /onboarding, check if an authenticated user token is available and valid
  if (pathname === '/onboarding') {
    if (adminToken) {
      try {
        const payloadBase64 = adminToken.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          // If token is valid and not expired, revert to admin dashboard
          if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
        }
      } catch {
        // Corrupted token, allow page-level handler to clean up
      }
    }

    if (studentToken) {
      try {
        const payloadBase64 = studentToken.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          // If token is valid and not expired
          if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
            if (decoded.role === 'admin' || decoded.role === 'staff') {
              const res = NextResponse.redirect(new URL('/admin', request.url));
              res.cookies.set('admin_token', studentToken, { path: '/', maxAge: 604800, sameSite: 'lax' });
              return res;
            } else {
              return NextResponse.redirect(new URL('/', request.url));
            }
          }
        }
      } catch {
        // Corrupted token
      }
    }
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
    '/onboarding',
  ],
};
