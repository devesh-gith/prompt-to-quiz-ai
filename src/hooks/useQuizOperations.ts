
import { useState } from 'react'
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useQuizOperations = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { organization } = useOrganization()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const saveQuiz = async (quizData: any, quizType: string, title: string, description?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save quizzes",
        variant: "destructive",
      })
      return null
    }

    setIsSaving(true)
    try {
      // Set up Supabase auth context with Clerk session
      const clerkToken = await getToken({ template: 'supabase' })
      console.log('Clerk token received:', clerkToken ? 'Token exists' : 'No token')
      
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      // Parse the JWT to see its structure
      try {
        const tokenPayload = JSON.parse(atob(clerkToken.split('.')[1]))
        console.log('JWT payload:', tokenPayload)
        console.log('JWT sub field:', tokenPayload.sub)
        console.log('JWT user_id field:', tokenPayload.user_id)
      } catch (e) {
        console.error('Failed to parse JWT:', e)
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      console.log('Attempting to save quiz with user ID:', user.id)
      console.log('created_by will be set to:', user.id)

      // Test if we can query the current user from the JWT
      const { data: testData, error: testError } = await supabase.rpc('version')
      console.log('Test query result:', testData, testError)

      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          quiz_type: quizType,
          quiz_data: quizData,
          created_by: user.id,
          organization_id: organization?.id || null,
          is_shared: false
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
        description: "Quiz saved successfully!",
      })

      return data
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const shareQuizWithOrganization = async (quizId: string) => {
    if (!organization) {
      toast({
        title: "Error",
        description: "You must be in an organization to share quizzes",
        variant: "destructive",
      })
      return false
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to share quizzes",
        variant: "destructive",
      })
      return false
    }

    try {
      // Set up Supabase auth context with Clerk session
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { error } = await supabase
        .from('quizzes')
        .update({ 
          is_shared: true,
          organization_id: organization.id 
        })
        .eq('id', quizId)
        .eq('created_by', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Quiz shared with ${organization.name}!`,
      })

      return true
    } catch (error) {
      console.error('Error sharing quiz:', error)
      toast({
        title: "Error",
        description: "Failed to share quiz. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const getSharedQuizzes = async () => {
    if (!organization || !user) return []

    try {
      // Set up Supabase auth context with Clerk session
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching shared quizzes:', error)
      return []
    }
  }

  return {
    saveQuiz,
    shareQuizWithOrganization,
    getSharedQuizzes,
    isSaving
  }
}
