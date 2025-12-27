import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
})

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

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validation = templateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid template data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, subject, body: templateBody, isDefault } = validation.data

    // Check for duplicate name
    const existing = await prisma.emailTemplate.findFirst({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        isDefault,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
