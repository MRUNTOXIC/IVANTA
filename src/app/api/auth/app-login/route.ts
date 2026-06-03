import { NextRequest, NextResponse } from 'next/server';
import { consumeAppToken } from '@/lib/appTokenStore';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', baseUrl));
  }

  const userData = consumeAppToken(token);

  if (!userData) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl));
  }

  const response = NextResponse.redirect(new URL('/dashboard', baseUrl));

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 365 * 10,
    path: '/',
  };

  response.cookies.set('userAuth', 'true', cookieOptions);
  response.cookies.set('userLoggedIn', 'true', { ...cookieOptions, httpOnly: false });
  response.cookies.set('userData', JSON.stringify(userData), cookieOptions);

  return response;
}
