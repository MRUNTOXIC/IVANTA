import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { checkAdminAuth } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    
    // Get all properties
    const allProperties = await Property.find({}).lean();
    
    // Filter properties that need slugs
    const propertiesNeedingSlugs = allProperties.filter((p: any) => !p.slug || p.slug === '');
    
    if (propertiesNeedingSlugs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All properties already have slugs',
        data: {
          total: allProperties.length,
          updated: 0
        }
      });
    }

    // Get existing slugs
    const existingSlugs: string[] = allProperties
      .filter((p: any) => p.slug && p.slug !== '')
      .map((p: any) => p.slug);

    const updated: any[] = [];

    // Generate slugs for properties that need them
    for (const property of propertiesNeedingSlugs) {
      const baseSlug = generateSlug(property.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      existingSlugs.push(uniqueSlug);
      
      await Property.findByIdAndUpdate(property._id, { slug: uniqueSlug });
      
      updated.push({
        id: property._id,
        title: property.title,
        slug: uniqueSlug
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated slugs for ${updated.length} properties`,
      data: {
        total: allProperties.length,
        updated: updated.length,
        properties: updated
      }
    });
  } catch (error: any) {
    console.error('Slug generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
