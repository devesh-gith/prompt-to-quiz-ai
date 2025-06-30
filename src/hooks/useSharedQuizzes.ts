
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
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { data, error } = await supabase
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
    if (!organization || !user) return []

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
        .from('shared_quizzes')
        .select('*')
        .eq('organization_id', organization.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching shared quizzes:', error)
      return []
    }
  }

  return {
    saveToSharedQuizzes,
    getSharedQuizzes,
    isSaving
  }
}
