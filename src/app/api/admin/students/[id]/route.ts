import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Get single student with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            lastLogin: true,
          },
        },
        matches: {
          include: {
            volunteer: {
              select: {
                id: true,
                fullName: true,
                causes: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update student profile
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

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const {
      fullName,
      age,
      gender,
      phoneNumber,
      alternativeContact,
      currentCity,
      currentCountry,
      area,
      originalLocation,
      cause,
      fieldsOfStudy,
      topicsNeedSupport,
      originalUniversity,
      currentUniversity,
      creditsRemaining,
      hasTranscripts,
      preferredLanguage,
      languagesSpoken,
      hoursPerWeekNeeded,
      deviceAccessLevel,
      internetAccessLevel,
      materialsAccessLevel,
      specialNeeds,
      educationalBackground,
      careerGoals,
      // User fields
      email,
      isActive,
      isVerified,
    } = body

    // Update student
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(alternativeContact !== undefined && { alternativeContact }),
        ...(currentCity !== undefined && { currentCity }),
        ...(currentCountry !== undefined && { currentCountry }),
        ...(area !== undefined && { area }),
        ...(originalLocation !== undefined && { originalLocation }),
        ...(cause !== undefined && { cause }),
        ...(fieldsOfStudy !== undefined && { fieldsOfStudy }),
        ...(topicsNeedSupport !== undefined && { topicsNeedSupport }),
        ...(originalUniversity !== undefined && { originalUniversity }),
        ...(currentUniversity !== undefined && { currentUniversity }),
        ...(creditsRemaining !== undefined && { creditsRemaining }),
        ...(hasTranscripts !== undefined && { hasTranscripts }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(languagesSpoken !== undefined && { languagesSpoken }),
        ...(hoursPerWeekNeeded !== undefined && { hoursPerWeekNeeded }),
        ...(deviceAccessLevel !== undefined && { deviceAccessLevel }),
        ...(internetAccessLevel !== undefined && { internetAccessLevel }),
        ...(materialsAccessLevel !== undefined && { materialsAccessLevel }),
        ...(specialNeeds !== undefined && { specialNeeds }),
        ...(educationalBackground !== undefined && { educationalBackground }),
        ...(careerGoals !== undefined && { careerGoals }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
    })

    // Update user fields if provided
    if (email !== undefined || isActive !== undefined || isVerified !== undefined) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: {
          ...(email !== undefined && { email }),
          ...(isActive !== undefined && { isActive }),
          ...(isVerified !== undefined && { isVerified }),
        },
      })
    }

    return NextResponse.json({ student, message: 'Student updated successfully' })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        matches: {
          where: {
            status: {
              in: ['accepted', 'active'],
            },
          },
        },
      },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student has active matches
    if (existingStudent.matches.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete student with active matches. Please complete or cancel matches first.' },
        { status: 400 }
      )
    }

    // Delete student (this will cascade delete due to schema onDelete: Cascade)
    await prisma.student.delete({
      where: { id },
    })

    // Optionally delete the user account as well
    await prisma.user.delete({
      where: { id: existingStudent.userId },
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
