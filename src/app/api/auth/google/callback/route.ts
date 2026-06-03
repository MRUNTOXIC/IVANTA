import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { storeAppToken } from '@/lib/appTokenStore';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  // Extract role from state
  let selectedRole = 'User';
  let returnTo = '/dashboard';
  let source = '';
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(decodeURIComponent(stateParam), 'base64').toString());
      if (['User', 'Broker', 'Builder'].includes(decoded.role)) {
        selectedRole = decoded.role;
      }
      if (decoded.returnTo && decoded.returnTo.startsWith('/')) {
        returnTo = decoded.returnTo;
      }
      if (decoded.source) {
        source = decoded.source;
      }
    } catch {}
  }

  const isApp = source === 'app';

  if (error) {
    if (isApp) return NextResponse.redirect('ivanta-properties://callback?error=google_auth_failed');
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', baseUrl));
  }

  if (!code) {
    if (isApp) return NextResponse.redirect('ivanta-properties://callback?error=no_code');
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl));
  }

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
    }

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    // Save or update user in database
    await connectDB();
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      user = await User.create({
        name: userInfo.name,
        email: userInfo.email,
        role: selectedRole,
        status: 'Active'
      });
      console.log(`New user created with ${selectedRole} role:`, user._id);
    } else {
      console.log('Existing user found:', user._id);
    }

    // Redirect to app or web dashboard
    const userData = {
      id: user._id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      role: user.role
    };

    let redirectUrl: string;
    if (isApp) {
      // Generate one-time token so WebView can set cookies
      const token = randomBytes(32).toString('hex');
      storeAppToken(token, userData);
      redirectUrl = `ivanta-properties://callback?token=${token}`;
    } else {
      redirectUrl = new URL(returnTo, baseUrl).toString();
    }

    const response = NextResponse.redirect(redirectUrl);

    // Set cookies for web users only — app users get cookies via /api/auth/app-login
    if (!isApp) {
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
    }

    return response;
  } catch {
    if (isApp) return NextResponse.redirect('ivanta-properties://callback?error=auth_failed');
    return NextResponse.redirect(new URL('/login?error=auth_failed', baseUrl));
  }
}
