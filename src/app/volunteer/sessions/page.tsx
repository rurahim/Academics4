'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Plus, Clock, Calendar, CheckCircle, X } from 'lucide-react'

interface Session {
  id: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  date: string
  durationMinutes: number
  subjectsCovered: string[]
  volunteerNotes: string | null
  match: {
    id: string
    student: {
      fullName: string
    }
    assignedSubjects: string[]
  }
}

interface Match {
  id: string
  student: { fullName: string }
  assignedSubjects: string[]
}

export default function VolunteerSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSession, setNewSession] = useState({
    matchId: '',
    scheduledAt: '',
    durationMinutes: 60,
    platform: '',
    subjectsCovered: [] as string[],
    volunteerNotes: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sessionsRes, matchesRes] = await Promise.all([
        fetch('/api/volunteers/sessions'),
        fetch('/api/volunteers/students'),
      ])

      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data.sessions)
      }

      if (matchesRes.ok) {
        const data = await matchesRes.json()
        setMatches(
          data.matches
            .filter((m: { status: string }) => m.status === 'active')
            .map((m: Match) => ({
              id: m.id,
              student: m.student,
              assignedSubjects: m.assignedSubjects,
            }))
        )
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async () => {
    if (!newSession.matchId || !newSession.scheduledAt) {
      alert('Please select a student and date/time')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/volunteers/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      })

      if (response.ok) {
        fetchData()
        setShowNewSession(false)
        setNewSession({
          matchId: '',
          scheduledAt: '',
          durationMinutes: 60,
          platform: '',
          subjectsCovered: [],
          volunteerNotes: '',
        })
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const completeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/volunteers/sessions/${sessionId}/complete`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  const selectedMatch = matches.find((m) => m.id === newSession.matchId)

  if (loading) {
    return (
      <DashboardLayout role="volunteer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const upcomingSessions = sessions.filter((s) => s.status === 'scheduled')
  const pastSessions = sessions.filter((s) => s.status === 'completed')

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sessions</h1>
            <p className="text-muted-foreground">Track your tutoring sessions</p>
          </div>
          <Button onClick={() => setShowNewSession(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Log Session
          </Button>
        </div>

        {/* New Session Form */}
        {showNewSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Log New Session</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewSession(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select
                    options={matches.map((m) => ({
                      value: m.id,
                      label: m.student.fullName,
                    }))}
                    value={newSession.matchId}
                    onChange={(e) =>
                      setNewSession({ ...newSession, matchId: e.target.value })
                    }
                    placeholder="Select student"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) =>
                      setNewSession({ ...newSession, scheduledAt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={15}
                    max={180}
                    value={newSession.durationMinutes}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        durationMinutes: parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    options={[
                      { value: 'WhatsApp', label: 'WhatsApp' },
                      { value: 'Zoom', label: 'Zoom' },
                      { value: 'Google Meet', label: 'Google Meet' },
                      { value: 'Microsoft Teams', label: 'Microsoft Teams' },
                      { value: 'Skype', label: 'Skype' },
                      { value: 'Discord', label: 'Discord' },
                      { value: 'Phone Call', label: 'Phone Call' },
                      { value: 'In Person', label: 'In Person' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={newSession.platform}
                    onChange={(e) =>
                      setNewSession({ ...newSession, platform: e.target.value })
                    }
                    placeholder="Select platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Topics Covered</Label>
                  {selectedMatch && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.assignedSubjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant={
                            newSession.subjectsCovered.includes(subject)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setNewSession({
                              ...newSession,
                              subjectsCovered: newSession.subjectsCovered.includes(
                                subject
                              )
                                ? newSession.subjectsCovered.filter(
                                    (t) => t !== subject
                                  )
                                : [...newSession.subjectsCovered, subject],
                            })
                          }
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={newSession.volunteerNotes}
                    onChange={(e) =>
                      setNewSession({ ...newSession, volunteerNotes: e.target.value })
                    }
                    placeholder="What was covered, progress made, etc."
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={createSession} disabled={creating}>
                  Save Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{session.match.student.fullName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.durationMinutes} min
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.subjectsCovered.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => completeSession(session.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No upcoming sessions scheduled.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Sessions
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
                    <div>
                      <p className="font-medium">{session.match.student.fullName}</p>
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {session.volunteerNotes}
                        </p>
                      )}
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No completed sessions yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
