import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const user = await User.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If the user being updated is currently logged in, update their cookie
    const userDataCookie = request.cookies.get('userData');
    if (userDataCookie) {
      try {
        const currentUserData = JSON.parse(userDataCookie.value);
        // Check if the updated user is the currently logged-in user
        if (currentUserData.email === user.email) {
          // Update the userData cookie with new role
          const response = NextResponse.json({
            success: true,
            data: user
          });
          
          response.cookies.set('userData', JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
          }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          });
          
          return response;
        }
      } catch (e) {
        // Cookie parsing failed, continue without updating
      }
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
