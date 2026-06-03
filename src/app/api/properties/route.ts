import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import { checkAdminAuth, checkBuilderAuth } from '@/middleware/auth';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';

// GET - Fetch all properties (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const userEmail = searchParams.get('userEmail');
    const subdomain = searchParams.get('subdomain');
    const isAdmin = checkAdminAuth(request);
    
    let query: any = {};
    
    // Filter by subdomain if provided
    if (subdomain) {
      query.subdomain = subdomain;
      const properties = await Property.find(query).select('-__v').lean();
      return NextResponse.json(
        {
          success: true,
          count: properties.length,
          data: properties
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }
    
    // Filter by user email if provided
    if (userEmail) {
      query.userEmail = userEmail;
      // If status is 'all', don't filter by status
      if (status && status !== 'all') {
        query.status = status;
      }
    } else {
      // Admin can request all statuses with status=all
      if (isAdmin && status === 'all') {
        // no status filter
      } else if (status && status !== 'all') {
        query.status = status;
      } else {
        query.status = 'approved';
      }
    }
    
    if (type) {
      if (type === 'new') {
        query.isNewProject = true;
        query.propertyType = { $in: ['buy', 'commercial'] };
        if (!userEmail) {
          query.status = status || 'approved';
        }
      } else if (type === 'plots') {
        query.propertyType = 'plot';
        if (!userEmail) {
          query.status = status || 'approved';
        }
      } else {
        query.propertyType = type;
        if (!userEmail) {
          query.status = status || 'approved';
        }
      }
    }
    
    // Filter out properties sold more than 10 days ago (only for public listings)
    if (!userEmail) {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      query.$or = [
        { isSold: { $ne: true } },
        { isSold: true, soldDate: { $gte: tenDaysAgo } }
      ];
    }
    
    let queryBuilder = Property.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();
    
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }
    
    const properties = await queryBuilder.exec();
    
    return NextResponse.json(
      {
        success: true,
        count: properties.length,
        data: properties
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new property (ADMIN OR BUILDER)
export async function POST(request: NextRequest) {
  // Check admin or builder authentication
  const isAdmin = checkAdminAuth(request);
  const isBuilder = checkBuilderAuth(request);
  
  if (!isAdmin && !isBuilder) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin or Builder access required' },
      { status: 401 }
    );
  }
  
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('Received property data:', body);
    console.log('isNewProject value:', body.isNewProject);
    
    // Generate slug from title
    const baseSlug = generateSlug(body.title);
    
    // Check for existing slugs
    const existingProperties = await Property.find({ slug: new RegExp(`^${baseSlug}(-\\d+)?$`) }).select('slug').lean();
    const existingSlugs = existingProperties.map((p: any) => p.slug);
    
    // Generate unique slug
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
    
    // Add slug to property data
    body.slug = uniqueSlug;
    
    const property = await Property.create(body);
    console.log('Created property:', property);
    
    return NextResponse.json({
      success: true,
      data: property
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
