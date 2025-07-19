
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
      console.log('Fetching organization members...')
      const memberships = await organization.getMemberships()
      console.log('Raw memberships data:', memberships.data?.length || 0, 'members')
      
      const memberMap = new Map<string, UserInfo>()
      
      if (memberships.data) {
        memberships.data.forEach(membership => {
          const userData = membership.publicUserData
          const userId = userData?.userId
          
          if (userId) {
            const firstName = userData?.firstName || ''
            const lastName = userData?.lastName || ''
            const fullName = `${firstName} ${lastName}`.trim()
            const email = userData?.identifier || 'No email'
            
            memberMap.set(userId, {
              name: fullName || email.split('@')[0] || 'Unknown User',
              email: email
            })
            
            console.log('Added member:', userId, fullName || email)
          }
        })
      }
      
      console.log('Created member map with', memberMap.size, 'members')

      // Format the results
      const formattedResults = results.map((result: any) => {
        const userInfo = memberMap.get(result.user_id)
        const quiz = result.shared_quizzes
        
        console.log('Formatting result for user:', result.user_id, 'found info:', userInfo)
        
        return {
          id: result.id,
          quiz_id: result.quiz_id,
          score: result.score,
          total_questions: result.total_questions,
          completed_at: result.completed_at,
          quiz_title: quiz?.title || 'Unknown Quiz',
          quiz_type: quiz?.quiz_type || 'unknown',
          user_id: result.user_id,
          user_name: userInfo?.name || `User ${result.user_id.slice(-4)}`,
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
