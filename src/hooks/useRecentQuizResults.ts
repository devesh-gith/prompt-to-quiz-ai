
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
      console.log('Fetching recent quiz results for user:', user.id)

      // Use the admin edge function since RLS is problematic
      const { data: functionData, error: functionError } = await supabase.functions.invoke('get-user-quiz-results', {
        body: { user_id: user.id }
      })

      if (functionError) {
        console.error('Error calling user results function:', functionError)
        // Fallback to direct query if function fails
        return await fetchRecentResultsDirect()
      }

      const results = functionData?.data || []
      console.log('Fetched user results from function:', results.length, 'results')

      if (!results || results.length === 0) {
        console.log('No quiz results found for user')
        setResults([])
        return []
      }

      // Format the results
      const formattedResults = results.map((result: any) => ({
        id: result.id,
        quiz_id: result.quiz_id,
        score: result.score,
        total_questions: result.total_questions,
        completed_at: result.completed_at,
        quiz_title: result.shared_quizzes?.title || 'Unknown Quiz',
        quiz_type: result.shared_quizzes?.quiz_type || 'unknown'
      }))

      console.log('Formatted user results:', formattedResults.length, 'results')
      setResults(formattedResults)
      return formattedResults
    } catch (error) {
      console.error('Error fetching recent quiz results:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentResultsDirect = async () => {
    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      console.log('Fetching recent quiz results directly for user:', user?.id)

      // Get quiz results directly
      const { data: quizResultsData, error: resultsError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (resultsError) {
        console.error('Error fetching quiz results directly:', resultsError)
        throw resultsError
      }

      if (!quizResultsData || quizResultsData.length === 0) {
        console.log('No quiz results found directly')
        setResults([])
        return []
      }

      // Get unique quiz IDs
      const quizIds = [...new Set(quizResultsData.map(result => result.quiz_id))]

      // Fetch quiz details from shared_quizzes
      const { data: quizData, error: quizError } = await supabase
        .from('shared_quizzes')
        .select('id, title, quiz_type')
        .in('id', quizIds)

      if (quizError) {
        console.error('Error fetching quiz details directly:', quizError)
        throw quizError
      }

      // Create a map for quick lookup
      const quizMap = new Map(quizData?.map(quiz => [quiz.id, quiz]) || [])

      // Combine the data
      const formattedResults = quizResultsData.map(result => {
        const quiz = quizMap.get(result.quiz_id)
        return {
          id: result.id,
          quiz_id: result.quiz_id,
          score: result.score,
          total_questions: result.total_questions,
          completed_at: result.completed_at,
          quiz_title: quiz?.title || 'Unknown Quiz',
          quiz_type: quiz?.quiz_type || 'unknown'
        }
      })

      console.log('Fetched recent results directly:', formattedResults.length, 'results')
      setResults(formattedResults)
      return formattedResults
    } catch (error) {
      console.error('Error fetching recent quiz results directly:', error)
      setResults([])
      return []
    }
  }

  useEffect(() => {
    fetchRecentResults()
  }, [user])

  // Set up real-time subscription for quiz results
  useEffect(() => {
    if (!user?.id) return

    console.log('Setting up real-time subscription for user quiz results')
    const channel = supabase
      .channel('user-quiz-results')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_results',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('New quiz result detected, refreshing...')
          fetchRecentResults()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return {
    results,
    isLoading,
    refetch: fetchRecentResults
  }
}
