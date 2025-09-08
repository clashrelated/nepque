import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail, welcomeEmailHtml } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, and password are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters',
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        name,
        email,
        ...(phone ? { phone } : {}),
        password: hashedPassword, // Store the hashed password
        role: 'USER',
      }
    })

    // Fire-and-forget welcome email
    try {
      void sendEmail({
        to: user.email,
        subject: 'Welcome to NepQue 🎉',
        html: welcomeEmailHtml(user.name || undefined),
      })
    } catch (_) {
      // ignore email errors
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create account',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
