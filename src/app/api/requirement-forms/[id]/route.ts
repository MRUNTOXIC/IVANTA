import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RequirementForm from '@/models/RequirementForm';
import { checkAdminAuth } from '@/middleware/auth';

// DELETE - Delete requirement form (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    
    const form = await RequirementForm.findByIdAndDelete(params.id);
    
    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Requirement form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Requirement form deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting requirement form:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
