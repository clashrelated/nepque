import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'
import { sendEmail, passwordResetEmailHtml } from '@/lib/email'

const schema = z.object({ email: z.string().email() })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    // Respond with 200 even if user not found (avoid user enumeration)
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 minutes

    // Remove previous reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: `pw:${user.id}` }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: `pw:${user.id}`,
        token,
        expires: expiresAt,
      },
    })

    // Always build an absolute URL. Prefer env, else derive from the request origin.
    const origin = new URL(request.url).origin
    const base = process.env.NEXT_PUBLIC_BASE_URL || origin
    const link = `${base.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`

    // Fire and forget
    try {
      void sendEmail({
        to: email,
        subject: 'Reset your NepQue password',
        html: passwordResetEmailHtml(link),
      })
    } catch (_) {}

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}


