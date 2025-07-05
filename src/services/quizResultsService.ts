
import { supabase } from '@/integrations/supabase/client'
import { setupSupabaseSession } from './supabaseAuth'

export const fetchQuizResults = async (clerkToken: string, userId: string) => {
  await setupSupabaseSession(clerkToken)

  const { data, error } = await supabase
    .from('quiz_results')
    .select('quiz_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching quiz results:', error)
    return []
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
  await setupSupabaseSession(clerkToken)

  console.log('Saving quiz result with proper UUID conversion:', { quizId, score, totalQuestions })

  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      quiz_id: quizId,
      user_id: userId,
      score,
      total_questions: totalQuestions,
      answers
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving quiz result - Details:', error)
    console.error('Quiz ID type:', typeof quizId, 'Value:', quizId)
    console.error('User ID:', userId)
    throw error
  }

  console.log('Quiz result saved successfully:', data)
  return data
}
