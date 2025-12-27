import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@academics4.org' },
    update: {},
    create: {
      email: 'admin@academics4.org',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
    },
  })

  console.log('Admin user created:')
  console.log('Email: admin@academics4.org')
  console.log('Password: admin123')

  // Seed Causes
  const causes = [
    { name: 'Syrian Crisis', description: 'Supporting displaced Syrian students', region: 'Middle East', priority: 10 },
    { name: 'Ukrainian Crisis', description: 'Supporting displaced Ukrainian students', region: 'Europe', priority: 10 },
    { name: 'Afghan Crisis', description: 'Supporting Afghan students affected by conflict', region: 'Central Asia', priority: 9 },
    { name: 'Palestinian Crisis', description: 'Supporting Palestinian students', region: 'Middle East', priority: 10 },
    { name: 'Sudanese Crisis', description: 'Supporting Sudanese students affected by conflict', region: 'Africa', priority: 9 },
    { name: 'Venezuelan Crisis', description: 'Supporting Venezuelan students', region: 'South America', priority: 8 },
    { name: 'Rohingya Crisis', description: 'Supporting Rohingya students', region: 'Southeast Asia', priority: 8 },
    { name: 'General Refugee Support', description: 'Supporting refugee and displaced students globally', region: 'Global', priority: 7 },
    { name: 'Economic Hardship', description: 'Supporting students facing economic difficulties', region: 'Global', priority: 6 },
    { name: 'Natural Disaster', description: 'Supporting students affected by natural disasters', region: 'Global', priority: 7 },
  ]

  for (const cause of causes) {
    await prisma.cause.upsert({
      where: { name: cause.name },
      update: cause,
      create: { ...cause, isActive: true },
    })
  }
  console.log(`Seeded ${causes.length} causes`)

  // Seed Fields of Study
  const fieldsOfStudy = [
    // STEM
    { name: 'Computer Science', category: 'STEM' },
    { name: 'Mathematics', category: 'STEM' },
    { name: 'Physics', category: 'STEM' },
    { name: 'Chemistry', category: 'STEM' },
    { name: 'Biology', category: 'STEM' },
    { name: 'Engineering', category: 'STEM' },
    { name: 'Data Science', category: 'STEM' },
    { name: 'Statistics', category: 'STEM' },
    // Business
    { name: 'Business Administration', category: 'Business' },
    { name: 'Economics', category: 'Business' },
    { name: 'Finance', category: 'Business' },
    { name: 'Marketing', category: 'Business' },
    { name: 'Accounting', category: 'Business' },
    // Humanities
    { name: 'English', category: 'Humanities' },
    { name: 'History', category: 'Humanities' },
    { name: 'Philosophy', category: 'Humanities' },
    { name: 'Literature', category: 'Humanities' },
    { name: 'Languages', category: 'Humanities' },
    // Social Sciences
    { name: 'Psychology', category: 'Social Sciences' },
    { name: 'Sociology', category: 'Social Sciences' },
    { name: 'Political Science', category: 'Social Sciences' },
    { name: 'International Relations', category: 'Social Sciences' },
    // Health
    { name: 'Medicine', category: 'Health' },
    { name: 'Nursing', category: 'Health' },
    { name: 'Public Health', category: 'Health' },
    { name: 'Pharmacy', category: 'Health' },
    // Arts
    { name: 'Fine Arts', category: 'Arts' },
    { name: 'Music', category: 'Arts' },
    { name: 'Design', category: 'Arts' },
    // Law
    { name: 'Law', category: 'Law' },
    // Education
    { name: 'Education', category: 'Education' },
  ]

  for (const field of fieldsOfStudy) {
    await prisma.fieldOfStudy.upsert({
      where: { name: field.name },
      update: field,
      create: { ...field, isActive: true, relatedFields: [] },
    })
  }
  console.log(`Seeded ${fieldsOfStudy.length} fields of study`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
