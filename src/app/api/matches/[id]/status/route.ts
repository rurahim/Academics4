import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const validStatuses = [
  'auto_suggested',
  'pending_email',
  'email_sent',
  'accepted',
  'active',
  'rejected',
  'not_compatible',
  'completed',
  'paused',
]

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check if match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: {
        volunteer: true,
      },
    })

    if (!existingMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Update volunteer capacity based on status change
    const wasActive = ['accepted', 'active'].includes(existingMatch.status)
    const willBeActive = ['accepted', 'active'].includes(status)
    const wasInactive = ['rejected', 'not_compatible', 'completed', 'paused'].includes(existingMatch.status)
    const willBeInactive = ['rejected', 'not_compatible', 'completed', 'paused'].includes(status)

    let capacityChange = 0
    if (!wasActive && willBeActive) {
      // Becoming active - increase capacity
      capacityChange = 1
    } else if (wasActive && willBeInactive) {
      // Becoming inactive - decrease capacity
      capacityChange = -1
    }

    // Update match and optionally volunteer capacity
    const match = await prisma.match.update({
      where: { id },
      data: {
        status,
        adminNotes,
        adminId: session.userId,
        // Set start date when becoming active
        ...(willBeActive && !existingMatch.startDate ? { startDate: new Date() } : {}),
        // Set end date when completing
        ...(status === 'completed' && !existingMatch.endDate ? { endDate: new Date() } : {}),
      },
      include: {
        student: true,
        volunteer: true,
      },
    })

    // Update volunteer capacity if needed
    if (capacityChange !== 0) {
      await prisma.volunteer.update({
        where: { id: existingMatch.volunteerId },
        data: {
          currentCapacity: {
            increment: capacityChange,
          },
          ...(capacityChange === 1 ? { studentsHelped: { increment: 1 } } : {}),
        },
      })
    }

    return NextResponse.json({ match, message: 'Status updated successfully' })
  } catch (error) {
    console.error('Update match status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
