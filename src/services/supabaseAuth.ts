
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wnaspljpcncshnnyrstt.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXNwbGpwY25jc2hubnlyc3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzM4NjQsImV4cCI6MjA2NjcwOTg2NH0.y95NQh-gQGwXcU4lyCUkqeZerSEJwC_3sotpAlu0bww"

export const createAuthenticatedSupabaseClient = (clerkToken: string) => {
  console.log('Creating authenticated Supabase client with token length:', clerkToken.length)
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      // Disable auto refresh since we're using Clerk tokens
      autoRefreshToken: false,
      persistSession: false,
    }
  })
}

export const setupSupabaseSession = async (clerkToken: string) => {
  try {
    console.log('Setting up Supabase session with Clerk token')
    
    // Create a client with the Clerk token in headers
    const authenticatedClient = createAuthenticatedSupabaseClient(clerkToken)
    
    // Test the connection by trying to make a simple query
    const { data, error } = await authenticatedClient
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Auth verification error:', error)
      throw new Error(`Authentication failed: ${error.message}`)
    }

    console.log('Supabase session setup successful')
    return { client: authenticatedClient }
  } catch (error) {
    console.error('Complete session setup failed:', error)
    throw error
  }
}
