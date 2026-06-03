import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { checkAdminAuth } from '@/middleware/auth';

// GET - Fetch settings (PUBLIC)
export async function GET() {
  try {
    await connectDB();
    
    let settings = await Settings.findOne();
    
    // If no settings exist, create default with Nana Mava
    if (!settings) {
      settings = await Settings.create({ areas: ['Nana Mava'], landmarks: [] });
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings (ADMIN ONLY)
export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const body = await request.json();
    const { areas, landmarks } = body;
    
    console.log('Received settings update:', { areas, landmarks });
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ areas: areas || [], landmarks: landmarks || [] });
      console.log('Created new settings:', settings);
    } else {
      settings.areas = areas || [];
      settings.landmarks = landmarks || [];
      await settings.save();
      console.log('Updated settings:', settings);
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
