import { readonly, ref } from 'vue'
import songUrl from '../assets/audio/song.mp3'

const isPlaying = ref(false)
const errorMessage = ref('')
let audio = null

function getAudio() {
  if (audio || typeof Audio === 'undefined') {
    return audio
  }

  audio = new Audio(songUrl)
  audio.loop = true
  audio.preload = 'none'
  audio.volume = 0.45
  audio.addEventListener('play', () => {
    isPlaying.value = true
    errorMessage.value = ''
  })
  audio.addEventListener('pause', () => {
    isPlaying.value = false
  })
  audio.addEventListener('error', () => {
    isPlaying.value = false
    errorMessage.value = 'The background music could not be loaded.'
  })

  return audio
}

async function setPlaying(shouldPlay) {
  const player = getAudio()

  if (!player) {
    return false
  }

  if (!shouldPlay) {
    player.pause()
    return true
  }

  try {
    await player.play()
    return true
  } catch {
    isPlaying.value = false
    errorMessage.value = 'Your browser blocked audio playback. Try the switch again.'
    return false
  }
}

async function togglePlayback() {
  return setPlaying(!isPlaying.value)
}

export function useAudioPlayer() {
  getAudio()

  return {
    isPlaying: readonly(isPlaying),
    errorMessage: readonly(errorMessage),
    setPlaying,
    togglePlayback
  }
}
