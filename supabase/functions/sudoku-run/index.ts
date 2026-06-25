import { createClient } from '@supabase/supabase-js'
import { createSeededRandom, generateSudoku, isCompleteSolution } from './_shared/sudoku.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const MODES = new Set(['classic', 'daily', 'sprint', 'zen'])
const DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const SPRINT_SECONDS: Record<string, number> = { easy: 900, medium: 600, hard: 420 }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

async function getAuthenticatedUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  const authorization = req.headers.get('Authorization') || ''
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Authentication is required.')
  return data.user
}

function getAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  if (!supabaseUrl || !serviceRoleKey) throw new Error('Server configuration is incomplete.')

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function startRun(admin: ReturnType<typeof createClient>, userId: string, payload: Record<string, unknown>) {
  const clientRunId = String(payload.clientRunId || '')
  const mode = String(payload.mode || 'classic')
  const requestedDifficulty = String(payload.difficulty || 'easy')
  const difficulty = mode === 'daily' ? 'medium' : requestedDifficulty
  const dailyDate = mode === 'daily' ? String(payload.dailyDate || utcDateKey()) : null

  if (!UUID_PATTERN.test(clientRunId)) throw new Error('A valid client run ID is required.')
  if (!MODES.has(mode)) throw new Error('This Sudoku mode is not supported by the verified run service.')
  if (!DIFFICULTIES.has(difficulty)) throw new Error('Unsupported Sudoku difficulty.')
  if (mode === 'daily' && dailyDate !== utcDateKey()) throw new Error('The official Daily Challenge must use the current UTC date.')

  const { data: existing, error: existingError } = await admin
    .from('sudoku_run_sessions')
    .select('id, run_token, client_run_id, mode, difficulty, puzzle_id, puzzle, daily_date, started_at, deadline_at, status')
    .eq('user_id', userId)
    .eq('client_run_id', clientRunId)
    .maybeSingle()

  if (existingError) throw existingError

  if (existing) {
    return {
      runId: existing.id,
      runToken: existing.run_token,
      clientRunId: existing.client_run_id,
      mode: existing.mode,
      difficulty: existing.difficulty,
      puzzleId: existing.puzzle_id,
      puzzle: existing.puzzle,
      dailyDate: existing.daily_date,
      startedAt: existing.started_at,
      deadline: existing.deadline_at,
      resumed: true
    }
  }

  const random = mode === 'daily'
    ? createSeededRandom(`sudoku-daily-v1-${dailyDate}`)
    : Math.random
  const generated = generateSudoku(difficulty, random)
  const startedAt = new Date()
  const deadline = mode === 'sprint'
    ? new Date(startedAt.getTime() + SPRINT_SECONDS[difficulty] * 1000)
    : null
  const expiresAt = mode === 'daily'
    ? new Date(`${dailyDate}T23:59:59.999Z`)
    : new Date(startedAt.getTime() + 24 * 60 * 60 * 1000)
  const puzzleId = mode === 'daily'
    ? `daily-${dailyDate}-v1`
    : `${mode}-${clientRunId}`

  const { data, error } = await admin
    .from('sudoku_run_sessions')
    .insert({
      client_run_id: clientRunId,
      user_id: userId,
      mode,
      difficulty,
      puzzle_id: puzzleId,
      puzzle: generated.puzzle,
      solution: generated.solution,
      daily_date: dailyDate,
      started_at: startedAt.toISOString(),
      deadline_at: deadline?.toISOString() || null,
      expires_at: expiresAt.toISOString()
    })
    .select('id, run_token, client_run_id, mode, difficulty, puzzle_id, puzzle, daily_date, started_at, deadline_at')
    .single()

  if (error) throw error

  return {
    runId: data.id,
    runToken: data.run_token,
    clientRunId: data.client_run_id,
    mode: data.mode,
    difficulty: data.difficulty,
    puzzleId: data.puzzle_id,
    puzzle: data.puzzle,
    dailyDate: data.daily_date,
    startedAt: data.started_at,
    deadline: data.deadline_at,
    resumed: false
  }
}

async function completeRun(admin: ReturnType<typeof createClient>, userId: string, payload: Record<string, unknown>) {
  const runToken = String(payload.runToken || '')
  const clientRunId = String(payload.clientRunId || '')
  const mistakes = Number(payload.mistakes || 0)
  const hintsUsed = Number(payload.hintsUsed || 0)

  if (!UUID_PATTERN.test(runToken) || !UUID_PATTERN.test(clientRunId)) throw new Error('The verified run token is invalid.')
  if (!Number.isInteger(mistakes) || mistakes < 0 || mistakes > 500) throw new Error('Mistake count is outside the accepted range.')
  if (!Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > 3) throw new Error('Hint count is outside the accepted range.')
  if (payload.completionReason !== 'solved') throw new Error('Only solved puzzles can be submitted.')

  const { data: session, error: sessionError } = await admin
    .from('sudoku_run_sessions')
    .select('id, user_id, client_run_id, solution, status, expires_at, deadline_at, mode')
    .eq('run_token', runToken)
    .eq('user_id', userId)
    .eq('client_run_id', clientRunId)
    .maybeSingle()

  if (sessionError) throw sessionError
  if (!session) throw new Error('The verified Sudoku run was not found.')

  if (session.status === 'completed') {
    const { data: existing, error: existingError } = await admin
      .from('sudoku_score_runs')
      .select('id, is_daily_official, quanta_awarded, quanta_reward_status')
      .eq('run_session_id', session.id)
      .maybeSingle()

    if (existingError) throw existingError

    const { data: wallet } = await admin
      .from('quanta_wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle()

    return {
      runId: existing?.id || null,
      dailyOfficial: Boolean(existing?.is_daily_official),
      inserted: false,
      quantaAwarded: Number(existing?.quanta_awarded || 0),
      previousBalance: Number(wallet?.balance || 0),
      newBalance: Number(wallet?.balance || 0),
      rewardStatus: existing?.quanta_reward_status || 'duplicate',
      rewardMessage: 'This verified run was already processed.'
    }
  }

  if (session.status !== 'active') throw new Error('This Sudoku run is no longer active.')
  if (new Date(session.expires_at).getTime() < Date.now()) throw new Error('This Sudoku run has expired.')
  if (session.mode === 'sprint' && session.deadline_at && new Date(session.deadline_at).getTime() < Date.now()) {
    throw new Error('The Sprint timer expired before completion.')
  }
  if (!isCompleteSolution(payload.entries, session.solution)) {
    await admin.from('sudoku_security_events').insert({
      user_id: userId,
      event_type: 'invalid_solution_submission',
      severity: 'warning',
      metadata: { client_run_id: clientRunId }
    })
    throw new Error('The submitted Sudoku grid does not match the verified solution.')
  }

  const { data, error } = await admin.rpc('sudoku_finalize_run', {
    p_user_id: userId,
    p_run_token: runToken,
    p_client_run_id: clientRunId,
    p_mistakes: mistakes,
    p_hints_used: hintsUsed
  })

  if (error) throw error
  const result = Array.isArray(data) ? data[0] : data

  return {
    runId: result?.run_id || null,
    dailyOfficial: Boolean(result?.daily_official),
    inserted: Boolean(result?.inserted),
    quantaAwarded: Number(result?.quanta_awarded || 0),
    previousBalance: Number(result?.previous_balance || 0),
    newBalance: Number(result?.new_balance || 0),
    rewardStatus: result?.reward_status || 'not_rewarded',
    rewardMessage: result?.reward_message || ''
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  try {
    const user = await getAuthenticatedUser(req)
    const admin = getAdminClient()
    const payload = await req.json()
    const action = String(payload?.action || '')

    if (action === 'start') return json(await startRun(admin, user.id, payload))
    if (action === 'complete') return json(await completeRun(admin, user.id, payload))
    return json({ error: 'Unsupported Sudoku run action.' }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The online Sudoku service failed.'
    return json({ error: message }, message.includes('Authentication') ? 401 : 400)
  }
})
