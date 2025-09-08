import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coupons: true,
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        couponCount: category._count.coupons,
      }
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category' },
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
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: body.name,
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: 'Category name already exists' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        icon: body.icon,
        color: body.color,
        isActive: body.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            coupons: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        ...updatedCategory,
        couponCount: updatedCategory._count.coupons,
      }
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category' },
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            coupons: true,
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has associated coupons
    if (existingCategory._count.coupons > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete category. It has ${existingCategory._count.coupons} associated coupons. Please remove or reassign the coupons first.` 
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
