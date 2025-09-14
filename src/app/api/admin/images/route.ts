import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

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

    // Filter only image files based on file extension
    const imageBlobs = blobs.filter(blob => {
      const filename = blob.pathname.toLowerCase()
      return filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
    })

    return NextResponse.json({
      success: true,
      data: {
        images: imageBlobs.map(blob => ({
          url: blob.url,
          filename: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          contentType: getContentTypeFromFilename(blob.pathname)
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
