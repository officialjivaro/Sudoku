const STORAGE_KEY = 'sudoku-player-v1'
const DATA_VERSION = 1
const RESULT_LIMIT = 250

// Storage Model | Keep browser data versioned and defensively parsed.
function createEmptyData() {
  return {
    version: DATA_VERSION,
    results: [],
    dailyProgress: {},
    dailyCompletions: {}
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isValidData(value) {
  return Boolean(
    value &&
    value.version === DATA_VERSION &&
    Array.isArray(value.results) &&
    value.dailyProgress &&
    typeof value.dailyProgress === 'object' &&
    value.dailyCompletions &&
    typeof value.dailyCompletions === 'object'
  )
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addUtcDays(dateKey, amount) {
  const date = parseDateKey(dateKey)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

function calculateStreaks(dateKeys, referenceDate = new Date()) {
  const uniqueDates = [...new Set(dateKeys)].sort()

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 }
  }

  let longest = 1
  let running = 1

  for (let index = 1; index < uniqueDates.length; index += 1) {
    if (addUtcDays(uniqueDates[index - 1], 1) === uniqueDates[index]) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 1
    }
  }

  const today = referenceDate.toISOString().slice(0, 10)
  const yesterday = addUtcDays(today, -1)
  const latest = uniqueDates.at(-1)
  let current = 0

  if (latest === today || latest === yesterday) {
    current = 1

    for (let index = uniqueDates.length - 2; index >= 0; index -= 1) {
      const expected = addUtcDays(uniqueDates[index + 1], -1)

      if (uniqueDates[index] !== expected) {
        break
      }

      current += 1
    }
  }

  return { current, longest }
}

function createMemoryStorage() {
  const values = new Map()

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    }
  }
}

export function createLocalStoragePlayerRepository(storage = createMemoryStorage()) {
  function readData() {
    try {
      const raw = storage.getItem(STORAGE_KEY)

      if (!raw) {
        return createEmptyData()
      }

      const parsed = JSON.parse(raw)
      return isValidData(parsed) ? parsed : createEmptyData()
    } catch {
      return createEmptyData()
    }
  }

  function writeData(data) {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function getResults() {
    return clone(readData().results)
  }

  function getDailyProgress(dateKey) {
    const progress = readData().dailyProgress[dateKey]
    return progress ? clone(progress) : null
  }

  function saveDailyProgress(dateKey, progress) {
    const data = readData()
    data.dailyProgress[dateKey] = clone(progress)
    writeData(data)
  }

  function clearDailyProgress(dateKey) {
    const data = readData()
    delete data.dailyProgress[dateKey]
    writeData(data)
  }

  function getDailyCompletion(dateKey) {
    const completion = readData().dailyCompletions[dateKey]
    return completion ? clone(completion) : null
  }

  function getDailyCompletions() {
    return clone(readData().dailyCompletions)
  }

  // Results and Streaks | Record outcomes and derive local achievements.
  function recordResult(result, referenceDate = new Date()) {
    const data = readData()
    const completedBefore = data.results.filter(item =>
      item.status === 'completed' &&
      item.mode === result.mode &&
      item.difficulty === result.difficulty
    )
    const previousBest = completedBefore.length > 0
      ? Math.min(...completedBefore.map(item => item.elapsedSeconds))
      : null
    const isPersonalBest = result.status === 'completed' &&
      result.mode !== 'zen' &&
      (previousBest === null || result.elapsedSeconds < previousBest)

    if (result.mode === 'daily' && result.status === 'completed' && result.dailyDate) {
      data.dailyCompletions[result.dailyDate] = clone(result)
      delete data.dailyProgress[result.dailyDate]
    }

    const streaks = calculateStreaks(Object.keys(data.dailyCompletions), referenceDate)
    const metadata = {
      isPersonalBest,
      previousBest,
      currentDailyStreak: streaks.current,
      longestDailyStreak: streaks.longest
    }
    const storedResult = { ...result, ...metadata }

    data.results.push(clone(storedResult))
    data.results = data.results.slice(-RESULT_LIMIT)

    if (result.mode === 'daily' && result.status === 'completed' && result.dailyDate) {
      data.dailyCompletions[result.dailyDate] = clone(storedResult)
    }

    writeData(data)
    return metadata
  }

  function getStats(referenceDate = new Date()) {
    const data = readData()
    const completed = data.results.filter(result => result.status === 'completed')
    const personalBests = {}

    for (const result of completed) {
      if (result.mode === 'zen') {
        continue
      }

      const key = `${result.mode}:${result.difficulty}`
      personalBests[key] = personalBests[key] === undefined
        ? result.elapsedSeconds
        : Math.min(personalBests[key], result.elapsedSeconds)
    }

    const byMode = completed.reduce((totals, result) => {
      totals[result.mode] = (totals[result.mode] || 0) + 1
      return totals
    }, {})
    const streaks = calculateStreaks(Object.keys(data.dailyCompletions), referenceDate)

    return {
      attempts: data.results.length,
      completed: completed.length,
      byMode,
      personalBests,
      currentDailyStreak: streaks.current,
      longestDailyStreak: streaks.longest
    }
  }

  function reset() {
    storage.removeItem(STORAGE_KEY)
  }

  return {
    getResults,
    getStats,
    getDailyProgress,
    saveDailyProgress,
    clearDailyProgress,
    getDailyCompletion,
    getDailyCompletions,
    recordResult,
    reset
  }
}
