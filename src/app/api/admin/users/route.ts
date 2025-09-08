import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withSecurity } from '@/lib/security';

export const GET = withSecurity(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role') || 'all';
      const status = searchParams.get('status') || 'all';
      const limit = 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role !== 'all') {
        where.role = role;
      }

      if (status !== 'all') {
        where.isActive = status === 'active';
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                favoriteCoupons: true,
                couponUsages: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        users,
        total,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  },
  {
    requireAdmin: true,
    rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 }
  }
)
