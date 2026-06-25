import { computed, readonly, reactive } from 'vue'
import { isSupabaseConfigured } from '../lib/supabase.js'
import {
  BACKGROUND_ASSETS,
  DEFAULT_EQUIPPED_ITEMS,
  getStoreItem,
  SUDOKU_STORE_ITEMS
} from '../constants/sudokuStoreCatalog.js'
import {
  equipSudokuItem,
  fetchSudokuCatalog,
  fetchSudokuEquipment,
  fetchSudokuInventory,
  purchaseSudokuItem
} from '../services/sudokuStoreService.js'
import { createId } from '../utils/createId.js'
import { useEconomy } from './useEconomy.js'

const defaultOwnedIds = SUDOKU_STORE_ITEMS.filter(item => item.price === 0).map(item => item.id)

const state = reactive({
  open: false,
  userId: null,
  catalog: [...SUDOKU_STORE_ITEMS],
  ownedItemIds: [...defaultOwnedIds],
  equipped: { ...DEFAULT_EQUIPPED_ITEMS },
  loading: false,
  actionItemId: '',
  error: '',
  message: ''
})

function normalizeRemoteItem(value) {
  const local = getStoreItem(value.id)
  return {
    ...local,
    id: value.id,
    category: value.category,
    slot: value.equipment_slot,
    name: value.name,
    description: value.description,
    price: Number(value.price || 0),
    active: Boolean(value.active),
    previewMetadata: value.preview_metadata || {}
  }
}

function applyCosmetics() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.sudokuBoardTheme = state.equipped.board || DEFAULT_EQUIPPED_ITEMS.board
  root.dataset.sudokuNumberStyle = state.equipped.numbers || DEFAULT_EQUIPPED_ITEMS.numbers
  root.dataset.sudokuPetalPack = state.equipped.petals || DEFAULT_EQUIPPED_ITEMS.petals
  root.dataset.sudokuCompletionEffect = state.equipped.completion || DEFAULT_EQUIPPED_ITEMS.completion
  root.dataset.sudokuControlTheme = state.equipped.controls || DEFAULT_EQUIPPED_ITEMS.controls

  const backgroundId = state.equipped.background || DEFAULT_EQUIPPED_ITEMS.background
  const backgroundUrl = BACKGROUND_ASSETS[backgroundId] || BACKGROUND_ASSETS[DEFAULT_EQUIPPED_ITEMS.background]
  root.style.setProperty('--active-background-image', `url("${backgroundUrl}")`)
}

async function handleAccount(user) {
  state.userId = user?.id || null
  state.error = ''
  state.message = ''
  state.ownedItemIds = [...defaultOwnedIds]
  state.equipped = { ...DEFAULT_EQUIPPED_ITEMS }

  if (!state.userId || !isSupabaseConfigured) {
    applyCosmetics()
    return
  }

  state.loading = true

  try {
    const [catalog, inventory, equipment] = await Promise.all([
      fetchSudokuCatalog(),
      fetchSudokuInventory(state.userId),
      fetchSudokuEquipment(state.userId)
    ])

    if (catalog.length > 0) {
      state.catalog = catalog.map(normalizeRemoteItem)
    }

    state.ownedItemIds = [...new Set([
      ...defaultOwnedIds,
      ...inventory.map(item => item.item_id)
    ])]

    for (const record of equipment) {
      if (record.equipment_slot && record.item_id) {
        state.equipped[record.equipment_slot] = record.item_id
      }
    }
  } catch (error) {
    state.error = `${error.message || 'The Sudoku store could not be loaded.'} Local previews remain available.`
  } finally {
    state.loading = false
    applyCosmetics()
  }
}

async function refresh() {
  if (!state.userId) {
    applyCosmetics()
    return
  }

  await handleAccount({ id: state.userId })
}

async function purchase(itemId) {
  state.error = ''
  state.message = ''

  if (!state.userId) {
    state.error = 'Sign in to purchase and permanently own Sudoku cosmetics.'
    return false
  }

  if (state.ownedItemIds.includes(itemId)) {
    state.message = 'You already own this item.'
    return true
  }

  state.actionItemId = itemId

  try {
    const result = await purchaseSudokuItem(itemId, createId())
    state.ownedItemIds = [...new Set([...state.ownedItemIds, itemId])]
    useEconomy().applyPurchaseResult(result)
    state.message = result?.inserted === false ? 'This purchase was already processed.' : 'Item purchased and added to your collection.'
    return true
  } catch (error) {
    state.error = error.message || 'The purchase could not be completed.'
    return false
  } finally {
    state.actionItemId = ''
  }
}

async function equip(itemId) {
  state.error = ''
  state.message = ''
  const item = state.catalog.find(current => current.id === itemId) || getStoreItem(itemId)

  if (!item) {
    state.error = 'This store item is unavailable.'
    return false
  }

  if (!state.ownedItemIds.includes(itemId)) {
    state.error = 'Purchase this item before equipping it.'
    return false
  }

  if (!state.userId) {
    state.equipped[item.slot] = itemId
    applyCosmetics()
    state.message = 'Default preview equipped for this visit.'
    return true
  }

  state.actionItemId = itemId

  try {
    await equipSudokuItem(itemId, item.slot)
    state.equipped[item.slot] = itemId
    applyCosmetics()
    state.message = `${item.name} equipped.`
    return true
  } catch (error) {
    state.error = error.message || 'The item could not be equipped.'
    return false
  } finally {
    state.actionItemId = ''
  }
}

function open() {
  state.open = true
  state.error = ''
  state.message = ''
}

function close() {
  state.open = false
  state.error = ''
  state.message = ''
}

export function useSudokuStore() {
  return {
    state: readonly(state),
    activeBackgroundUrl: computed(() => {
      const itemId = state.equipped.background || DEFAULT_EQUIPPED_ITEMS.background
      return BACKGROUND_ASSETS[itemId] || BACKGROUND_ASSETS[DEFAULT_EQUIPPED_ITEMS.background]
    }),
    isOwned: itemId => state.ownedItemIds.includes(itemId),
    isEquipped: itemId => Object.values(state.equipped).includes(itemId),
    handleAccount,
    refresh,
    purchase,
    equip,
    open,
    close,
    applyCosmetics
  }
}
