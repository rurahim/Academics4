'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'

interface Match {
  id: string
  status: string
  assignedSubjects: string[]
  student: {
    id: string
    fullName: string
    cause: string
    fieldsOfStudy: string[]
    topicsNeedSupport: Array<{ keyword: string; status: string }>
  }
}

interface VolunteerProfile {
  id: string
  fullName: string
  currentCapacity: number
  maxCapacity: number
  totalHoursVolunteered: number
  studentsHelped: number
  matches: Match[]
}

export default function VolunteerDashboard() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingMatches, setPendingMatches] = useState<Match[]>([])

  useEffect(() => {
    fetchProfile()
    fetchMatches()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/volunteers/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.volunteer)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?status=email_sent')
      if (response.ok) {
        const data = await response.json()
        setPendingMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  const handleMatchResponse = async (matchId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/${accept ? 'accept' : 'reject'}`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchProfile()
        fetchMatches()
      }
    } catch (error) {
      console.error('Error responding to match:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="volunteer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.fullName || 'Tutor'}!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your tutoring activity</p>
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
                  <p className="text-sm text-muted-foreground">Current Students</p>
                  <p className="text-2xl font-bold">
                    {profile?.currentCapacity || 0}/{profile?.maxCapacity || 5}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Students Helped</p>
                  <p className="text-2xl font-bold">{profile?.studentsHelped || 0}</p>
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
                  <p className="text-sm text-muted-foreground">Hours Tutored</p>
                  <p className="text-2xl font-bold">{profile?.totalHoursVolunteered || 0}</p>
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
                  <p className="text-2xl font-bold">{profile?.matches?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Match Requests */}
        {pendingMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pending Match Requests
              </CardTitle>
              <CardDescription>
                Review and respond to these student match requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{match.student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.student.cause} - {match.student.fieldsOfStudy.join(', ')}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {match.assignedSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMatchResponse(match.id, false)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMatchResponse(match.id, true)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Students */}
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>
              Students you are currently helping
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
                      <p className="font-medium">{match.student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.student.cause}
                      </p>
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
                No students assigned yet. Wait for admin to match you with students.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
