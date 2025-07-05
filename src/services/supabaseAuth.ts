
import { supabase } from '@/integrations/supabase/client'

export const setupSupabaseSession = async (clerkToken: string) => {
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: clerkToken,
    refresh_token: '',
  })

  if (sessionError) {
    console.error('Session setup error:', sessionError)
    throw sessionError
  }

  // Debug: Check if we can get the current user ID
  const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('Error getting Supabase user:', userError)
  }

  return supabaseUser
}
