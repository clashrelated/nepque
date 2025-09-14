import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor') || ''

    const { blobs, cursor: nextCursor, hasMore } = await list({
      limit,
      cursor: cursor || undefined,
      prefix: folder ? `${folder}/` : undefined,
    })

    // Filter only image files
    const imageBlobs = blobs.filter(blob => {
      const contentType = blob.contentType || ''
      return contentType.startsWith('image/')
    })

    return NextResponse.json({
      success: true,
      data: {
        images: imageBlobs.map(blob => ({
          url: blob.url,
          filename: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          contentType: blob.contentType
        })),
        pagination: {
          hasMore,
          nextCursor: hasMore ? nextCursor : null
        }
      }
    })

  } catch (error) {
    console.error('List images error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch images' 
    }, { status: 500 })
  }
}
