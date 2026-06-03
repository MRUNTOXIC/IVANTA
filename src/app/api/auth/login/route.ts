import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { storeAppToken } from '@/lib/appTokenStore';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, isApp } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // ── Demo accounts ─────────────────────────────────────────────────────
    const DEMO_ACCOUNTS: Record<string, { name: string; role: string; password: string }> = {
      'user@ivanta.demo':    { name: 'Demo User',    role: 'User',    password: 'user123' },
      'broker@ivanta.demo':  { name: 'Demo Broker',  role: 'Broker',  password: 'broker123' },
      'builder@ivanta.demo': { name: 'Demo Builder', role: 'Builder', password: 'builder123' },
    };
    const demo = DEMO_ACCOUNTS[email.toLowerCase()];
    if (demo) {
      if (password && password !== demo.password) {
        return NextResponse.json({ success: false, error: 'Invalid password for demo account' }, { status: 401 });
      }
      const userData = { id: `demo-${demo.role.toLowerCase()}`, email: email.toLowerCase(), name: demo.name, role: demo.role };
      if (isApp) {
        const token = randomBytes(32).toString('hex');
        storeAppToken(token, userData);
        return NextResponse.json({ success: true, isApp: true, token });
      }
      const response = NextResponse.json({ success: true, userData });
      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 365, path: '/' };
      response.cookies.set('userAuth', 'true', cookieOptions);
      response.cookies.set('userLoggedIn', 'true', { ...cookieOptions, httpOnly: false });
      response.cookies.set('userData', JSON.stringify(userData), cookieOptions);
      return response;
    }
    // ─────────────────────────────────────────────────────────────────────

    await connectDB();
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register for easy local testing
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role: role || 'User',
        status: 'Active'
      });
    }

    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    if (isApp) {
      const token = randomBytes(32).toString('hex');
      storeAppToken(token, userData);
      return NextResponse.json({ success: true, isApp: true, token });
    }

    // Set cookies for web users
    const response = NextResponse.json({ success: true, userData });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      path: '/',
    };
    response.cookies.set('userAuth', 'true', cookieOptions);
    response.cookies.set('userLoggedIn', 'true', { ...cookieOptions, httpOnly: false });
    response.cookies.set('userData', JSON.stringify(userData), cookieOptions);

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
