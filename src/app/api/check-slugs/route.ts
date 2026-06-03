import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET() {
  try {
    await connectDB();
    
    const totalProperties = await Property.countDocuments();
    const propertiesWithSlugs = await Property.countDocuments({ slug: { $exists: true, $ne: '' } });
    const propertiesWithoutSlugs = totalProperties - propertiesWithSlugs;
    
    // Get sample properties
    const sampleWithSlug = await Property.findOne({ slug: { $exists: true, $ne: '' } })
      .select('_id title slug')
      .lean();
    
    const sampleWithoutSlug = await Property.findOne({ $or: [{ slug: { $exists: false } }, { slug: '' }] })
      .select('_id title slug')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        totalProperties,
        propertiesWithSlugs,
        propertiesWithoutSlugs,
        samples: {
          withSlug: sampleWithSlug,
          withoutSlug: sampleWithoutSlug
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
