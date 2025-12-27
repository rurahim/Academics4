import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    // Verify the refresh token
    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Delete expired token
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } })
      }
      return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 })
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })

    // Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    })

    const newRefreshToken = await generateRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    })

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken)

    return NextResponse.json({ message: 'Token refreshed' })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
