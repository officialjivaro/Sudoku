import { requireSupabase } from '../lib/supabase.js'

export async function fetchSudokuCatalog() {
  const client = requireSupabase()
  const { data, error } = await client
    .from('sudoku_shop_items')
    .select('id, category, equipment_slot, name, description, price, active, preview_metadata, created_at, updated_at')
    .eq('active', true)
    .order('category')
    .order('price')

  if (error) throw error
  return Array.isArray(data) ? data : []
}

export async function fetchSudokuInventory(userId) {
  if (!userId) return []

  const client = requireSupabase()
  const { data, error } = await client
    .from('sudoku_user_inventory')
    .select('item_id, acquired_at, source_purchase_id')
    .eq('user_id', userId)

  if (error) throw error
  return Array.isArray(data) ? data : []
}

export async function fetchSudokuEquipment(userId) {
  if (!userId) return []

  const client = requireSupabase()
  const { data, error } = await client
    .from('sudoku_equipped_items')
    .select('equipment_slot, item_id, equipped_at')
    .eq('user_id', userId)

  if (error) throw error
  return Array.isArray(data) ? data : []
}

export async function purchaseSudokuItem(itemId, clientPurchaseId) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('sudoku_purchase_item', {
    p_item_id: itemId,
    p_client_purchase_id: clientPurchaseId
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function equipSudokuItem(itemId, equipmentSlot) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('sudoku_equip_item', {
    p_item_id: itemId,
    p_equipment_slot: equipmentSlot
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}
