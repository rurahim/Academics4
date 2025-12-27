'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Mail, ChevronDown, ChevronUp } from 'lucide-react'

interface Volunteer {
  id: string
  fullName: string
  fieldsOfExpertise: string[]
  subjectsQualified: string[]
  languagesSpoken: string[]
  preferredLanguage: string
  bio: string | null
}

interface Match {
  id: string
  status: string
  assignedSubjects: string[]
  volunteer: Volunteer
}

export default function StudentTeachersPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/students/teachers')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
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

  const activeMatches = matches.filter((m) => m.status === 'active')
  const pendingMatches = matches.filter((m) => ['pending', 'email_sent'].includes(m.status))

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Teachers</h1>
          <p className="text-muted-foreground">
            Tutors assigned to help you with your studies
          </p>
        </div>

        {/* Active Teachers */}
        {activeMatches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Active Teachers ({activeMatches.length})</h2>
            {activeMatches.map((match) => {
              const isExpanded = expandedTeacher === match.id

              return (
                <Card key={match.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {match.volunteer.fullName}
                          <Badge variant="success">Active</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {match.volunteer.preferredLanguage}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedTeacher(isExpanded ? null : match.id)
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
                        <p className="text-sm font-medium mb-2">Teaching You</p>
                        <div className="flex flex-wrap gap-2">
                          {match.assignedSubjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        {match.volunteer.bio && (
                          <div>
                            <p className="text-sm font-medium mb-2">About</p>
                            <p className="text-sm text-muted-foreground">
                              {match.volunteer.bio}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Expertise</p>
                            <div className="flex flex-wrap gap-1">
                              {match.volunteer.fieldsOfExpertise.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">All Subjects</p>
                            <div className="flex flex-wrap gap-1">
                              {match.volunteer.subjectsQualified.map((subject) => (
                                <Badge key={subject} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Languages</p>
                          <div className="flex flex-wrap gap-1">
                            {match.volunteer.languagesSpoken.map((lang) => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pending Matches */}
        {pendingMatches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pending Assignments ({pendingMatches.length})</h2>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-6">
                <p className="text-sm text-amber-800">
                  We&apos;re currently matching you with {pendingMatches.length} more tutor
                  {pendingMatches.length !== 1 ? 's' : ''}. You&apos;ll be notified when they confirm.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Teachers */}
        {activeMatches.length === 0 && pendingMatches.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  No teachers assigned yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  The admin team is working on finding the best matches for your topics.
                  You&apos;ll be notified when a tutor is assigned to help you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
