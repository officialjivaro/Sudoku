export const SUDOKU_STORE_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'background', label: 'Backgrounds' }),
  Object.freeze({ id: 'board', label: 'Boards' }),
  Object.freeze({ id: 'numbers', label: 'Numbers' }),
  Object.freeze({ id: 'petals', label: 'Petals' }),
  Object.freeze({ id: 'completion', label: 'Completion' }),
  Object.freeze({ id: 'controls', label: 'Controls' })
])

const item = value => Object.freeze({ active: true, ...value })

export const SUDOKU_STORE_ITEMS = Object.freeze([
  item({ id: 'sakura-sanctuary', category: 'background', slot: 'background', name: 'Sakura Sanctuary', price: 0, description: 'The original quiet garden among the blossoms.', assetKey: 'sakura-sanctuary', preview: 'image' }),
  item({ id: 'moon-garden', category: 'background', slot: 'background', name: 'Moon Garden', price: 55, description: 'A violet night, a patient moon, and suspiciously elegant hills.', assetKey: 'moon-garden', preview: 'image' }),
  item({ id: 'koi-sunset', category: 'background', slot: 'background', name: 'Koi Sunset', price: 65, description: 'Warm evening water with koi who refuse to solve row seven.', assetKey: 'koi-sunset', preview: 'image' }),
  item({ id: 'ink-mountain', category: 'background', slot: 'background', name: 'Ink Mountain', price: 45, description: 'Paper, mist, and mountains drawn with unnecessary confidence.', assetKey: 'ink-mountain', preview: 'image' }),
  item({ id: 'lantern-night', category: 'background', slot: 'background', name: 'Lantern Night', price: 70, description: 'Lanterns drift above a puzzle that definitely knows your mistakes.', assetKey: 'lantern-night', preview: 'image' }),
  item({ id: 'jade-mist', category: 'background', slot: 'background', name: 'Jade Mist', price: 50, description: 'A cool green valley wrapped in polite, mysterious fog.', assetKey: 'jade-mist', preview: 'image' }),

  item({ id: 'paper-white', category: 'board', slot: 'board', name: 'Paper White', price: 0, description: 'The clean original board with soft paper cells.', themeKey: 'paper-white', preview: '#fffafc' }),
  item({ id: 'rose-grid', category: 'board', slot: 'board', name: 'Rose Grid', price: 30, description: 'Blush cells and deeper rose block lines.', themeKey: 'rose-grid', preview: '#f7c9d6' }),
  item({ id: 'midnight-ink', category: 'board', slot: 'board', name: 'Midnight Ink', price: 50, description: 'A dark lacquer board with pale ink marks.', themeKey: 'midnight-ink', preview: '#25222c' }),
  item({ id: 'jade-board', category: 'board', slot: 'board', name: 'Jade Board', price: 45, description: 'Muted jade tiles for methodical temple arithmetic.', themeKey: 'jade-board', preview: '#b9d9cf' }),
  item({ id: 'lantern-gold', category: 'board', slot: 'board', name: 'Lantern Gold', price: 60, description: 'Warm ivory cells with restrained golden dividers.', themeKey: 'lantern-gold', preview: '#f4dfaa' }),

  item({ id: 'classic-ink', category: 'numbers', slot: 'numbers', name: 'Classic Ink', price: 0, description: 'Crisp familiar digits with no dramatic monologue.', themeKey: 'classic-ink', preview: 'Aa' }),
  item({ id: 'brush-script', category: 'numbers', slot: 'numbers', name: 'Brush Script', price: 25, description: 'Bold brush-like numbers for theatrical deductions.', themeKey: 'brush-script', preview: '九' }),
  item({ id: 'rounded-mochi', category: 'numbers', slot: 'numbers', name: 'Rounded Mochi', price: 20, description: 'Friendly rounded digits with snack-shaped optimism.', themeKey: 'rounded-mochi', preview: '8' }),
  item({ id: 'mono-temple', category: 'numbers', slot: 'numbers', name: 'Mono Temple', price: 30, description: 'Monospaced numbers aligned with ceremonial precision.', themeKey: 'mono-temple', preview: '123' }),

  item({ id: 'sakura-soft', category: 'petals', slot: 'petals', name: 'Soft Sakura', price: 0, description: 'The original pale pink petal shower.', themeKey: 'sakura-soft', preview: '#f4a9ba' }),
  item({ id: 'moon-petals', category: 'petals', slot: 'petals', name: 'Moon Petals', price: 30, description: 'Cool violet petals for midnight solving.', themeKey: 'moon-petals', preview: '#b9a3e3' }),
  item({ id: 'golden-petals', category: 'petals', slot: 'petals', name: 'Golden Petals', price: 35, description: 'Tiny drifting lantern sparks pretending to be flowers.', themeKey: 'golden-petals', preview: '#f0c56b' }),
  item({ id: 'crimson-petals', category: 'petals', slot: 'petals', name: 'Crimson Petals', price: 40, description: 'A dramatic red shower for unnecessarily serious grids.', themeKey: 'crimson-petals', preview: '#c85b6f' }),

  item({ id: 'blossom-burst', category: 'completion', slot: 'completion', name: 'Blossom Burst', price: 0, description: 'A restrained celebration of drifting petals.', themeKey: 'blossom-burst', preview: '#f4a9ba' }),
  item({ id: 'lantern-spark', category: 'completion', slot: 'completion', name: 'Lantern Spark', price: 35, description: 'Warm sparks rise when the final number lands.', themeKey: 'lantern-spark', preview: '#f0b56f' }),
  item({ id: 'ink-ripple', category: 'completion', slot: 'completion', name: 'Ink Ripple', price: 30, description: 'A calm black ripple approves your arithmetic.', themeKey: 'ink-ripple', preview: '#343038' }),
  item({ id: 'koi-wave', category: 'completion', slot: 'completion', name: 'Koi Wave', price: 45, description: 'A coral wave sweeps across the completed board.', themeKey: 'koi-wave', preview: '#ed7b70' }),

  item({ id: 'sakura-controls', category: 'controls', slot: 'controls', name: 'Sakura Controls', price: 0, description: 'The original pink paper controls.', themeKey: 'sakura-controls', preview: '#f4a9ba' }),
  item({ id: 'moon-controls', category: 'controls', slot: 'controls', name: 'Moon Controls', price: 25, description: 'Deep violet controls with moonlit highlights.', themeKey: 'moon-controls', preview: '#62527a' }),
  item({ id: 'jade-controls', category: 'controls', slot: 'controls', name: 'Jade Controls', price: 25, description: 'Cool jade controls with dark ink shadows.', themeKey: 'jade-controls', preview: '#6d9e91' })
])

export const DEFAULT_EQUIPPED_ITEMS = Object.freeze({
  background: 'sakura-sanctuary',
  board: 'paper-white',
  numbers: 'classic-ink',
  petals: 'sakura-soft',
  completion: 'blossom-burst',
  controls: 'sakura-controls'
})

export function getStoreItem(itemId) {
  return SUDOKU_STORE_ITEMS.find(current => current.id === itemId) || null
}

export function getCategoryLabel(categoryId) {
  return SUDOKU_STORE_CATEGORIES.find(category => category.id === categoryId)?.label || 'Cosmetic'
}
