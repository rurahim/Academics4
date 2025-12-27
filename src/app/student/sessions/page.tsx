'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle, Star } from 'lucide-react'

interface Session {
  id: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  date: string
  durationMinutes: number
  subjectsCovered: string[]
  volunteerNotes: string | null
  match: {
    id: string
    volunteer: {
      fullName: string
    }
    assignedSubjects: string[]
  }
}

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/students/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
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

  const upcomingSessions = sessions.filter((s) => s.status === 'scheduled')
  const pastSessions = sessions.filter((s) => s.status === 'completed')
  const totalHours = pastSessions.reduce((acc, s) => acc + s.durationMinutes / 60, 0)

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">Track your learning sessions with tutors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingSessions.length}</p>
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
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{pastSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              {upcomingSessions.length} session{upcomingSessions.length !== 1 ? 's' : ''}{' '}
              scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div>
                      <p className="font-medium">with {session.match.volunteer.fullName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>{session.durationMinutes} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.subjectsCovered.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No upcoming sessions. Your teacher will schedule sessions with you.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Session History
            </CardTitle>
            <CardDescription>
              {pastSessions.length} session{pastSessions.length !== 1 ? 's' : ''} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">with {session.match.volunteer.fullName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <span>{session.durationMinutes} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.subjectsCovered.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {session.volunteerNotes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          &quot;{session.volunteerNotes}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="success">Completed</Badge>
                      <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Leave feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No completed sessions yet. Your learning journey is about to begin!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
