
import { createAuthenticatedSupabaseClient } from './supabaseAuth'

export const saveSharedQuiz = async (
  clerkToken: string,
  userId: string,
  organizationId: string,
  quizData: any,
  quizType: string,
  title: string,
  description?: string
) => {
  try {
    console.log('Setting up authenticated Supabase client for quiz save...')
    const supabase = createAuthenticatedSupabaseClient(clerkToken)

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
      
      // Check if it's a JWT/auth error
      if (error.code === 'PGRST301' || error.message.includes('JWS')) {
        throw new Error('Authentication token is invalid. Please refresh the page and try again.')
      }
      
      throw error
    }

    console.log('Quiz saved successfully:', data)
    return data
  } catch (error) {
    console.error('Error in saveSharedQuiz:', error)
    throw error
  }
}

export const fetchSharedQuizzes = async (
  clerkToken: string,
  organizationId: string
) => {
  try {
    const supabase = createAuthenticatedSupabaseClient(clerkToken)

    console.log('Fetching quizzes for organization:', organizationId)

    const { data, error } = await supabase
      .from('shared_quizzes')
      .select('*')
      .eq('organization_id', organizationId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shared quizzes:', error)
      
      if (error.code === 'PGRST301' || error.message.includes('JWS')) {
        throw new Error('Authentication token is invalid. Please refresh the page and try again.')
      }
      
      throw error
    }

    console.log('Fetched quizzes:', data?.length || 0, 'quizzes')
    return data || []
  } catch (error) {
    console.error('Error in fetchSharedQuizzes:', error)
    throw error
  }
}
