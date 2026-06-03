import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SEO from '@/models/SEO';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get('pageUrl');
    
    if (pageUrl) {
      const seoData = await SEO.findOne({ pageUrl });
      return NextResponse.json({ success: true, data: seoData });
    }
    
    const allSEO = await SEO.find({}).sort({ pageName: 1 });
    return NextResponse.json({ success: true, data: allSEO });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const seoData = new SEO(body);
    await seoData.save();
    
    return NextResponse.json({ success: true, data: seoData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    const seoData = await SEO.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!seoData) {
      return NextResponse.json({ success: false, error: 'SEO data not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: seoData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    await SEO.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
