import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all active fields of study (public endpoint for forms)
export async function GET() {
  try {
    const fields = await prisma.fieldOfStudy.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        parentFieldId: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
