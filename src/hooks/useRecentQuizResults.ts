
import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'

interface RecentQuizResult {
  id: string
  quiz_id: string
  score: number
  total_questions: number
  completed_at: string
  quiz_title: string
  quiz_type: string
}

export const useRecentQuizResults = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [results, setResults] = useState<RecentQuizResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRecentResults = async () => {
    if (!user) {
      console.log('No user found')
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

      console.log('Fetching recent quiz results for user:', user.id)

      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          completed_at,
          shared_quizzes!inner(title, quiz_type)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching recent quiz results:', error)
        throw error
      }

      const formattedResults = data?.map(result => ({
        id: result.id,
        quiz_id: result.quiz_id,
        score: result.score,
        total_questions: result.total_questions,
        completed_at: result.completed_at,
        quiz_title: result.shared_quizzes?.title || 'Unknown Quiz',
        quiz_type: result.shared_quizzes?.quiz_type || 'unknown'
      })) || []

      console.log('Fetched recent results:', formattedResults.length, 'results')
      setResults(formattedResults)
      return formattedResults
    } catch (error) {
      console.error('Error fetching recent quiz results:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentResults()
  }, [user])

  return {
    results,
    isLoading,
    refetch: fetchRecentResults
  }
}
