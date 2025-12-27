'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/ui/multi-select'
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
import {
  Search,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Check,
  X,
  AlertCircle,
  Filter,
  RefreshCw,
  GraduationCap,
  Users,
  CircleDot,
  Edit2,
  Trash2,
  Save,
  Plus,
} from 'lucide-react'

interface Topic {
  keyword: string
  status: 'unassigned' | 'assigned'
  assignedTo: string | null
  volunteerName?: string
}

interface Student {
  id: string
  fullName: string
  cause: string
  fieldsOfStudy: string[]
  topicsNeedSupport: Topic[]
  languagesSpoken: string[]
  preferredLanguage: string
  hoursPerWeekNeeded: number | null
  currentCity: string | null
  currentCountry: string | null
  age: number | null
  gender: string | null
  phoneNumber: string | null
  alternativeContact: string | null
  area: string | null
  originalLocation: string | null
  originalUniversity: string | null
  currentUniversity: string | null
  creditsRemaining: number | null
  hasTranscripts: boolean
  deviceAccessLevel: number | null
  internetAccessLevel: number | null
  materialsAccessLevel: number | null
  specialNeeds: string | null
  educationalBackground: string | null
  careerGoals: string | null
  isActive: boolean
  user?: {
    email: string
    isActive: boolean
    isVerified: boolean
  }
  matches: Array<{
    id: string
    status: string
    volunteer: {
      id: string
      fullName: string
    }
    assignedSubjects: string[]
  }>
}

interface SubjectMatch {
  volunteer: string
  student: string
  similarity: number
}

interface SuggestedMatch {
  volunteerId: string
  volunteerName: string
  score: number
  matchingSubjects: SubjectMatch[]
  matchingFields?: string[]
  availableCapacity: number
  subjectsQualified: string[]
  preferredLanguage: string
  isAlreadyMatched?: boolean
  existingMatchStatus?: string | null
  existingAssignedSubjects?: string[]
}

interface AssignmentDialogState {
  open: boolean
  student: Student | null
  topic: Topic | null
  suggestions: SuggestedMatch[]
  loading: boolean
}

interface EditDialogState {
  open: boolean
  student: Student | null
  formData: Partial<Student> & { email?: string; isActive?: boolean; isVerified?: boolean }
  saving: boolean
}

type SearchFilterType = 'all' | 'name' | 'topic' | 'field' | 'language' | 'location' | 'university'

const MATCH_STATUSES = [
  { value: 'pending_email', label: 'Pending Email', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'email_sent', label: 'Email Sent', color: 'bg-blue-100 text-blue-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'active', label: 'Active', color: 'bg-green-500 text-white' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'not_compatible', label: 'Not Compatible', color: 'bg-gray-100 text-gray-800' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800' },
  { value: 'paused', label: 'Paused', color: 'bg-orange-100 text-orange-800' },
] as const

interface CauseOption {
  id: string
  name: string
  description: string | null
  region: string | null
  priority: number
}

interface FieldOption {
  id: string
  name: string
  category: string | null
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [causeOptions, setCauseOptions] = useState<CauseOption[]>([])
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<SearchFilterType>('all')
  const [causeFilter, setCauseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('all')
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all')
  const [updatingMatchStatus, setUpdatingMatchStatus] = useState<string | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [suggestedMatches, setSuggestedMatches] = useState<Record<string, SuggestedMatch[]>>({})
  const [loadingSuggestions, setLoadingSuggestions] = useState<string | null>(null)
  const [assignmentDialog, setAssignmentDialog] = useState<AssignmentDialogState>({
    open: false,
    student: null,
    topic: null,
    suggestions: [],
    loading: false,
  })
  const [assigning, setAssigning] = useState(false)
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    student: null,
    formData: {},
    saving: false,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; student: Student | null; deleting: boolean }>({
    open: false,
    student: null,
    deleting: false,
  })
  const [addDialog, setAddDialog] = useState<{
    open: boolean
    saving: boolean
    formData: {
      email: string
      password: string
      fullName: string
      age: string
      gender: string
      phoneNumber: string
      alternativeContact: string
      currentCity: string
      currentCountry: string
      area: string
      originalLocation: string
      cause: string
      fieldsOfStudy: string[]
      topicsNeedSupport: string[]
      originalUniversity: string
      currentUniversity: string
      creditsRemaining: string
      hasTranscripts: boolean
      preferredLanguage: string
      languagesSpoken: string[]
      hoursPerWeekNeeded: string
      deviceAccessLevel: string
      internetAccessLevel: string
      materialsAccessLevel: string
      specialNeeds: string
      educationalBackground: string
      careerGoals: string
    }
  }>({
    open: false,
    saving: false,
    formData: {
      email: '',
      password: '',
      fullName: '',
      age: '',
      gender: '',
      phoneNumber: '',
      alternativeContact: '',
      currentCity: '',
      currentCountry: '',
      area: '',
      originalLocation: '',
      cause: '',
      fieldsOfStudy: [],
      topicsNeedSupport: [],
      originalUniversity: '',
      currentUniversity: '',
      creditsRemaining: '',
      hasTranscripts: false,
      preferredLanguage: '',
      languagesSpoken: [],
      hoursPerWeekNeeded: '',
      deviceAccessLevel: '',
      internetAccessLevel: '',
      materialsAccessLevel: '',
      specialNeeds: '',
      educationalBackground: '',
      careerGoals: '',
    },
  })
  const [newField, setNewField] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [addNewField, setAddNewField] = useState('')
  const [addNewTopic, setAddNewTopic] = useState('')
  const [addNewLanguage, setAddNewLanguage] = useState('')

  const fetchStudents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch('/api/admin/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchCauses = useCallback(async () => {
    try {
      const response = await fetch('/api/causes')
      if (response.ok) {
        const data = await response.json()
        setCauseOptions(data.causes)
      }
    } catch (error) {
      console.error('Error fetching causes:', error)
    }
  }, [])

  const fetchFields = useCallback(async () => {
    try {
      const response = await fetch('/api/fields')
      if (response.ok) {
        const data = await response.json()
        setFieldOptions(data.fields)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchCauses()
    fetchFields()
  }, [fetchStudents, fetchCauses, fetchFields])

  const fetchSuggestedMatches = async (studentId: string) => {
    if (suggestedMatches[studentId]) return suggestedMatches[studentId]

    setLoadingSuggestions(studentId)
    try {
      const response = await fetch(`/api/admin/students/${studentId}/suggestions`)
      if (response.ok) {
        const data = await response.json()
        setSuggestedMatches((prev) => ({ ...prev, [studentId]: data.suggestions }))
        return data.suggestions
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoadingSuggestions(null)
    }
    return []
  }

  const updateMatchStatus = async (matchId: string, newStatus: string, studentId: string) => {
    setUpdatingMatchStatus(matchId)
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the local state
        setStudents((prev) =>
          prev.map((student) => {
            if (student.id === studentId) {
              return {
                ...student,
                matches: student.matches.map((match) =>
                  match.id === matchId ? { ...match, status: newStatus } : match
                ),
              }
            }
            return student
          })
        )
      } else {
        const errorText = await response.text()
        let errorMessage = 'Unknown error'
        try {
          const error = JSON.parse(errorText)
          errorMessage = error.error || JSON.stringify(error)
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`
        }
        console.error('Failed to update match status:', errorMessage)
        alert('Failed to update status: ' + errorMessage)
      }
    } catch (error) {
      console.error('Error updating match status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingMatchStatus(null)
    }
  }

  const handleExpand = async (studentId: string) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(studentId)
      await fetchSuggestedMatches(studentId)
    }
  }

  const openAssignmentDialog = async (student: Student, topic: Topic) => {
    setAssignmentDialog({
      open: true,
      student,
      topic,
      suggestions: [],
      loading: true,
    })

    const suggestions = await fetchSuggestedMatches(student.id)
    setAssignmentDialog((prev) => ({
      ...prev,
      suggestions: suggestions || [],
      loading: false,
    }))
  }

  const assignSubject = async (volunteerId: string) => {
    if (!assignmentDialog.student || !assignmentDialog.topic) return

    setAssigning(true)
    try {
      const response = await fetch(
        `/api/admin/students/${assignmentDialog.student.id}/assign-subject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectKeyword: assignmentDialog.topic.keyword,
            volunteerId,
          }),
        }
      )

      if (response.ok) {
        await fetchStudents()
        setSuggestedMatches((prev) => {
          const updated = { ...prev }
          delete updated[assignmentDialog.student!.id]
          return updated
        })
        setAssignmentDialog({ open: false, student: null, topic: null, suggestions: [], loading: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign subject')
      }
    } catch (error) {
      console.error('Error assigning subject:', error)
      alert('Failed to assign subject')
    } finally {
      setAssigning(false)
    }
  }

  const unassignSubject = async (studentId: string, keyword: string) => {
    if (!confirm(`Unassign "${keyword}" from the current volunteer?`)) return

    try {
      const response = await fetch(`/api/admin/students/${studentId}/assign-subject`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectKeyword: keyword }),
      })

      if (response.ok) {
        await fetchStudents()
        setSuggestedMatches((prev) => {
          const updated = { ...prev }
          delete updated[studentId]
          return updated
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to unassign subject')
      }
    } catch (error) {
      console.error('Error unassigning subject:', error)
    }
  }

  const openEditDialog = async (student: Student) => {
    try {
      const response = await fetch(`/api/admin/students/${student.id}`)
      if (response.ok) {
        const data = await response.json()
        const fullStudent = data.student
        setEditDialog({
          open: true,
          student: fullStudent,
          formData: {
            ...fullStudent,
            email: fullStudent.user?.email,
            isActive: fullStudent.user?.isActive,
            isVerified: fullStudent.user?.isVerified,
          },
          saving: false,
        })
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }

  const saveStudent = async () => {
    if (!editDialog.student) return

    setEditDialog(prev => ({ ...prev, saving: true }))
    try {
      const response = await fetch(`/api/admin/students/${editDialog.student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDialog.formData),
      })

      if (response.ok) {
        await fetchStudents()
        setEditDialog({ open: false, student: null, formData: {}, saving: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student')
    } finally {
      setEditDialog(prev => ({ ...prev, saving: false }))
    }
  }

  const deleteStudent = async () => {
    if (!deleteConfirm.student) return

    setDeleteConfirm(prev => ({ ...prev, deleting: true }))
    try {
      const response = await fetch(`/api/admin/students/${deleteConfirm.student.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchStudents()
        setDeleteConfirm({ open: false, student: null, deleting: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    } finally {
      setDeleteConfirm(prev => ({ ...prev, deleting: false }))
    }
  }

  const createStudent = async () => {
    const { formData } = addDialog
    if (!formData.email || !formData.password || !formData.fullName || !formData.cause) {
      alert('Email, password, full name, and cause are required')
      return
    }

    setAddDialog(prev => ({ ...prev, saving: true }))
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchStudents()
        setAddDialog({
          open: false,
          saving: false,
          formData: {
            email: '',
            password: '',
            fullName: '',
            age: '',
            gender: '',
            phoneNumber: '',
            alternativeContact: '',
            currentCity: '',
            currentCountry: '',
            area: '',
            originalLocation: '',
            cause: 'Gaza',
            fieldsOfStudy: [],
            topicsNeedSupport: [],
            originalUniversity: '',
            currentUniversity: '',
            creditsRemaining: '',
            hasTranscripts: false,
            preferredLanguage: '',
            languagesSpoken: [],
            hoursPerWeekNeeded: '',
            deviceAccessLevel: '',
            internetAccessLevel: '',
            materialsAccessLevel: '',
            specialNeeds: '',
            educationalBackground: '',
            careerGoals: '',
          },
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Failed to create student')
    } finally {
      setAddDialog(prev => ({ ...prev, saving: false }))
    }
  }

  const updateAddFormData = (field: string, value: unknown) => {
    setAddDialog(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }))
  }

  const addToAddArray = (field: 'fieldsOfStudy' | 'languagesSpoken' | 'topicsNeedSupport', value: string) => {
    if (!value.trim()) return
    const current = addDialog.formData[field] || []
    if (!current.includes(value.trim())) {
      updateAddFormData(field, [...current, value.trim()])
    }
  }

  const removeFromAddArray = (field: 'fieldsOfStudy' | 'languagesSpoken' | 'topicsNeedSupport', value: string) => {
    const current = addDialog.formData[field] || []
    updateAddFormData(field, current.filter((v: string) => v !== value))
  }

  const updateFormData = (field: string, value: unknown) => {
    setEditDialog(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }))
  }

  const addToArray = (field: 'fieldsOfStudy' | 'languagesSpoken', value: string) => {
    if (!value.trim()) return
    const current = (editDialog.formData[field] as string[]) || []
    if (!current.includes(value.trim())) {
      updateFormData(field, [...current, value.trim()])
    }
  }

  const removeFromArray = (field: 'fieldsOfStudy' | 'languagesSpoken', value: string) => {
    const current = (editDialog.formData[field] as string[]) || []
    updateFormData(field, current.filter((v: string) => v !== value))
  }

  const addTopic = (keyword: string) => {
    if (!keyword.trim()) return
    const current = (editDialog.formData.topicsNeedSupport as Topic[]) || []
    if (!current.some(t => t.keyword.toLowerCase() === keyword.toLowerCase())) {
      updateFormData('topicsNeedSupport', [...current, { keyword: keyword.trim(), status: 'unassigned', assignedTo: null }])
    }
  }

  const removeTopic = (keyword: string) => {
    const current = (editDialog.formData.topicsNeedSupport as Topic[]) || []
    updateFormData('topicsNeedSupport', current.filter(t => t.keyword !== keyword))
  }

  // Get unique causes for filter
  const causes = [...new Set(students.map((s) => s.cause))].sort()

  // Filter students
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim()

    let matchesSearch = true
    if (query) {
      switch (searchFilter) {
        case 'name':
          matchesSearch = student.fullName.toLowerCase().includes(query)
          break
        case 'topic':
          matchesSearch = student.topicsNeedSupport.some((t) =>
            t.keyword.toLowerCase().includes(query)
          )
          break
        case 'field':
          matchesSearch = student.fieldsOfStudy.some((f) =>
            f.toLowerCase().includes(query)
          )
          break
        case 'language':
          matchesSearch = student.languagesSpoken.some((l) =>
            l.toLowerCase().includes(query)
          ) || (student.preferredLanguage?.toLowerCase().includes(query) ?? false)
          break
        case 'location':
          matchesSearch =
            (student.currentCity?.toLowerCase().includes(query) ?? false) ||
            (student.currentCountry?.toLowerCase().includes(query) ?? false) ||
            (student.area?.toLowerCase().includes(query) ?? false)
          break
        case 'university':
          matchesSearch =
            (student.originalUniversity?.toLowerCase().includes(query) ?? false) ||
            (student.currentUniversity?.toLowerCase().includes(query) ?? false)
          break
        case 'all':
        default:
          matchesSearch =
            student.fullName.toLowerCase().includes(query) ||
            student.cause.toLowerCase().includes(query) ||
            student.topicsNeedSupport.some((t) => t.keyword.toLowerCase().includes(query)) ||
            student.fieldsOfStudy.some((f) => f.toLowerCase().includes(query)) ||
            student.languagesSpoken.some((l) => l.toLowerCase().includes(query)) ||
            (student.currentCity?.toLowerCase().includes(query) ?? false) ||
            (student.currentCountry?.toLowerCase().includes(query) ?? false) ||
            (student.originalUniversity?.toLowerCase().includes(query) ?? false)
          break
      }
    }

    const matchesCause = causeFilter === 'all' || student.cause === causeFilter

    const unassignedCount = student.topicsNeedSupport.filter((t) => t.status === 'unassigned').length
    const assignedCount = student.topicsNeedSupport.filter((t) => t.status === 'assigned').length
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unassigned' && unassignedCount > 0) ||
      (statusFilter === 'partial' && unassignedCount > 0 && assignedCount > 0) ||
      (statusFilter === 'complete' && unassignedCount === 0 && assignedCount > 0)

    const matchesMatchStatus =
      matchStatusFilter === 'all' ||
      student.matches.some((match) => match.status === matchStatusFilter)

    const matchesActiveStatus =
      activeStatusFilter === 'all' ||
      (activeStatusFilter === 'active' && student.isActive) ||
      (activeStatusFilter === 'disabled' && !student.isActive)

    return matchesSearch && matchesCause && matchesStatus && matchesMatchStatus && matchesActiveStatus
  })

  // Sort students: active first, disabled at the end
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a.isActive === b.isActive) return 0
    return a.isActive ? -1 : 1
  })

  const getTopicStats = (student: Student) => {
    const assigned = student.topicsNeedSupport.filter((t) => t.status === 'assigned').length
    const total = student.topicsNeedSupport.length
    return { assigned, total, unassigned: total - assigned }
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">
              Manage student profiles and subject assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setAddDialog(prev => ({ ...prev, open: true }))}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudents(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {students.filter((s) => s.topicsNeedSupport.some((t) => t.status === 'unassigned')).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Need Assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CircleDot className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {students.reduce((acc, s) => acc + s.topicsNeedSupport.filter((t) => t.status === 'unassigned').length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Unassigned Topics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {students.reduce((acc, s) => acc + s.topicsNeedSupport.filter((t) => t.status === 'assigned').length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Assigned Topics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search & Filter Row - All in one line */}
              <div className="flex items-center gap-3">
                {/* Search Section */}
                <div className="flex items-center gap-2 flex-1">
                  <SelectRoot value={searchFilter} onValueChange={(value) => setSearchFilter(value as SearchFilterType)}>
                    <SelectTrigger className="w-[180px] h-10">
                      <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="topic">Topic / Subject</SelectItem>
                      <SelectItem value="field">Field of Study</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        searchFilter === 'all' ? 'Search students...' :
                        searchFilter === 'name' ? 'Search by name...' :
                        searchFilter === 'topic' ? 'e.g., calculus, AI, programming...' :
                        searchFilter === 'field' ? 'e.g., Medicine, Engineering...' :
                        searchFilter === 'language' ? 'e.g., Arabic, English...' :
                        searchFilter === 'location' ? 'e.g., Gaza, Palestine...' :
                        searchFilter === 'university' ? 'e.g., Iqra University...' :
                        'Search...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-border" />

                {/* Filter Dropdowns */}
                <SelectRoot value={causeFilter} onValueChange={setCauseFilter}>
                  <SelectTrigger className="w-[150px] h-10">
                    <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Cause" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Causes</SelectItem>
                    {causes.map((cause) => (
                      <SelectItem key={cause} value={cause}>
                        {cause}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <SelectRoot value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[170px] h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unassigned">Has Unassigned</SelectItem>
                    <SelectItem value="partial">Partially Assigned</SelectItem>
                    <SelectItem value="complete">Fully Assigned</SelectItem>
                  </SelectContent>
                </SelectRoot>
                <SelectRoot value={matchStatusFilter} onValueChange={setMatchStatusFilter}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue placeholder="Match Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Match Status</SelectItem>
                    {MATCH_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <SelectRoot value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Profile Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="disabled">Disabled Only</SelectItem>
                  </SelectContent>
                </SelectRoot>

                {/* Clear Filters Button */}
                {(searchQuery || causeFilter !== 'all' || statusFilter !== 'all' || matchStatusFilter !== 'all' || activeStatusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchFilter('all')
                      setCauseFilter('all')
                      setStatusFilter('all')
                      setMatchStatusFilter('all')
                      setActiveStatusFilter('all')
                    }}
                    className="h-10 px-3 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Active filters summary */}
              {(searchQuery || causeFilter !== 'all' || statusFilter !== 'all' || matchStatusFilter !== 'all' || activeStatusFilter !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span>Showing {sortedStudents.length} of {students.length} students</span>
                  {searchQuery && (
                    <Badge variant="secondary">
                      {searchFilter === 'all' ? 'All' : searchFilter}: &quot;{searchQuery}&quot;
                    </Badge>
                  )}
                  {causeFilter !== 'all' && (
                    <Badge variant="secondary">
                      Cause: {causeFilter}
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary">
                      {statusFilter}
                    </Badge>
                  )}
                  {matchStatusFilter !== 'all' && (
                    <Badge variant="secondary">
                      Match: {MATCH_STATUSES.find(s => s.value === matchStatusFilter)?.label || matchStatusFilter}
                    </Badge>
                  )}
                  {activeStatusFilter !== 'all' && (
                    <Badge variant="secondary">
                      {activeStatusFilter === 'active' ? 'Active' : 'Disabled'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Cards */}
        <div className="space-y-4">
          {sortedStudents.map((student) => {
            const stats = getTopicStats(student)
            const isExpanded = expandedStudent === student.id
            const studentSuggestions = suggestedMatches[student.id] || []
            const coveragePercent = stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0

            return (
              <Card
                key={student.id}
                className={`transition-all ${
                  !student.isActive
                    ? 'border-l-4 border-l-gray-400 bg-gray-50 opacity-75'
                    : stats.unassigned > 0
                    ? 'border-l-4 border-l-amber-500'
                    : stats.assigned > 0
                    ? 'border-l-4 border-l-green-500'
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {student.fullName}
                        <Badge variant="outline">{student.cause}</Badge>
                        {!student.isActive && (
                          <Badge variant="destructive" className="bg-gray-100 text-gray-700 border-gray-300">
                            Disabled
                          </Badge>
                        )}
                        {student.isActive && stats.unassigned > 0 && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                            {stats.unassigned} unassigned
                          </Badge>
                        )}
                        {student.isActive && stats.assigned > 0 && stats.unassigned === 0 && (
                          <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                            Fully assigned
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {student.preferredLanguage}
                        {student.hoursPerWeekNeeded && ` • ${student.hoursPerWeekNeeded}h/week`}
                        {student.currentCity && ` • ${student.currentCity}, ${student.currentCountry}`}
                      </CardDescription>
                      {student.fieldsOfStudy.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-muted-foreground mr-1">Major:</span>
                          {student.fieldsOfStudy.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-sm font-medium">{coveragePercent}% covered</p>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              coveragePercent === 100
                                ? 'bg-green-500'
                                : coveragePercent > 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${coveragePercent}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(student)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm({ open: true, student, deleting: false })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleExpand(student.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Subject Assignment Grid */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-3">Subject Assignment Status</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {student.topicsNeedSupport.map((topic) => (
                          <div
                            key={topic.keyword}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              topic.status === 'assigned'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {topic.status === 'assigned' ? (
                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                                  )}
                                  <span className="font-medium truncate">{topic.keyword}</span>
                                </div>
                                {topic.status === 'assigned' && topic.volunteerName && (
                                  <p className="text-xs text-green-700 mt-1 ml-6">
                                    Assigned to: {topic.volunteerName}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {topic.status === 'assigned' ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => unassignSubject(student.id, topic.keyword)}
                                  >
                                    Unassign
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-100"
                                    onClick={() => openAssignmentDialog(student, topic)}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Assign
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Teachers */}
                    {student.matches.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Current Teachers</p>
                        <div className="flex flex-wrap gap-2">
                          {student.matches.map((match) => {
                            const currentStatus = MATCH_STATUSES.find(s => s.value === match.status)
                            return (
                              <div
                                key={match.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                              >
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{match.volunteer.fullName}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                  {match.assignedSubjects.join(', ')}
                                </span>
                                <SelectRoot
                                  value={match.status}
                                  onValueChange={(value) => updateMatchStatus(match.id, value, student.id)}
                                  disabled={updatingMatchStatus === match.id}
                                >
                                  <SelectTrigger
                                    className={`h-7 text-xs min-w-[130px] ${currentStatus?.color || 'bg-gray-100'}`}
                                  >
                                    {updatingMatchStatus === match.id ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MATCH_STATUSES.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                                          {status.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </SelectRoot>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Expanded Content - Suggested Volunteers */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Suggested Volunteers</p>
                        {loadingSuggestions === student.id ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          </div>
                        ) : studentSuggestions.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {studentSuggestions.slice(0, 6).map((suggestion) => (
                              <div
                                key={suggestion.volunteerId}
                                className="p-4 bg-gray-50 rounded-lg border"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{suggestion.volunteerName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        Score: {suggestion.score}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {suggestion.availableCapacity} slots available
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Language: {suggestion.preferredLanguage}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Matching subjects:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {suggestion.matchingSubjects.map((match, idx) => (
                                      <Badge
                                        key={`${match.volunteer}-${idx}`}
                                        variant="outline"
                                        className={`text-xs ${
                                          match.similarity >= 80
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : match.similarity >= 60
                                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                            : 'bg-orange-50 border-orange-200 text-orange-700'
                                        }`}
                                      >
                                        {match.volunteer.toLowerCase() === match.student.toLowerCase()
                                          ? match.volunteer
                                          : `${match.student} ≈ ${match.volunteer}`}{' '}
                                        ({match.similarity}%)
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No matching volunteers found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {sortedStudents.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || causeFilter !== 'all' || statusFilter !== 'all' || activeStatusFilter !== 'all'
                      ? 'No students found matching your filters.'
                      : 'No students registered yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAssignmentDialog({ open: false, student: null, topic: null, suggestions: [], loading: false })
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign &quot;{assignmentDialog.topic?.keyword}&quot;</DialogTitle>
            <DialogDescription>
              Select a volunteer to teach {assignmentDialog.student?.fullName} this subject
            </DialogDescription>
          </DialogHeader>

          {assignmentDialog.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : assignmentDialog.suggestions.length > 0 ? (
            <div className="space-y-3 py-4">
              {assignmentDialog.suggestions.map((suggestion) => {
                const topicKeyword = assignmentDialog.topic?.keyword || ''
                const topicMatch = suggestion.matchingSubjects.find(
                  (m) => m.student.toLowerCase() === topicKeyword.toLowerCase()
                )
                const matchesTopic = !!topicMatch

                return (
                  <div
                    key={suggestion.volunteerId}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      matchesTopic ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{suggestion.volunteerName}</p>
                          <Badge variant="secondary">Score: {suggestion.score}</Badge>
                          {suggestion.isAlreadyMatched && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              Already Matched
                            </Badge>
                          )}
                          {matchesTopic && topicMatch && (
                            <Badge variant="success" className="bg-green-100 text-green-700">
                              {topicMatch.student.toLowerCase() !== topicMatch.volunteer.toLowerCase() ? (
                                <span>{topicMatch.student} ≈ {topicMatch.volunteer} ({topicMatch.similarity}%)</span>
                              ) : (
                                <span>{topicMatch.similarity}% Match</span>
                              )}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Available slots:</span> {suggestion.availableCapacity}
                            {suggestion.isAlreadyMatched && ' (can add subjects)'}
                          </p>
                          <p>
                            <span className="font-medium">Language:</span> {suggestion.preferredLanguage}
                          </p>
                          {suggestion.matchingFields && suggestion.matchingFields.length > 0 && (
                            <p>
                              <span className="font-medium">Matching Fields:</span>{' '}
                              <span className="text-blue-600">{suggestion.matchingFields.join(', ')}</span>
                            </p>
                          )}
                          {suggestion.matchingSubjects.length === 0 && suggestion.matchingFields && suggestion.matchingFields.length > 0 && (
                            <p className="text-amber-600 text-xs italic">
                              Field match only - no specific subject match
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => assignSubject(suggestion.volunteerId)}
                        disabled={assigning || (!suggestion.isAlreadyMatched && suggestion.availableCapacity === 0)}
                        className={matchesTopic ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {assigning ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-1" />
                        )}
                        {suggestion.isAlreadyMatched ? 'Add Subject' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No available volunteers match this student&apos;s requirements.</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentDialog({ open: false, student: null, topic: null, suggestions: [], loading: false })}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false, student: null, formData: {}, saving: false })
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>Update all details for {editDialog.student?.fullName}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editDialog.formData.fullName || ''}
                onChange={(e) => updateFormData('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editDialog.formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                value={editDialog.formData.age || ''}
                onChange={(e) => updateFormData('age', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input
                value={editDialog.formData.gender || ''}
                onChange={(e) => updateFormData('gender', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editDialog.formData.phoneNumber || ''}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alternative Contact</Label>
              <Input
                value={editDialog.formData.alternativeContact || ''}
                onChange={(e) => updateFormData('alternativeContact', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current City</Label>
              <Input
                value={editDialog.formData.currentCity || ''}
                onChange={(e) => updateFormData('currentCity', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Country</Label>
              <Input
                value={editDialog.formData.currentCountry || ''}
                onChange={(e) => updateFormData('currentCountry', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Area</Label>
              <Input
                value={editDialog.formData.area || ''}
                onChange={(e) => updateFormData('area', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Original Location</Label>
              <Input
                value={editDialog.formData.originalLocation || ''}
                onChange={(e) => updateFormData('originalLocation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cause</Label>
              <SelectRoot value={editDialog.formData.cause || ''} onValueChange={(v) => updateFormData('cause', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cause" />
                </SelectTrigger>
                <SelectContent>
                  {causeOptions.map((cause) => (
                    <SelectItem key={cause.id} value={cause.name}>
                      {cause.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Input
                value={editDialog.formData.preferredLanguage || ''}
                onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Original University</Label>
              <Input
                value={editDialog.formData.originalUniversity || ''}
                onChange={(e) => updateFormData('originalUniversity', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current University</Label>
              <Input
                value={editDialog.formData.currentUniversity || ''}
                onChange={(e) => updateFormData('currentUniversity', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Credits Remaining</Label>
              <Input
                type="number"
                value={editDialog.formData.creditsRemaining || ''}
                onChange={(e) => updateFormData('creditsRemaining', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hours Per Week Needed</Label>
              <Input
                type="number"
                value={editDialog.formData.hoursPerWeekNeeded || ''}
                onChange={(e) => updateFormData('hoursPerWeekNeeded', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Device Access Level (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={editDialog.formData.deviceAccessLevel || ''}
                onChange={(e) => updateFormData('deviceAccessLevel', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Internet Access Level (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={editDialog.formData.internetAccessLevel || ''}
                onChange={(e) => updateFormData('internetAccessLevel', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Materials Access Level (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={editDialog.formData.materialsAccessLevel || ''}
                onChange={(e) => updateFormData('materialsAccessLevel', parseInt(e.target.value) || null)}
              />
            </div>

            {/* Fields of Study */}
            <div className="col-span-2 space-y-2">
              <Label>Fields of Study</Label>
              <MultiSelect
                options={fieldOptions.map((f) => ({ value: f.name, label: f.name }))}
                value={(editDialog.formData.fieldsOfStudy as string[]) || []}
                onChange={(values) => updateFormData('fieldsOfStudy', values)}
                placeholder="Select fields of study..."
              />
            </div>

            {/* Topics Need Support */}
            <div className="col-span-2 space-y-2">
              <Label>Topics Need Support</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {((editDialog.formData.topicsNeedSupport as Topic[]) || []).map((topic) => (
                  <Badge
                    key={topic.keyword}
                    variant={topic.status === 'assigned' ? 'success' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {topic.keyword}
                    {topic.status === 'unassigned' && (
                      <button type="button" onClick={() => removeTopic(topic.keyword)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTopic(newTopic)
                      setNewTopic('')
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => { addTopic(newTopic); setNewTopic('') }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Languages */}
            <div className="col-span-2 space-y-2">
              <Label>Languages Spoken</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {((editDialog.formData.languagesSpoken as string[]) || []).map((lang) => (
                  <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                    {lang}
                    <button type="button" onClick={() => removeFromArray('languagesSpoken', lang)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add language..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addToArray('languagesSpoken', newLanguage)
                      setNewLanguage('')
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => { addToArray('languagesSpoken', newLanguage); setNewLanguage('') }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Areas */}
            <div className="col-span-2 space-y-2">
              <Label>Special Needs</Label>
              <Textarea
                value={editDialog.formData.specialNeeds || ''}
                onChange={(e) => updateFormData('specialNeeds', e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Educational Background</Label>
              <Textarea
                value={editDialog.formData.educationalBackground || ''}
                onChange={(e) => updateFormData('educationalBackground', e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Career Goals</Label>
              <Textarea
                value={editDialog.formData.careerGoals || ''}
                onChange={(e) => updateFormData('careerGoals', e.target.value)}
                rows={2}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Has Transcripts</Label>
              <Switch
                checked={editDialog.formData.hasTranscripts || false}
                onCheckedChange={(checked) => updateFormData('hasTranscripts', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Account Active</Label>
              <Switch
                checked={editDialog.formData.isActive !== false}
                onCheckedChange={(checked) => updateFormData('isActive', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg col-span-2">
              <Label>Email Verified</Label>
              <Switch
                checked={editDialog.formData.isVerified || false}
                onCheckedChange={(checked) => updateFormData('isVerified', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, student: null, formData: {}, saving: false })}
              disabled={editDialog.saving}
            >
              Cancel
            </Button>
            <Button onClick={saveStudent} disabled={editDialog.saving}>
              {editDialog.saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm({ open: false, student: null, deleting: false })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm.student?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, student: null, deleting: false })}
              disabled={deleteConfirm.deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteStudent} disabled={deleteConfirm.deleting}>
              {deleteConfirm.deleting ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog
        open={addDialog.open}
        onOpenChange={(open) => {
          if (!open && !addDialog.saving) {
            setAddDialog(prev => ({ ...prev, open: false }))
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Student
            </DialogTitle>
            <DialogDescription>
              Fill in the student details. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Account Information *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={addDialog.formData.email}
                    onChange={(e) => updateAddFormData('email', e.target.value)}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={addDialog.formData.password}
                    onChange={(e) => updateAddFormData('password', e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={addDialog.formData.fullName}
                    onChange={(e) => updateAddFormData('fullName', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={addDialog.formData.age}
                    onChange={(e) => updateAddFormData('age', e.target.value)}
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <SelectRoot value={addDialog.formData.gender} onValueChange={(v) => updateAddFormData('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={addDialog.formData.phoneNumber}
                    onChange={(e) => updateAddFormData('phoneNumber', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alternative Contact</Label>
                  <Input
                    value={addDialog.formData.alternativeContact}
                    onChange={(e) => updateAddFormData('alternativeContact', e.target.value)}
                    placeholder="WhatsApp, Telegram, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cause *</Label>
                  <SelectRoot value={addDialog.formData.cause} onValueChange={(v) => updateAddFormData('cause', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                    <SelectContent>
                      {causeOptions.length > 0 ? (
                        causeOptions.map((cause) => (
                          <SelectItem key={cause.id} value={cause.name}>
                            {cause.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No causes available.<br/>Add causes from Settings page.
                        </div>
                      )}
                    </SelectContent>
                  </SelectRoot>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current City</Label>
                  <Input
                    value={addDialog.formData.currentCity}
                    onChange={(e) => updateAddFormData('currentCity', e.target.value)}
                    placeholder="Current city"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Country</Label>
                  <Input
                    value={addDialog.formData.currentCountry}
                    onChange={(e) => updateAddFormData('currentCountry', e.target.value)}
                    placeholder="Current country"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input
                    value={addDialog.formData.area}
                    onChange={(e) => updateAddFormData('area', e.target.value)}
                    placeholder="Area/district"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Location</Label>
                  <Input
                    value={addDialog.formData.originalLocation}
                    onChange={(e) => updateAddFormData('originalLocation', e.target.value)}
                    placeholder="Original location"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Education</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original University</Label>
                  <Input
                    value={addDialog.formData.originalUniversity}
                    onChange={(e) => updateAddFormData('originalUniversity', e.target.value)}
                    placeholder="Original university"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current University</Label>
                  <Input
                    value={addDialog.formData.currentUniversity}
                    onChange={(e) => updateAddFormData('currentUniversity', e.target.value)}
                    placeholder="Current university"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credits Remaining</Label>
                  <Input
                    type="number"
                    value={addDialog.formData.creditsRemaining}
                    onChange={(e) => updateAddFormData('creditsRemaining', e.target.value)}
                    placeholder="Credits remaining"
                  />
                </div>
                <div className="space-y-2 flex items-center gap-3 pt-6">
                  <Switch
                    checked={addDialog.formData.hasTranscripts}
                    onCheckedChange={(v) => updateAddFormData('hasTranscripts', v)}
                  />
                  <Label>Has Transcripts</Label>
                </div>
              </div>

              {/* Fields of Study */}
              <div className="space-y-2">
                <Label>Fields of Study</Label>
                <MultiSelect
                  options={fieldOptions.map((f) => ({ value: f.name, label: f.name }))}
                  value={addDialog.formData.fieldsOfStudy}
                  onChange={(values) => updateAddFormData('fieldsOfStudy', values)}
                  placeholder="Select fields of study..."
                />
              </div>

              {/* Topics Need Support */}
              <div className="space-y-2">
                <Label>Topics Need Support</Label>
                <div className="flex gap-2">
                  <Input
                    value={addNewTopic}
                    onChange={(e) => setAddNewTopic(e.target.value)}
                    placeholder="Add topic (e.g., Calculus, Physics)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToAddArray('topicsNeedSupport', addNewTopic)
                        setAddNewTopic('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToAddArray('topicsNeedSupport', addNewTopic)
                      setAddNewTopic('')
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {addDialog.formData.topicsNeedSupport.map((topic) => (
                    <Badge key={topic} variant="outline" className="flex items-center gap-1 bg-amber-50">
                      {topic}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromAddArray('topicsNeedSupport', topic)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Educational Background</Label>
                <Textarea
                  value={addDialog.formData.educationalBackground}
                  onChange={(e) => updateAddFormData('educationalBackground', e.target.value)}
                  placeholder="Brief educational background"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Career Goals</Label>
                <Textarea
                  value={addDialog.formData.careerGoals}
                  onChange={(e) => updateAddFormData('careerGoals', e.target.value)}
                  placeholder="Career goals and aspirations"
                  rows={2}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Languages & Availability</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Input
                    value={addDialog.formData.preferredLanguage}
                    onChange={(e) => updateAddFormData('preferredLanguage', e.target.value)}
                    placeholder="e.g., English, Arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hours Per Week Needed</Label>
                  <Input
                    type="number"
                    value={addDialog.formData.hoursPerWeekNeeded}
                    onChange={(e) => updateAddFormData('hoursPerWeekNeeded', e.target.value)}
                    placeholder="Hours needed per week"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <div className="flex gap-2">
                  <Input
                    value={addNewLanguage}
                    onChange={(e) => setAddNewLanguage(e.target.value)}
                    placeholder="Add language"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToAddArray('languagesSpoken', addNewLanguage)
                        setAddNewLanguage('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToAddArray('languagesSpoken', addNewLanguage)
                      setAddNewLanguage('')
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {addDialog.formData.languagesSpoken.map((lang) => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                      {lang}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromAddArray('languagesSpoken', lang)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Access Levels */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Resource Access (1-5 scale)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Device Access</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={addDialog.formData.deviceAccessLevel}
                    onChange={(e) => updateAddFormData('deviceAccessLevel', e.target.value)}
                    placeholder="1-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Internet Access</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={addDialog.formData.internetAccessLevel}
                    onChange={(e) => updateAddFormData('internetAccessLevel', e.target.value)}
                    placeholder="1-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materials Access</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={addDialog.formData.materialsAccessLevel}
                    onChange={(e) => updateAddFormData('materialsAccessLevel', e.target.value)}
                    placeholder="1-5"
                  />
                </div>
              </div>
            </div>

            {/* Special Needs */}
            <div className="space-y-2">
              <Label>Special Needs</Label>
              <Textarea
                value={addDialog.formData.specialNeeds}
                onChange={(e) => updateAddFormData('specialNeeds', e.target.value)}
                placeholder="Any special needs or accommodations"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog(prev => ({ ...prev, open: false }))}
              disabled={addDialog.saving}
            >
              Cancel
            </Button>
            <Button
              onClick={createStudent}
              disabled={addDialog.saving || !addDialog.formData.email || !addDialog.formData.password || !addDialog.formData.fullName}
              className="bg-green-600 hover:bg-green-700"
            >
              {addDialog.saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
