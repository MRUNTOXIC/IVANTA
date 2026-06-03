import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { checkAdminAuth } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

// POST - Mark property as sold
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const params = await context.params;
    const isAdmin = checkAdminAuth(request);
    const body = await request.json().catch(() => ({}));
    const userEmail = body?.userEmail ? String(body.userEmail) : null;
    
    // Find the property
    const property = await Property.findById(params.id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Admin can mark any property as sold, otherwise enforce ownership
    if (!isAdmin && (!userEmail || property.userEmail !== userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - You can only mark your own properties as sold' },
        { status: 403 }
      );
    }
    
    // Mark as sold
    property.isSold = true;
    property.soldDate = new Date();
    await property.save();
    
    return NextResponse.json({
      success: true,
      message: 'Property marked as sold successfully',
      data: property
    });
  } catch (error: any) {
    console.error('Mark as sold error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Unmark property as sold (optional - for undo)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const params = await context.params;
    const isAdmin = checkAdminAuth(request);
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    // Find the property
    const property = await Property.findById(params.id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Admin can unmark any property as sold, otherwise enforce ownership
    if (!isAdmin && property.userEmail !== userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - You can only unmark your own properties' },
        { status: 403 }
      );
    }
    
    // Unmark as sold
    property.isSold = false;
    property.soldDate = undefined;
    await property.save();
    
    return NextResponse.json({
      success: true,
      message: 'Property unmarked as sold successfully',
      data: property
    });
  } catch (error: any) {
    console.error('Unmark as sold error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
