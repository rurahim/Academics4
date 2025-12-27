'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Calendar, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'

interface Topic {
  keyword: string
  status: string
}

interface Student {
  id: string
  fullName: string
  cause: string
  fieldsOfStudy: string[]
  topicsNeedSupport: Topic[]
  preferredLanguage: string
  hoursPerWeekNeeded: number | null
  deviceAccessLevel: number | null
  internetAccessLevel: number | null
}

interface Match {
  id: string
  status: string
  assignedSubjects: string[]
  student: Student
}

export default function VolunteerStudentsPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleMatchAction = async (matchId: string, action: 'accept' | 'decline') => {
    setActionLoading(matchId)
    try {
      const response = await fetch(`/api/volunteers/matches/${matchId}/${action}`, {
        method: 'POST',
      })
      if (response.ok) {
        await fetchStudents()
      } else {
        const data = await response.json()
        alert(data.error || `Failed to ${action} match`)
      }
    } catch (error) {
      console.error(`Error ${action}ing match:`, error)
      alert(`Failed to ${action} match`)
    } finally {
      setActionLoading(null)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/volunteers/students')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
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

  // Show matches that are assigned to this volunteer (active, accepted, email_sent, pending_email, auto_suggested)
  const relevantStatuses = ['active', 'accepted', 'email_sent', 'pending_email', 'auto_suggested']
  const assignedMatches = matches.filter((m) => relevantStatuses.includes(m.status))
  const activeCount = matches.filter((m) => m.status === 'active').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>
      case 'email_sent':
      case 'pending_email':
        return <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200">Pending Confirmation</Badge>
      case 'auto_suggested':
        return <Badge variant="secondary">Pending Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-muted-foreground">
            Students assigned to you ({assignedMatches.length} total, {activeCount} active)
          </p>
        </div>

        {assignedMatches.length > 0 ? (
          <div className="space-y-4">
            {assignedMatches.map((match) => {
              const isExpanded = expandedStudent === match.id

              return (
                <Card key={match.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {match.student.fullName}
                          {getStatusBadge(match.status)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {match.student.cause} &bull; {match.student.preferredLanguage}
                          {match.student.hoursPerWeekNeeded &&
                            ` &bull; ${match.student.hoursPerWeekNeeded}h/week needed`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedStudent(isExpanded ? null : match.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Assigned Subjects */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Your Assigned Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {match.assignedSubjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        {(['email_sent', 'pending_email', 'auto_suggested'].includes(match.status)) ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleMatchAction(match.id, 'accept')}
                              disabled={actionLoading === match.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {actionLoading === match.id ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleMatchAction(match.id, 'decline')}
                              disabled={actionLoading === match.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule Session
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Fields of Study</p>
                            <div className="flex flex-wrap gap-1">
                              {match.student.fieldsOfStudy.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">All Topics Needed</p>
                            <div className="flex flex-wrap gap-1">
                              {match.student.topicsNeedSupport.map((topic) => (
                                <Badge
                                  key={topic.keyword}
                                  variant={
                                    match.assignedSubjects.includes(topic.keyword)
                                      ? 'success'
                                      : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {topic.keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Access Levels */}
                        <div>
                          <p className="text-sm font-medium mb-2">Student Access Levels</p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Device: </span>
                              <span className="font-medium">
                                {match.student.deviceAccessLevel || 'N/A'}/5
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Internet: </span>
                              <span className="font-medium">
                                {match.student.internetAccessLevel || 'N/A'}/5
                              </span>
                            </div>
                          </div>
                          {(match.student.deviceAccessLevel &&
                            match.student.deviceAccessLevel <= 2) ||
                          (match.student.internetAccessLevel &&
                            match.student.internetAccessLevel <= 2) ? (
                            <p className="text-xs text-amber-600 mt-1">
                              Note: This student has limited access. Consider low-bandwidth
                              communication methods.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  No students assigned yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your pending match requests on the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
