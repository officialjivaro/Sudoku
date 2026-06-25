function randomChunkSize() {
  return Math.floor(Math.random() * 3) + 3
}

export function splitFactIntoLines(fact) {
  const words = String(fact || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let index = 0

  while (index < words.length) {
    const chunkSize = randomChunkSize()
    lines.push(words.slice(index, index + chunkSize).join(' '))
    index += chunkSize
  }

  return lines
}

export function pickRandomFact(facts) {
  if (!Array.isArray(facts) || facts.length === 0) {
    return ''
  }

  return facts[Math.floor(Math.random() * facts.length)]
}
