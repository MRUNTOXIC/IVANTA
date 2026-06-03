import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  const mainDomain = 'ivantaproperty';

  // Check if it's a subdomain (not www, not main domain, not localhost)
  if (
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== mainDomain &&
    !hostname.includes('localhost') &&
    !hostname.includes('127.0.0.1') &&
    pathname === '/' // Only handle root path of subdomain
  ) {
    // Redirect to subdomain handler on main domain
    const url = new URL(`https://ivantaproperty.com/property/subdomain/${subdomain}`);
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('userAuth');
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
