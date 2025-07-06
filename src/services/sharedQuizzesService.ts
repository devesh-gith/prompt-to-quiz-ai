
import { supabase } from '@/integrations/supabase/client'
import { setupSupabaseSession } from './supabaseAuth'

export const saveSharedQuiz = async (
  clerkToken: string,
  userId: string,
  organizationId: string,
  quizData: any,
  quizType: string,
  title: string,
  description?: string
) => {
  console.log('Setting up Supabase session for quiz save...')
  await setupSupabaseSession(clerkToken)

  console.log('Saving quiz with organization ID:', organizationId)
  console.log('Quiz data preview:', { title, quizType, questionsCount: quizData?.questions?.length })
  console.log('Created by (user.id):', userId)

  const { data, error } = await supabase
    .from('shared_quizzes')
    .insert({
      title,
      description,
      quiz_type: quizType,
      quiz_data: quizData,
      created_by: userId,
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error details:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw error
  }

  console.log('Quiz saved successfully:', data)
  return data
}

export const fetchSharedQuizzes = async (
  clerkToken: string,
  organizationId: string
) => {
  await setupSupabaseSession(clerkToken)

  console.log('Fetching quizzes for organization:', organizationId)

  const { data, error } = await supabase
    .from('shared_quizzes')
    .select('*')
    .eq('organization_id', organizationId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shared quizzes:', error)
    throw error
  }

  console.log('Fetched quizzes:', data?.length || 0, 'quizzes')
  return data || []
}
