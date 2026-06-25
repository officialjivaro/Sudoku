import defaultBackground from '../assets/images/background.webp'
import inkMountain from '../assets/images/store/backgrounds/ink-mountain.svg'
import jadeMist from '../assets/images/store/backgrounds/jade-mist.svg'
import koiSunset from '../assets/images/store/backgrounds/koi-sunset.svg'
import lanternNight from '../assets/images/store/backgrounds/lantern-night.svg'
import moonGarden from '../assets/images/store/backgrounds/moon-garden.svg'

export {
  DEFAULT_EQUIPPED_ITEMS,
  getCategoryLabel,
  getStoreItem,
  SUDOKU_STORE_CATEGORIES,
  SUDOKU_STORE_ITEMS
} from './sudokuStoreData.js'

export const BACKGROUND_ASSETS = Object.freeze({
  'sakura-sanctuary': defaultBackground,
  'moon-garden': moonGarden,
  'koi-sunset': koiSunset,
  'ink-mountain': inkMountain,
  'lantern-night': lanternNight,
  'jade-mist': jadeMist
})
