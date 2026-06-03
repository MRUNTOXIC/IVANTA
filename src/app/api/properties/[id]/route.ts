import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { checkAdminAuth } from '@/middleware/auth';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';

// DELETE - Delete a property (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const params = await context.params;
    const property = await Property.findByIdAndDelete(params.id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get single property (PUBLIC)
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const params = await context.params;
    const id = params.id;
    
    // Try to find by slug first, then by ID
    let property = await Property.findOne({ slug: id });
    
    if (!property) {
      // Try finding by MongoDB ID
      property = await Property.findById(id);
    }
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: property
    });
  } catch (error: any) {
    console.error('Get error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a property (ADMIN ONLY)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const params = await context.params;
    const body = await request.json();
    
    // Get existing property
    const existingProperty = await Property.findById(params.id);
    
    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // If title changed, regenerate slug
    if (body.title && body.title !== existingProperty.title) {
      const baseSlug = generateSlug(body.title);
      
      // Check for existing slugs (excluding current property)
      const existingProperties = await Property.find({ 
        slug: new RegExp(`^${baseSlug}(-\\d+)?$`),
        _id: { $ne: params.id }
      }).select('slug').lean();
      const existingSlugs = existingProperties.map((p: any) => p.slug);
      
      // Generate unique slug
      body.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }
    
    const property = await Property.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: property
    });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PATCH - Partially update a property (ADMIN ONLY for status updates)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const params = await context.params;
    const body = await request.json();
    
    const property = await Property.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: property
    });
  } catch (error: any) {
    console.error('Patch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
