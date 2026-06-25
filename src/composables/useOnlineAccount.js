import { computed, readonly, reactive } from 'vue'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import {
  fetchProfile,
  normalizeEmail,
  updateProfileDisplayName
} from '../services/accountService.js'

const state = reactive({
  configured: isSupabaseConfigured,
  initialized: false,
  session: null,
  user: null,
  profile: null,
  loading: false,
  error: '',
  message: '',
  modalOpen: false
})

let initializePromise = null
let authSubscription = null
let sessionRevision = 0

function setSession(session) {
  sessionRevision += 1
  state.session = session || null
  state.user = session?.user || null
}

async function loadProfile() {
  if (!state.user) {
    state.profile = null
    return null
  }

  const revision = sessionRevision
  const userId = state.user.id
  const profile = await fetchProfile(userId)

  if (revision !== sessionRevision || state.user?.id !== userId) {
    return null
  }

  state.profile = profile
  return profile
}

async function handleSession(session) {
  setSession(session)

  if (session?.user) {
    await loadProfile()
  } else {
    state.profile = null
  }
}

async function initialize() {
  if (state.initialized) return state.session
  if (initializePromise) return initializePromise

  initializePromise = (async () => {
    if (!state.configured || !supabase) {
      state.initialized = true
      return null
    }

    state.loading = true
    state.error = ''

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      await handleSession(data.session)

      if (!authSubscription) {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          window.setTimeout(async () => {
            try {
              await handleSession(session)
            } catch (error) {
              state.error = error.message || 'Unable to refresh the shared Jivaro account.'
            }
          }, 0)
        })

        authSubscription = listener.subscription
      }

      return data.session
    } catch (error) {
      state.error = error.message || 'Unable to restore the shared Jivaro account.'
      setSession(null)
      state.profile = null
      return null
    } finally {
      state.loading = false
      state.initialized = true
    }
  })()

  return initializePromise
}

async function requestOtp(value) {
  if (!state.configured || !supabase) {
    state.error = 'Online accounts are not configured for this build.'
    return false
  }

  state.loading = true
  state.error = ''
  state.message = ''

  try {
    const email = normalizeEmail(value)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { source: 'sudoku' }
      }
    })

    if (error) throw error
    state.message = 'Check your inbox for the Jivaro Games sign-in code.'
    return true
  } catch (error) {
    state.error = error.message || 'The sign-in code could not be sent.'
    return false
  } finally {
    state.loading = false
  }
}

async function verifyOtp(emailValue, tokenValue) {
  if (!state.configured || !supabase) return false

  state.loading = true
  state.error = ''
  state.message = ''

  try {
    const email = normalizeEmail(emailValue)
    const token = String(tokenValue || '').trim().replace(/[\s-]+/g, '')

    if (!token) {
      throw new Error('Enter the sign-in code from your email.')
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) throw error
    await handleSession(data.session)
    state.message = 'Signed in. Online scores and permanent Quanta are now active.'
    return true
  } catch (error) {
    state.error = error.message || 'The sign-in code is invalid or expired.'
    return false
  } finally {
    state.loading = false
  }
}

async function saveDisplayName(value) {
  if (!state.user) return false

  const userId = state.user.id
  state.loading = true
  state.error = ''
  state.message = ''

  try {
    const profile = await updateProfileDisplayName(userId, value)

    if (state.user?.id !== userId) {
      return false
    }

    state.profile = profile
    state.message = 'Display name updated across Jivaro Games.'
    return true
  } catch (error) {
    if (state.user?.id === userId) {
      state.error = error.message || 'The display name could not be updated.'
    }
    return false
  } finally {
    if (state.user?.id === userId) {
      state.loading = false
    }
  }
}

async function signOut() {
  if (!supabase) return false

  state.loading = true
  state.error = ''
  state.message = ''

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    state.profile = null
    state.message = 'Signed out. Guest Quanta remain temporary for this tab.'
    return true
  } catch (error) {
    state.error = error.message || 'Unable to sign out.'
    return false
  } finally {
    state.loading = false
  }
}

function openModal() {
  state.error = ''
  state.message = ''
  state.modalOpen = true
}

function closeModal() {
  state.modalOpen = false
  state.error = ''
  state.message = ''
}

export function useOnlineAccount() {
  return {
    state: readonly(state),
    isAuthenticated: computed(() => Boolean(state.user)),
    displayName: computed(() => state.profile?.display_name || 'Player'),
    email: computed(() => state.user?.email || ''),
    initialize,
    requestOtp,
    verifyOtp,
    saveDisplayName,
    signOut,
    openModal,
    closeModal,
    refreshProfile: loadProfile
  }
}
