import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('=== Supabase Configuration Debug ===')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
console.log('All env vars:', import.meta.env)
console.log('===================================')

// Error checking to ensure environment variables are present
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not set!')
  console.error('Make sure you have a .env.local file with VITE_SUPABASE_URL defined')
  console.error('Current env mode:', import.meta.env.MODE)
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Check your .env.local file.')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set!')
  console.error('Make sure you have a .env.local file with VITE_SUPABASE_ANON_KEY defined')
  console.error('Current env mode:', import.meta.env.MODE)
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Check your .env.local file.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}`)
}

// Create Supabase client with additional options for debugging
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    debug: true // Enable debug mode
  },
  global: {
    headers: {
      'x-client-info': 'cmdshift-web'
    }
  }
})

// Log successful initialization
console.log('✅ Supabase client initialized successfully')
console.log('Supabase URL:', supabaseUrl)
console.log('Auth debug mode:', true)

// Test the connection
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase session check error:', error)
    } else {
      console.log('Supabase session check successful:', data?.session ? 'Session exists' : 'No session')
    }
  })
  .catch(err => {
    console.error('Failed to check Supabase session:', err)
  })

export default supabase