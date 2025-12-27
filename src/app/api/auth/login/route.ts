import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        volunteer: true,
        student: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }

    // Skip password verification in development
    const isValid = await verifyPassword(validatedData.password, user.passwordHash)
    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Set cookies
    await setAuthCookies(accessToken, refreshToken)

    // Determine if profile is complete
    const hasProfile =
      (user.role === 'volunteer' && user.volunteer !== null) ||
      (user.role === 'student' && user.student !== null) ||
      user.role === 'admin'

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        hasProfile,
        volunteer: user.volunteer,
        student: user.student,
      },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
