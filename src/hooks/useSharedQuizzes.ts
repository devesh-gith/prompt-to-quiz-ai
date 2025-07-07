import { useState } from 'react'
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useSharedQuizzes = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { organization } = useOrganization()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const saveToSharedQuizzes = async (quizData: any, quizType: string, title: string, description?: string) => {
    if (!user || !organization) {
      toast({
        title: "Error",
        description: "You must be logged in and part of an organization to share quizzes",
        variant: "destructive",
      })
      return null
    }

    setIsSaving(true)
    try {
      // Get fresh Clerk token for Supabase
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      // Create a custom supabase client with the Clerk token
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseWithAuth = createClient(
        'https://wnaspljpcncshnnyrstt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXNwbGpwY25jc2hubnlyc3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzM4NjQsImV4cCI6MjA2NjcwOTg2NH0.y95NQh-gQGwXcU4lyCUkqeZerSEJwC_3sotpAlu0bww',
        {
          global: {
            headers: {
              Authorization: `Bearer ${clerkToken}`,
            },
          },
        }
      )

      console.log('Saving quiz with organization ID:', organization.id)
      console.log('User ID:', user.id)
      console.log('Quiz data preview:', { title, quizType, questionsCount: quizData?.questions?.length })

      // First, ensure the user is a member of the organization
      const { error: membershipError } = await supabaseWithAuth
        .from('organization_members')
        .upsert({
          user_id: user.id,
          organization_id: organization.id,
          role: 'admin' // Set as admin for now, you can modify this later
        }, {
          onConflict: 'user_id,organization_id'
        })

      if (membershipError) {
        console.error('Error creating/updating membership:', membershipError)
        // Continue anyway, might already exist
      }

      const { data, error } = await supabaseWithAuth
        .from('shared_quizzes')
        .insert({
          title,
          description,
          quiz_type: quizType,
          quiz_data: quizData,
          created_by: user.id,
          organization_id: organization.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      console.log('Quiz saved successfully:', data)

      toast({
        title: "Success",
        description: `Quiz shared with ${organization.name}! It will be available for 1 hour.`,
      })

      return data
    } catch (error) {
      console.error('Error saving shared quiz:', error)
      toast({
        title: "Error",
        description: "Failed to share quiz. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const getSharedQuizzes = async () => {
    if (!organization || !user) {
      console.log('No organization or user found')
      return []
    }

    setIsLoading(true)
    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      console.log('Fetching quizzes for organization:', organization.id)

      const { data, error } = await supabase
        .from('shared_quizzes')
        .select('*')
        .eq('organization_id', organization.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching shared quizzes:', error)
        throw error
      }

      console.log('Fetched quizzes:', data?.length || 0, 'quizzes')
      return data || []
    } catch (error) {
      console.error('Error fetching shared quizzes:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getQuizResults = async () => {
    if (!user) {
      return []
    }

    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { data, error } = await supabase
        .from('quiz_results')
        .select('quiz_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching quiz results:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching quiz results:', error)
      return []
    }
  }

  const saveQuizResult = async (quizId: string, score: number, totalQuestions: number, answers: any) => {
    if (!user) {
      console.error('No user found when trying to save quiz result')
      return null
    }

    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      console.log('Saving quiz result:', { quizId, score, totalQuestions })

      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          score,
          total_questions: totalQuestions,
          answers
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving quiz result:', error)
        throw error
      }

      console.log('Quiz result saved successfully:', data)
      return data
    } catch (error) {
      console.error('Error saving quiz result:', error)
      throw error
    }
  }

  return {
    saveToSharedQuizzes,
    getSharedQuizzes,
    getQuizResults,
    saveQuizResult,
    isSaving,
    isLoading
  }
}
