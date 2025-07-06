
import { supabase } from '@/integrations/supabase/client'

export const setupSupabaseSession = async (clerkToken: string) => {
  try {
    console.log('Setting up Supabase session with Clerk token')
    
    // Clear any existing session first
    await supabase.auth.signOut()
    
    // Set the session with the Clerk token
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token: clerkToken,
      refresh_token: '', // Clerk tokens don't use refresh tokens in this context
    })

    if (sessionError) {
      console.error('Session setup error:', sessionError)
      throw new Error(`Failed to setup Supabase session: ${sessionError.message}`)
    }

    console.log('Session setup successful:', data.session?.user?.id)
    
    // Verify we can get the current user
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting Supabase user after session setup:', userError)
      throw new Error(`Failed to verify user session: ${userError.message}`)
    }

    if (!supabaseUser) {
      throw new Error('No user found after session setup')
    }

    console.log('Supabase user verified:', supabaseUser.id)
    return supabaseUser
  } catch (error) {
    console.error('Complete session setup failed:', error)
    throw error
  }
}
