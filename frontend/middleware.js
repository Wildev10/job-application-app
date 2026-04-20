import { NextResponse } from 'next/server';

/**
 * Protect admin and superadmin routes with dedicated auth cookies.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const companyToken = request.cookies.get('company_token')?.value;

    if (!companyToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/superadmin')) {
    const superAdminToken = request.cookies.get('sa_token')?.value;
    const isLoginRoute = pathname === '/superadmin/login';

    if (!superAdminToken && !isLoginRoute) {
      const loginUrl = new URL('/superadmin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (superAdminToken && isLoginRoute) {
      const dashboardUrl = new URL('/superadmin', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*'],
};
