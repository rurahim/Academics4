'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { volunteerProfileSchema, type VolunteerProfileInput } from '@/lib/validations'
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


export default function VolunteerProfilePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fields, setFields] = useState<FieldOption[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VolunteerProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(volunteerProfileSchema) as any,
    defaultValues: {
      fieldsOfExpertise: [],
      subjectsQualified: [],
      languagesSpoken: [],
      onlineTeachingExperience: false,
      diverseBackgroundExperience: false,
      maxCapacity: 5,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, profileRes] = await Promise.all([
          fetch('/api/fields'),
          fetch('/api/volunteers/profile'),
        ])

        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json()
          setFields(fieldsData.fields)
        }

        // Pre-populate form if profile exists
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.volunteer) {
            setIsEditing(true)
            const v = profileData.volunteer
            reset({
              fullName: v.fullName || '',
              age: v.age || undefined,
              phoneNumber: v.phoneNumber || '',
              city: v.city || '',
              country: v.country || '',
              area: v.area || '',
              universityAffiliation: v.universityAffiliation || '',
              fieldsOfExpertise: v.fieldsOfExpertise || [],
              subjectsQualified: v.subjectsQualified || [],
              languagesSpoken: v.languagesSpoken || [],
              preferredLanguage: v.preferredLanguage || '',
              onlineTeachingExperience: v.onlineTeachingExperience || false,
              diverseBackgroundExperience: v.diverseBackgroundExperience || false,
              hoursPerWeekAvailable: v.hoursPerWeekAvailable || undefined,
              maxCapacity: v.maxCapacity || 5,
              additionalSupportWilling: v.additionalSupportWilling || '',
              bio: v.bio || '',
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

  const onSubmit = async (data: VolunteerProfileInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/volunteers/profile', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} profile`)
        return
      }

      router.push('/volunteer')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="volunteer">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Your Profile' : 'Complete Your Tutor Profile'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your information to help us find the best matches'
                : 'Tell us about yourself so we can match you with students who need your help'}
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
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      error={errors.phoneNumber?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="universityAffiliation">University Affiliation</Label>
                    <Input
                      id="universityAffiliation"
                      {...register('universityAffiliation')}
                      error={errors.universityAffiliation?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      {...register('area')}
                      error={errors.area?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Expertise</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label required>Fields of Expertise</Label>
                    <Controller
                      name="fieldsOfExpertise"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          options={fields.map((f) => ({ value: f.name, label: f.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={loadingData ? 'Loading fields...' : 'Select your fields of expertise'}
                          error={errors.fieldsOfExpertise?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Subjects/Skills You Can Teach</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter specific subjects or skills (e.g., &quot;Python&quot;, &quot;Calculus II&quot;, &quot;IELTS Preparation&quot;)
                    </p>
                    <Controller
                      name="subjectsQualified"
                      control={control}
                      render={({ field }) => (
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Type a subject and press Enter"
                          maxTags={10}
                          error={errors.subjectsQualified?.message}
                        />
                      )}
                    />
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
                    <Label htmlFor="preferredLanguage" required>Preferred Teaching Language</Label>
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

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="onlineTeachingExperience"
                      className="h-4 w-4"
                      {...register('onlineTeachingExperience')}
                    />
                    <Label htmlFor="onlineTeachingExperience">
                      I have experience teaching online
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="diverseBackgroundExperience"
                      className="h-4 w-4"
                      {...register('diverseBackgroundExperience')}
                    />
                    <Label htmlFor="diverseBackgroundExperience">
                      I have experience teaching students from diverse backgrounds
                    </Label>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeekAvailable">Hours Available Per Week</Label>
                    <Input
                      id="hoursPerWeekAvailable"
                      type="number"
                      min={1}
                      max={40}
                      {...register('hoursPerWeekAvailable', { valueAsNumber: true })}
                      error={errors.hoursPerWeekAvailable?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity">Maximum Students</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      min={1}
                      max={10}
                      {...register('maxCapacity', { valueAsNumber: true })}
                      error={errors.maxCapacity?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About You</h3>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about yourself, your teaching style, and what motivates you to help"
                    {...register('bio')}
                    error={errors.bio?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalSupportWilling">Additional Support (optional)</Label>
                  <Textarea
                    id="additionalSupportWilling"
                    placeholder="Any additional support you're willing to provide (e.g., career guidance, mentorship)"
                    {...register('additionalSupportWilling')}
                  />
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
