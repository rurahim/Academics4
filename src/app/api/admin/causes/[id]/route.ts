import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'

const updateCauseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  region: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
})

// GET - Get a single cause
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cause = await prisma.cause.findUnique({
      where: { id },
    })

    if (!cause) {
      return NextResponse.json({ error: 'Cause not found' }, { status: 404 })
    }

    // Get stats
    const [studentCount, volunteerCount, matchCount] = await Promise.all([
      prisma.student.count({ where: { cause: cause.name } }),
      prisma.volunteer.count({ where: { causes: { has: cause.name } } }),
      prisma.match.count({
        where: {
          student: { cause: cause.name },
        },
      }),
    ])

    return NextResponse.json({
      cause: {
        ...cause,
        studentCount,
        volunteerCount,
        matchCount,
      },
    })
  } catch (error) {
    console.error('Error fetching cause:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a cause
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const validation = updateCauseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid cause data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const cause = await prisma.cause.findUnique({
      where: { id },
    })

    if (!cause) {
      return NextResponse.json({ error: 'Cause not found' }, { status: 404 })
    }

    // If renaming, check for duplicates
    if (validation.data.name && validation.data.name !== cause.name) {
      const existing = await prisma.cause.findFirst({
        where: {
          name: { equals: validation.data.name, mode: 'insensitive' },
          id: { not: id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A cause with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updatedCause = await prisma.cause.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json({ cause: updatedCause })
  } catch (error) {
    console.error('Error updating cause:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a cause
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cause = await prisma.cause.findUnique({
      where: { id },
    })

    if (!cause) {
      return NextResponse.json({ error: 'Cause not found' }, { status: 404 })
    }

    // Check if cause is in use
    const [studentCount, volunteerCount] = await Promise.all([
      prisma.student.count({ where: { cause: cause.name } }),
      prisma.volunteer.count({ where: { causes: { has: cause.name } } }),
    ])

    if (studentCount > 0 || volunteerCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete cause with active users',
          details: `${studentCount} students and ${volunteerCount} volunteers are using this cause`,
        },
        { status: 400 }
      )
    }

    await prisma.cause.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cause:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
