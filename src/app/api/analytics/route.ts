import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';

// POST - Track page visit
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sessionId, visitorId, page, entryTime, userAgent, referrer, device, browser } = body;
    
    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const analytics = await Analytics.create({
      sessionId,
      visitorId,
      page,
      entryTime: new Date(entryTime),
      userAgent,
      referrer,
      ipAddress,
      device,
      browser,
    });
    
    return NextResponse.json({
      success: true,
      data: analytics
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update page exit time and duration
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sessionId, page, exitTime } = body;
    
    // Find the most recent entry for this session and page
    const analytics = await Analytics.findOne({ 
      sessionId, 
      page,
      exitTime: { $exists: false }
    }).sort({ entryTime: -1 });
    
    if (analytics) {
      const exit = new Date(exitTime);
      const entry = new Date(analytics.entryTime);
      const duration = Math.floor((exit.getTime() - entry.getTime()) / 1000); // in seconds
      
      analytics.exitTime = exit;
      analytics.duration = duration;
      await analytics.save();
      
      return NextResponse.json({
        success: true,
        data: analytics
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Analytics entry not found'
    }, { status: 404 });
  } catch (error: any) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get analytics data (Admin or Builder)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '30');
    const email = searchParams.get('email'); // For builder-specific analytics
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    if (type === 'summary' || type === 'builder') {
      let pageFilter: any = {
        createdAt: { $gte: startDate },
        page: { $not: { $regex: '^/admin' } } // Exclude admin pages
      };
      
      // For builder analytics, filter by property pages of their properties
      if (type === 'builder' && email) {
        // Filter analytics for property detail pages of builder's properties
        pageFilter = {
          createdAt: { $gte: startDate },
          page: { $regex: '^/property/' }
        };
      }
      
      // Get summary statistics
      const totalVisits = await Analytics.countDocuments(pageFilter);
      
      const uniqueVisitors = await Analytics.distinct('visitorId', pageFilter);
      
      const avgDurationResult = await Analytics.aggregate([
        {
          $match: {
            ...pageFilter,
            duration: { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]);
      
      const avgDuration = avgDurationResult.length > 0 
        ? Math.floor(avgDurationResult[0].avgDuration) 
        : 0;
      
      const totalDuration = avgDurationResult.length > 0 
        ? avgDurationResult[0].totalDuration 
        : 0;
      
      // Get page views breakdown
      const pageViews = await Analytics.aggregate([
        {
          $match: pageFilter
        },
        {
          $group: {
            _id: '$page',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);
      
      // Get device breakdown
      const deviceBreakdown = await Analytics.aggregate([
        {
          $match: pageFilter
        },
        {
          $group: {
            _id: '$device',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Get daily visitors for chart
      const dailyVisitors = await Analytics.aggregate([
        {
          $match: pageFilter
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            visitors: { $addToSet: '$visitorId' },
            pageViews: { $sum: 1 }
          }
        },
        {
          $project: {
            date: '$_id',
            uniqueVisitors: { $size: '$visitors' },
            pageViews: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ]);
      
      // For builder, get top properties by views
      let topProperties: Array<{ _id: any; title: string; views: number }> = [];
      if (type === 'builder' && email) {
        const Property = (await import('@/models/Property')).default;
        const builderProperties = await Property.find({ userEmail: email, status: 'approved' }).select('_id title');
        
        // Get view counts for each property
        const propertyCounts = await Promise.all(
          builderProperties.map(async (prop) => {
            const count = await Analytics.countDocuments({
              createdAt: { $gte: startDate },
              page: `/property/${prop._id}`
            });
            return {
              _id: prop._id,
              title: prop.title,
              views: count
            };
          })
        );
        
        topProperties = propertyCounts.sort((a, b) => b.views - a.views).slice(0, 5);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          totalVisits,
          uniqueVisitors: uniqueVisitors.length,
          avgDuration,
          totalDuration,
          pageViews,
          deviceBreakdown,
          dailyVisitors,
          ...(type === 'builder' && { topProperties })
        }
      });
    }
    
    // Get all analytics data
    const analytics = await Analytics.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 }).limit(100);
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
