<template>
  <audio ref="audioEl" preload="auto"></audio>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudio } from '../composables/useAudio'

const audioEl = ref(null)
const { setAudioElement, volume, play, pause, nextTrack, setPlaylist } = useAudio()

const PLAYLIST = [
  '/audio/bgm1.mp3',
  '/audio/bgm2.mp3',
  '/audio/bgm3.mp3',
]

const handleVisibilityChange = () => {
  if (document.hidden) {
    pause()
  } else {
    play()
  }
}

onMounted(() => {
  if (!audioEl.value) return

  setAudioElement(audioEl.value)
  audioEl.value.volume = volume.value

  audioEl.value.addEventListener('ended', nextTrack)

  setPlaylist(PLAYLIST)

  document.addEventListener('visibilitychange', handleVisibilityChange)

  const tryPlay = () => {
    play()
    document.removeEventListener('click', tryPlay)
    document.removeEventListener('keydown', tryPlay)
  }
  document.addEventListener('click', tryPlay)
  document.addEventListener('keydown', tryPlay)
})

onUnmounted(() => {
  if (audioEl.value) {
    audioEl.value.removeEventListener('ended', nextTrack)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
