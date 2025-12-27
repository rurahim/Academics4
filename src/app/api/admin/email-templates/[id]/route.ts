import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  isDefault: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params
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

    // Check for duplicate name (excluding current template)
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        name,
        id: { not: templateId },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        name,
        subject,
        body: templateBody,
        isDefault: isDefault ?? undefined,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if template exists and is not default
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (template.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default templates' },
        { status: 400 }
      )
    }

    await prisma.emailTemplate.delete({
      where: { id: templateId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
