'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Search,
  RefreshCw,
  ArrowRight,
  UserPlus,
  CheckCircle,
  Mail,
  Clock,
  Filter,
  Users,
  GraduationCap,
  AlertCircle,
  Edit2,
  XCircle,
  Play,
  Pause,
  MailCheck,
  UserX,
  Trash2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface MatchingKeywordDetailed {
  studentTopic: string
  volunteerSubject: string
  similarity: number
}

interface Suggestion {
  studentId: string
  studentName: string
  studentCause: string
  studentFields: string[]
  studentTopics: string[]
  volunteerId: string
  volunteerName: string
  volunteerFields: string[]
  volunteerSubjects: string[]
  volunteerEmail: string
  score: number
  matchingKeywords: string[]
  matchingKeywordsDetailed?: MatchingKeywordDetailed[]
  matchingFields: string[]
  volunteerExistingMatches: Array<{
    studentName: string
    status: string
    subjects: string[]
  }>
}

interface Session {
  id: string
  status: string
  scheduledAt: string | null
  durationMinutes: number
  subjectsCovered: string[]
}

interface Match {
  id: string
  studentId: string
  volunteerId: string
  status: string
  matchScore: number | null
  assignedSubjects: string[]
  adminNotes: string | null
  emailSentAt: string | null
  createdAt: string
  sessions?: Session[]
  student: {
    id: string
    fullName: string
    cause: string
    fieldsOfStudy: string[]
    topicsNeedSupport: Array<{ keyword: string; status: string }>
  }
  volunteer: {
    id: string
    fullName: string
    cause: string
    fieldsOfExpertise: string[]
    subjectsQualified: string[]
    currentCapacity: number
    maxCapacity: number
  }
}

interface UnmatchedStudent {
  id: string
  fullName: string
  cause: string
  fieldsOfStudy: string[]
  topicsNeedSupport: Array<{ keyword: string; status: string }>
  preferredLanguage: string | null
  currentCity: string | null
  currentCountry: string | null
}

interface UnmatchedVolunteer {
  id: string
  fullName: string
  cause: string
  fieldsOfExpertise: string[]
  subjectsQualified: string[]
  preferredLanguage: string | null
  city: string | null
  country: string | null
  currentCapacity: number
  maxCapacity: number
}

const STATUS_OPTIONS = [
  { value: 'auto_suggested', label: 'Auto Suggested', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending_email', label: 'Pending Email', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'email_sent', label: 'Email Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700' },
  { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'not_compatible', label: 'Not Compatible', color: 'bg-orange-100 text-orange-700' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700' },
  { value: 'paused', label: 'Paused', color: 'bg-slate-100 text-slate-700' },
]

export default function AdminMatchesPage() {
  const [activeTab, setActiveTab] = useState('suggestions')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [unmatchedStudents, setUnmatchedStudents] = useState<UnmatchedStudent[]>([])
  const [unmatchedVolunteers, setUnmatchedVolunteers] = useState<UnmatchedVolunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean
    match: Match | null
    newStatus: string
    notes: string
    saving: boolean
  }>({ open: false, match: null, newStatus: '', notes: '', saving: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    match: Match | null
    deleting: boolean
  }>({ open: false, match: null, deleting: false })
  const [subjectDialog, setSubjectDialog] = useState<{
    open: boolean
    suggestion: Suggestion | null
    selectedSubjects: string[]
    creating: boolean
  }>({ open: false, suggestion: null, selectedSubjects: [], creating: false })
  const [exporting, setExporting] = useState<string | null>(null)

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [suggestionsRes, matchesRes, unmatchedRes] = await Promise.all([
        fetch('/api/admin/suggestions'),
        fetch('/api/matches'),
        fetch('/api/admin/unmatched'),
      ])

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json()
        setSuggestions(data.suggestions)
      }

      if (matchesRes.ok) {
        const data = await matchesRes.json()
        setMatches(data.matches)
      }

      if (unmatchedRes.ok) {
        const data = await unmatchedRes.json()
        setUnmatchedStudents(data.students)
        setUnmatchedVolunteers(data.volunteers)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Open subject selection dialog
  const openSubjectDialog = (suggestion: Suggestion) => {
    setSubjectDialog({
      open: true,
      suggestion,
      selectedSubjects: [], // Start with none selected
      creating: false,
    })
  }

  // Toggle subject selection
  const toggleSubject = (subject: string) => {
    setSubjectDialog((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter((s) => s !== subject)
        : [...prev.selectedSubjects, subject],
    }))
  }

  // Select all subjects
  const selectAllSubjects = () => {
    if (!subjectDialog.suggestion) return
    setSubjectDialog((prev) => ({
      ...prev,
      selectedSubjects: [...prev.suggestion!.studentTopics],
    }))
  }

  // Create match with selected subjects
  const createMatchWithSubjects = async () => {
    if (!subjectDialog.suggestion || subjectDialog.selectedSubjects.length === 0) return

    setSubjectDialog((prev) => ({ ...prev, creating: true }))
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: subjectDialog.suggestion.studentId,
          volunteerId: subjectDialog.suggestion.volunteerId,
          assignedSubjects: subjectDialog.selectedSubjects,
        }),
      })

      if (response.ok) {
        await fetchAllData()
        setSubjectDialog({ open: false, suggestion: null, selectedSubjects: [], creating: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create match')
      }
    } catch (error) {
      console.error('Error creating match:', error)
      alert('Failed to create match')
    } finally {
      setSubjectDialog((prev) => ({ ...prev, creating: false }))
    }
  }

  // Export function
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

  const updateMatchStatus = async () => {
    if (!statusDialog.match) return

    setStatusDialog(prev => ({ ...prev, saving: true }))
    try {
      const response = await fetch(`/api/matches/${statusDialog.match.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusDialog.newStatus,
          adminNotes: statusDialog.notes,
        }),
      })

      if (response.ok) {
        await fetchAllData()
        setStatusDialog({ open: false, match: null, newStatus: '', notes: '', saving: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setStatusDialog(prev => ({ ...prev, saving: false }))
    }
  }

  const sendEmail = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/send-email`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchAllData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  const deleteMatch = async () => {
    if (!deleteDialog.match) return

    setDeleteDialog(prev => ({ ...prev, deleting: true }))
    try {
      const response = await fetch(`/api/matches/${deleteDialog.match.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAllData()
        setDeleteDialog({ open: false, match: null, deleting: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete match')
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      alert('Failed to delete match')
    } finally {
      setDeleteDialog(prev => ({ ...prev, deleting: false }))
    }
  }

  // Get unique subjects from matches for filter
  const allSubjects = [...new Set(matches.flatMap(m => m.assignedSubjects))].sort()

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    const query = searchQuery.toLowerCase()
    return (
      s.studentName.toLowerCase().includes(query) ||
      s.volunteerName.toLowerCase().includes(query) ||
      s.studentFields.some(f => f.toLowerCase().includes(query)) ||
      s.volunteerFields.some(f => f.toLowerCase().includes(query))
    )
  })

  // Filter matches (exclude rejected/not_compatible for main matched tab)
  const filteredMatches = matches.filter((m) => {
    // Exclude rejected matches from main matched tab
    if (['rejected', 'not_compatible'].includes(m.status)) return false

    const matchesSearch =
      m.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.volunteer.fullName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter

    const matchesSubject =
      subjectFilter === 'all' || m.assignedSubjects.includes(subjectFilter)

    return matchesSearch && matchesStatus && matchesSubject
  })

  // Filter rejected matches for rejected tab
  const filteredRejectedMatches = matches.filter((m) => {
    // Only include rejected/not_compatible matches
    if (!['rejected', 'not_compatible'].includes(m.status)) return false

    const matchesSearch =
      m.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.volunteer.fullName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Filter unmatched
  const filteredUnmatchedStudents = unmatchedStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUnmatchedVolunteers = unmatchedVolunteers.filter((v) =>
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status)
    return option ? option : { label: status, color: 'bg-gray-100 text-gray-700' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_email': return <Clock className="h-3 w-3" />
      case 'email_sent': return <Mail className="h-3 w-3" />
      case 'accepted': return <CheckCircle className="h-3 w-3" />
      case 'active': return <Play className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'completed': return <MailCheck className="h-3 w-3" />
      default: return null
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

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Match Management</h1>
            <p className="text-muted-foreground">
              Create, manage, and track student-tutor matches
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Excel:</span>
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleExport('students', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'students-excel' ? '...' : 'Students'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleExport('volunteers', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'volunteers-excel' ? '...' : 'Tutors'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleExport('matches', 'excel')}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {exporting === 'matches-excel' ? '...' : 'Matches'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">PDF:</span>
              <Button
                variant="default"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => handleExport('students', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'students-pdf' ? '...' : 'Students'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => handleExport('volunteers', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'volunteers-pdf' ? '...' : 'Tutors'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={() => handleExport('matches', 'pdf')}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 mr-1" />
                {exporting === 'matches-pdf' ? '...' : 'Matches'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAllData()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{suggestions.length}</p>
              <p className="text-sm text-muted-foreground">Suggestions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-yellow-600">
                {matches.filter(m => m.status === 'pending_email').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Email</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'email_sent').length}
              </p>
              <p className="text-sm text-muted-foreground">Awaiting Response</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-600">
                {matches.filter(m => ['accepted', 'active'].includes(m.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-red-600">
                {unmatchedStudents.length}
              </p>
              <p className="text-sm text-muted-foreground">Unmatched Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Suggestions ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="matched" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Matched ({matches.filter(m => !['rejected', 'not_compatible'].includes(m.status)).length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({matches.filter(m => ['rejected', 'not_compatible'].includes(m.status)).length})
            </TabsTrigger>
            <TabsTrigger value="unmatched" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Unmatched ({unmatchedStudents.length + unmatchedVolunteers.length})
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            {filteredSuggestions.length > 0 ? (
              <div className="space-y-3">
                {filteredSuggestions.map((suggestion) => {
                  const key = `${suggestion.studentId}-${suggestion.volunteerId}`
                  const hasExistingMatches = suggestion.volunteerExistingMatches?.length > 0

                  return (
                    <Card key={key} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <span>{suggestion.studentName}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span>{suggestion.volunteerName}</span>
                            <Badge variant="outline" className="ml-2">
                              {suggestion.studentCause}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <div className={`text-2xl font-bold ${
                              suggestion.score >= 50 ? 'text-green-600' :
                              suggestion.score > 0 ? 'text-amber-600' : 'text-gray-400'
                            }`}>
                              {suggestion.score}%
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openSubjectDialog(suggestion)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Create Match
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Volunteer's existing matches warning */}
                        {hasExistingMatches && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">
                                  Tutor has existing matches:
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {suggestion.volunteerExistingMatches.map((match, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className={`text-xs ${
                                        match.status === 'email_sent'
                                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                                          : match.status === 'pending_email'
                                          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                          : 'bg-green-50 border-green-200 text-green-700'
                                      }`}
                                    >
                                      {match.studentName} - {match.status.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {/* Student Info */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Student Fields
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {suggestion.studentFields.map((field) => {
                                const isMatched = suggestion.matchingFields?.includes(field)
                                return (
                                  <Badge
                                    key={field}
                                    variant={isMatched ? 'default' : 'outline'}
                                    className={isMatched ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                  >
                                    {isMatched && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {field}
                                  </Badge>
                                )
                              })}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Student Needs Help With
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.studentTopics.map((topic) => {
                                const matchDetail = suggestion.matchingKeywordsDetailed?.find(
                                  m => m.studentTopic.toLowerCase() === topic.toLowerCase()
                                )
                                const isMatched = suggestion.matchingKeywords.includes(topic) || matchDetail
                                const isSemanticMatch = matchDetail &&
                                  matchDetail.studentTopic.toLowerCase() !== matchDetail.volunteerSubject.toLowerCase()

                                return (
                                  <Badge
                                    key={topic}
                                    variant={isMatched ? 'default' : 'outline'}
                                    className={isMatched ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                    title={matchDetail ? `Matches with "${matchDetail.volunteerSubject}" (${matchDetail.similarity}%)` : undefined}
                                  >
                                    {isMatched && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {isSemanticMatch ? (
                                      <span>
                                        {topic} <span className="opacity-75">≈ {matchDetail.volunteerSubject}</span>
                                        <span className="ml-1 text-xs opacity-75">({matchDetail.similarity}%)</span>
                                      </span>
                                    ) : (
                                      topic
                                    )}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>

                          {/* Volunteer Info */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Tutor Fields
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {suggestion.volunteerFields.map((field) => {
                                const isMatched = suggestion.matchingFields?.includes(field)
                                return (
                                  <Badge
                                    key={field}
                                    variant={isMatched ? 'default' : 'outline'}
                                    className={isMatched ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                  >
                                    {isMatched && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {field}
                                  </Badge>
                                )
                              })}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Tutor Can Teach
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.volunteerSubjects.map((subject) => {
                                const matchDetail = suggestion.matchingKeywordsDetailed?.find(
                                  m => m.volunteerSubject.toLowerCase() === subject.toLowerCase()
                                )
                                const isMatched = suggestion.matchingKeywords.some(
                                  k => k.toLowerCase() === subject.toLowerCase()
                                ) || matchDetail
                                return (
                                  <Badge
                                    key={subject}
                                    variant={isMatched ? 'default' : 'outline'}
                                    className={isMatched ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                  >
                                    {isMatched && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {subject}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Matching Fields & Keywords */}
                        <div className="mt-3 pt-3 border-t flex flex-wrap gap-4">
                          {suggestion.matchingFields?.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium text-blue-600">Matching Fields:</span>{' '}
                              {suggestion.matchingFields.join(', ')}
                            </p>
                          )}
                          {suggestion.matchingKeywordsDetailed && suggestion.matchingKeywordsDetailed.length > 0 ? (
                            <div className="text-sm">
                              <span className="font-medium text-green-600">Matching Keywords:</span>{' '}
                              {suggestion.matchingKeywordsDetailed.map((m, idx) => (
                                <span key={m.studentTopic}>
                                  {idx > 0 && ', '}
                                  {m.studentTopic.toLowerCase() === m.volunteerSubject.toLowerCase() ? (
                                    m.studentTopic
                                  ) : (
                                    <span>
                                      {m.studentTopic} ≈ {m.volunteerSubject}
                                      <span className="text-xs text-muted-foreground ml-1">({m.similarity}%)</span>
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : suggestion.matchingKeywords.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium text-green-600">Matching Keywords:</span>{' '}
                              {suggestion.matchingKeywords.join(', ')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No matches found for your search.'
                        : 'No suggestions available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Matched Tab */}
          <TabsContent value="matched" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <SelectRoot value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <SelectRoot value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {allSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            {filteredMatches.length > 0 ? (
              <div className="space-y-3">
                {filteredMatches.map((match) => {
                  const statusInfo = getStatusBadge(match.status)

                  return (
                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <span>{match.student.fullName}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Users className="h-5 w-5 text-green-600" />
                            <span>{match.volunteer.fullName}</span>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                              {getStatusIcon(match.status)}
                              {statusInfo.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStatusDialog({
                                open: true,
                                match,
                                newStatus: match.status,
                                notes: match.adminNotes || '',
                                saving: false,
                              })}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Update Status
                            </Button>
                            {match.status === 'pending_email' && (
                              <Button
                                size="sm"
                                onClick={() => sendEmail(match.id)}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Send Email
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteDialog({
                                open: true,
                                match,
                                deleting: false,
                              })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Created: {new Date(match.createdAt).toLocaleDateString()}
                          {match.emailSentAt && (
                            <> • Email sent: {new Date(match.emailSentAt).toLocaleDateString()}</>
                          )}
                          {match.matchScore && (
                            <> • Score: {Math.round(match.matchScore)}%</>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Student's Topics */}
                          <div>
                            <p className="text-sm font-medium mb-2">Student Needs Help With</p>
                            <div className="flex flex-wrap gap-1">
                              {match.student.topicsNeedSupport.map((topic: { keyword: string; status: string }) => {
                                const isAssigned = match.assignedSubjects.some(
                                  (s) => s.toLowerCase() === topic.keyword.toLowerCase()
                                )
                                return (
                                  <Badge
                                    key={topic.keyword}
                                    variant={isAssigned ? 'default' : 'outline'}
                                    className={isAssigned ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                  >
                                    {isAssigned && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {topic.keyword}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                          {/* Tutor's Subjects */}
                          <div>
                            <p className="text-sm font-medium mb-2">Tutor Can Teach</p>
                            <div className="flex flex-wrap gap-1">
                              {match.volunteer.subjectsQualified.slice(0, 6).map((subject) => {
                                const isAssigned = match.assignedSubjects.some(
                                  (s) => s.toLowerCase() === subject.toLowerCase()
                                )
                                return (
                                  <Badge
                                    key={subject}
                                    variant={isAssigned ? 'default' : 'outline'}
                                    className={isAssigned ? 'bg-green-600 text-white' : 'text-muted-foreground'}
                                  >
                                    {isAssigned && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {subject}
                                  </Badge>
                                )
                              })}
                              {match.volunteer.subjectsQualified.length > 6 && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  +{match.volunteer.subjectsQualified.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Assigned Subjects Summary */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Assigned Subjects ({match.assignedSubjects.length})</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {match.assignedSubjects.map((subject) => (
                                  <Badge key={subject} className="bg-green-100 text-green-700">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {match.volunteer.currentCapacity}/{match.volunteer.maxCapacity}
                            </p>
                          </div>
                        </div>
                        {match.adminNotes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm">
                              <span className="font-medium">Admin Notes:</span> {match.adminNotes}
                            </p>
                          </div>
                        )}
                        {/* Session Progress */}
                        {match.status === 'active' && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Session Progress
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {match.sessions?.filter((s) => s.status === 'completed').length || 0} completed, {' '}
                                {match.sessions?.filter((s) => s.status === 'scheduled').length || 0} scheduled
                              </span>
                            </div>
                            {match.sessions && match.sessions.length > 0 ? (
                              <div className="space-y-1">
                                {match.sessions.slice(0, 3).map((session) => (
                                  <div key={session.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={session.status === 'completed' ? 'success' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {session.status}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {session.scheduledAt ? new Date(session.scheduledAt).toLocaleDateString() : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">{session.durationMinutes} min</span>
                                      <div className="flex gap-1">
                                        {session.subjectsCovered.map((s) => (
                                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {match.sessions.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{match.sessions.length - 3} more sessions
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                No sessions logged yet
                              </p>
                            )}
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
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No matches found with the selected filters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4">
            {filteredRejectedMatches.length > 0 ? (
              <div className="space-y-3">
                {filteredRejectedMatches.map((match) => {
                  const statusInfo = getStatusBadge(match.status)

                  return (
                    <Card key={match.id} className="hover:shadow-md transition-shadow border-red-200 bg-red-50/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <span>{match.student.fullName}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Users className="h-5 w-5 text-green-600" />
                            <span>{match.volunteer.fullName}</span>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                              {getStatusIcon(match.status)}
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Rejected on {new Date(match.createdAt).toLocaleDateString()}
                          {match.adminNotes && ` • Reason: ${match.adminNotes}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Student Fields
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.student.fieldsOfStudy.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Tutor Expertise
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.volunteer.fieldsOfExpertise.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {match.assignedSubjects.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Assigned Subjects
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.assignedSubjects.map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setStatusDialog({
                                open: true,
                                match,
                                newStatus: 'pending_email',
                                notes: '',
                                saving: false,
                              })
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Re-activate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteDialog({
                                open: true,
                                match,
                                deleting: false,
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No rejected matches found.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rejected matches will appear here so you don&apos;t approach the same pairs again.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Unmatched Tab */}
          <TabsContent value="unmatched" className="space-y-6">
            {/* Unmatched Students */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                Unmatched Students ({filteredUnmatchedStudents.length})
              </h3>
              {filteredUnmatchedStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredUnmatchedStudents.map((student) => (
                    <Card key={student.id} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {student.fullName}
                          <Badge variant="outline" className="ml-auto">
                            {student.cause}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {student.preferredLanguage}
                          {student.currentCity && ` • ${student.currentCity}, ${student.currentCountry}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Fields of Study</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {student.fieldsOfStudy.map((field) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Needs Help With</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {student.topicsNeedSupport.map((topic) => (
                                <Badge
                                  key={topic.keyword}
                                  variant="outline"
                                  className={`text-xs ${
                                    topic.status === 'unassigned'
                                      ? 'bg-red-50 border-red-200 text-red-700'
                                      : 'bg-green-50 border-green-200 text-green-700'
                                  }`}
                                >
                                  {topic.keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    All students have been matched!
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Unmatched Tutors */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                Unmatched Tutors ({filteredUnmatchedVolunteers.length})
              </h3>
              {filteredUnmatchedVolunteers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredUnmatchedVolunteers.map((volunteer) => (
                    <Card key={volunteer.id} className="border-l-4 border-l-amber-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {volunteer.fullName}
                          <Badge variant="outline" className="ml-auto">
                            {volunteer.cause}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {volunteer.preferredLanguage}
                          {volunteer.city && ` • ${volunteer.city}, ${volunteer.country}`}
                          <span className="ml-2 text-green-600">
                            {volunteer.maxCapacity - volunteer.currentCapacity} slots available
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Fields of Expertise</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {volunteer.fieldsOfExpertise.map((field) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Can Teach</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {volunteer.subjectsQualified.slice(0, 5).map((subject) => (
                                <Badge key={subject} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                              {volunteer.subjectsQualified.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{volunteer.subjectsQualified.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    All tutors have been matched!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setStatusDialog({ open: false, match: null, newStatus: '', notes: '', saving: false })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Status</DialogTitle>
            <DialogDescription>
              Update status for {statusDialog.match?.student.fullName} &rarr; {statusDialog.match?.volunteer.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <SelectRoot
                value={statusDialog.newStatus}
                onValueChange={(value) => setStatusDialog(prev => ({ ...prev, newStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${option.color}`}>
                          {option.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusDialog.notes}
                onChange={(e) => setStatusDialog(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialog({ open: false, match: null, newStatus: '', notes: '', saving: false })}
              disabled={statusDialog.saving}
            >
              Cancel
            </Button>
            <Button onClick={updateMatchStatus} disabled={statusDialog.saving}>
              {statusDialog.saving ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({ open: false, match: null, deleting: false })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match?
              {deleteDialog.match && (
                <span className="block mt-2 font-medium text-foreground">
                  {deleteDialog.match.student.fullName} → {deleteDialog.match.volunteer.fullName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <p className="font-medium">This will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Remove the match completely</li>
                <li>Reset assigned subjects back to &quot;unassigned&quot;</li>
                <li>Allow you to re-match from suggestions</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, match: null, deleting: false })}
              disabled={deleteDialog.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteMatch}
              disabled={deleteDialog.deleting}
            >
              {deleteDialog.deleting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Selection Dialog */}
      <Dialog
        open={subjectDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setSubjectDialog({ open: false, suggestion: null, selectedSubjects: [], creating: false })
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Subjects to Assign</DialogTitle>
            <DialogDescription>
              {subjectDialog.suggestion && (
                <>
                  Creating match: <span className="font-medium">{subjectDialog.suggestion.studentName}</span>
                  {' → '}
                  <span className="font-medium">{subjectDialog.suggestion.volunteerName}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Student&apos;s Topics</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAllSubjects}
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {subjectDialog.suggestion?.studentTopics.map((topic) => {
                const matchDetail = subjectDialog.suggestion?.matchingKeywordsDetailed?.find(
                  (m) => m.studentTopic.toLowerCase() === topic.toLowerCase()
                )
                const isMatched = subjectDialog.suggestion?.matchingKeywords.includes(topic) || matchDetail
                const isSelected = subjectDialog.selectedSubjects.includes(topic)

                return (
                  <div
                    key={topic}
                    className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSubject(topic)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSubject(topic)}
                    />
                    <div className="flex-1">
                      <span className="font-medium">{topic}</span>
                      {matchDetail && matchDetail.studentTopic.toLowerCase() !== matchDetail.volunteerSubject.toLowerCase() && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ≈ {matchDetail.volunteerSubject} ({matchDetail.similarity}%)
                        </span>
                      )}
                    </div>
                    {isMatched && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Matched
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {subjectDialog.selectedSubjects.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Selected: {subjectDialog.selectedSubjects.length} subject(s)
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subjectDialog.selectedSubjects.map((s) => (
                    <Badge key={s} className="bg-blue-600 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubjectDialog({ open: false, suggestion: null, selectedSubjects: [], creating: false })}
              disabled={subjectDialog.creating}
            >
              Cancel
            </Button>
            <Button
              onClick={createMatchWithSubjects}
              disabled={subjectDialog.creating || subjectDialog.selectedSubjects.length === 0}
            >
              {subjectDialog.creating ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              Create Match ({subjectDialog.selectedSubjects.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
