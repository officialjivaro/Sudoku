import { requireSupabase } from '../lib/supabase.js'

const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} _.-]+$/u

export function validateDisplayName(value) {
  const displayName = String(value || '').trim().replace(/\s+/g, ' ')

  if (displayName.length < 3 || displayName.length > 24) {
    throw new Error('Display names must contain between 3 and 24 characters.')
  }

  if (!DISPLAY_NAME_PATTERN.test(displayName)) {
    throw new Error('Use letters, numbers, spaces, periods, hyphens, or underscores only.')
  }

  return displayName
}

export function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase()

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }

  return email
}

export async function fetchProfile(userId) {
  if (!userId) return null

  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('user_id, display_name, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateProfileDisplayName(userId, value) {
  const client = requireSupabase()
  const displayName = validateDisplayName(value)
  const { data, error } = await client
    .from('profiles')
    .update({ display_name: displayName })
    .eq('user_id', userId)
    .select('user_id, display_name, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}
