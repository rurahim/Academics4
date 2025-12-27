'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Topic {
  keyword: string
  status: 'unassigned' | 'assigned'
  assignedTo?: string
}

interface Match {
  id: string
  status: string
  assignedSubjects: string[]
  volunteer: {
    id: string
    fullName: string
    subjectsQualified: string[]
  }
}

interface StudentProfile {
  id: string
  fullName: string
  cause: string
  topicsNeedSupport: Topic[]
  matches: Match[]
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/students/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.student)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const topics = (profile?.topicsNeedSupport || []) as Topic[]
  const assignedTopics = topics.filter((t) => t.status === 'assigned')
  const unassignedTopics = topics.filter((t) => t.status === 'unassigned')
  const coveragePercentage = topics.length > 0
    ? Math.round((assignedTopics.length / topics.length) * 100)
    : 0

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.fullName || 'Student'}!</h1>
          <p className="text-muted-foreground">Track your learning progress and assigned teachers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Teachers</p>
                  <p className="text-2xl font-bold">{profile?.matches?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Topics Covered</p>
                  <p className="text-2xl font-bold">{assignedTopics.length}/{topics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <p className="text-2xl font-bold">{coveragePercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">
                    {profile?.matches?.filter((m) => m.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topics Status */}
        <Card>
          <CardHeader>
            <CardTitle>Your Topics</CardTitle>
            <CardDescription>
              Track which topics have been assigned to tutors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subject Coverage</span>
                  <span>{coveragePercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${coveragePercentage}%` }}
                  />
                </div>
              </div>

              {/* Assigned Topics */}
              {assignedTopics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Assigned Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignedTopics.map((topic) => (
                      <Badge key={topic.keyword} variant="success">
                        {topic.keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Unassigned Topics */}
              {unassignedTopics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Waiting for Assignment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {unassignedTopics.map((topic) => (
                      <Badge key={topic.keyword} variant="warning">
                        {topic.keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Teachers */}
        <Card>
          <CardHeader>
            <CardTitle>My Teachers</CardTitle>
            <CardDescription>
              Tutors assigned to help you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.matches && profile.matches.length > 0 ? (
              <div className="space-y-4">
                {profile.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{match.volunteer.fullName}</p>
                      <div className="flex gap-2 mt-2">
                        {match.assignedSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={match.status === 'active' ? 'success' : 'default'}>
                      {match.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No teachers assigned yet. The admin is working on finding the best matches for you.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
