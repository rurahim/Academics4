import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        student: true,
        volunteer: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only the assigned volunteer can reject
    if (payload.role === 'volunteer') {
      const volunteer = await prisma.volunteer.findUnique({
        where: { userId: payload.userId },
      })

      if (!volunteer || volunteer.id !== match.volunteerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['pending', 'email_sent'].includes(match.status)) {
      return NextResponse.json(
        { error: 'Match is not in a state that can be rejected' },
        { status: 400 }
      )
    }

    // Update match status to rejected
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'rejected' },
    })

    // Send notification email to student (optional - depends on settings)
    const template = await prisma.emailTemplate.findFirst({
      where: { name: 'match_rejected' },
    })

    if (template) {
      const emailBody = template.body
        .replace(/\{\{volunteer_name\}\}/g, match.volunteer.fullName)
        .replace(/\{\{student_name\}\}/g, match.student.fullName)
        .replace(/\{\{subjects\}\}/g, match.assignedSubjects.join(', '))

      console.log('Sending rejection notification to admin')
      console.log('Body:', emailBody)
    }

    return NextResponse.json({
      match: {
        id: updatedMatch.id,
        status: updatedMatch.status,
      },
    })
  } catch (error) {
    console.error('Error rejecting match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
