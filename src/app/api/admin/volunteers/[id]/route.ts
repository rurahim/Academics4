import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Get single volunteer with full details
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

    const volunteer = await prisma.volunteer.findUnique({
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
            student: {
              select: {
                id: true,
                fullName: true,
                cause: true,
              },
            },
          },
        },
      },
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    return NextResponse.json({ volunteer })
  } catch (error) {
    console.error('Get volunteer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update volunteer profile
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

    // Check if volunteer exists
    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingVolunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    const {
      fullName,
      age,
      phoneNumber,
      city,
      country,
      area,
      universityAffiliation,
      fieldsOfExpertise,
      subjectsQualified,
      languagesSpoken,
      preferredLanguage,
      onlineTeachingExperience,
      diverseBackgroundExperience,
      hoursPerWeekAvailable,
      maxCapacity,
      isAvailable,
      causes,
      additionalSupportWilling,
      bio,
      // User fields
      email,
      isActive,
      isVerified,
    } = body

    // Update volunteer
    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(age !== undefined && { age }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(area !== undefined && { area }),
        ...(universityAffiliation !== undefined && { universityAffiliation }),
        ...(fieldsOfExpertise !== undefined && { fieldsOfExpertise }),
        ...(subjectsQualified !== undefined && { subjectsQualified }),
        ...(languagesSpoken !== undefined && { languagesSpoken }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(onlineTeachingExperience !== undefined && { onlineTeachingExperience }),
        ...(diverseBackgroundExperience !== undefined && { diverseBackgroundExperience }),
        ...(hoursPerWeekAvailable !== undefined && { hoursPerWeekAvailable }),
        ...(maxCapacity !== undefined && {
          maxCapacity,
          capacitySetBy: 'admin',
        }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(causes !== undefined && { causes }),
        ...(additionalSupportWilling !== undefined && { additionalSupportWilling }),
        ...(bio !== undefined && { bio }),
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
        where: { id: existingVolunteer.userId },
        data: {
          ...(email !== undefined && { email }),
          ...(isActive !== undefined && { isActive }),
          ...(isVerified !== undefined && { isVerified }),
        },
      })
    }

    return NextResponse.json({ volunteer, message: 'Volunteer updated successfully' })
  } catch (error) {
    console.error('Update volunteer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete volunteer
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

    // Check if volunteer exists
    const existingVolunteer = await prisma.volunteer.findUnique({
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

    if (!existingVolunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    // Check if volunteer has active matches
    if (existingVolunteer.matches.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete volunteer with active matches. Please complete or cancel matches first.' },
        { status: 400 }
      )
    }

    // Delete volunteer (this will cascade delete due to schema onDelete: Cascade)
    await prisma.volunteer.delete({
      where: { id },
    })

    // Optionally delete the user account as well
    await prisma.user.delete({
      where: { id: existingVolunteer.userId },
    })

    return NextResponse.json({ message: 'Volunteer deleted successfully' })
  } catch (error) {
    console.error('Delete volunteer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
