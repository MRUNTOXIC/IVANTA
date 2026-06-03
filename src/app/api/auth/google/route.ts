import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;
  
  if (!googleClientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const role = request.nextUrl.searchParams.get('role') || 'User';
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard';
  const source = request.nextUrl.searchParams.get('source') || '';
  const state = Buffer.from(JSON.stringify({ role, returnTo, source })).toString('base64');

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(googleAuthUrl);
}
