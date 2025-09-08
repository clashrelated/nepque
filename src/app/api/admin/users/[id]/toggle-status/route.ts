import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { isActive } = await request.json();

    // Prevent admin from deactivating themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account status' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
