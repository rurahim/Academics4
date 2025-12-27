'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Academics4</h1>
          <p className="text-muted-foreground mt-2">
            Join our mission to connect tutors with students in need
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle>I&apos;m a Tutor</CardTitle>
              <CardDescription>
                Share your knowledge and help students achieve their educational goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register/volunteer">
                <Button className="w-full" variant="secondary">
                  Register as Tutor
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>I&apos;m a Student</CardTitle>
              <CardDescription>
                Get matched with tutors to continue your education
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register/student">
                <Button className="w-full">
                  Register as Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
