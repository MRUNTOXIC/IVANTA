import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    const dbStatus = mongoose.connection.readyState;
    const statusMap: { [key: number]: string } = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection test',
      status: statusMap[dbStatus],
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'MongoDB connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
