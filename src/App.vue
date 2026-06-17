<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
    
    <video
      ref="videoRef" 
      autoplay 
      muted 
      playsinline 
      loop
      preload="auto"
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

    <div v-else-if="isAuthorized && !isGameStarted" class="relative z-10 w-full max-w-xl p-4 animate-fade-in">
      <Lobby 
        :username="currentUsername" 
        @game-ready="startGameSession" 
        @logout="logout"
      />
    </div>

    <GameBoard 
      v-else 
      :gameId="activeGameId"
      @back-to-menu="isGameStarted = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AuthForm from './components/AuthForm.vue'
import Lobby from './components/Lobby.vue' 
import GameBoard from './components/GameBoard.vue' 
import { apiClient } from './api/client' // Импортируем исправленный клиент
import Hls from 'hls.js'

// Инициализируем пустой строкой, так как GameBoard ожидает String
const activeGameId = ref('') 
const isStartScreen = ref(true)
const isAuthorized = ref(!!localStorage.getItem('token')) // ИСПРАВЛЕНО: Проверка по ключу 'token'
const isGameStarted = ref(false)
const currentUsername = ref(localStorage.getItem('username') || 'CyberCommander')

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
  localStorage.removeItem('token') // ИСПРАВЛЕНО: Удаляем 'token' вместо 'auth_token'
  localStorage.removeItem('username')
  isAuthorized.value = false
  isGameStarted.value = false
  isStartScreen.value = true
}

// Вызывается из Лобби при клике на кнопку «НАЧАТЬ ПОИСК СОПЕРНИКА»
const startGameSession = async () => {
  try {
    activeGameId.value = '' // Сбрасываем старый ID перед началом новой сессии
    
    // ИСПРАВЛЕНО: Делаем запрос на быстрый поиск матча через apiClient (POST /api/matchmaking/quick)
    await apiClient.startMatchmaking()
    
    isGameStarted.value = true
    console.log("🚀 Поиск запущен на бэкенде. Переходим в GameBoard для подсоединения к веб-сокету.")
  } catch (err) {
    console.error(err)
    alert(`Ошибка старта поиска матча: ${err.message || 'Не удалось связаться с сервером'}`)
  }
}

// Инициализация фонового видеопотока HLS
onMounted(async () => {
  await nextTick()
  const video = videoRef.value
  if (!video) return

  video.muted = true

  if (Hls.isSupported()) {
    hlsInstance = new Hls({ 
      maxMaxBufferLength: 10, 
      enableWorker: true, 
      lowLatencyMode: true,
      autoStartLoad: true,
      manifestLoadingMaxRetry: 3,
      manifestLoadingRetryDelay: 2000,
      levelLoadingMaxRetry: 3,
      levelLoadingRetryDelay: 2000,
      
      xhrSetup: function (xhr, url) {
        const token = localStorage.getItem('token') // ИСПРАВЛЕНО: Читаем 'token' вместо 'auth_token'
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
      }
    })

    hlsInstance.loadSource(streamUrl)
    hlsInstance.attachMedia(video)

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      const playVideo = () => {
        video.play().catch(err => {
          console.warn("Браузер заблокировал автоплей, пробуем снова...", err)
          setTimeout(playVideo, 1000)
        })
      }
      playVideo()
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
</style>