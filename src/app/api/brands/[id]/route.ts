import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use raw select to guarantee SEO fields are returned even if Prisma Client is stale
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logo: string | null;
        website: string | null;
        isActive: boolean;
        sponsored: boolean;
        sponsorWeight: number;
        seoTitle: string | null;
        seoDescription: string | null;
        seoKeywords: string | null;
        ogImage: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`SELECT id, name, slug, description, logo, website, "isActive", sponsored, "sponsorWeight", "seoTitle", "seoDescription", "seoKeywords", "ogImage", "createdAt", "updatedAt" FROM "brands" WHERE id = ${id} LIMIT 1`;

    const [row] = rows as any[];
    const count = await prisma.coupon.count({ where: { brandId: id } });

    if (!row) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...row, _count: { coupons: count }, couponCount: count }
    });

  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Brand name is required' },
        { status: 400 }
      );
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if another brand with the same name exists (excluding current brand)
    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        name: body.name,
        id: { not: id }
      }
    });

    if (duplicateBrand) {
      return NextResponse.json(
        { success: false, message: 'Brand name already exists' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Update brand with SEO fields; fallback if client is stale
    let updatedBrand
    try {
      updatedBrand = await prisma.brand.update({
        where: { id },
        data: {
          name: body.name,
          slug,
          description: body.description,
          logo: body.logo,
          website: body.website,
          isActive: body.isActive ?? true,
          sponsored: body.sponsored ?? false,
          sponsorWeight: body.sponsorWeight !== undefined ? (Number(body.sponsorWeight) || 0) : undefined,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          seoKeywords: body.seoKeywords,
          ogImage: body.ogImage,
        },
        include: {
          _count: { select: { coupons: true } }
        }
      })
    } catch (e) {
      // Retry without SEO fields (older Prisma Client scenario)
      updatedBrand = await prisma.brand.update({
        where: { id },
        data: {
          name: body.name,
          slug,
          description: body.description,
          logo: body.logo,
          website: body.website,
          isActive: body.isActive ?? true,
          sponsored: body.sponsored ?? false,
          sponsorWeight: body.sponsorWeight !== undefined ? (Number(body.sponsorWeight) || 0) : undefined,
        },
        include: {
          _count: { select: { coupons: true } }
        }
      })

      // Force-update SEO columns using parameterized raw queries (one per field)
      if (body.seoTitle !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoTitle" = ${body.seoTitle} WHERE "id" = ${id}`
      }
      if (body.seoDescription !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoDescription" = ${body.seoDescription} WHERE "id" = ${id}`
      }
      if (body.seoKeywords !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "seoKeywords" = ${body.seoKeywords} WHERE "id" = ${id}`
      }
      if (body.ogImage !== undefined) {
        await prisma.$executeRaw`UPDATE "brands" SET "ogImage" = ${body.ogImage} WHERE "id" = ${id}`
      }
    }

    // Re-fetch to ensure SEO fields reflect latest values (including raw update path)
    const fresh = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { coupons: true } } }
    })

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      data: fresh ? { ...fresh, couponCount: fresh._count.coupons } : { ...updatedBrand, couponCount: updatedBrand._count.coupons }
    });

  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coupons: true,
          }
        }
      }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    // Delete all associated coupons first (favorite/usages cascade on coupon delete)
    await prisma.coupon.deleteMany({ where: { brandId: id } })

    // Delete brand
    await prisma.brand.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Brand and associated coupons deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
