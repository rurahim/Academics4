import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'volunteer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { userId: payload.userId },
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer profile not found' }, { status: 404 })
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        match: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.match.volunteerId !== volunteer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (session.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Session is not in scheduled status' },
        { status: 400 }
      )
    }

    // Update session status
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'completed' },
    })

    // Update volunteer hours
    if (session.durationMinutes) {
      await prisma.volunteer.update({
        where: { id: volunteer.id },
        data: {
          totalHoursVolunteered: {
            increment: Math.round(session.durationMinutes / 60 * 10) / 10,
          },
        },
      })
    }

    return NextResponse.json({
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
      },
    })
  } catch (error) {
    console.error('Error completing session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
