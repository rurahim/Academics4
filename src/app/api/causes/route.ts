import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all active causes (public endpoint for forms)
export async function GET() {
  try {
    const causes = await prisma.cause.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        region: true,
        priority: true,
      },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({ causes })
  } catch (error) {
    console.error('Error fetching causes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
