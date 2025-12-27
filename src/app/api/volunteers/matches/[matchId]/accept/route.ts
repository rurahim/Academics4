import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
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

    const { matchId } = await params

    // Verify this match belongs to this volunteer
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        volunteerId: volunteer.id,
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (!['email_sent', 'pending_email', 'auto_suggested'].includes(match.status)) {
      return NextResponse.json({ error: 'Match cannot be accepted in current status' }, { status: 400 })
    }

    // Update match status to active
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'active' },
    })

    // Update volunteer's current capacity
    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: {
        currentCapacity: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, message: 'Match accepted' })
  } catch (error) {
    console.error('Error accepting match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
