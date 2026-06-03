import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import Property from '@/models/Property';

function getUserId(request: NextRequest): string | null {
  const header = request.headers.get('x-user-id');
  if (header) return header;
  const cookie = request.cookies.get('userData');
  if (cookie) {
    try { return JSON.parse(cookie.value).id; } catch {}
  }
  return null;
}

// GET - Fetch user's favorite properties
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    const propertyIds = favorites.map(fav => fav.propertyId);
    const properties = await Property.find({ _id: { $in: propertyIds } });

    return NextResponse.json({ success: true, count: properties.length, data: properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Add property to favorites
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { propertyId } = await request.json();
    await connectDB();

    const favorite = await Favorite.create({ userId, propertyId });
    return NextResponse.json({ success: true, data: favorite }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Property already in favorites' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE - Remove property from favorites
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID required' }, { status: 400 });
    }

    await connectDB();
    await Favorite.deleteOne({ userId, propertyId });

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
