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
  Edit2,
  Lock,
  Unlock,
  Users,
  Filter,
  RefreshCw,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Save,
  X,
  Plus,
} from 'lucide-react'

interface Volunteer {
  id: string
  fullName: string
  causes: string[]
  fieldsOfExpertise: string[]
  subjectsQualified: string[]
  languagesSpoken: string[]
  preferredLanguage: string
  hoursPerWeekAvailable: number | null
  currentCapacity: number
  maxCapacity: number
  capacitySetBy: 'volunteer' | 'admin'
  city: string | null
  country: string | null
  area: string | null
  age: number | null
  phoneNumber: string | null
  universityAffiliation: string | null
  onlineTeachingExperience: boolean
  diverseBackgroundExperience: boolean
  isAvailable: boolean
  isActive: boolean
  additionalSupportWilling: string | null
  bio: string | null
  rating: number
  totalHoursVolunteered: number
  studentsHelped: number
  user?: {
    email: string
    isActive: boolean
    isVerified: boolean
  }
  matches: Array<{
    id: string
    status: string
    student: {
      id: string
      fullName: string
    }
    assignedSubjects: string[]
  }>
}

interface EditDialogState {
  open: boolean
  volunteer: Volunteer | null
  formData: Partial<Volunteer> & { email?: string; isActive?: boolean; isVerified?: boolean }
  saving: boolean
}

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

type SearchFilterType = 'all' | 'name' | 'subject' | 'field' | 'language' | 'location' | 'university'

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [causeOptions, setCauseOptions] = useState<CauseOption[]>([])
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<SearchFilterType>('all')
  const [causeFilter, setCauseFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all')
  const [expandedVolunteer, setExpandedVolunteer] = useState<string | null>(null)
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    volunteer: null,
    formData: {},
    saving: false,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; volunteer: Volunteer | null; deleting: boolean }>({
    open: false,
    volunteer: null,
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
      phoneNumber: string
      city: string
      country: string
      area: string
      universityAffiliation: string
      causes: string[]
      fieldsOfExpertise: string[]
      subjectsQualified: string[]
      languagesSpoken: string[]
      preferredLanguage: string
      onlineTeachingExperience: boolean
      diverseBackgroundExperience: boolean
      hoursPerWeekAvailable: string
      maxCapacity: string
      additionalSupportWilling: string
      bio: string
    }
  }>({
    open: false,
    saving: false,
    formData: {
      email: '',
      password: '',
      fullName: '',
      age: '',
      phoneNumber: '',
      city: '',
      country: '',
      area: '',
      universityAffiliation: '',
      causes: [],
      fieldsOfExpertise: [],
      subjectsQualified: [],
      languagesSpoken: [],
      preferredLanguage: '',
      onlineTeachingExperience: false,
      diverseBackgroundExperience: false,
      hoursPerWeekAvailable: '',
      maxCapacity: '5',
      additionalSupportWilling: '',
      bio: '',
    },
  })
  const [newField, setNewField] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [addNewField, setAddNewField] = useState('')
  const [addNewSubject, setAddNewSubject] = useState('')
  const [addNewLanguage, setAddNewLanguage] = useState('')

  const fetchVolunteers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch('/api/admin/volunteers')
      if (response.ok) {
        const data = await response.json()
        setVolunteers(data.volunteers)
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error)
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
    fetchVolunteers()
    fetchCauses()
    fetchFields()
  }, [fetchVolunteers, fetchCauses, fetchFields])

  const openEditDialog = async (volunteer: Volunteer) => {
    // Fetch full volunteer details
    try {
      const response = await fetch(`/api/admin/volunteers/${volunteer.id}`)
      if (response.ok) {
        const data = await response.json()
        const fullVolunteer = data.volunteer
        setEditDialog({
          open: true,
          volunteer: fullVolunteer,
          formData: {
            ...fullVolunteer,
            email: fullVolunteer.user?.email,
            isActive: fullVolunteer.user?.isActive,
            isVerified: fullVolunteer.user?.isVerified,
          },
          saving: false,
        })
      }
    } catch (error) {
      console.error('Error fetching volunteer details:', error)
    }
  }

  const saveVolunteer = async () => {
    if (!editDialog.volunteer) return

    setEditDialog(prev => ({ ...prev, saving: true }))
    try {
      const response = await fetch(`/api/admin/volunteers/${editDialog.volunteer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDialog.formData),
      })

      if (response.ok) {
        await fetchVolunteers()
        setEditDialog({ open: false, volunteer: null, formData: {}, saving: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update volunteer')
      }
    } catch (error) {
      console.error('Error updating volunteer:', error)
      alert('Failed to update volunteer')
    } finally {
      setEditDialog(prev => ({ ...prev, saving: false }))
    }
  }

  const deleteVolunteer = async () => {
    if (!deleteConfirm.volunteer) return

    setDeleteConfirm(prev => ({ ...prev, deleting: true }))
    try {
      const response = await fetch(`/api/admin/volunteers/${deleteConfirm.volunteer.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchVolunteers()
        setDeleteConfirm({ open: false, volunteer: null, deleting: false })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete volunteer')
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      alert('Failed to delete volunteer')
    } finally {
      setDeleteConfirm(prev => ({ ...prev, deleting: false }))
    }
  }

  const createVolunteer = async () => {
    const { formData } = addDialog
    if (!formData.email || !formData.password || !formData.fullName) {
      alert('Email, password, and full name are required')
      return
    }

    setAddDialog(prev => ({ ...prev, saving: true }))
    try {
      const response = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchVolunteers()
        setAddDialog({
          open: false,
          saving: false,
          formData: {
            email: '',
            password: '',
            fullName: '',
            age: '',
            phoneNumber: '',
            city: '',
            country: '',
            area: '',
            universityAffiliation: '',
            causes: [],
            fieldsOfExpertise: [],
            subjectsQualified: [],
            languagesSpoken: [],
            preferredLanguage: '',
            onlineTeachingExperience: false,
            diverseBackgroundExperience: false,
            hoursPerWeekAvailable: '',
            maxCapacity: '5',
            additionalSupportWilling: '',
            bio: '',
          },
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create volunteer')
      }
    } catch (error) {
      console.error('Error creating volunteer:', error)
      alert('Failed to create volunteer')
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

  const addToAddArray = (field: 'fieldsOfExpertise' | 'subjectsQualified' | 'languagesSpoken', value: string) => {
    if (!value.trim()) return
    const current = addDialog.formData[field] || []
    if (!current.includes(value.trim())) {
      updateAddFormData(field, [...current, value.trim()])
    }
  }

  const removeFromAddArray = (field: 'fieldsOfExpertise' | 'subjectsQualified' | 'languagesSpoken', value: string) => {
    const current = addDialog.formData[field] || []
    updateAddFormData(field, current.filter((v: string) => v !== value))
  }

  const updateFormData = (field: string, value: unknown) => {
    setEditDialog(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }))
  }

  const addToArray = (field: 'fieldsOfExpertise' | 'subjectsQualified' | 'languagesSpoken' | 'causes', value: string) => {
    if (!value.trim()) return
    const current = (editDialog.formData[field] as string[]) || []
    if (!current.includes(value.trim())) {
      updateFormData(field, [...current, value.trim()])
    }
  }

  const removeFromArray = (field: 'fieldsOfExpertise' | 'subjectsQualified' | 'languagesSpoken' | 'causes', value: string) => {
    const current = (editDialog.formData[field] as string[]) || []
    updateFormData(field, current.filter((v: string) => v !== value))
  }

  // Get unique causes for filter
  const causes = [...new Set(volunteers.flatMap((v) => v.causes || []))].sort()

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const query = searchQuery.toLowerCase().trim()

    let matchesSearch = true
    if (query) {
      switch (searchFilter) {
        case 'name':
          matchesSearch = volunteer.fullName.toLowerCase().includes(query)
          break
        case 'subject':
          matchesSearch = volunteer.subjectsQualified.some((s) =>
            s.toLowerCase().includes(query)
          )
          break
        case 'field':
          matchesSearch = volunteer.fieldsOfExpertise.some((f) =>
            f.toLowerCase().includes(query)
          )
          break
        case 'language':
          matchesSearch = volunteer.languagesSpoken.some((l) =>
            l.toLowerCase().includes(query)
          ) || (volunteer.preferredLanguage?.toLowerCase().includes(query) ?? false)
          break
        case 'location':
          matchesSearch =
            (volunteer.city?.toLowerCase().includes(query) ?? false) ||
            (volunteer.country?.toLowerCase().includes(query) ?? false) ||
            (volunteer.area?.toLowerCase().includes(query) ?? false)
          break
        case 'university':
          matchesSearch = volunteer.universityAffiliation?.toLowerCase().includes(query) ?? false
          break
        case 'all':
        default:
          matchesSearch =
            volunteer.fullName.toLowerCase().includes(query) ||
            (volunteer.causes || []).some((c) => c.toLowerCase().includes(query)) ||
            volunteer.subjectsQualified.some((s) => s.toLowerCase().includes(query)) ||
            volunteer.fieldsOfExpertise.some((f) => f.toLowerCase().includes(query)) ||
            volunteer.languagesSpoken.some((l) => l.toLowerCase().includes(query)) ||
            (volunteer.city?.toLowerCase().includes(query) ?? false) ||
            (volunteer.country?.toLowerCase().includes(query) ?? false) ||
            (volunteer.universityAffiliation?.toLowerCase().includes(query) ?? false)
          break
      }
    }

    const matchesCause = causeFilter === 'all' || (volunteer.causes || []).includes(causeFilter)

    const availableSlots = Math.max(0, volunteer.maxCapacity - volunteer.currentCapacity)
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && availableSlots > 0) ||
      (availabilityFilter === 'full' && availableSlots === 0)

    const matchesActiveStatus =
      activeStatusFilter === 'all' ||
      (activeStatusFilter === 'active' && volunteer.isActive) ||
      (activeStatusFilter === 'disabled' && !volunteer.isActive)

    return matchesSearch && matchesCause && matchesAvailability && matchesActiveStatus
  })

  // Sort volunteers: active first, disabled at the end
  const sortedVolunteers = [...filteredVolunteers].sort((a, b) => {
    if (a.isActive === b.isActive) return 0
    return a.isActive ? -1 : 1
  })

  // Calculate stats
  const totalCapacity = volunteers.reduce((acc, v) => acc + v.maxCapacity, 0)
  const usedCapacity = volunteers.reduce((acc, v) => acc + v.currentCapacity, 0)
  const availableCapacity = totalCapacity - usedCapacity
  const utilizationPercent = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0
  const volunteersAtFull = volunteers.filter(
    (v) => v.currentCapacity >= v.maxCapacity
  ).length
  const lockedVolunteers = volunteers.filter((v) => v.capacitySetBy === 'admin').length

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
            <h1 className="text-2xl font-bold">Tutor Management</h1>
            <p className="text-muted-foreground">
              Manage tutor profiles, capacity, and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setAddDialog(prev => ({ ...prev, open: true }))}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tutor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchVolunteers(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Capacity Overview */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Capacity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Tutors</p>
                <p className="text-2xl font-bold">{volunteers.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity} slots</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableCapacity} slots</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{utilizationPercent}%</p>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        utilizationPercent > 80
                          ? 'bg-red-500'
                          : utilizationPercent > 60
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${utilizationPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Full Capacity</p>
                <p className="text-2xl font-bold text-amber-600">{volunteersAtFull}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{volunteers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Tutors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {volunteers.filter((v) => v.currentCapacity < v.maxCapacity).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{volunteersAtFull}</p>
                  <p className="text-xs text-muted-foreground">At Full Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lockedVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Admin-Locked</p>
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
                      <SelectItem value="subject">Subject</SelectItem>
                      <SelectItem value="field">Field of Expertise</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        searchFilter === 'all' ? 'Search volunteers...' :
                        searchFilter === 'name' ? 'Search by name...' :
                        searchFilter === 'subject' ? 'e.g., Java, C++, Calculus...' :
                        searchFilter === 'field' ? 'e.g., Computer Science, Medicine...' :
                        searchFilter === 'language' ? 'e.g., Arabic, English...' :
                        searchFilter === 'location' ? 'e.g., Gaza, Pakistan...' :
                        searchFilter === 'university' ? 'e.g., LUMS, Iqra University...' :
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
                <SelectRoot value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-[150px] h-10">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="full">At Capacity</SelectItem>
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
                {(searchQuery || causeFilter !== 'all' || availabilityFilter !== 'all' || activeStatusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchFilter('all')
                      setCauseFilter('all')
                      setAvailabilityFilter('all')
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
              {(searchQuery || causeFilter !== 'all' || availabilityFilter !== 'all' || activeStatusFilter !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {sortedVolunteers.length} of {volunteers.length} volunteers</span>
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
                  {availabilityFilter !== 'all' && (
                    <Badge variant="secondary">
                      {availabilityFilter}
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

        {/* Volunteer Cards */}
        <div className="space-y-4">
          {sortedVolunteers.map((volunteer) => {
            const availableSlots = Math.max(0, volunteer.maxCapacity - volunteer.currentCapacity)
            const utilizationPercent = volunteer.maxCapacity > 0
              ? Math.round((volunteer.currentCapacity / volunteer.maxCapacity) * 100)
              : 0
            const isExpanded = expandedVolunteer === volunteer.id
            const isLocked = volunteer.capacitySetBy === 'admin'

            return (
              <Card
                key={volunteer.id}
                className={`transition-all ${
                  !volunteer.isActive
                    ? 'border-l-4 border-l-gray-400 bg-gray-50 opacity-75'
                    : availableSlots === 0
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/30'
                    : 'border-l-4 border-l-green-500'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {volunteer.fullName}
                        {(volunteer.causes || []).map((cause) => (
                          <Badge key={cause} variant="outline">{cause}</Badge>
                        ))}
                        {!volunteer.isActive && (
                          <Badge variant="destructive" className="bg-gray-100 text-gray-700 border-gray-300">
                            Disabled
                          </Badge>
                        )}
                        {volunteer.isActive && availableSlots === 0 && (
                          <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200">
                            Full
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {volunteer.preferredLanguage}
                        {volunteer.hoursPerWeekAvailable && ` • ${volunteer.hoursPerWeekAvailable}h/week`}
                        {volunteer.city && ` • ${volunteer.city}, ${volunteer.country}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(volunteer)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm({ open: true, volunteer, deleting: false })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedVolunteer(isExpanded ? null : volunteer.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Capacity Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Capacity:</span>
                          <span className="text-lg font-bold">
                            {volunteer.currentCapacity}/{volunteer.maxCapacity}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({availableSlots} available)
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            utilizationPercent >= 100
                              ? 'bg-amber-500'
                              : utilizationPercent >= 80
                              ? 'bg-amber-400'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <p className="text-sm font-medium mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {volunteer.subjectsQualified.slice(0, 8).map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                        {volunteer.subjectsQualified.length > 8 && (
                          <Badge variant="outline">
                            +{volunteer.subjectsQualified.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Current Students */}
                    {volunteer.matches.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Current Students</p>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.matches.map((match) => (
                            <div
                              key={match.id}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                            >
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{match.student.fullName}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground text-xs">
                                {match.assignedSubjects.join(', ')}
                              </span>
                              <Badge
                                variant={
                                  match.status === 'active'
                                    ? 'success'
                                    : match.status === 'accepted'
                                    ? 'success'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {match.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Fields of Expertise</p>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.fieldsOfExpertise.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Languages</p>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.languagesSpoken.map((lang) => (
                                <Badge key={lang} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Statistics</p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Hours volunteered:</span>{' '}
                                <span className="font-medium">{volunteer.totalHoursVolunteered}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Students helped:</span>{' '}
                                <span className="font-medium">{volunteer.studentsHelped}</span>
                              </p>
                              {volunteer.rating > 0 && (
                                <p>
                                  <span className="text-muted-foreground">Rating:</span>{' '}
                                  <span className="font-medium">{volunteer.rating.toFixed(1)}/5</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Contact</p>
                            <div className="space-y-1 text-sm">
                              {volunteer.phoneNumber && (
                                <p className="text-muted-foreground">{volunteer.phoneNumber}</p>
                              )}
                              {volunteer.universityAffiliation && (
                                <p className="text-muted-foreground">{volunteer.universityAffiliation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {volunteer.bio && (
                          <div>
                            <p className="text-sm font-medium mb-1">Bio</p>
                            <p className="text-sm text-muted-foreground">{volunteer.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {sortedVolunteers.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || causeFilter !== 'all' || availabilityFilter !== 'all' || activeStatusFilter !== 'all'
                      ? 'No tutors found matching your filters.'
                      : 'No tutors registered yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Volunteer Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialog({ open: false, volunteer: null, formData: {}, saving: false })
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tutor Profile</DialogTitle>
            <DialogDescription>
              Update all details for {editDialog.volunteer?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Basic Info */}
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
              <Label>Phone Number</Label>
              <Input
                value={editDialog.formData.phoneNumber || ''}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={editDialog.formData.city || ''}
                onChange={(e) => updateFormData('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={editDialog.formData.country || ''}
                onChange={(e) => updateFormData('country', e.target.value)}
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
              <Label>University Affiliation</Label>
              <Input
                value={editDialog.formData.universityAffiliation || ''}
                onChange={(e) => updateFormData('universityAffiliation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Supported Causes</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editDialog.formData.causes || []).map((cause: string) => (
                  <Badge key={cause} variant="secondary" className="flex items-center gap-1">
                    {cause}
                    <button
                      type="button"
                      onClick={() => removeFromArray('causes', cause)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <SelectRoot
                value=""
                onValueChange={(v) => {
                  if (v && !(editDialog.formData.causes || []).includes(v)) {
                    addToArray('causes', v)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a cause..." />
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
              <Label>Hours Per Week Available</Label>
              <Input
                type="number"
                value={editDialog.formData.hoursPerWeekAvailable || ''}
                onChange={(e) => updateFormData('hoursPerWeekAvailable', parseInt(e.target.value) || null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Capacity</Label>
              <Input
                type="number"
                value={editDialog.formData.maxCapacity || ''}
                onChange={(e) => updateFormData('maxCapacity', parseInt(e.target.value) || 5)}
              />
            </div>

            {/* Fields of Expertise */}
            <div className="col-span-2 space-y-2">
              <Label>Fields of Expertise</Label>
              <MultiSelect
                options={fieldOptions.map((f) => ({ value: f.name, label: f.name }))}
                value={editDialog.formData.fieldsOfExpertise || []}
                onChange={(values) => updateFormData('fieldsOfExpertise', values)}
                placeholder="Select fields of expertise..."
              />
            </div>

            {/* Subjects Qualified */}
            <div className="col-span-2 space-y-2">
              <Label>Subjects Qualified</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editDialog.formData.subjectsQualified || []).map((subject: string) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeFromArray('subjectsQualified', subject)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addToArray('subjectsQualified', newSubject)
                      setNewSubject('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    addToArray('subjectsQualified', newSubject)
                    setNewSubject('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Languages */}
            <div className="col-span-2 space-y-2">
              <Label>Languages Spoken</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editDialog.formData.languagesSpoken || []).map((lang: string) => (
                  <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeFromArray('languagesSpoken', lang)}
                      className="ml-1 hover:text-red-600"
                    >
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    addToArray('languagesSpoken', newLanguage)
                    setNewLanguage('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={editDialog.formData.bio || ''}
                onChange={(e) => updateFormData('bio', e.target.value)}
                rows={3}
              />
            </div>

            {/* Additional Support */}
            <div className="col-span-2 space-y-2">
              <Label>Additional Support Willing to Provide</Label>
              <Textarea
                value={editDialog.formData.additionalSupportWilling || ''}
                onChange={(e) => updateFormData('additionalSupportWilling', e.target.value)}
                rows={2}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Online Teaching Experience</Label>
              </div>
              <Switch
                checked={editDialog.formData.onlineTeachingExperience || false}
                onCheckedChange={(checked) => updateFormData('onlineTeachingExperience', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Diverse Background Experience</Label>
              </div>
              <Switch
                checked={editDialog.formData.diverseBackgroundExperience || false}
                onCheckedChange={(checked) => updateFormData('diverseBackgroundExperience', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Is Available</Label>
              </div>
              <Switch
                checked={editDialog.formData.isAvailable !== false}
                onCheckedChange={(checked) => updateFormData('isAvailable', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Account Active</Label>
              </div>
              <Switch
                checked={editDialog.formData.isActive !== false}
                onCheckedChange={(checked) => updateFormData('isActive', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg col-span-2">
              <div>
                <Label>Email Verified</Label>
              </div>
              <Switch
                checked={editDialog.formData.isVerified || false}
                onCheckedChange={(checked) => updateFormData('isVerified', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, volunteer: null, formData: {}, saving: false })}
              disabled={editDialog.saving}
            >
              Cancel
            </Button>
            <Button onClick={saveVolunteer} disabled={editDialog.saving}>
              {editDialog.saving ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm({ open: false, volunteer: null, deleting: false })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tutor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm.volunteer?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, volunteer: null, deleting: false })}
              disabled={deleteConfirm.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteVolunteer}
              disabled={deleteConfirm.deleting}
            >
              {deleteConfirm.deleting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Volunteer Dialog */}
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
              Add New Tutor
            </DialogTitle>
            <DialogDescription>
              Fill in the tutor details. Required fields are marked with *.
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
                    placeholder="volunteer@example.com"
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
                  <Label>Phone Number</Label>
                  <Input
                    value={addDialog.formData.phoneNumber}
                    onChange={(e) => updateAddFormData('phoneNumber', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={addDialog.formData.city}
                    onChange={(e) => updateAddFormData('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={addDialog.formData.country}
                    onChange={(e) => updateAddFormData('country', e.target.value)}
                    placeholder="Country"
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
              </div>
            </div>

            {/* Education & Expertise */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Education & Expertise</h3>
              <div className="space-y-2">
                <Label>University Affiliation</Label>
                <Input
                  value={addDialog.formData.universityAffiliation}
                  onChange={(e) => updateAddFormData('universityAffiliation', e.target.value)}
                  placeholder="University name"
                />
              </div>

              {/* Fields of Expertise */}
              <div className="space-y-2">
                <Label>Fields of Expertise</Label>
                <MultiSelect
                  options={fieldOptions.map((f) => ({ value: f.name, label: f.name }))}
                  value={addDialog.formData.fieldsOfExpertise}
                  onChange={(values) => updateAddFormData('fieldsOfExpertise', values)}
                  placeholder="Select fields of expertise..."
                />
              </div>

              {/* Subjects Qualified */}
              <div className="space-y-2">
                <Label>Subjects Qualified to Teach</Label>
                <div className="flex gap-2">
                  <Input
                    value={addNewSubject}
                    onChange={(e) => setAddNewSubject(e.target.value)}
                    placeholder="Add subject (e.g., Calculus, Physics)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToAddArray('subjectsQualified', addNewSubject)
                        setAddNewSubject('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToAddArray('subjectsQualified', addNewSubject)
                      setAddNewSubject('')
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {addDialog.formData.subjectsQualified.map((subject) => (
                    <Badge key={subject} variant="outline" className="flex items-center gap-1 bg-blue-50">
                      {subject}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromAddArray('subjectsQualified', subject)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={addDialog.formData.onlineTeachingExperience}
                    onCheckedChange={(v) => updateAddFormData('onlineTeachingExperience', v)}
                  />
                  <Label>Online Teaching Experience</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={addDialog.formData.diverseBackgroundExperience}
                    onCheckedChange={(v) => updateAddFormData('diverseBackgroundExperience', v)}
                  />
                  <Label>Diverse Background Experience</Label>
                </div>
              </div>
            </div>

            {/* Languages & Availability */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Languages & Availability</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Input
                    value={addDialog.formData.preferredLanguage}
                    onChange={(e) => updateAddFormData('preferredLanguage', e.target.value)}
                    placeholder="e.g., English, Arabic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hours Per Week Available</Label>
                  <Input
                    type="number"
                    value={addDialog.formData.hoursPerWeekAvailable}
                    onChange={(e) => updateAddFormData('hoursPerWeekAvailable', e.target.value)}
                    placeholder="Hours available"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Students (Capacity)</Label>
                  <Input
                    type="number"
                    value={addDialog.formData.maxCapacity}
                    onChange={(e) => updateAddFormData('maxCapacity', e.target.value)}
                    placeholder="Max students"
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

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Additional Information</h3>
              <div className="space-y-2">
                <Label>Additional Support Willing to Provide</Label>
                <Textarea
                  value={addDialog.formData.additionalSupportWilling}
                  onChange={(e) => updateAddFormData('additionalSupportWilling', e.target.value)}
                  placeholder="e.g., Mentorship, Career guidance, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={addDialog.formData.bio}
                  onChange={(e) => updateAddFormData('bio', e.target.value)}
                  placeholder="Brief bio about the volunteer"
                  rows={3}
                />
              </div>
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
              onClick={createVolunteer}
              disabled={addDialog.saving || !addDialog.formData.email || !addDialog.formData.password || !addDialog.formData.fullName}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {addDialog.saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Create Tutor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
