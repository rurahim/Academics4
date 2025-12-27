import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'

const capacitySchema = z.object({
  maxCapacity: z.number().min(1).max(10).optional(),
  isLocked: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: volunteerId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = capacitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid capacity value' },
        { status: 400 }
      )
    }

    const { maxCapacity, isLocked } = validation.data

    // Get current volunteer to check capacity
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    // Cannot set max capacity below current capacity
    if (maxCapacity !== undefined && maxCapacity < volunteer.currentCapacity) {
      return NextResponse.json(
        { error: 'Cannot set max capacity below current number of students' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (maxCapacity !== undefined) {
      updateData.maxCapacity = maxCapacity
      updateData.capacitySetBy = 'admin'
    }

    if (isLocked !== undefined) {
      updateData.capacitySetBy = isLocked ? 'admin' : 'volunteer'
    }

    const updatedVolunteer = await prisma.volunteer.update({
      where: { id: volunteerId },
      data: updateData,
    })

    return NextResponse.json({
      volunteer: {
        id: updatedVolunteer.id,
        maxCapacity: updatedVolunteer.maxCapacity,
        currentCapacity: updatedVolunteer.currentCapacity,
        capacitySetBy: updatedVolunteer.capacitySetBy,
        isLocked: updatedVolunteer.capacitySetBy === 'admin',
      },
    })
  } catch (error) {
    console.error('Error updating volunteer capacity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
