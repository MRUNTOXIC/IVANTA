import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAuth } from '@/middleware/auth';

// GET - Fetch all users (ADMIN ONLY)
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new user (PUBLIC - for registration)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const user = await User.create(body);
    
    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
