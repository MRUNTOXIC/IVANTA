import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userDataCookie = request.cookies.get('userData');
    const authCookie = request.cookies.get('userAuth');

    if (!authCookie || !userDataCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userDataCookie.value);

    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
