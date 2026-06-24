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
        v-if="!showLeaderboard && !showProfile && !showShop && !showInventory && !showMatchHistory && !showAchievements"
        :username="currentUsername" 
        @game-ready="startGameSession" 
        @logout="logout"
        @show-leaderboard="showLeaderboard = true"
        @show-profile="showProfile = true"
        @show-shop="showShop = true"
        @show-inventory="showInventory = true"
        @show-match-history="showMatchHistory = true"
        @show-achievements="showAchievements = true"
      />
      <Shop v-else-if="showShop" @close="showShop = false" @profile-updated="handleProfileUpdate" />
      <Inventory v-else-if="showInventory" @close="showInventory = false" @profile-updated="handleProfileUpdate" />
      <Leaderboard v-else-if="showLeaderboard" @close="showLeaderboard = false" />
      <MatchHistory v-else-if="showMatchHistory" @close="showMatchHistory = false" />
      <Achievements v-else-if="showAchievements" @close="showAchievements = false" @balance-updated="handleAchievementBalanceUpdate" />
      <Profile v-else @close="showProfile = false" @username-changed="(name) => currentUsername = name" />
    </div>

    <GameBoard 
      v-else 
      :gameId="activeGameId"
      :isLobbyWait="isLobbyWait"
      :lobbyId="currentLobbyId"
      @back-to-menu="apiClient.leaveMatchmaking().catch(() => {}); isGameStarted = false; isLobbyWait = false; currentLobbyId = ''; clearGameState()"
    />

    <AchievementToast :achievement="achievementToast" @close="achievementToast = null" />
    <AudioPlayer />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AuthForm from './components/AuthForm.vue'
import Lobby from './components/Lobby.vue' 
import GameBoard from './components/GameBoard.vue' 
import Leaderboard from './components/Leaderboard.vue'
import Profile from './components/Profile.vue'
import Shop from './components/Shop.vue'
import Inventory from './components/Inventory.vue'
import MatchHistory from './components/MatchHistory.vue'
import Achievements from './components/Achievements.vue'
import AchievementToast from './components/AchievementToast.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import { apiClient } from './api/client' // Импортируем исправленный клиент
import Hls from 'hls.js'

// Инициализируем пустой строкой, так как GameBoard ожидает String
const activeGameId = ref('') 
const isStartScreen = ref(true)
const isAuthorized = ref(false)
const isGameStarted = ref(false)
const isLobbyWait = ref(false)
const currentLobbyId = ref('')
const showLeaderboard = ref(false)
const showProfile = ref(false)
const showShop = ref(false)
const showInventory = ref(false)
const showMatchHistory = ref(false)
const showAchievements = ref(false)
const currentUsername = ref('CyberCommander')

const achievementToast = ref(null)
const showAchievementToast = (ach) => {
  achievementToast.value = ach
}
provide('showAchievementToast', showAchievementToast)

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

const handleProfileUpdate = (data) => {
  // Profile was updated (shop/inventory changed); nothing to sync at app level
}

const handleAchievementBalanceUpdate = (newBalance) => {
  // Balance updated after claiming achievement reward
}

const saveGameState = () => {
  try {
    localStorage.setItem('activeGameId', activeGameId.value)
    localStorage.setItem('isGameStarted', isGameStarted.value ? '1' : '')
    localStorage.setItem('isLobbyWait', isLobbyWait.value ? '1' : '')
    localStorage.setItem('currentLobbyId', currentLobbyId.value)
    localStorage.setItem('showShop', showShop.value ? '1' : '')
    localStorage.setItem('showProfile', showProfile.value ? '1' : '')
    localStorage.setItem('showLeaderboard', showLeaderboard.value ? '1' : '')
    localStorage.setItem('showInventory', showInventory.value ? '1' : '')
    localStorage.setItem('showAchievements', showAchievements.value ? '1' : '')
  } catch {}
}

const restoreGameState = () => {
  try {
    const saved = localStorage.getItem('activeGameId')
    if (saved) {
      activeGameId.value = saved
      isGameStarted.value = localStorage.getItem('isGameStarted') === '1'
      isLobbyWait.value = localStorage.getItem('isLobbyWait') === '1'
      currentLobbyId.value = localStorage.getItem('currentLobbyId') || ''
      showShop.value = localStorage.getItem('showShop') === '1'
      showProfile.value = localStorage.getItem('showProfile') === '1'
      showLeaderboard.value = localStorage.getItem('showLeaderboard') === '1'
      showInventory.value = localStorage.getItem('showInventory') === '1'
      showAchievements.value = localStorage.getItem('showAchievements') === '1'
    }
  } catch {}
}

const clearGameState = () => {
  try {
    localStorage.removeItem('activeGameId')
    localStorage.removeItem('isGameStarted')
    localStorage.removeItem('isLobbyWait')
    localStorage.removeItem('currentLobbyId')
    localStorage.removeItem('showShop')
    localStorage.removeItem('showProfile')
    localStorage.removeItem('showLeaderboard')
    localStorage.removeItem('showInventory')
    localStorage.removeItem('showAchievements')
  } catch {}
}

const logout = async () => {
  try {
    await apiClient.logout()
  } catch {}
  localStorage.removeItem('username')
  localStorage.removeItem('user_id')
  isAuthorized.value = false
  isGameStarted.value = false
  isLobbyWait.value = false
  currentLobbyId.value = ''
  showLeaderboard.value = false
  showProfile.value = false
  showShop.value = false
  showInventory.value = false
  showAchievements.value = false
  isStartScreen.value = true
  clearGameState()
}

// Вызывается из Лобби при клике на кнопку «НАЧАТЬ ПОИСК СОПЕРНИКА»
const startGameSession = async (gameId) => {
  try {
    if (gameId && gameId !== 'LOBBY_WAIT') {
      // Check if it's a lobby wait with ID (LOBBY_<uuid>)
      if (typeof gameId === 'string' && gameId.startsWith('LOBBY_')) {
        currentLobbyId.value = gameId.replace('LOBBY_', '')
        activeGameId.value = ''
        isLobbyWait.value = true
        isGameStarted.value = true
        saveGameState()
        return
      }
      activeGameId.value = gameId
      currentLobbyId.value = ''
      isLobbyWait.value = false
      isGameStarted.value = true
      saveGameState()
      return
    }
	activeGameId.value = ''
	currentLobbyId.value = ''
	isLobbyWait.value = gameId === 'LOBBY_WAIT'
	isGameStarted.value = true
	saveGameState()
  } catch (err) {
    console.error(err)
    alert(`Ошибка старта поиска матча: ${err.message || 'Не удалось связаться с сервером'}`)
  }
}

// Инициализация фонового видеопотока HLS
onMounted(async () => {
  await nextTick()

  // Проверяем авторизацию через сервер
  try {
    const authData = await apiClient.checkAuth()
    if (authData && authData.user_id) {
      localStorage.setItem('user_id', authData.user_id)
      if (authData.username) {
        localStorage.setItem('username', authData.username)
      }
      isAuthorized.value = true
    }
  } catch {}

  restoreGameState()

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