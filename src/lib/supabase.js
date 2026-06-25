import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabasePublishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
const authStorageKey = String(import.meta.env.VITE_SUPABASE_AUTH_STORAGE_KEY || 'chronogame-supabase-auth').trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: authStorageKey
      }
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Online services are not configured. Add the Jivaro Games Supabase values to .env.local.')
  }

  return supabase
}
