import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['volunteer', 'student']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Volunteer schemas
export const volunteerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18 years old').max(100).optional(),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  area: z.string().optional(),
  universityAffiliation: z.string().optional(),
  fieldsOfExpertise: z.array(z.string()).min(1, 'Select at least one field'),
  subjectsQualified: z
    .array(z.string())
    .min(1, 'Add at least one subject')
    .max(10, 'Maximum 10 subjects'),
  languagesSpoken: z.array(z.string()).min(1, 'Select at least one language'),
  preferredLanguage: z.string().min(1, 'Select a preferred language'),
  onlineTeachingExperience: z.boolean().default(false),
  diverseBackgroundExperience: z.boolean().default(false),
  hoursPerWeekAvailable: z.number().min(1).max(40).optional(),
  maxCapacity: z.number().min(1).max(10).default(5),
  causes: z.array(z.string()).optional(),
  additionalSupportWilling: z.string().optional(),
  bio: z.string().max(1000).optional(),
})

// Student schemas
export const studentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().min(1).max(100).optional(),
  gender: z.string().optional(),
  phoneNumber: z.string().optional(),
  alternativeContact: z.string().optional(),
  currentCity: z.string().optional(),
  currentCountry: z.string().optional(),
  area: z.string().optional(),
  originalLocation: z.string().optional(),
  cause: z.string().min(1, 'Select a cause'),
  fieldsOfStudy: z.array(z.string()).min(1, 'Select at least one field'),
  topicsNeedSupport: z
    .array(
      z.object({
        keyword: z.string(),
        status: z.enum(['unassigned', 'assigned']).default('unassigned'),
        assignedTo: z.string().nullable().optional(),
      })
    )
    .min(1, 'Add at least one topic')
    .max(10, 'Maximum 10 topics'),
  originalUniversity: z.string().optional(),
  currentUniversity: z.string().optional(),
  creditsRemaining: z.number().optional(),
  hasTranscripts: z.boolean().default(false),
  preferredLanguage: z.string().min(1, 'Select a preferred language'),
  languagesSpoken: z.array(z.string()).min(1, 'Select at least one language'),
  hoursPerWeekNeeded: z.number().min(1).max(40).optional(),
  deviceAccessLevel: z.number().min(1).max(5).optional(),
  internetAccessLevel: z.number().min(1).max(5).optional(),
  materialsAccessLevel: z.number().min(1).max(5).optional(),
  specialNeeds: z.string().optional(),
  educationalBackground: z.string().optional(),
  careerGoals: z.string().optional(),
})

// Match schemas
export const createMatchSchema = z.object({
  studentId: z.string().uuid(),
  volunteerId: z.string().uuid(),
  assignedSubjects: z.array(z.string()).min(1, 'Assign at least one subject'),
  primaryFieldId: z.string().uuid().optional(),
  adminNotes: z.string().optional(),
})

export const updateMatchStatusSchema = z.object({
  status: z.enum([
    'auto_suggested',
    'pending_email',
    'email_sent',
    'accepted',
    'active',
    'rejected',
    'not_compatible',
    'completed',
    'paused',
  ]),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
})

// Session schemas
export const createSessionSchema = z.object({
  matchId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().min(15).max(180),
  subjectsCovered: z.array(z.string()).optional(),
})

export const updateSessionSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  volunteerNotes: z.string().optional(),
  studentNotes: z.string().optional(),
  studentAttendance: z.boolean().optional(),
  volunteerAttendance: z.boolean().optional(),
  subjectsCovered: z.array(z.string()).optional(),
})

// Feedback schemas
export const feedbackSchema = z.object({
  matchId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  givenTo: z.string().uuid(),
  rating: z.number().min(1).max(5),
  knowledgeRating: z.number().min(1).max(5).optional(),
  teachingRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  comments: z.string().max(1000).optional(),
})

// Subject assignment schema
export const subjectAssignmentSchema = z.object({
  studentId: z.string().uuid(),
  subjectKeyword: z.string().min(1),
  volunteerId: z.string().uuid(),
  reason: z.string().optional(),
})

// Email template schema
export const emailTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  variables: z.array(z.string()).optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type VolunteerProfileInput = z.infer<typeof volunteerProfileSchema>
export type StudentProfileInput = z.infer<typeof studentProfileSchema>
export type CreateMatchInput = z.infer<typeof createMatchSchema>
export type UpdateMatchStatusInput = z.infer<typeof updateMatchStatusSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type SubjectAssignmentInput = z.infer<typeof subjectAssignmentSchema>
export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>
