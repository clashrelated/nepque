import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSchemas } from '@/lib/validation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchemas.create.parse(body)

    await prisma.contactSubmission.create({
      data: {
        type: data.type as any,
        name: data.name,
        email: data.email,
        company: data.company,
        message: data.message,
        budget: data.budget,
        goals: data.goals
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.issues) {
      const msg = JSON.stringify(error.issues)
      return NextResponse.json({ success: false, message: msg }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: error?.message || 'Failed to submit' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  // Admin-only listing
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'CONTACT' | 'PARTNER' | null

  const where = type ? { type } : {}
  const items = await prisma.contactSubmission.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ success: true, data: items })
}


