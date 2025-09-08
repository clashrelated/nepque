import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({ token: z.string().min(10), password: z.string().min(6) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = schema.parse(body)

    const vt = await prisma.verificationToken.findFirst({
      where: { token, identifier: { startsWith: 'pw:' } },
    })

    if (!vt || vt.expires < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 })
    }

    const userId = vt.identifier.replace('pw:', '')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    // Invalidate token(s)
    await prisma.verificationToken.deleteMany({ where: { identifier: `pw:${user.id}` } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}


