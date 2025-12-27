'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Mail,
  UserPlus,
  Settings,
  ArrowRight,
  BarChart3,
  Bell,
  RefreshCw,
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalVolunteers: number
  activeMatches: number
  pendingMatches: number
  studentsNeedingAssignment: number
  volunteerCapacityAvailable: number
  emailsSentToday: number
  recentMatches: Array<{
    id: string
    status: string
    matchScore: number | null
    createdAt: string
    student: { fullName: string; cause: string }
    volunteer: { fullName: string }
    assignedSubjects: string[]
  }>
  topicsCoverage: {
    assigned: number
    unassigned: number
  }
  pendingActions: {
    autoSuggested: number
    pendingEmail: number
    emailSent: number
  }
  causeBreakdown: Array<{
    cause: string
    students: number
    volunteers: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const coveragePercentage = stats?.topicsCoverage
    ? Math.round(
        (stats.topicsCoverage.assigned /
          (stats.topicsCoverage.assigned + stats.topicsCoverage.unassigned || 1)) *
          100
      )
    : 0

  const totalPendingActions =
    (stats?.pendingActions?.autoSuggested || 0) +
    (stats?.pendingActions?.pendingEmail || 0) +
    (stats?.pendingActions?.emailSent || 0)

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and quick actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardStats(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats?.studentsNeedingAssignment || 0) > 0 || totalPendingActions > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stats?.studentsNeedingAssignment || 0) > 0 && (
              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-200 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">
                          {stats?.studentsNeedingAssignment} Students Need Assignment
                        </p>
                        <p className="text-sm text-amber-700">
                          Students have unassigned topics waiting for tutors
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/students">
                      <Button size="sm" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-100">
                        View Students <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {totalPendingActions > 0 && (
              <Card className="border-blue-300 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-200 rounded-lg">
                        <Bell className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">
                          {totalPendingActions} Pending Actions
                        </p>
                        <div className="flex gap-2 mt-1">
                          {(stats?.pendingActions?.autoSuggested || 0) > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {stats?.pendingActions.autoSuggested} auto-suggested
                            </Badge>
                          )}
                          {(stats?.pendingActions?.pendingEmail || 0) > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {stats?.pendingActions.pendingEmail} pending email
                            </Badge>
                          )}
                          {(stats?.pendingActions?.emailSent || 0) > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {stats?.pendingActions.emailSent} awaiting response
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href="/admin/matches">
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-100">
                        Matching Center <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/students">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Manage Students</span>
                </Button>
              </Link>
              <Link href="/admin/volunteers">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Manage Tutors</span>
                </Button>
              </Link>
              <Link href="/admin/matches">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">Matching Center</span>
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-lg mb-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-lg mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.totalVolunteers || 0}</p>
                <p className="text-xs text-muted-foreground">Tutors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-lg mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.activeMatches || 0}</p>
                <p className="text-xs text-muted-foreground">Active Matches</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-amber-100 rounded-lg mb-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.pendingMatches || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-emerald-100 rounded-lg mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.volunteerCapacityAvailable || 0}</p>
                <p className="text-xs text-muted-foreground">Available Slots</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-rose-100 rounded-lg mb-2">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
                <p className="text-2xl font-bold">{coveragePercentage}%</p>
                <p className="text-xs text-muted-foreground">Topic Coverage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Topic Assignment Coverage</CardTitle>
            <CardDescription>
              {stats?.topicsCoverage?.assigned || 0} of{' '}
              {(stats?.topicsCoverage?.assigned || 0) + (stats?.topicsCoverage?.unassigned || 0)} topics assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">
                  Assigned: {stats?.topicsCoverage?.assigned || 0}
                </span>
                <span className="text-red-600 font-medium">
                  Unassigned: {stats?.topicsCoverage?.unassigned || 0}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${coveragePercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cause Breakdown */}
        {stats?.causeBreakdown && stats.causeBreakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Users by Cause</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.causeBreakdown.map((item) => (
                  <div key={item.cause} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-lg">{item.cause}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium text-blue-600">{item.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tutors:</span>
                        <span className="font-medium text-green-600">{item.volunteers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Matches */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Matches</CardTitle>
                <CardDescription>Latest student-tutor pairings</CardDescription>
              </div>
              <Link href="/admin/matches">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentMatches && stats.recentMatches.length > 0 ? (
              <div className="space-y-3">
                {stats.recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{match.student.fullName}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{match.volunteer.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          {match.student.cause}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {match.assignedSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {match.matchScore && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="font-bold text-lg">{Math.round(match.matchScore)}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <Badge
                          variant={
                            match.status === 'active'
                              ? 'success'
                              : match.status === 'accepted'
                              ? 'success'
                              : match.status === 'email_sent'
                              ? 'warning'
                              : match.status === 'pending_email'
                              ? 'secondary'
                              : match.status === 'rejected'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {match.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No matches yet. Start by assigning tutors to students.
                </p>
                <Link href="/admin/matches" className="mt-4 inline-block">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Go to Matching Center
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/settings">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Templates</p>
                    <p className="text-xs text-muted-foreground">Manage email content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/settings">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Platform Settings</p>
                    <p className="text-xs text-muted-foreground">Configure options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/analytics">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-muted-foreground">View reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/volunteers">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Capacity Overview</p>
                    <p className="text-xs text-muted-foreground">Tutor slots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
