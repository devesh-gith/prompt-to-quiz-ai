
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
      console.log('Fetching admin quiz results for organization:', organization.id)

      // Use the edge function to get results with admin privileges
      const { data: functionData, error: functionError } = await supabase.functions.invoke('get-admin-quiz-results', {
        body: { organization_id: organization.id }
      })

      if (functionError) {
        console.error('Error calling admin results function:', functionError)
        throw functionError
      }

      const results = functionData?.data || []
      console.log('Fetched admin results from function:', results.length, 'results')

      if (!results || results.length === 0) {
        console.log('No quiz results found for organization')
        setResults([])
        return []
      }

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

      // Format the results
      const formattedResults = results.map((result: any) => {
        const userInfo = memberMap.get(result.user_id)
        const quiz = result.shared_quizzes
        
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

      console.log('Formatted admin results:', formattedResults.length, 'results')
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
