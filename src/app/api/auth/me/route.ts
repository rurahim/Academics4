import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        volunteer: true,
        student: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
        isActive: user.isActive,
        hasProfile,
        volunteer: user.volunteer,
        student: user.student,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
