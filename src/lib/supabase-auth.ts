
import { useUser, useAuth } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'

export const useSupabaseAuth = () => {
  const { user } = useUser()
  const { getToken } = useAuth()

  const setupSupabaseAuth = async () => {
    if (!user) return false

    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) return false

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      return true
    } catch (error) {
      console.error('Failed to setup Supabase auth:', error)
      return false
    }
  }

  return { setupSupabaseAuth }
}
