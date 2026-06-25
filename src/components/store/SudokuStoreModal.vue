<template>
  <AppModalShell
    :open="store.state.open"
    size="market"
    title-id="store-title"
    close-label="Close Sakura Market"
    @close="close"
  >
    <template #header>
      <div class="store-header">
        <div>
          <p class="eyebrow">Sudoku cosmetics</p>
          <h2 id="store-title" class="store-header__title">Sakura Market</h2>
          <p class="section-copy">Preview permanent cosmetics. Nothing here changes puzzle difficulty or rankings.</p>
        </div>

        <div class="store-wallet" :aria-label="`${economy.walletLabel.value}: ${economy.balance.value} Quanta`">
          <QuantaCoin size="medium" />
          <div>
            <span>{{ economy.walletLabel.value }}</span>
            <strong>{{ economy.balance.value.toLocaleString() }}</strong>
          </div>
        </div>
      </div>
    </template>

    <div class="store-content">
      <p v-if="!account.isAuthenticated.value" class="store-notice">
        Guests may browse previews. Sign in to purchase, own, and equip permanent items.
      </p>

      <nav class="category-tabs internal-scroll" aria-label="Sakura Market categories">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          :class="['category-tab', { 'category-tab--active': category.id === activeCategory }]"
          :aria-pressed="category.id === activeCategory"
          @click="activeCategory = category.id"
        >
          {{ category.label }}
        </button>
      </nav>

      <div class="store-workspace">
        <WashiPanel variant="feature" class="store-preview-panel">
          <CosmeticPreviewStage :item="selectedItem" />

          <div v-if="selectedItem" class="store-preview-actions">
            <div class="store-preview-actions__status">
              <StatusChip v-if="store.isEquipped(selectedItem.id)" tone="success">Equipped</StatusChip>
              <StatusChip v-else-if="store.isOwned(selectedItem.id)" tone="sakura">Owned</StatusChip>
              <StatusChip v-else tone="gold">
                <template #icon><QuantaCoin /></template>
                {{ selectedItem.price }}
              </StatusChip>
            </div>

            <AppButton
              size="small"
              :disabled="selectedAction.disabled"
              @click="handleItemAction(selectedItem)"
            >
              {{ selectedAction.label }}
            </AppButton>
          </div>
        </WashiPanel>

        <div class="store-catalog internal-scroll" tabindex="0" aria-label="Sudoku cosmetic items">
          <button
            v-for="item in filteredItems"
            :key="item.id"
            type="button"
            class="store-item"
            :class="{ 'store-item--selected': selectedItem?.id === item.id }"
            :aria-pressed="selectedItem?.id === item.id"
            @click="selectedItemId = item.id"
          >
            <div class="item-preview" :class="`item-preview--${item.category}`" :style="previewStyle(item)" aria-hidden="true">
              <span v-if="item.preview !== 'image'">{{ previewText(item) }}</span>
            </div>

            <div class="item-copy">
              <small>{{ categoryLabel(item.category) }}</small>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>

            <div class="item-meta">
              <span v-if="store.isEquipped(item.id)" class="item-badge item-badge--equipped">Equipped</span>
              <span v-else-if="store.isOwned(item.id)" class="item-badge">Owned</span>
              <span v-else class="item-price"><QuantaCoin />{{ item.price }}</span>
              <span>Preview</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="store-footer">
        <span v-if="store.state.error" class="store-error" role="alert">{{ store.state.error }}</span>
        <span v-else-if="store.state.message" class="store-success" role="status">{{ store.state.message }}</span>
        <span v-else>Prices and ownership are validated by the server.</span>
        <AppButton size="small" variant="quiet" @click="close">Return to Sudoku</AppButton>
      </div>
    </template>
  </AppModalShell>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  BACKGROUND_ASSETS,
  getCategoryLabel,
  SUDOKU_STORE_CATEGORIES
} from '../../constants/sudokuStoreCatalog.js'
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import QuantaCoin from '../common/QuantaCoin.vue'
import AppButton from '../ui/AppButton.vue'
import AppModalShell from '../ui/AppModalShell.vue'
import StatusChip from '../ui/StatusChip.vue'
import WashiPanel from '../ui/WashiPanel.vue'
import CosmeticPreviewStage from './CosmeticPreviewStage.vue'

const account = useOnlineAccount()
const economy = useEconomy()
const store = useSudokuStore()
const categories = SUDOKU_STORE_CATEGORIES
const activeCategory = ref(categories[0].id)
const selectedItemId = ref('')
const filteredItems = computed(() => store.state.catalog.filter(item => item.category === activeCategory.value && item.active !== false))
const selectedItem = computed(() => filteredItems.value.find(item => item.id === selectedItemId.value) || filteredItems.value[0] || null)
const selectedAction = computed(() => selectedItem.value ? buttonState(selectedItem.value) : { label: 'Unavailable', disabled: true })

watch(activeCategory, () => {
  selectedItemId.value = filteredItems.value[0]?.id || ''
})

watch(
  () => store.state.open,
  open => {
    if (open) selectedItemId.value = filteredItems.value[0]?.id || ''
    else selectedItemId.value = ''
  }
)

watch(filteredItems, items => {
  if (!items.some(item => item.id === selectedItemId.value)) selectedItemId.value = items[0]?.id || ''
})

function close() {
  store.close()
}

function categoryLabel(categoryId) {
  return getCategoryLabel(categoryId)
}

function previewStyle(item) {
  if (item.preview === 'image') {
    const url = BACKGROUND_ASSETS[item.assetKey || item.id]
    return url ? { backgroundImage: `url("${url}")` } : {}
  }

  if (typeof item.preview === 'string' && item.preview.startsWith('#')) {
    return { background: `linear-gradient(145deg, ${item.preview}, color-mix(in srgb, ${item.preview} 55%, #2b2630))` }
  }

  return {}
}

function previewText(item) {
  if (item.category === 'numbers') return item.preview || '123'
  if (item.category === 'completion') return '✦'
  if (item.category === 'controls') return '▣'
  if (item.category === 'petals') return '❀'
  return item.name.slice(0, 1)
}

function buttonState(item) {
  const loading = store.state.actionItemId === item.id

  if (loading) return { label: 'Working…', disabled: true }
  if (store.isEquipped(item.id)) return { label: 'Equipped', disabled: true }
  if (store.isOwned(item.id)) return { label: 'Equip', disabled: false }
  if (!account.isAuthenticated.value) return { label: 'Sign In to Buy', disabled: false }
  if (economy.balance.value < item.price) return { label: `Need ${item.price - economy.balance.value} Q`, disabled: true }
  return { label: `Buy · ${item.price} Q`, disabled: false }
}

async function handleItemAction(item) {
  if (!account.isAuthenticated.value && !store.isOwned(item.id)) {
    store.close()
    await nextTick()
    account.openModal()
    return
  }

  if (store.isOwned(item.id)) {
    await store.equip(item.id)
    return
  }

  if (await store.purchase(item.id)) await store.equip(item.id)
}
</script>

<style scoped>
.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.store-header__title {
  margin: 0.12rem 0 0.22rem;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.6rem);
}

.store-wallet {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.68rem;
  border: 1px solid rgba(197, 146, 54, 0.32);
  border-radius: var(--radius-medium);
  background: rgba(255, 247, 218, 0.74);
  box-shadow: var(--shadow-soft);
}

.store-wallet span,
.store-wallet strong {
  display: block;
}

.store-wallet span {
  color: #805416;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.store-wallet strong {
  color: #5c3906;
  font-family: var(--font-display);
  font-size: 1.08rem;
}

.store-content {
  display: grid;
  gap: 0.65rem;
  min-block-size: 0;
}

.store-notice {
  margin: 0;
  padding: 0.5rem 0.7rem;
  border-inline-start: 3px solid var(--color-gold);
  background: rgba(255, 244, 218, 0.68);
  color: #714914;
  font-size: 0.72rem;
  font-weight: 750;
}

.category-tabs {
  display: flex;
  gap: 0.32rem;
  overflow-x: auto;
  padding-block-end: 0.12rem;
}

.category-tab {
  flex: 0 0 auto;
  min-block-size: 2.2rem;
  padding: 0.38rem 0.7rem;
  border: 1px solid rgba(75, 59, 67, 0.16);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.66);
  color: var(--color-ink-muted);
  font-size: 0.7rem;
  font-weight: 850;
  cursor: pointer;
}

.category-tab--active {
  border-color: var(--color-sakura-500);
  background: linear-gradient(145deg, var(--color-sakura-100), var(--color-sakura-300));
  color: #542334;
  box-shadow: 0 0.18rem 0 var(--color-sakura-700);
}

.category-tab:focus-visible {
  box-shadow: var(--focus-ring);
}

.store-workspace {
  display: grid;
  grid-template-columns: minmax(18rem, 0.78fr) minmax(0, 1.22fr);
  gap: 0.75rem;
  min-block-size: 0;
}

.store-preview-panel {
  align-self: start;
}

.store-preview-panel :deep(.washi-panel__content) {
  display: grid;
  gap: 0.7rem;
}

.store-preview-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
}

.store-preview-actions__status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.store-catalog {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-content: start;
  gap: 0.5rem;
  min-block-size: 0;
  max-block-size: min(58dvh, 33rem);
  overflow: auto;
  padding: 0.1rem 0.16rem 0.3rem;
}

.store-item {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.45rem;
  min-inline-size: 0;
  padding: 0.55rem;
  border: 1px solid rgba(75, 59, 67, 0.16);
  border-radius: var(--radius-medium);
  background: rgba(255, 253, 248, 0.68);
  color: inherit;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  text-align: start;
  transition: transform var(--motion-fast) ease, border-color var(--motion-fast) ease, box-shadow var(--motion-fast) ease;
}

.store-item:hover,
.store-item--selected {
  border-color: var(--color-sakura-500);
  box-shadow: var(--shadow-panel);
  transform: translateY(-0.08rem);
}

.store-item--selected {
  background: rgba(251, 221, 229, 0.72);
}

.store-item:focus-visible {
  box-shadow: var(--focus-ring);
}

.item-preview {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(37, 33, 36, 0.14);
  border-radius: var(--radius-small);
  background: linear-gradient(145deg, #fff7f9, #e8cbd3);
  background-position: center;
  background-size: cover;
  color: #fff;
  font-size: clamp(1.4rem, 3.5vw, 2.6rem);
  font-weight: 950;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.58);
}

.item-preview--numbers span {
  letter-spacing: 0.08em;
}

.item-copy small {
  color: var(--color-sakura-700);
  font-size: 0.54rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.item-copy h3 {
  margin: 0.12rem 0 0.18rem;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.92rem;
}

.item-copy p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 0.66rem;
  line-height: 1.32;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  color: var(--color-ink-muted);
  font-size: 0.58rem;
  font-weight: 800;
}

.item-price {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #754b0c;
  font-weight: 900;
}

.item-badge {
  padding: 0.2rem 0.4rem;
  border-radius: 999px;
  background: var(--color-sakura-100);
  color: var(--color-sakura-700);
}

.item-badge--equipped {
  background: rgba(222, 241, 231, 0.88);
  color: var(--color-success);
}

.store-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  color: var(--color-ink-muted);
  font-size: 0.7rem;
}

.store-error {
  color: var(--color-danger);
  font-weight: 850;
}

.store-success {
  color: var(--color-success);
  font-weight: 850;
}

@media (max-width: 66rem) {
  .store-catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 48rem) {
  .store-workspace {
    grid-template-columns: 1fr;
  }

  .store-preview-panel :deep(.washi-panel__content) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .store-catalog {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-block-size: 36dvh;
  }
}

@media (max-width: 38rem) {
  .store-header {
    align-items: flex-start;
  }

  .store-header .section-copy {
    display: none;
  }

  .store-catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .store-preview-panel :deep(.washi-panel__content) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 26rem) {
  .store-wallet span {
    display: none;
  }

  .item-copy p {
    display: none;
  }
}

@media (max-height: 42rem) {
  .store-catalog {
    max-block-size: 40dvh;
  }
}
</style>
