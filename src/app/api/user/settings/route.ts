import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        settings: user.settings || {}
      }
    })

  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { settings },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        settings: true 
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      data: {
        settings: updatedUser.settings
      }
    })

  } catch (error) {
    console.error('Error saving user settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
