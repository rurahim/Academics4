'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Plus,
  Trash2,
  Mail,
  Heart,
  Users,
  GraduationCap,
  Edit2,
  X,
  AlertCircle,
  Check,
  Globe,
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  isDefault: boolean
}

interface Cause {
  id: string
  name: string
  description: string | null
  region: string | null
  priority: number
  isActive: boolean
  studentCount: number
  volunteerCount: number
  createdAt: string
}

const defaultTemplates = [
  {
    name: 'match_request',
    subject: 'New Student Match Request - {{student_name}}',
    body: `Dear {{tutor_name}},

We have a new student who needs your help!

Student: {{student_name}}
Cause: {{cause}}
Subjects: {{subjects}}

The student is looking for support in the following topics:
{{topics}}

Please log in to your dashboard to review and respond to this match request.

Best regards,
The Academics4 Team`,
  },
  {
    name: 'match_accepted',
    subject: 'Great news! A tutor has been assigned to help you',
    body: `Dear {{student_name}},

Great news! {{tutor_name}} has agreed to help you with your studies.

Subjects: {{subjects}}

Your tutor will reach out to you soon to schedule your first session.

Best regards,
The Academics4 Team`,
  },
  {
    name: 'match_rejected',
    subject: 'Update on your tutor request',
    body: `Dear {{student_name}},

Unfortunately, {{tutor_name}} was unable to take on additional students at this time.

Don't worry - we're working on finding another tutor who can help you with {{subjects}}.

Best regards,
The Academics4 Team`,
  },
]

export default function AdminSettingsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [causes, setCauses] = useState<Cause[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [editingCause, setEditingCause] = useState<Cause | null>(null)
  const [isNewCause, setIsNewCause] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'causes' | 'templates' | 'settings'>('causes')

  useEffect(() => {
    Promise.all([fetchTemplates(), fetchCauses()]).finally(() => setLoading(false))
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchCauses = async () => {
    try {
      const response = await fetch('/api/admin/causes')
      if (response.ok) {
        const data = await response.json()
        setCauses(data.causes)
      }
    } catch (error) {
      console.error('Error fetching causes:', error)
    }
  }

  const saveCause = async () => {
    if (!editingCause) return

    setSaving(true)
    setDeleteError(null)
    try {
      const method = isNewCause ? 'POST' : 'PUT'
      const url = isNewCause
        ? '/api/admin/causes'
        : `/api/admin/causes/${editingCause.id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCause.name,
          description: editingCause.description,
          region: editingCause.region,
          priority: editingCause.priority,
          isActive: editingCause.isActive,
        }),
      })

      if (response.ok) {
        await fetchCauses()
        setEditingCause(null)
        setIsNewCause(false)
      } else {
        const data = await response.json()
        setDeleteError(data.error || 'Failed to save cause')
      }
    } catch (error) {
      console.error('Error saving cause:', error)
      setDeleteError('Failed to save cause')
    } finally {
      setSaving(false)
    }
  }

  const deleteCause = async (causeId: string) => {
    setDeleteError(null)
    try {
      const response = await fetch(`/api/admin/causes/${causeId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCauses((prev) => prev.filter((c) => c.id !== causeId))
      } else {
        const data = await response.json()
        setDeleteError(data.error || 'Failed to delete cause')
      }
    } catch (error) {
      console.error('Error deleting cause:', error)
      setDeleteError('Failed to delete cause')
    }
  }

  const toggleCauseActive = async (cause: Cause) => {
    try {
      const response = await fetch(`/api/admin/causes/${cause.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cause.isActive }),
      })
      if (response.ok) {
        setCauses((prev) =>
          prev.map((c) =>
            c.id === cause.id ? { ...c, isActive: !c.isActive } : c
          )
        )
      }
    } catch (error) {
      console.error('Error toggling cause:', error)
    }
  }

  const startNewCause = () => {
    setEditingCause({
      id: '',
      name: '',
      description: '',
      region: '',
      priority: 0,
      isActive: true,
      studentCount: 0,
      volunteerCount: 0,
      createdAt: new Date().toISOString(),
    })
    setIsNewCause(true)
    setDeleteError(null)
  }

  const startEditCause = (cause: Cause) => {
    setEditingCause({ ...cause })
    setIsNewCause(false)
    setDeleteError(null)
  }

  const saveTemplate = async () => {
    if (!editingTemplate) return

    setSaving(true)
    try {
      const method = editingTemplate.id ? 'PUT' : 'POST'
      const url = editingTemplate.id
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : '/api/admin/email-templates'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      })

      if (response.ok) {
        const data = await response.json()
        if (editingTemplate.id) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingTemplate.id ? data.template : t))
          )
        } else {
          setTemplates((prev) => [...prev, data.template])
        }
        setEditingTemplate(null)
      }
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const createDefaultTemplates = async () => {
    setSaving(true)
    try {
      for (const template of defaultTemplates) {
        await fetch('/api/admin/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...template, isDefault: true }),
        })
      }
      fetchTemplates()
    } catch (error) {
      console.error('Error creating default templates:', error)
    } finally {
      setSaving(false)
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

  const totalCauseUsers = causes.reduce(
    (acc, c) => acc + c.studentCount + c.volunteerCount,
    0
  )

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage causes, email templates, and platform settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('causes')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'causes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="h-4 w-4 inline mr-2" />
            Causes ({causes.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Email Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Platform Settings
          </button>
        </div>

        {/* Error Message */}
        {deleteError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Causes Tab */}
        {activeTab === 'causes' && (
          <div className="space-y-6">
            {/* Causes Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{causes.length}</p>
                      <p className="text-sm text-muted-foreground">Total Causes</p>
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
                        {causes.filter((c) => c.isActive).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Causes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {causes.reduce((acc, c) => acc + c.studentCount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {causes.reduce((acc, c) => acc + c.volunteerCount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add/Edit Cause Form */}
            {editingCause && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>
                    {isNewCause ? 'Add New Cause' : `Edit: ${editingCause.name}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cause-name">Cause Name *</Label>
                      <Input
                        id="cause-name"
                        value={editingCause.name}
                        onChange={(e) =>
                          setEditingCause({ ...editingCause, name: e.target.value })
                        }
                        placeholder="e.g., Ukraine Support"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cause-region">Region</Label>
                      <Input
                        id="cause-region"
                        value={editingCause.region || ''}
                        onChange={(e) =>
                          setEditingCause({ ...editingCause, region: e.target.value })
                        }
                        placeholder="e.g., Eastern Europe"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cause-description">Description</Label>
                      <Textarea
                        id="cause-description"
                        value={editingCause.description || ''}
                        onChange={(e) =>
                          setEditingCause({
                            ...editingCause,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe this cause..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cause-priority">Priority (0-100)</Label>
                      <Input
                        id="cause-priority"
                        type="number"
                        min={0}
                        max={100}
                        value={editingCause.priority}
                        onChange={(e) =>
                          setEditingCause({
                            ...editingCause,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher priority causes appear first
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={editingCause.isActive}
                            onChange={() =>
                              setEditingCause({ ...editingCause, isActive: true })
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!editingCause.isActive}
                            onChange={() =>
                              setEditingCause({ ...editingCause, isActive: false })
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Inactive</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button onClick={saveCause} disabled={saving || !editingCause.name}>
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? 'Saving...' : 'Save Cause'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingCause(null)
                        setIsNewCause(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Causes List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Manage Causes
                    </CardTitle>
                    <CardDescription>
                      Add, edit, or deactivate causes for students and tutors
                    </CardDescription>
                  </div>
                  <Button onClick={startNewCause} disabled={!!editingCause}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Cause
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {causes.length > 0 ? (
                  <div className="space-y-3">
                    {causes.map((cause) => (
                      <div
                        key={cause.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          cause.isActive
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{cause.name}</h3>
                              {cause.isActive ? (
                                <Badge className="bg-green-100 text-green-700">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                              {cause.priority > 0 && (
                                <Badge variant="outline">
                                  Priority: {cause.priority}
                                </Badge>
                              )}
                            </div>
                            {cause.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {cause.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              {cause.region && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  {cause.region}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-blue-600">
                                <GraduationCap className="h-3 w-3" />
                                {cause.studentCount} students
                              </span>
                              <span className="flex items-center gap-1 text-purple-600">
                                <Users className="h-3 w-3" />
                                {cause.volunteerCount} tutors
                              </span>
                            </div>
                            {/* Usage bar */}
                            {totalCauseUsers > 0 && (
                              <div className="mt-2">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${
                                        ((cause.studentCount + cause.volunteerCount) /
                                          totalCauseUsers) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(
                                    ((cause.studentCount + cause.volunteerCount) /
                                      totalCauseUsers) *
                                    100
                                  ).toFixed(1)}
                                  % of users
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleCauseActive(cause)}
                              title={cause.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {cause.isActive ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditCause(cause)}
                              disabled={!!editingCause}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCause(cause.id)}
                              disabled={
                                cause.studentCount > 0 || cause.volunteerCount > 0
                              }
                              title={
                                cause.studentCount > 0 || cause.volunteerCount > 0
                                  ? 'Cannot delete cause with active users'
                                  : 'Delete cause'
                              }
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No causes configured yet
                    </p>
                    <Button onClick={startNewCause}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Cause
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>
                    Customize emails sent to tutors and students
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {templates.length === 0 && (
                    <Button
                      variant="outline"
                      onClick={createDefaultTemplates}
                      disabled={saving}
                    >
                      Create Defaults
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      setEditingTemplate({
                        id: '',
                        name: '',
                        subject: '',
                        body: '',
                        isDefault: false,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Template Editor */}
              {editingTemplate && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-4">
                    {editingTemplate.id ? 'Edit Template' : 'New Template'}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={editingTemplate.name}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., match_request"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Subject Line</Label>
                      <Input
                        id="template-subject"
                        value={editingTemplate.subject}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Email subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-body">Email Body</Label>
                      <Textarea
                        id="template-body"
                        value={editingTemplate.body}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            body: e.target.value,
                          })
                        }
                        placeholder="Email content..."
                        rows={10}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Available Variables:</p>
                      <p>
                        {`{{tutor_name}}, {{student_name}}, {{cause}}, {{subjects}}, {{topics}}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveTemplate} disabled={saving}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingTemplate(null)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Templates List */}
              {templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{template.name}</p>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.body.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTemplate(template)}
                        >
                          Edit
                        </Button>
                        {!template.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No email templates configured. Click &quot;Create Defaults&quot; to
                  set up standard templates.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Platform Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>General configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auto-send Match Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically send email notifications when matches are created
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Match Expiry (days)</p>
                    <p className="text-sm text-muted-foreground">
                      Days before unresponded match requests expire
                    </p>
                  </div>
                  <Input
                    type="number"
                    defaultValue={7}
                    className="w-20"
                    min={1}
                    max={30}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Default Tutor Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      Default number of students a tutor can take on
                    </p>
                  </div>
                  <Input
                    type="number"
                    defaultValue={3}
                    className="w-20"
                    min={1}
                    max={10}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Enable AI Match Suggestions</p>
                    <p className="text-sm text-muted-foreground">
                      Use AI to suggest optimal student-tutor matches
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Minimum Match Score</p>
                    <p className="text-sm text-muted-foreground">
                      Minimum compatibility score to show in AI suggestions
                    </p>
                  </div>
                  <Input
                    type="number"
                    defaultValue={30}
                    className="w-20"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
