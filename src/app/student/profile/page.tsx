'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentProfileSchema, type StudentProfileInput } from '@/lib/validations'
import { LANGUAGES } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface FieldOption {
  id: string
  name: string
  category: string | null
}

interface CauseOption {
  id: string
  name: string
  description: string | null
  region: string | null
}

interface TopicSupport {
  keyword: string
  status: 'unassigned' | 'assigned'
  assignedTo: string | null
}

export default function StudentProfilePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [fields, setFields] = useState<FieldOption[]>([])
  const [causes, setCauses] = useState<CauseOption[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(studentProfileSchema) as any,
    defaultValues: {
      fieldsOfStudy: [],
      topicsNeedSupport: [],
      languagesSpoken: [],
      hasTranscripts: false,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, causesRes, profileRes] = await Promise.all([
          fetch('/api/fields'),
          fetch('/api/causes'),
          fetch('/api/students/profile'),
        ])

        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json()
          setFields(fieldsData.fields)
        }

        if (causesRes.ok) {
          const causesData = await causesRes.json()
          setCauses(causesData.causes)
        }

        // Pre-populate form if profile exists
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.student) {
            setIsEditing(true)
            const s = profileData.student
            const topicsArr = (s.topicsNeedSupport as TopicSupport[]) || []
            setTopics(topicsArr.map((t) => t.keyword))
            reset({
              fullName: s.fullName || '',
              age: s.age || undefined,
              gender: s.gender || '',
              phoneNumber: s.phoneNumber || '',
              alternativeContact: s.alternativeContact || '',
              currentCity: s.currentCity || '',
              currentCountry: s.currentCountry || '',
              area: s.area || '',
              originalLocation: s.originalLocation || '',
              cause: s.cause || '',
              fieldsOfStudy: s.fieldsOfStudy || [],
              topicsNeedSupport: topicsArr,
              originalUniversity: s.originalUniversity || '',
              currentUniversity: s.currentUniversity || '',
              creditsRemaining: s.creditsRemaining || undefined,
              hasTranscripts: s.hasTranscripts || false,
              preferredLanguage: s.preferredLanguage || '',
              languagesSpoken: s.languagesSpoken || [],
              hoursPerWeekNeeded: s.hoursPerWeekNeeded || undefined,
              deviceAccessLevel: s.deviceAccessLevel || undefined,
              internetAccessLevel: s.internetAccessLevel || undefined,
              materialsAccessLevel: s.materialsAccessLevel || undefined,
              specialNeeds: s.specialNeeds || '',
              educationalBackground: s.educationalBackground || '',
              careerGoals: s.careerGoals || '',
            })
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [reset])

  const handleTopicsChange = (newTopics: string[]) => {
    setTopics(newTopics)
    setValue(
      'topicsNeedSupport',
      newTopics.map((keyword) => ({
        keyword,
        status: 'unassigned' as const,
        assignedTo: null,
      }))
    )
  }

  const onSubmit = async (data: StudentProfileInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/students/profile', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} profile`)
        return
      }

      router.push('/student')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Your Profile' : 'Complete Your Student Profile'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your information and learning needs'
                : 'Tell us about yourself and what subjects you need help with'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit as any)}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" required>Full Name</Label>
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      error={errors.fullName?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      error={errors.age?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      id="gender"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                      ]}
                      placeholder="Select gender"
                      {...register('gender')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alternativeContact">Alternative Contact</Label>
                    <Input
                      id="alternativeContact"
                      placeholder="WhatsApp, Telegram, etc."
                      {...register('alternativeContact')}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCity">Current City</Label>
                    <Input
                      id="currentCity"
                      {...register('currentCity')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentCountry">Current Country</Label>
                    <Input
                      id="currentCountry"
                      {...register('currentCountry')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      {...register('area')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalLocation">Original Location</Label>
                  <Input
                    id="originalLocation"
                    placeholder="Your hometown or original location"
                    {...register('originalLocation')}
                  />
                </div>
              </div>

              {/* Cause Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cause</h3>
                <div className="space-y-2">
                  <Label htmlFor="cause" required>Which crisis are you affected by?</Label>
                  <Select
                    id="cause"
                    options={causes.map((c) => ({
                      value: c.name,
                      label: c.region ? `${c.name} (${c.region})` : c.name,
                    }))}
                    placeholder={loadingData ? 'Loading causes...' : 'Select your cause'}
                    {...register('cause')}
                    error={errors.cause?.message}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label required>Fields of Study</Label>
                    <Controller
                      name="fieldsOfStudy"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={fields.map((f) => ({ value: f.name, label: f.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={loadingData ? 'Loading fields...' : 'Select your fields of study'}
                          error={errors.fieldsOfStudy?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Topics You Need Help With</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter specific topics or subjects (e.g., &quot;Python Programming&quot;, &quot;Calculus&quot;, &quot;English Writing&quot;)
                    </p>
                    <TagInput
                      value={topics}
                      onChange={handleTopicsChange}
                      placeholder="Type a topic and press Enter"
                      maxTags={10}
                      error={errors.topicsNeedSupport?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originalUniversity">Original University</Label>
                      <Input
                        id="originalUniversity"
                        {...register('originalUniversity')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentUniversity">Current University (if any)</Label>
                      <Input
                        id="currentUniversity"
                        {...register('currentUniversity')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditsRemaining">Credits Remaining</Label>
                      <Input
                        id="creditsRemaining"
                        type="number"
                        {...register('creditsRemaining', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="hasTranscripts"
                        className="h-4 w-4"
                        {...register('hasTranscripts')}
                      />
                      <Label htmlFor="hasTranscripts">
                        I have access to my academic transcripts
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Languages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label required>Languages Spoken</Label>
                    <Controller
                      name="languagesSpoken"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select languages"
                          error={errors.languagesSpoken?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage" required>Preferred Learning Language</Label>
                    <Select
                      id="preferredLanguage"
                      options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                      placeholder="Select preferred language"
                      {...register('preferredLanguage')}
                      error={errors.preferredLanguage?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Availability & Access */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability & Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeekNeeded">Hours Needed Per Week</Label>
                    <Input
                      id="hoursPerWeekNeeded"
                      type="number"
                      min={1}
                      max={40}
                      {...register('hoursPerWeekNeeded', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceAccessLevel">Device Access (1-5)</Label>
                    <Input
                      id="deviceAccessLevel"
                      type="number"
                      min={1}
                      max={5}
                      placeholder="1=Limited, 5=Full access"
                      {...register('deviceAccessLevel', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internetAccessLevel">Internet Access (1-5)</Label>
                    <Input
                      id="internetAccessLevel"
                      type="number"
                      min={1}
                      max={5}
                      placeholder="1=Limited, 5=Full access"
                      {...register('internetAccessLevel', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materialsAccessLevel">Materials Access (1-5)</Label>
                    <Input
                      id="materialsAccessLevel"
                      type="number"
                      min={1}
                      max={5}
                      placeholder="1=Limited, 5=Full access"
                      {...register('materialsAccessLevel', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialNeeds">Special Needs (optional)</Label>
                    <Textarea
                      id="specialNeeds"
                      placeholder="Any special accommodations you may need"
                      {...register('specialNeeds')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationalBackground">Educational Background (optional)</Label>
                    <Textarea
                      id="educationalBackground"
                      placeholder="Brief description of your educational journey"
                      {...register('educationalBackground')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="careerGoals">Career Goals (optional)</Label>
                    <Textarea
                      id="careerGoals"
                      placeholder="What are your career aspirations?"
                      {...register('careerGoals')}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isEditing ? 'Update Profile' : 'Complete Profile'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
