
import { useState } from 'react'
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react'
import { useToast } from '@/hooks/use-toast'
import { saveSharedQuiz, fetchSharedQuizzes } from '@/services/sharedQuizzesService'
import { fetchQuizResults, saveQuizResultData } from '@/services/quizResultsService'

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
      console.log('Starting quiz save process...')
      console.log('User ID:', user.id)
      console.log('Organization ID:', organization.id)
      
      // Try to get the Supabase template token first
      let clerkToken = null
      try {
        clerkToken = await getToken({ template: 'supabase' })
        console.log('Got Supabase template token, length:', clerkToken?.length || 0)
      } catch (templateError) {
        console.warn('Supabase template not available, trying default token:', templateError)
        // Fallback to default token if Supabase template is not configured
        clerkToken = await getToken()
        console.log('Got default token, length:', clerkToken?.length || 0)
      }
      
      if (!clerkToken) {
        throw new Error('Failed to get authentication token from Clerk. Please make sure you are logged in.')
      }

      const data = await saveSharedQuiz(
        clerkToken,
        user.id,
        organization.id,
        quizData,
        quizType,
        title,
        description
      )

      toast({
        title: "Success",
        description: `Quiz shared with ${organization.name}! It will be available for 1 hour.`,
      })

      return data
    } catch (error) {
      console.error('Error saving shared quiz:', error)
      
      let errorMessage = "Failed to share quiz. Please try again."
      if (error instanceof Error) {
        if (error.message.includes('JWSError') || error.message.includes('JWSInvalidSignature')) {
          errorMessage = "Authentication configuration issue. Please make sure the Supabase JWT template is properly configured in your Clerk dashboard, or contact support."
        } else if (error.message.includes('Authentication token is invalid')) {
          errorMessage = "Authentication failed. Please refresh the page and try again."
        } else if (error.message.includes('Supabase JWT template')) {
          errorMessage = "Authentication configuration issue. Please contact support."
        } else if (error.message.includes('row-level security')) {
          errorMessage = "You don't have permission to share quizzes with this organization."
        } else {
          errorMessage = `Failed to share quiz: ${error.message}`
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
      let clerkToken = null
      try {
        clerkToken = await getToken({ template: 'supabase' })
      } catch (templateError) {
        console.warn('Supabase template not available, trying default token:', templateError)
        clerkToken = await getToken()
      }
      
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      return await fetchSharedQuizzes(clerkToken, organization.id)
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

      return await fetchQuizResults(clerkToken, user.id)
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

      return await saveQuizResultData(clerkToken, user.id, quizId, score, totalQuestions, answers)
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
