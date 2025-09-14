import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate that it's a Vercel Blob URL
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json({ 
        error: 'Only Vercel Blob images can be deleted' 
      }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete image. Please try again.' 
    }, { status: 500 })
  }
}
