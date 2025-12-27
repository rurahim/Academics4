import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET - Get all fields with stats (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const fields = await prisma.fieldOfStudy.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new field of study
export async function POST(request: NextRequest) {
  try {
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
    const { name, category, parentFieldId, relatedFields, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check for duplicate name
    const existing = await prisma.fieldOfStudy.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A field with this name already exists' },
        { status: 400 }
      )
    }

    const field = await prisma.fieldOfStudy.create({
      data: {
        name,
        category,
        parentFieldId,
        relatedFields: relatedFields || [],
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
