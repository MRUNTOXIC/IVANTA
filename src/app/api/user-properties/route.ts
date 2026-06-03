import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find properties submitted by this user (with or without userEmail field)
    const properties = await Property.find({ 
      $or: [
        { submittedBy: 'user', userEmail: email },
        { submittedBy: 'user', userEmail: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch (error: any) {
    console.error('Error fetching user properties:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Check property limits for User and Broker roles
    if (body.userEmail) {
      // Get user role from cookies
      const userDataCookie = request.cookies.get('userData');
      if (userDataCookie) {
        try {
          const userData = JSON.parse(userDataCookie.value);
          const userRole = userData.role;
          
          // Count active (non-sold) properties for this user
          const activePropertiesCount = await Property.countDocuments({
            userEmail: body.userEmail,
            $or: [
              { isSold: { $ne: true } },
              { isSold: true, soldDate: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } } // Sold within last 10 days
            ]
          });
          
          // Check limits based on role
          if (userRole === 'User' && activePropertiesCount >= 1) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Property limit reached. Users can only post 1 active property. Please mark your existing property as sold before posting a new one.' 
              },
              { status: 403 }
            );
          }
          
          if (userRole === 'Broker' && activePropertiesCount >= 10) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Property limit reached. Brokers can post up to 10 active properties. Please mark some properties as sold before posting new ones.' 
              },
              { status: 403 }
            );
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    // Set status as pending for user submissions
    const propertyData = {
      ...body,
      status: 'pending',
      submittedBy: 'user'
    };

    const property = await Property.create(propertyData);

    return NextResponse.json({
      success: true,
      message: 'Property submitted for approval',
      data: property,
    });
  } catch (error: any) {
    console.error('Error submitting property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit property' },
      { status: 500 }
    );
  }
}
