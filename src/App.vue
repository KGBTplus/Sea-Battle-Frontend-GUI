<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
    
    <video
      ref="videoRef" 
      autoplay 
      muted 
      playsinline 
      class="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-55"
    />

    <div v-if="!isAuthorized" class="relative z-10 w-full flex flex-col items-center justify-center min-h-[400px]">
      <div 
        v-if="isStartScreen" 
        @click="startApp"
        class="cursor-pointer group select-none flex flex-col items-center justify-center space-y-4 animate-pulse-slow"
      >
        <h1 class="text-7xl font-faero text-center tracking-widest px-4 py-2 text-white [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000] transition-all duration-500 group-hover:scale-105">
          Sea battle
        </h1>
        <p class="font-mono text-xs text-white [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000] opacity-90">
          [ Нажмите на надпись, чтобы начать ]
        </p>
      </div>

      <div v-else class="w-full flex flex-col items-center animate-fade-in">
        <div class="w-full max-w-md bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-6 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
          <h1 class="text-4xl font-faero text-center tracking-wider text-black">Sea battle</h1>
        </div>
        <AuthForm @close="isStartScreen = true" @login-success="handleLoginSuccess" />
      </div>
    </div>

    <div v-else-if="isAuthorized && !isGameStarted" class="relative z-10 w-full max-w-lg p-4 animate-fade-in">
      <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-1 shadow-[2px_2px_10px_rgba(0,0,0,0.5)] text-black">
        
        <div class="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between font-mono font-bold text-sm select-none">
          <div class="flex items-center gap-2">
            <span>⚓</span>
            <span>Minesweeper_Battle_Control.exe</span>
          </div>
          <div class="flex gap-1">
            <button class="w-4 h-4 bg-[#d4d0c8] text-black border border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-[9px] font-bold flex items-center justify-center leading-none">_</button>
            <button class="w-4 h-4 bg-[#d4d0c8] text-black border border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-[10px] font-bold flex items-center justify-center leading-none">🗖</button>
            <button @click="logout" class="w-4 h-4 bg-[#d4d0c8] text-black border border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-[10px] font-bold flex items-center justify-center leading-none ml-1">X</button>
          </div>
        </div>

        <div class="p-6 flex flex-col items-center justify-center gap-6 bg-[#d4d0c8]">
          <div class="text-center select-none py-4 border border-dashed border-gray-500 w-full bg-gray-100/50">
            <h2 class="text-5xl font-faero tracking-widest text-black drop-shadow-[2px_2px_0px_#fff]">
              SEA BATTLE
            </h2>
            <p class="font-mono text-[11px] text-blue-900 mt-2 tracking-wide uppercase font-bold">
              Вход выполнен: {{ currentUsername }}
            </p>
          </div>

          <div class="w-full max-w-xs py-2">
            <button 
              @click="isGameStarted = true"
              class="w-full py-4 text-2xl font-faero text-black bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] shadow-[1px_1px_0_0_#000] hover:bg-[#e6e6e6] transition-colors tracking-widest animate-win-pulse"
            >
              START GAME
            </button>
          </div>

          <div class="w-full flex justify-between font-mono text-[10px] text-gray-600 border-t border-gray-400 pt-3">
            <span>System: Microsoft Windows 95</span>
            <span>v1.0.2026</span>
          </div>
        </div>

      </div>
    </div>

    <GameBoard 
      v-else 
      @back-to-menu="isGameStarted = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AuthForm from './components/AuthForm.vue'
import GameBoard from './components/GameBoard.vue' 
import Hls from 'hls.js'

const isStartScreen = ref(true)
const isAuthorized = ref(false) 
const isGameStarted = ref(false)
const currentUsername = ref('CyberCommander')

const videoRef = ref(null)
let hlsInstance = null

const streamUrl = '/stream/playlist.m3u8'

const startApp = () => {
  isStartScreen.value = false
}

const handleLoginSuccess = () => {
  currentUsername.value = localStorage.getItem('username') || 'CyberCommander'
  isAuthorized.value = true
}

const logout = () => {
  isAuthorized.value = false
  isGameStarted = false
  isStartScreen = true
}

onMounted(async () => {
  await nextTick()
  const video = videoRef.value
  if (!video) return

  if (Hls.isSupported()) {
    hlsInstance = new Hls({ maxMaxBufferLength: 10, enableWorker: true, lowLatencyMode: true })
    hlsInstance.loadSource(streamUrl)
    hlsInstance.attachMedia(video)
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.warn("Видео ждет взаимодействия:", err))
    })

    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        video.currentTime = 0
        video.play().catch(() => {})
      }
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl
    video.loop = true
    video.play().catch(() => {})
  }
})

onBeforeUnmount(() => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
})
</script>

<style scoped>
@keyframes pulseSlow {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
}
.animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }

@keyframes winPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0px rgba(0,0,0,0); }
  50% { transform: scale(1.03); box-shadow: 0 0 8px rgba(0,0,128,0.3); }
}
.animate-win-pulse { animation: winPulse 2s ease-in-out infinite; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
</style>