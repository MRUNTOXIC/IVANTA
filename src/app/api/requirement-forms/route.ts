import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RequirementForm from '@/models/RequirementForm';
import { checkAdminAuth } from '@/middleware/auth';

// GET - Fetch all requirement forms (ADMIN ONLY)
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    
    const forms = await RequirementForm.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    return NextResponse.json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new requirement form (PUBLIC)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('Received requirement form:', body);
    
    const form = await RequirementForm.create(body);
    console.log('Created requirement form:', form);
    
    return NextResponse.json({
      success: true,
      data: form
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating requirement form:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
