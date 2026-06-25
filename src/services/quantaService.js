import { requireSupabase } from '../lib/supabase.js'

function emptyWallet(userId = '') {
  return {
    user_id: userId,
    balance: 0,
    lifetime_earned: 0,
    lifetime_spent: 0,
    created_at: null,
    updated_at: null
  }
}

export async function fetchQuantaWallet(userId) {
  if (!userId) return emptyWallet()

  const client = requireSupabase()
  const { data, error } = await client
    .from('quanta_wallets')
    .select('user_id, balance, lifetime_earned, lifetime_spent, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data || emptyWallet(userId)
}
