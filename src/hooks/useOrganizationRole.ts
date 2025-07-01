
import { useState, useEffect } from 'react'
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react'
import { supabase } from '@/integrations/supabase/client'

export const useOrganizationRole = () => {
  const { user } = useUser()
  const { organization } = useOrganization()
  const { getToken } = useAuth()
  const [role, setRole] = useState<'admin' | 'member' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkUserRole = async () => {
    if (!user || !organization) {
      setRole(null)
      setIsLoading(false)
      return
    }

    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organization.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking user role:', error)
        setRole(null)
        return
      }

      if (data) {
        setRole(data.role)
      } else {
        // User not found in organization_members, default to member
        setRole('member')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  const setUserAsAdmin = async () => {
    if (!user || !organization) return false

    try {
      const clerkToken = await getToken({ template: 'supabase' })
      if (!clerkToken) {
        throw new Error('Failed to get authentication token')
      }

      await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: '',
      })

      const { error } = await supabase
        .from('organization_members')
        .upsert({
          user_id: user.id,
          organization_id: organization.id,
          role: 'admin',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error setting user as admin:', error)
        return false
      }

      setRole('admin')
      return true
    } catch (error) {
      console.error('Error setting user as admin:', error)
      return false
    }
  }

  useEffect(() => {
    checkUserRole()
  }, [user, organization])

  return {
    role,
    isLoading,
    isAdmin: role === 'admin',
    isMember: role === 'member',
    setUserAsAdmin,
    refreshRole: checkUserRole
  }
}
