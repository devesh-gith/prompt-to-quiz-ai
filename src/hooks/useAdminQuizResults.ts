
import { useState, useEffect } from 'react'
import { useUser, useAuth, useOrganization } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'
import { useOrganizationRole } from '@/hooks/useOrganizationRole'

interface AdminQuizResult {
  id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
  quiz_title: string
  quiz_type: string
  user_id: string
  user_name: string
  user_email: string
}

interface UserInfo {
  name: string
  email: string
}

export const useAdminQuizResults = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { organization } = useOrganization()
  const { isAdmin } = useOrganizationRole()
  const [results, setResults] = useState<AdminQuizResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAdminResults = async () => {
    if (!user || !organization || !isAdmin) {
      console.log('Not admin or no organization')
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

      console.log('Fetching admin quiz results for organization:', organization.id)

      // First, get all quiz results for quizzes in this organization
      const { data: quizResultsData, error: resultsError } = await supabase
        .from('quiz_results')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(50) // Show more results for admins

      if (resultsError) {
        console.error('Error fetching quiz results:', resultsError)
        throw resultsError
      }

      if (!quizResultsData || quizResultsData.length === 0) {
        console.log('No quiz results found')
        setResults([])
        return []
      }

      // Get unique quiz IDs
      const quizIds = [...new Set(quizResultsData.map(result => result.quiz_id))]

      // Fetch quiz details from shared_quizzes for this organization
      const { data: quizData, error: quizError } = await supabase
        .from('shared_quizzes')
        .select('id, title, quiz_type')
        .in('id', quizIds)
        .eq('organization_id', organization.id)

      if (quizError) {
        console.error('Error fetching quiz details:', quizError)
        throw quizError
      }

      // Create a map for quick lookup
      const quizMap = new Map(quizData?.map(quiz => [quiz.id, quiz]) || [])

      // Filter results to only include quizzes from this organization
      const organizationResults = quizResultsData.filter(result => 
        quizMap.has(result.quiz_id)
      )

      // Get organization members using the getMemberships method
      const memberships = await organization.getMemberships()
      const memberMap = new Map<string, UserInfo>(
        memberships.data?.map(membership => {
          const userData = membership.publicUserData
          return [
            userData?.userId || '',
            {
              name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Unknown User',
              email: userData?.identifier || 'No email'
            }
          ]
        }) || []
      )

      // Combine the data
      const formattedResults = organizationResults.map(result => {
        const quiz = quizMap.get(result.quiz_id)
        const userInfo = memberMap.get(result.user_id)
        
        return {
          id: result.id,
          quiz_id: result.quiz_id,
          score: result.score,
          total_questions: result.total_questions,
          completed_at: result.completed_at,
          quiz_title: quiz?.title || 'Unknown Quiz',
          quiz_type: quiz?.quiz_type || 'unknown',
          user_id: result.user_id,
          user_name: userInfo?.name || 'Unknown User',
          user_email: userInfo?.email || 'No email'
        }
      })

      console.log('Fetched admin results:', formattedResults.length, 'results')
      setResults(formattedResults)
      return formattedResults
    } catch (error) {
      console.error('Error fetching admin quiz results:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchAdminResults()
    }
  }, [user, organization, isAdmin])

  // Set up real-time subscription for quiz results in organization
  useEffect(() => {
    if (!user || !organization?.id || !isAdmin) return

    console.log('Setting up real-time subscription for admin quiz results')
    const channel = supabase
      .channel('admin-quiz-results')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_results'
        },
        () => {
          console.log('New organization quiz result detected, refreshing...')
          fetchAdminResults()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up admin real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [user, organization?.id, isAdmin])

  return {
    results,
    isLoading,
    refetch: fetchAdminResults
  }
}
