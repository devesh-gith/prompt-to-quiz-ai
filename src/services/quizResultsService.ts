
import { createAuthenticatedSupabaseClient } from './supabaseAuth'

export const fetchQuizResults = async (clerkToken: string, userId: string) => {
  const supabase = createAuthenticatedSupabaseClient(clerkToken)

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching quiz results:', error)
    throw error
  }

  return data || []
}

export const saveQuizResultData = async (
  clerkToken: string,
  userId: string,
  quizId: string,
  score: number,
  totalQuestions: number,
  answers: any
) => {
  const supabase = createAuthenticatedSupabaseClient(clerkToken)

  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      answers,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving quiz result:', error)
    throw error
  }

  return data
}
