import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_EQUIPPED_ITEMS,
  SUDOKU_STORE_CATEGORIES,
  SUDOKU_STORE_ITEMS
} from '../src/constants/sudokuStoreData.js'

test('Sudoku store item IDs are unique and prices are valid', () => {
  const ids = SUDOKU_STORE_ITEMS.map(item => item.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(SUDOKU_STORE_ITEMS.every(item => Number.isInteger(item.price) && item.price >= 0))
})

test('every store item uses a supported category and slot', () => {
  const categories = new Set(SUDOKU_STORE_CATEGORIES.map(category => category.id))
  assert.ok(SUDOKU_STORE_ITEMS.every(item => categories.has(item.category)))
  assert.ok(SUDOKU_STORE_ITEMS.every(item => item.slot === item.category))
})

test('every default equipped item exists and is free', () => {
  for (const itemId of Object.values(DEFAULT_EQUIPPED_ITEMS)) {
    const item = SUDOKU_STORE_ITEMS.find(candidate => candidate.id === itemId)
    assert.ok(item)
    assert.equal(item.price, 0)
  }
})
