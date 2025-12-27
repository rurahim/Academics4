'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  UserX,
  UserCheck,
  Battery,
  AlertTriangle,
} from 'lucide-react'

interface Analytics {
  overview: {
    totalStudents: number
    totalVolunteers: number
    totalMatches: number
    activeMatches: number
    totalSessions: number
    completedSessions: number
    totalHours: number
    topicCoverage: {
      total: number
      assigned: number
      percentage: number
    }
    capacityUtilization: number
    volunteersAtFullCapacity: number
    volunteersWithCapacity: number
    studentsWithActiveMatch: number
    studentsWithoutMatch: number
    volunteersWithActiveMatch: number
    volunteersWithoutMatch: number
  }
  causeDistribution: Array<{ cause: string; students: number; volunteers: number }>
  matchStatusDistribution: Array<{ status: string; count: number }>
  popularSubjects: Array<{ subject: string; count: number }>
  sessionsOverTime: Array<{ date: string; scheduled: number; completed: number }>
  registrationsOverTime: Array<{ date: string; students: number; volunteers: number }>
  fieldDemandAnalysis: Array<{ field: string; studentDemand: number; volunteerSupply: number; gap: number }>
  subjectDemandAnalysis: Array<{ subject: string; demand: number; assigned: number; unassigned: number; volunteerSupply: number }>
  topStudentFields: Array<{ field: string; count: number }>
  topVolunteerFields: Array<{ field: string; count: number }>
  topVolunteerSubjects: Array<{ subject: string; count: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const statusColors: Record<string, string> = {
  active: '#22C55E',
  pending: '#F59E0B',
  email_sent: '#3B82F6',
  completed: '#6B7280',
  rejected: '#EF4444',
  paused: '#8B5CF6',
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'students' | 'volunteers' | 'matches', format: 'excel' | 'pdf') => {
    try {
      setExporting(`${type}-${format}`)
      const response = await fetch(`/api/admin/export?type=${type}&format=${format}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_backup_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(null)
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

  if (!analytics) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform performance and insights</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Excel:</span>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleExport('students', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'students-excel' ? 'Exporting...' : 'Students'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleExport('volunteers', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'volunteers-excel' ? 'Exporting...' : 'Tutors'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleExport('matches', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'matches-excel' ? 'Exporting...' : 'Matches'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">PDF:</span>
              <Button
                variant="default"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => handleExport('students', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'students-pdf' ? 'Exporting...' : 'Students'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => handleExport('volunteers', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'volunteers-pdf' ? 'Exporting...' : 'Tutors'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={() => handleExport('matches', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'matches-pdf' ? 'Exporting...' : 'Matches'}
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.totalVolunteers}</p>
                <p className="text-xs text-muted-foreground">Tutors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.activeMatches}</p>
                <p className="text-xs text-muted-foreground">Active Matches</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.completedSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-8 w-8 text-amber-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.totalHours}</p>
                <p className="text-xs text-muted-foreground">Hours Tutored</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-rose-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.topicCoverage.percentage}%</p>
                <p className="text-xs text-muted-foreground">Topic Coverage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Battery className="h-8 w-8 text-cyan-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.capacityUtilization}%</p>
                <p className="text-xs text-muted-foreground">Capacity Used</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <UserCheck className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.studentsWithActiveMatch}</p>
                <p className="text-xs text-muted-foreground">Students Matched</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <UserX className="h-8 w-8 text-red-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.studentsWithoutMatch}</p>
                <p className="text-xs text-muted-foreground">Students Unmatched</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <UserCheck className="h-8 w-8 text-teal-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.volunteersWithActiveMatch}</p>
                <p className="text-xs text-muted-foreground">Tutors Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-indigo-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.volunteersWithCapacity}</p>
                <p className="text-xs text-muted-foreground">Tutors Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{analytics.overview.volunteersAtFullCapacity}</p>
                <p className="text-xs text-muted-foreground">At Full Capacity</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cause Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Cause</CardTitle>
              <CardDescription>Distribution of students and tutors per cause</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.causeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="cause"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#3B82F6" name="Students" />
                    <Bar dataKey="volunteers" fill="#22C55E" name="Tutors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Match Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Match Status Distribution</CardTitle>
              <CardDescription>Current status of all matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.matchStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {analytics.matchStatusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrations Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Registrations (Last 30 Days)</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.registrationsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.registrationsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.slice(5)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#3B82F6"
                        name="Students"
                      />
                      <Line
                        type="monotone"
                        dataKey="volunteers"
                        stroke="#22C55E"
                        name="Tutors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No registration data in the last 30 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sessions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions (Last 30 Days)</CardTitle>
              <CardDescription>Session activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.sessionsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.sessionsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.slice(5)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#22C55E"
                        name="Completed"
                      />
                      <Line
                        type="monotone"
                        dataKey="scheduled"
                        stroke="#F59E0B"
                        name="Scheduled"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No session data in the last 30 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Most Requested Subjects</CardTitle>
            <CardDescription>Top 10 subjects being taught</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {analytics.popularSubjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.popularSubjects} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" name="Matches" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No subject data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Field Demand Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Field Demand vs Supply</CardTitle>
            <CardDescription>
              Comparing student demand with tutor availability by field. Positive gap means more students than tutors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {analytics.fieldDemandAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.fieldDemandAnalysis.slice(0, 12)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="field"
                      width={150}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="studentDemand" fill="#3B82F6" name="Student Demand" />
                    <Bar dataKey="volunteerSupply" fill="#22C55E" name="Tutor Supply" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No field data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject Demand Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>High Demand Subjects (Unassigned)</CardTitle>
            <CardDescription>
              Subjects with the most unassigned student requests. Focus recruitment on these areas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {analytics.subjectDemandAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subjectDemandAnalysis.slice(0, 12)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={150}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="unassigned" fill="#EF4444" name="Unassigned" />
                    <Bar dataKey="assigned" fill="#22C55E" name="Assigned" />
                    <Bar dataKey="volunteerSupply" fill="#8B5CF6" name="Tutors Available" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No subject demand data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Fields Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Student Fields</CardTitle>
              <CardDescription>Most common fields of study among students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.topStudentFields.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topStudentFields} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="field"
                        width={130}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No student field data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Tutor Fields</CardTitle>
              <CardDescription>Most common fields of expertise among tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.topVolunteerFields.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topVolunteerFields} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="field"
                        width={130}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#22C55E" name="Tutors" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No tutor field data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Tutor Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Tutor Subject Expertise</CardTitle>
            <CardDescription>Most common subjects tutors are qualified to teach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {analytics.topVolunteerSubjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topVolunteerSubjects} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06B6D4" name="Tutors" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No tutor subject data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Download className="h-8 w-8 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Data Backup</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download complete lists of students, tutors, and matches as Excel or PDF files.
                  Excel exports include all details. PDF exports include key fields for quick reference.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Excel (Full Data)</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleExport('students', 'excel')}
                        disabled={exporting !== null}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Students ({analytics.overview.totalStudents})
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleExport('volunteers', 'excel')}
                        disabled={exporting !== null}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Tutors ({analytics.overview.totalVolunteers})
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleExport('matches', 'excel')}
                        disabled={exporting !== null}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Matches ({analytics.overview.totalMatches})
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">PDF (Key Fields)</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={() => handleExport('students', 'pdf')}
                        disabled={exporting !== null}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Students
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => handleExport('volunteers', 'pdf')}
                        disabled={exporting !== null}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Tutors
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => handleExport('matches', 'pdf')}
                        disabled={exporting !== null}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Matches
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
