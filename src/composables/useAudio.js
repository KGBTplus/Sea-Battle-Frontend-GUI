import { ref, shallowRef } from 'vue'

const STORAGE_KEY = 'battleship_music_volume'
const DEFAULT_VOLUME = 0.5

const audioEl = shallowRef(null)
const volume = ref(loadVolume())
const isPlaying = ref(false)
const currentTrackIndex = ref(-1)
const playlist = ref([])

function loadVolume() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const v = parseFloat(saved)
      if (!isNaN(v) && v >= 0 && v <= 1) return v
    }
  } catch {}
  return DEFAULT_VOLUME
}

function persistVolume(v) {
  try {
    localStorage.setItem(STORAGE_KEY, String(v))
  } catch {}
}

export function useAudio() {
  function setAudioElement(el) {
    audioEl.value = el
    if (el) {
      el.volume = volume.value
    }
  }

  function setVolume(v) {
    volume.value = v
    persistVolume(v)
    if (audioEl.value) {
      audioEl.value.volume = v
    }
  }

  function setPlaylist(tracks) {
    playlist.value = tracks
    if (tracks.length > 0 && currentTrackIndex.value < 0) {
      playTrack(0)
    }
  }

  function playTrack(index) {
    if (!audioEl.value || playlist.value.length === 0) return
    const i = ((index % playlist.value.length) + playlist.value.length) % playlist.value.length
    currentTrackIndex.value = i
    audioEl.value.src = playlist.value[i]
    audioEl.value.load()
    play()
  }

  function nextTrack() {
    if (playlist.value.length === 0) return
    playTrack(currentTrackIndex.value + 1)
  }

  function prevTrack() {
    if (playlist.value.length === 0) return
    playTrack(currentTrackIndex.value - 1)
  }

  async function play() {
    if (!audioEl.value) return
    try {
      await audioEl.value.play()
      isPlaying.value = true
    } catch {
      isPlaying.value = false
    }
  }

  function pause() {
    if (!audioEl.value) return
    audioEl.value.pause()
    isPlaying.value = false
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  return {
    volume,
    isPlaying,
    currentTrackIndex,
    playlist,
    setAudioElement,
    setVolume,
    setPlaylist,
    playTrack,
    nextTrack,
    prevTrack,
    play,
    pause,
    togglePlay,
  }
}
