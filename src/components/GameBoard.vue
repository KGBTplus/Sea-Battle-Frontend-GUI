<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-y-auto bg-black font-faero py-8 select-none">
    
    <img :src="sceneryUrl" class="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-40" />

    <div v-if="isFish1Active" class="absolute fish fish-1-container" :style="{ top: fish1Top + '%' }" @animationend="resetFish1">
      <img :src="fish1Url" alt="Fish 1" class="w-[100px] md:w-[130px] h-auto fish-wiggle drop-shadow-[4px_10px_5px_rgba(0,0,0,0.5)]" />
    </div>
    <div v-if="isFish2Active" class="absolute fish fish-2-container" :style="{ top: fish2Top + '%' }" @animationend="resetFish2">
      <img :src="fish2Url" alt="Fish 2" class="w-[100px] md:w-[130px] h-auto fish-wiggle drop-shadow-[-4px_10px_5px_rgba(0,0,0,0.5)]" />
    </div>

    <div class="relative z-10 w-full max-w-7xl p-4 flex flex-col items-center justify-center animate-fade-in gap-6">
      
      <div class="w-full max-w-4xl bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 text-center shadow-md">
        <h3 class="text-lg font-bold font-mono tracking-wide" :class="getStatusColorClass">
          {{ getStatusMessage }}
        </h3>
        <div v-if="placementSecondsLeft !== null && (gameState === 'placement' || gameState === 'waiting')" class="mt-2 font-mono text-sm font-bold"
             :class="placementSecondsLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-amber-700'">
          ⏱ РАССТАНОВКА: {{ formatTime(placementSecondsLeft) }}
        </div>

        <div v-else-if="turnSecondsLeft !== null && (gameState === 'player-turn' || gameState === 'enemy-turn')" class="mt-2 flex justify-center gap-6 text-sm font-mono font-bold">
          <span :class="myPlayerID === currentTurnId ? 'text-green-700' : 'text-gray-500'">
            🎯 ВАШ ХОД: {{ myPlayerID === currentTurnId ? formatTime(turnSecondsLeft) : '—' }}
          </span>
          <span :class="myPlayerID !== currentTurnId ? 'text-red-700' : 'text-gray-500'">
            🛡️ СОПЕРНИК: {{ myPlayerID !== currentTurnId ? formatTime(turnSecondsLeft) : '—' }}
          </span>
        </div>
      </div>

      <div v-if="gameState === 'finished'" class="w-full max-w-4xl flex flex-col items-center gap-3">
        <div class="w-full bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-center shadow-md">
          <h2 class="text-2xl font-faero mb-2" :class="resultColorClass">{{ resultMessage }}</h2>
          <p class="text-sm font-mono mb-3" :class="rewardColorClass">{{ rewardMessage }}</p>
          <div class="flex flex-col items-center gap-2">
            <button @click="toggleRevanch"
              class="px-6 py-3 text-lg font-faero text-black bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] shadow-md hover:bg-gray-100 tracking-widest transition-all"
              :class="{ 'btn--dimmed': isRevanchReady }">
              {{ isRevanchReady ? '✔ ГОТОВ К РЕВАНШУ' : '⚔ ИГРАТЬ СНОВА' }}
            </button>
            <p v-if="revanchOpponentReady" class="text-xs font-mono text-green-700">Соперник готов к реваншу!</p>
            <button @click="forceLeaveToLobby"
              class="px-6 py-2 text-sm font-faero text-red-700 bg-gray-200 border border-red-400 hover:bg-red-100 active:bg-red-200 tracking-wider transition-colors">
              🚪 ВЕРНУТЬСЯ В ЛОББИ
            </button>
          </div>
          <p class="font-mono text-xs text-gray-500 mt-2">возвращение в лобби через {{ countdown }} сек...</p>
        </div>
      </div>

      <div class="w-full max-w-4xl min-h-[3rem] flex items-stretch">
        <div v-if="notificationMessage" class="w-full bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 text-center shadow-md font-mono text-xs font-bold uppercase tracking-wider animate-scale-pop"
              :class="notificationType === 'error' ? 'text-red-700 border-red-500 bg-red-50' : 'text-green-700 border-green-500 bg-green-50'">
          {{ notificationMessage }}
        </div>
      </div>

      <div class="flex flex-col xl:flex-row gap-8 w-full justify-center items-stretch">
        
        <div class="w-full xl:w-[340px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black flex flex-col shadow-sm">
          <template v-if="myStats && (gameState === 'player-turn' || gameState === 'enemy-turn' || gameState === 'waiting' || gameState === 'finished')">
            <h2 class="text-lg mb-2 text-center border-b-2 border-gray-400 pb-1 tracking-wide"
              style="font-family: Tahoma, 'MS Sans Serif', Verdana, sans-serif;">📊 {{ myUsername }}</h2>
            <div class="text-[10px] font-mono space-y-1 bg-gray-200 p-2 border border-gray-400 flex-grow">
              <div class="flex justify-between"><span>Игр:</span><span class="font-bold">{{ myStats.total_games }}</span></div>
              <div class="flex justify-between"><span>% побед:</span><span class="font-bold">{{ (myStats.win_percentage || 0).toFixed(1) }}%</span></div>
              <div class="flex justify-between"><span>% попаданий:</span><span class="font-bold">{{ (myStats.hit_percentage || 0).toFixed(1) }}%</span></div>
              <div class="border-t border-gray-400 my-1"></div>
              <div class="font-bold text-xs mb-1">Кораблей осталось:</div>
              <div class="flex justify-between"><span>4-палубный:</span><span class="font-bold">{{ myShipsAlive[4] || 0 }}</span></div>
              <div class="flex justify-between"><span>3-палубных:</span><span class="font-bold">{{ myShipsAlive[3] || 0 }}</span></div>
              <div class="flex justify-between"><span>2-палубных:</span><span class="font-bold">{{ myShipsAlive[2] || 0 }}</span></div>
              <div class="flex justify-between"><span>1-палубных:</span><span class="font-bold">{{ myShipsAlive[1] || 0 }}</span></div>
            </div>
          </template>
          <template v-else>
            <h2 class="text-xl font-faero mb-3 text-center border-b-2 border-gray-400 pb-2 tracking-wide">SHIP DOCK</h2>
            
             <div class="text-[10px] font-mono mb-3 text-center text-gray-600 bg-gray-200 p-2 border border-gray-400">
              <template v-if="isReady">
                <p class="font-bold text-green-800">✔ Флот зафиксирован</p>
                <p class="text-xs mt-1">Ожидаем готовности оппонента.</p>
              </template>
              <template v-else-if="gameState === 'placement'">
                <p class="font-bold text-blue-800">⚓ Расстановка:</p>
                <p>Тащите корабль из дока на поле, либо тащите с поля на новое место!</p>
                <p class="font-bold text-emerald-800 mt-1">🔄 Поворот:</p>
                <p>Кликните по кораблю в доке или на поле.</p>
                <button @click="randomizeFleet"
                  class="mt-2 w-full py-1.5 text-xs font-faero text-black bg-gray-400 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] hover:bg-gray-300 transition-colors tracking-wider"
                >
                  🎲 СЛУЧАЙНАЯ РАССТАНОВКА
                </button>
              </template>
              <template v-else>
                <p class="text-red-700 font-bold">ИГРА АКТИВНА</p>
                <p class="text-xs mt-1">Следите за индикатором хода сверху.</p>
              </template>
            </div>
            
            <div class="flex flex-wrap gap-3 justify-center items-center overflow-y-auto flex-grow max-h-[450px] p-3 bg-gray-300/50 border border-inset border-gray-400">
              <template v-if="!isReady" v-for="ship in availableShips" :key="ship.id">
                <div 
                  v-if="!ship.placed"
                  :draggable="gameState === 'placement' && !isReady"
                  @dragstart="handleDragStart($event, ship, 'dock')"
                  @dragend="handleDragEnd"
                  @click="toggleDockShipDirection(ship)"
                  @contextmenu.prevent="toggleDockShipDirection(ship)"
                  class="border border-transparent bg-gray-600/20 relative overflow-hidden flex items-center justify-center transition-transform"
                  :class="gameState === 'placement' ? 'cursor-grab active:cursor-grabbing hover:brightness-110 hover:border-blue-500' : 'opacity-40'"
                  :style="getDockShipBoxStyle(ship)"
                >
                  <img :src="getShipImage(ship.size, ship.direction)" class="pointer-events-none w-full h-full object-fill" />
                </div>
              </template>
            </div>
          </template>
        </div>

        <div class="w-full max-w-[500px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-6 text-black shadow-md">
          <h2 class="text-2xl font-faero mb-4 text-center border-b-2 border-gray-400 pb-2 tracking-wide">YOUR FLEET</h2>
          
          <div class="w-full aspect-square border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] p-2 relative overflow-hidden defense-grid"
               :style="{ backgroundImage: `url(${water1Url})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            
            <div 
              v-for="ship in placedShips" 
              :key="'placed-'+ship.id"
              :draggable="gameState === 'placement' && !isReady"
              @dragstart="handleDragStart($event, ship, 'board')"
              @dragend="handleDragEnd"
              @click="handlePlacedShipClick(ship)"
              @contextmenu.prevent="handlePlacedShipClick(ship)"
              @dblclick="removeShipFromBoard(ship)"
               class="absolute border border-white/40 shadow-md overflow-hidden bg-blue-950/20 transition-all duration-75"
              :class="[
                gameState === 'placement' && !isReady ? 'z-20 cursor-grab active:cursor-grabbing hover:brightness-125 hover:scale-[1.02] pointer-events-auto' : 'z-20 cursor-default pointer-events-none',
                { 'pointer-events-none': isDragging }
              ]"
              :style="getPlacedShipStyle(ship)"
            >
              <img :src="getShipImage(ship.size, ship.direction)" loading="eager" draggable="false" class="pointer-events-none w-full h-full object-fill absolute inset-0 select-none" />
            </div>

            <div 
              v-for="ship in gamePlayerShips" 
              :key="'game-'+ship.id"
              class="absolute z-15 overflow-hidden bg-blue-950/20 pointer-events-none"
              :style="getGameShipStyle(ship)"
            >
              <img :src="getShipImage(ship.size, ship.direction)" loading="eager" draggable="false" class="pointer-events-none w-full h-full object-fill absolute inset-0 select-none" />
            </div>

            <div class="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 text-center items-center text-sm font-bold text-white bg-blue-950/20"
                 :class="gameState === 'placement' ? 'pointer-events-auto' : 'pointer-events-none'">
              <div></div>
              <div v-for="letter in letters" :key="letter">{{ letter }}</div>
              
              <template v-for="rowIdx in 10" :key="rowIdx">
                <div class="text-center text-[11px] leading-none font-bold font-mono text-white bg-[#0b2b5e] w-5 h-full flex items-center justify-center border-r border-blue-800">{{ rowIdx }}</div>
                <div 
                  v-for="colIdx in 10" 
                  :key="colIdx"
                  class="w-full h-full aspect-square border border-white/10 relative flex items-center justify-center"
                  :class="{ 
                    'bg-green-500/40': gameState === 'placement' && isCellHovered(rowIdx - 1, colIdx - 1), 
                    'bg-red-500/50': gameState === 'placement' && isCellHoverInvalid(rowIdx - 1, colIdx - 1) 
                  }"
                  @dragover.prevent="handleDragOver(rowIdx - 1, colIdx - 1)"
                  @drop="handleDrop(rowIdx - 1, colIdx - 1)"
                >
                  <span v-if="playerDefenseGrid[rowIdx - 1][colIdx - 1] === 'hit'" class="text-base z-30 filter drop-shadow animate-scale-pop">💥</span>
                  <span v-if="playerDefenseGrid[rowIdx - 1][colIdx - 1] === 'miss'" class="text-xs z-30 text-cyan-300 font-mono">⭕</span>
                  <span v-if="playerDefenseGrid[rowIdx - 1][colIdx - 1] === 'destroyed'" class="text-base z-50 animate-scale-pop">💀</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="w-full max-w-[500px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-6 text-black shadow-md">
          <h2 class="text-2xl font-faero mb-4 text-center border-b-2 border-gray-400 pb-2 tracking-wide">
            ENEMY FLEET
          </h2>
          
          <div class="w-full aspect-square border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] p-2 relative"
               :style="{ backgroundImage: `url(${water2Url})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            
            <div class="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 text-center items-center text-sm font-bold text-white bg-slate-950/25">
              <div></div>
              <div v-for="letter in letters" :key="letter">{{ letter }}</div>
              
              <template v-for="rowIdx in 10" :key="rowIdx">
                <div class="text-center text-[11px] leading-none font-bold font-mono text-white bg-[#0b2b5e] w-5 h-full flex items-center justify-center border-r border-blue-800">{{ rowIdx }}</div>
                <div 
                  v-for="colIdx in 10" 
                  :key="colIdx"
                  class="w-full h-full aspect-square border border-white/10 bg-lime-500/5 hover:bg-lime-400/30 transition-colors duration-100 relative flex items-center justify-center overflow-hidden"
                  :class="canUserShoot ? 'cursor-crosshair' : 'cursor-not-allowed opacity-80'"
                  @click="handleEnemyCellShot(rowIdx - 1, colIdx - 1)"
                >
                  <div v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].animating" class="absolute inset-0 z-30 shot-laser-target"></div>
                  <div v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].exploding" class="absolute inset-0 z-40 explosion-flash"></div>
                  
                  <span v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].status === 'hit'" class="text-base z-30 filter drop-shadow animate-scale-pop">💥</span>
                  <span v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].status === 'miss'" class="text-xs z-30 text-cyan-300 font-mono animate-fade-in">⭕</span>
                  <span v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].status === 'destroyed'" class="text-base z-50 animate-scale-pop">💀</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-if="opponentStats && (gameState === 'player-turn' || gameState === 'enemy-turn' || gameState === 'waiting' || gameState === 'finished')" class="w-full xl:w-[240px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black flex flex-col shadow-sm">
          <h2 class="text-lg mb-2 text-center border-b-2 border-gray-400 pb-1 tracking-wide"
              style="font-family: Tahoma, 'MS Sans Serif', Verdana, sans-serif;">📊 {{ opponentName || 'Соперник' }}</h2>
          <div class="text-[10px] font-mono space-y-1 bg-gray-200 p-2 border border-gray-400 flex-grow">
            <div class="flex justify-between"><span>Игр:</span><span class="font-bold">{{ opponentStats.total_games }}</span></div>
            <div class="flex justify-between"><span>% побед:</span><span class="font-bold">{{ (opponentStats.win_percentage || 0).toFixed(1) }}%</span></div>
            <div class="flex justify-between"><span>% попаданий:</span><span class="font-bold">{{ (opponentStats.hit_percentage || 0).toFixed(1) }}%</span></div>
            <div class="border-t border-gray-400 my-1"></div>
            <div class="font-bold text-xs mb-1">Кораблей осталось:</div>
            <div class="flex justify-between"><span>4-палубный:</span><span class="font-bold">{{ opponentShipsAlive[4] || 0 }}</span></div>
            <div class="flex justify-between"><span>3-палубных:</span><span class="font-bold">{{ opponentShipsAlive[3] || 0 }}</span></div>
            <div class="flex justify-between"><span>2-палубных:</span><span class="font-bold">{{ opponentShipsAlive[2] || 0 }}</span></div>
            <div class="flex justify-between"><span>1-палубных:</span><span class="font-bold">{{ opponentShipsAlive[1] || 0 }}</span></div>
          </div>
          <button v-if="gameState === 'player-turn' || gameState === 'enemy-turn' || gameState === 'waiting'"
            @click="forfeitGame"
            class="mt-2 w-full py-1 text-xs font-faero text-red-700 bg-red-100 border border-red-300 hover:bg-red-200 transition-colors tracking-wider"
          >
            Сдаться
          </button>
        </div>

      </div>

      <div v-if="allShipsPlaced && gameState === 'placement'" class="w-full max-w-xs z-30 mt-4 flex flex-col items-center gap-3">
        <button 
          @click="toggleReady"
          :disabled="isSending"
          class="w-full py-4 text-xl font-faero text-black bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] shadow-md hover:bg-gray-100 tracking-widest disabled:opacity-50 disabled:cursor-wait"
          :class="{ 'btn--dimmed': isReady }"
        >
          {{ isReady ? '✔ ГОТОВ' : '⚓ ГОТОВ' }}
        </button>
      </div>

      <div v-if="gameState === 'placement' || gameState === 'waiting' || gameState === 'searching'" class="w-full max-w-xs mt-2">
        <button @click="leaveLobby"
          class="w-full py-2 text-sm font-faero text-red-700 bg-gray-200 border border-red-400 hover:bg-red-100 active:bg-red-200 tracking-wider transition-colors"
        >
          🚪 ПОКИНУТЬ ИГРУ
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { apiClient } from '../api/client' // ИСПРАВЛЕНО: Импортируем наш обновленный клиент

// Импорт графических ассетов
import sceneryUrl from '../assets/images/scenery.jpeg'
import fish1Url from '../assets/images/fish1.png'
import fish2Url from '../assets/images/fish2.png'
import water1Url from '../assets/images/water1.gif'
import water2Url from '../assets/images/water2.gif'

import ship1hor from '../assets/images/ship1hor.jpeg'
import ship1vert from '../assets/images/ship1vert.jpeg'
import ship2hor from '../assets/images/ship2hor.jpeg'
import ship2vert from '../assets/images/ship2vert.jpeg'
import ship3hor from '../assets/images/ship3hor.jpeg'
import ship3vert from '../assets/images/ship3vert.jpeg'
import ship4hor from '../assets/images/ship4hor.jpeg'
import ship4vert from '../assets/images/ship4vert.jpeg'

const props = defineProps({
  gameId: { type: String, default: '' },
  isLobbyWait: { type: Boolean, default: false },
  lobbyId: { type: String, default: '' }
})
const emit = defineEmits(['back-to-menu'])

const playAgainTimeout = ref(null)
const countdown = ref(20)
let countdownInterval = null

const startCountdown = () => {
  countdown.value = 20
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      countdownInterval = null
      goBackToMenu()
    }
  }, 1000)
}

const handleGlobalKeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === 'Enter' && gameState.value === 'placement' && allShipsPlaced.value) {
    e.preventDefault()
    toggleReady()
  }
}

const goBackToMenu = () => {
  isLeaving.value = true
  if (playAgainTimeout.value) {
    clearTimeout(playAgainTimeout.value)
    playAgainTimeout.value = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  countdown.value = 20
  placementSecondsLeft.value = null
  turnSecondsLeft.value = null
  isRevanchReady.value = false
  revanchOpponentReady.value = false
  gameReward.value = null
  clearGrids()
  clearShipsPlacement()
  emit('back-to-menu')
}

const toggleRevanch = () => {
  isRevanchReady.value = !isRevanchReady.value
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ type: 'toggle_revanch' }))
  }
}

const forceLeaveToLobby = () => {
  isLeaving.value = true
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ type: 'force_leave_to_lobby' }))
  }
  goBackToMenu()
}

// Локальная копия ID игры, так как props изменять напрямую нельзя
const localGameId = ref(props.gameId || '')

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

const opponentName = ref('')
const myUsername = ref(localStorage.getItem('username') || '')

const notificationMessage = ref('')
const notificationType = ref('success')

const triggerNotification = (msg, type = 'success', timeout = 5000) => {
  notificationMessage.value = msg
  notificationType.value = type
  if (timeout) {
    setTimeout(() => {
      if (notificationMessage.value === msg) {
        notificationMessage.value = ''
      }
    }, timeout)
  }
}

const fish1Top = ref(20)
const fish2Top = ref(70)
const isFish1Active = ref(true)
const isFish2Active = ref(true)
const activeFish = ref([])

// Статусы для матчмейкинга: 'searching', 'placement', 'waiting', 'player-turn', 'enemy-turn', 'finished'
const gameState = ref('searching') 
const currentTurnPlayerID = ref(null) 
const myPlayerID = ref(null) 

const socket = ref(null)
let pingInterval = null // Переменная для таймера Heartbeat

const isReady = ref(false)
const isSending = ref(false)

const placementSecondsLeft = ref(null)
const turnSecondsLeft = ref(null)
const currentTurnId = ref(null)

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SHIPS_STORAGE_KEY = 'placed_ships'

const saveShipsPlacement = () => {
  try {
    const data = availableShips.value.map(s => ({
      id: s.id, size: s.size, placed: s.placed,
      row: s.row, col: s.col, direction: s.direction
    }))
    localStorage.setItem(SHIPS_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save ship placement:', e)
  }
}

const loadShipsPlacement = () => {
  try {
    const raw = localStorage.getItem(SHIPS_STORAGE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    data.forEach(saved => {
      const ship = availableShips.value.find(s => s.id === saved.id)
      if (ship) {
        ship.placed = saved.placed
        ship.row = saved.row
        ship.col = saved.col
        ship.direction = saved.direction
      }
    })
    return true
  } catch { return false }
}

const clearShipsPlacement = () => {
  try {
    localStorage.removeItem(SHIPS_STORAGE_KEY)
  } catch {}
}

// Инициализация сетки атак (правой)
const enemyAttackGrid = ref(
  Array.from({ length: 10 }, () => 
    Array.from({ length: 10 }, () => ({ status: 'none', animating: false, exploding: false }))
  )
)

// Инициализация сетки обороны (левой)
const playerDefenseGrid = ref(
  Array.from({ length: 10 }, () => 
    Array.from({ length: 10 }, () => 'none')
  )
)

const availableShips = ref([
  { id: 1, size: 4, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 2, size: 3, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 3, size: 3, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 4, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 5, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 6, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 7, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 8, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 9, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
  { id: 10, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
])

const myStats = ref(null)
const opponentStats = ref(null)

const draggedShip = ref(null)
const dragSource = ref('dock') 
const originalRow = ref(null)
const originalCol = ref(null)

const activeHoverCells = ref([])
const isHoverInvalid = ref(false)
const isDragging = ref(false)
const isLeaving = ref(false)
const processedMovesCount = ref(0)
const lastGameData = ref(null)

// Revanch / game-over state
const isRevanchReady = ref(false)
const revanchOpponentReady = ref(false)
const gameResult = ref('')
const gameReward = ref(null)
const perfectWin = ref(false)
const playerHits = ref(0)

const placedShips = computed(() => availableShips.value.filter(s => s.placed))
const allShipsPlaced = computed(() => availableShips.value.every(s => s.placed))

const computeShipsAlive = (ships, filterPlayerID) => {
  if (!ships) return {}
  const alive = {}
  for (const ship of ships) {
    if (ship.player_id !== filterPlayerID) continue
    if (!ship.sunk) {
      alive[ship.ship_type] = (alive[ship.ship_type] || 0) + 1
    }
  }
  return alive
}

const myShipsAlive = computed(() => {
  if (!lastGameData.value || !myPlayerID.value) return {}
  return computeShipsAlive(lastGameData.value.ships, myPlayerID.value)
})

const opponentShipsAlive = computed(() => {
  if (!lastGameData.value || !myPlayerID.value) return {}
  const opponentID = lastGameData.value.player1_id === myPlayerID.value
    ? lastGameData.value.player2_id
    : lastGameData.value.player1_id
  if (!opponentID) return {}
  return computeShipsAlive(lastGameData.value.ships, opponentID)
})

const gamePlayerShips = computed(() => {
  if (!lastGameData.value || !myPlayerID.value) return []
  if (gameState.value === 'placement' || gameState.value === 'searching' || gameState.value === 'finished') return []
  const ships = lastGameData.value.ships || []
  return ships
    .filter(s => s.player_id === myPlayerID.value)
    .map(s => ({
      id: s.id,
      size: s.size,
      direction: s.direction,
      row: s.row,
      col: s.col,
      sunk: s.sunk
    }))
})

const canUserShoot = computed(() => {
  return gameState.value === 'player-turn' && currentTurnPlayerID.value === myPlayerID.value
})

const resultMessage = computed(() => {
  if (gameResult.value === 'draw') return '🤝 НИЧЬЯ!'
  if (gameResult.value === 'win') return '🏆 ПОБЕДА!'
  if (gameResult.value === 'lose') return '💥 ПОРАЖЕНИЕ'
  return '🏁 ИГРА ЗАВЕРШЕНА'
})

const resultColorClass = computed(() => {
  if (gameResult.value === 'win') return 'text-win'
  if (gameResult.value === 'draw') return 'text-neutral'
  if (gameResult.value === 'lose') return 'text-loss'
  return 'text-neutral'
})

const rewardMessage = computed(() => {
  if (gameReward.value === null) return ''
  const sign = gameReward.value >= 0 ? '+' : ''
  const bonusText = perfectWin.value ? ' (идеальная победа!)' : ''
  return `${sign}${gameReward.value} монет${bonusText}`
})

const rewardColorClass = computed(() => {
  if (gameReward.value === null || gameReward.value === 0) return 'text-neutral'
  return gameReward.value > 0 ? 'reward-positive' : 'reward-negative'
})

const parseMyIDFromToken = () => {
  const uid = localStorage.getItem('user_id')
  if (uid) {
    myPlayerID.value = uid
  }
}

/**
 * ИНИЦИАЛИЗАЦИЯ WEBSOCKET С УЧЕТОМ НОВОГО МАТЧМЕЙКИНГА И KEEP-ALIVE
 */
const initWebSocket = () => {
  console.log('[WS] Initializing WebSocket, gameState:', gameState.value, 'gameId:', localGameId.value)
  const token = apiClient.getWsToken() || ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws`
  const wsProtocols = token ? ['auth_' + token] : []
  
  console.log("🔗 Подключение к новому WebSocket шлюзу матчмейкинга:", wsUrl)
  socket.value = wsProtocols.length ? new WebSocket(wsUrl, wsProtocols) : new WebSocket(wsUrl)

  socket.value.onopen = () => {
    triggerNotification('📡 Подключение к игровому серверу установлено!', 'success', 3000)
    
    clearInterval(pingInterval)
    pingInterval = setInterval(() => {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  socket.value.onmessage = (event) => {
    try {
      const response = JSON.parse(event.data)
      console.log("📥 Получено WS сообщение:", response)
      
      switch (response.type) {
        case 'matchmaking_searching':
          gameState.value = 'searching'
          triggerNotification(props.isLobbyWait ? '📡 Ожидание второго игрока в лобби...' : '🔍 Поиск свободного соперника в сети...', 'success', null)
          break

        case 'match_found':
          if (response.data) {
            try {
              const innerData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
              if (innerData && innerData.game_id) {
                localGameId.value = innerData.game_id // Сохраняем динамический ID матча
              }
            } catch (parseErr) {
              console.error("Ошибка десериализации MatchFoundData:", parseErr)
            }
          }
          clearShipsPlacement()
          gameState.value = 'placement'
          triggerNotification('⚔️ Соперник найден! Переходим к расстановке флота.', 'success', 4000)
          break

        case 'pong':
          break

        case 'opponent_ready':
          triggerNotification('👥 Соперник подтвердил готовность!', 'success', 3000)
          break

        case 'game_started':
          if (gameState.value !== 'placement' && gameState.value !== 'searching' && gameState.value !== 'waiting') {
            break
          }
          let gsData = response.data
          if (typeof gsData === 'string') {
            try { gsData = JSON.parse(gsData) } catch(e) { gsData = null }
          }
          if (gsData) {
            if (gsData.current_turn) {
              currentTurnPlayerID.value = gsData.current_turn
              gameState.value = (gsData.current_turn === myPlayerID.value) ? 'player-turn' : 'enemy-turn'
            }
            if (gsData.player1_name && gsData.player2_name) {
              opponentName.value = (myPlayerID.value === gsData.player1_id)
                ? gsData.player2_name : gsData.player1_name
            }
          }
          triggerNotification('⚔️ Игра началась!', 'success', 3000)
          break

        case 'your_turn':
          {
            let ytData = response.data
            if (typeof ytData === 'string') { try { ytData = JSON.parse(ytData) } catch(e) { ytData = null } }
            const turnOwner = ytData ? (ytData.current_turn || ytData.CurrentTurn) : null
            if (turnOwner) {
              currentTurnPlayerID.value = turnOwner
              gameState.value = (turnOwner === myPlayerID.value) ? 'player-turn' : 'enemy-turn'
              if (turnOwner === myPlayerID.value) {
                triggerNotification('💥 Ваш ход!', 'success', 3000)
              }
            }
          }
          break

        case 'opponent_moved':
          {
            let md = response.data
            if (typeof md === 'string') { try { md = JSON.parse(md) } catch(e) { md = null } }
            if (md && typeof md.x === 'number' && typeof md.y === 'number') {
              const status = md.hit ? 'hit' : 'miss'
              if (playerDefenseGrid.value[md.y][md.x] !== 'destroyed') {
                playerDefenseGrid.value[md.y][md.x] = status
              }
              if (md.ship_sunk && md.sunk_cells && md.sunk_cells.length) {
                md.sunk_cells.forEach(([x, y]) => {
                  playerDefenseGrid.value[y][x] = 'destroyed'
                })
                for (const [x, y] of md.sunk_cells) {
                  for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                      const nr = y + dr
                      const nc = x + dc
                      if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && playerDefenseGrid.value[nr][nc] === 'none') {
                        playerDefenseGrid.value[nr][nc] = 'miss'
                      }
                    }
                  }
                }
              }
              triggerNotification(
                md.hit ? '💥 Попадание по вашему кораблю!' : '⭕ Промах!',
                md.hit ? 'error' : 'success', 3000
              )
            }
          }
          break

        case 'opponent_ships_placed':
          triggerNotification('👥 Соперник расставляет корабли...', 'success', 3000)
          break

        case 'game_over':
          {
            let gd = response.data
            if (typeof gd === 'string') { try { gd = JSON.parse(gd) } catch(e) { gd = null } }
            if (!gd) break
            const winnerId = gd.winner_id || gd.WinnerID || null
            const result = gd.result || 'win'
            const reward1 = gd.reward1 ?? 0
            const reward2 = gd.reward2 ?? 0
            const hits1 = gd.hits1 ?? 0
            const hits2 = gd.hits2 ?? 0
            const perfect1 = gd.perfect_win1 ?? false
            const perfect2 = gd.perfect_win2 ?? false

            const newBalance1 = gd.new_balance1 ?? null
            const newBalance2 = gd.new_balance2 ?? null

            const isP1 = myPlayerID.value === gd.player1_id
            const myReward = isP1 ? reward1 : reward2
            const myHits = isP1 ? hits1 : hits2
            const myPerfect = isP1 ? perfect1 : perfect2
            const myNewBalance = isP1 ? newBalance1 : newBalance2

            gameReward.value = myReward
            perfectWin.value = myPerfect
            playerHits.value = myHits
            if (myNewBalance !== null) {
              localStorage.setItem('coins', String(myNewBalance))
            }

            if (result === 'draw') {
              gameResult.value = 'draw'
              triggerNotification('🤝 НИЧЬЯ! Оба флота уничтожены!', 'success', null)
            } else if (winnerId === myPlayerID.value) {
              gameResult.value = 'win'
              triggerNotification('🏆 ПОБЕДА! Вражеский флот полностью разгромлен!', 'success', null)
            } else {
              gameResult.value = 'lose'
              triggerNotification('💥 ПОРАЖЕНИЕ. Ваш флот уничтожен.', 'error', null)
            }
            clearShipsPlacement()
            gameState.value = 'finished'
            isRevanchReady.value = false
            revanchOpponentReady.value = false
            startCountdown()
          }
          break

        case 'timer_tick':
          {
            let td = response.data
            if (typeof td === 'string') { try { td = JSON.parse(td) } catch(e) { td = null } }
            if (td) {
              if (td.timer_type === 'placement') {
                placementSecondsLeft.value = td.seconds_left
              } else if (td.timer_type === 'turn') {
                turnSecondsLeft.value = td.seconds_left
                if (td.current_turn) {
                  currentTurnPlayerID.value = td.current_turn
                }
                currentTurnId.value = td.current_turn || null
              } else if (td.timer_type === 'gameover') {
                countdown.value = td.seconds_left
              }
            }
          }
          break

        case 'placement_auto_filled':
          {
            let pd = response.data
            if (typeof pd === 'string') { try { pd = JSON.parse(pd) } catch(e) { pd = null } }
            triggerNotification(pd?.message || '⏰ Время вышло! Корабли расставлены случайно.', 'error', 6000)
            isReady.value = true
          }
          break

        case 'turn_timeout':
          {
            let td = response.data
            if (typeof td === 'string') { try { td = JSON.parse(td) } catch(e) { td = null } }
            triggerNotification(td?.message || '⏰ Время вышло!', 'error', 4000)
            turnSecondsLeft.value = null
          }
          break

        case 'opponent_left':
          {
            if (isLeaving.value) break
            let od = response.data
            if (typeof od === 'string') { try { od = JSON.parse(od) } catch(e) { od = null } }
            triggerNotification(od?.message || '👋 Соперник покинул игру', 'error', 8000)
            clearShipsPlacement()
            placementSecondsLeft.value = null
            turnSecondsLeft.value = null
            setTimeout(() => emit('back-to-menu'), 2000)
          }
          break

        case 'revanch_toggle':
          {
            let rd = response.data
            if (typeof rd === 'string') { try { rd = JSON.parse(rd) } catch(e) { rd = null } }
            if (rd) {
              const isP1 = lastGameData.value?.player1_id === myPlayerID.value
              const opponentReady = isP1 ? rd.player2_ready : rd.player1_ready
              revanchOpponentReady.value = !!opponentReady
            }
          }
          break

        case 'force_leave_to_lobby':
          {
            let fd = response.data
            if (typeof fd === 'string') { try { fd = JSON.parse(fd) } catch(e) { fd = null } }
            triggerNotification(fd?.message || '🚪 Возврат в лобби', 'success', 3000)
            clearShipsPlacement()
            placementSecondsLeft.value = null
            turnSecondsLeft.value = null
            goBackToMenu()
          }
          break

        case 'revanch_game_start':
          {
            let rsd = response.data
            if (typeof rsd === 'string') { try { rsd = JSON.parse(rsd) } catch(e) { rsd = null } }
            if (rsd?.game_id) {
              if (playAgainTimeout.value) {
                clearTimeout(playAgainTimeout.value)
                playAgainTimeout.value = null
              }
              if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null }
              if (socket.value) {
                socket.value.onclose = null
                socket.value.close()
                socket.value = null
              }
              opponentName.value = ''
              currentTurnPlayerID.value = null
              currentTurnId.value = null
              isReady.value = false
              isSending.value = false
              notificationMessage.value = ''
              placementSecondsLeft.value = null
              turnSecondsLeft.value = null
              gameReward.value = null
              gameResult.value = ''
              perfectWin.value = false
              playerHits.value = 0
              lastGameData.value = null
              myStats.value = null
              opponentStats.value = null
              processedMovesCount.value = 0
              countdown.value = 20
              isRevanchReady.value = false
              revanchOpponentReady.value = false
              for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                  playerDefenseGrid.value[r][c] = 'none'
                  enemyAttackGrid.value[r][c] = { status: 'none', animating: false, exploding: false }
                }
              }
              const freshShips = [
                { id: 1, size: 4, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 2, size: 3, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 3, size: 3, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 4, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 5, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 6, size: 2, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 7, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 8, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 9, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
                { id: 10, size: 1, placed: false, row: null, col: null, direction: 'horizontal' },
              ]
              availableShips.value = freshShips
              gameState.value = 'searching'
              localGameId.value = rsd.game_id
              localStorage.removeItem(SHIPS_STORAGE_KEY)
              initWebSocket()
            }
          }
          break

        case 'game_state':
          {
            let gs = response.data
            if (typeof gs === 'string') { try { gs = JSON.parse(gs) } catch(e) { gs = null } }
            if (!gs) break
            lastGameData.value = gs
            const rawStatus = gs.Status || gs.status
            if (gs.player1_name && gs.player2_name) {
              opponentName.value = (myPlayerID.value === gs.player1_id)
                ? gs.player2_name : gs.player1_name
            }
            if (rawStatus === 'placing_ships') {
              updatePlayerStats(gs)
              if (gameState.value === 'searching') {
                gameState.value = 'placement'
                clearShipsPlacement()
                triggerNotification('⚔️ Соперник найден! Переходим к расстановке флота.', 'success', 4000)
              }
            } else if (rawStatus === 'playing') {
              handlePlayingState(gs)
              clearGrids()
              applyMoveHistory(gs, gs.Moves || gs.moves || [])
              applySunkShips(gs)
              applySunkEnemyShips(gs)
              updatePlayerStats(gs)
            } else if (rawStatus === 'finished') {
              handleGameFinished(gs)
            }
          }
          break

        case 'left_lobby':
          clearShipsPlacement()
          placementSecondsLeft.value = null
          turnSecondsLeft.value = null
          break

        case 'error':
          triggerNotification(`❌ Ошибка сервера: ${response.message || 'Неизвестный сбой'}`, 'error', 5000)
          break

        default:
          processServerGameState(response)
          break
      }
    } catch (err) {
      console.error("Сбой чтения или обработки сообщения WS:", err)
    }
  }

  socket.value.onerror = (error) => {
    console.error("WebSocket Error:", error)
    triggerNotification('❌ Критическая ошибка сетевого канала.', 'error', null)
  }

  socket.value.onclose = (e) => {
    clearInterval(pingInterval)
    if (gameState.value !== 'finished' && !isLeaving.value && !props.isLobbyWait) {
      triggerNotification('🚨 Канал прерван сервером. Попробуйте обновить страницу.', 'error', null)
    }
  }
}

const clearGrids = () => {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (playerDefenseGrid.value[r][c] !== 'destroyed') {
        playerDefenseGrid.value[r][c] = 'none'
      }
      if (enemyAttackGrid.value[r][c].status !== 'destroyed') {
        enemyAttackGrid.value[r][c].status = 'none'
      }
    }
  }
}

const markSunkShip = (shipCells, grid, isObjectGrid) => {
  shipCells.forEach(cell => {
    const x = cell.x !== undefined ? cell.x : cell.X
    const y = cell.y !== undefined ? cell.y : cell.Y
    if (y >= 0 && y < 10 && x >= 0 && x < 10) {
      if (isObjectGrid) {
        grid[y][x].status = 'destroyed'
      } else {
        grid[y][x] = 'destroyed'
      }
    }
  })
}

const markSurroundingMisses = (shipCells, grid) => {
  for (const cell of shipCells) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = cell.y + dr
        const nc = cell.x + dc
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
          const val = grid[nr][nc]
          if (val === 'none' || val?.status === 'none') {
            if (typeof val === 'object') {
              grid[nr][nc].status = 'miss'
            } else {
              grid[nr][nc] = 'miss'
            }
          }
        }
      }
    }
  }
}

const applyMoveHistory = (game, incomingMoves) => {
  const movesList = game.Moves || game.moves
  if (!movesList || !Array.isArray(movesList)) return

  movesList.forEach(move => {
    const pId = move.player_id || move.PlayerID
    const mX = move.x !== undefined ? move.x : move.X
    const mY = move.y !== undefined ? move.y : move.Y
    const mHit = move.hit !== undefined ? move.hit : move.Hit
    const isMyMove = pId === myPlayerID.value
    const cellStatus = mHit ? 'hit' : 'miss'
    if (isMyMove) {
      enemyAttackGrid.value[mY][mX].status = cellStatus
    } else {
      playerDefenseGrid.value[mY][mX] = cellStatus
    }
  })
  processedMovesCount.value = incomingMoves.length
}

const applySunkShips = (game) => {
  const shipsList = game.Ships || game.ships
  if (!shipsList || !Array.isArray(shipsList)) return

  shipsList.forEach(ship => {
    const shipCells = ship.cells || ship.Cells || []
    const shipPlayerId = ship.player_id || ship.PlayerID
    const isSunk = ship.sunk || ship.Sunk
    if (!isSunk) return

    if (shipPlayerId === myPlayerID.value) {
      markSunkShip(shipCells, playerDefenseGrid.value, false)
      markSurroundingMisses(shipCells, playerDefenseGrid.value)
    } else {
      markSunkShip(shipCells, enemyAttackGrid.value, true)
      markSurroundingMisses(shipCells, enemyAttackGrid.value)
    }
  })
}

const applySunkEnemyShips = (game) => {
  const sunkEnemyList = game.sunk_enemy_ships || game.SunkEnemyShips
  if (!sunkEnemyList || !Array.isArray(sunkEnemyList)) return

  sunkEnemyList.forEach(ship => {
    const shipCells = ship.cells || ship.Cells || []
    shipCells.forEach(cell => {
      const x = cell.x !== undefined ? cell.x : cell.X
      const y = cell.y !== undefined ? cell.y : cell.Y
      if (y >= 0 && y < 10 && x >= 0 && x < 10) {
        enemyAttackGrid.value[y][x].status = 'destroyed'
      }
    })
    for (const cell of shipCells) {
      const cx = cell.x !== undefined ? cell.x : cell.X
      const cy = cell.y !== undefined ? cell.y : cell.Y
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cy + dr
          const nc = cx + dc
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            if (enemyAttackGrid.value[nr][nc].status === 'none') {
              enemyAttackGrid.value[nr][nc].status = 'miss'
            }
          }
        }
      }
    }
  })
}

const updatePlayerStats = (game) => {
  const p1Stats = game.player1_stats
  const p2Stats = game.player2_stats
  if (!p1Stats || !p2Stats) return

  const isP1 = myPlayerID.value === (game.player1_id || game.Player1ID)
  myStats.value = isP1 ? p1Stats : p2Stats
  opponentStats.value = isP1 ? p2Stats : p1Stats
}

const handleGameFinished = (game) => {
  gameState.value = 'finished'
  const winnerId = game.WinnerID || game.winner_id
  if (!winnerId || winnerId === '00000000-0000-0000-0000-000000000000') {
    triggerNotification('🤝 НИЧЬЯ! Оба флота уничтожены!', 'success', null)
  } else if (winnerId === myPlayerID.value) {
    triggerNotification('🏆 ПОБЕДА! Вражеский флот полностью разгромлен!', 'success', null)
  } else {
    triggerNotification('💥 ПОРАЖЕНИЕ. Ваш флот уничтожен.', 'error', null)
  }
  clearShipsPlacement()
  clearGrids()
  startCountdown()
}

const handlePlayingState = (game) => {
  const turnId = game.CurrentTurn || game.current_turn
  currentTurnPlayerID.value = turnId
  gameState.value = (turnId === myPlayerID.value) ? 'player-turn' : 'enemy-turn'
  const p1name = game.player1_name || game.Player1Name
  const p2name = game.player2_name || game.Player2Name
  if (p1name && p2name) {
    opponentName.value = (myPlayerID.value === (game.player1_id || game.Player1ID)) ? p2name : p1name
  }
}

const processServerGameState = (game) => {
  if (game.error || game.Error || game.status === 'error') {
    const errText = game.error || game.Error || game.message || "Внутренний сбой"
    triggerNotification(`❌ Сбой операции: ${errText}`, 'error', 5000)
    return
  }

  lastGameData.value = game

  const rawStatus = game.Status || game.status

  if (rawStatus === 'placing_ships') {
    if (gameState.value !== 'placement') {
      gameState.value = 'waiting'
    }
    return
  }

  if (rawStatus === 'finished') {
    handleGameFinished(game)
    return
  }

  const incomingMoves = game.Moves || game.moves || []
  if (incomingMoves.length < processedMovesCount.value) {
    return
  }

  if (rawStatus === 'playing') {
    handlePlayingState(game)
  }

  clearGrids()
  applyMoveHistory(game, incomingMoves)
  applySunkShips(game)
  applySunkEnemyShips(game)
  updatePlayerStats(game)
}

/**
 * ОТПРАВКА КОРАБЛЕЙ ИСПОЛЬЗУЕТ СИНХРОНИЗИРОВАННЫЙ КЛИЕНТ И ТОКЕНЫ
 */
const getShipsArray = () => {
  return availableShips.value.map(ship => {
    const xCoord = typeof ship.col === 'number' ? ship.col : 0
    const yCoord = typeof ship.row === 'number' ? ship.row : 0
    return {
      ship_type: Number(ship.size),
      start_x: xCoord,
      start_y: yCoord,
      horizontal: ship.direction === 'horizontal'
    }
  })
}

const toggleReady = async () => {
  if (isSending.value) return
  if (isReady.value) {
    try {
      await apiClient.shipsReset(localGameId.value)
      isReady.value = false
      saveShipsPlacement()
      triggerNotification('🔄 Готовность отменена', 'success', 3000)
    } catch (err) {
      triggerNotification(`❌ Ошибка: ${err.message}`, 'error', 3000)
    }
    return
  }
  if (!allShipsPlaced.value) return

  isSending.value = true
  try {
    await apiClient.shipsReset(localGameId.value)
    await apiClient.placeShips(localGameId.value, getShipsArray())
    await apiClient.shipsConfirm(localGameId.value)
    saveShipsPlacement()
    isReady.value = true
    triggerNotification('⚓ Флот зафиксирован. Ожидаем оппонента...', 'success', 15000)
  } catch (err) {
    triggerNotification(`❌ Ошибка: ${err.message}`, 'error', 6000)
  } finally {
    isSending.value = false
  }
}

/**
 * ВЫСТРЕЛ ИСПОЛЬЗУЕТ ОБНОВЛЕННЫЙ ТОКЕН И PATH-VARIABLE URL
 */
const handleEnemyCellShot = async (row, col) => {
  if (!canUserShoot.value) return
  if (enemyAttackGrid.value[row][col].status !== 'none' || enemyAttackGrid.value[row][col].animating) return
  
  enemyAttackGrid.value[row][col].animating = true

  try {
    const gameStateResponse = await apiClient.makeMove(localGameId.value, col, row)
    processServerGameState(gameStateResponse)
    const moves = gameStateResponse.Moves || gameStateResponse.moves || []
    const lastMove = moves.length > 0 ? moves[moves.length - 1] : null
    const isHit = lastMove ? (lastMove.hit || lastMove.Hit) : false
    enemyAttackGrid.value[row][col].exploding = isHit
  } catch (err) {
    triggerNotification(`❌ Осечка орудия: ${err.message}`, 'error', 3000)
  } finally {
    enemyAttackGrid.value[row][col].animating = false
  }
}

const getStatusMessage = computed(() => {
  switch (gameState.value) {
    case 'searching': return props.isLobbyWait ? '📡 ОЖИДАНИЕ ВТОРОГО ИГРОКА В ЛОББИ...' : '🔍 ПОИСК ИГРЫ: Ожидаем подключение соперника к дуэли...'
    case 'placement': return '⚓ СТАДИЯ РАССТАНОВКИ ФЛОТА: Разместите 10 кораблей на левой сетке'
    case 'waiting': return '📡 ОЖИДАНИЕ: Соперник завершает расстановку сил...'
    case 'player-turn': return '💥 ВАШ ХОД! Сделайте выстрел по правому сектору врага'
    case 'enemy-turn': return '🛡️ ХОД СОПЕРНИКА: Ожидайте вражеского залпа...'
    case 'finished': return '🏆 ТАКТИЧЕСКАЯ ОПЕРАЦИЯ ЗАВЕРШЕНА'
    default: return 'Синхронизация сессии...'
  }
})

const getStatusColorClass = computed(() => {
  if (gameState.value === 'player-turn') return 'text-emerald-700 font-extrabold'
  if (gameState.value === 'enemy-turn') return 'text-red-700'
  if (gameState.value === 'searching' || gameState.value === 'waiting') return 'text-amber-700 animate-pulse'
  return 'text-blue-800'
})

const getShipImage = (size, direction) => {
  const isHor = direction === 'horizontal'
  if (size === 4) return isHor ? ship4hor : ship4vert
  if (size === 3) return isHor ? ship3hor : ship3vert
  if (size === 2) return isHor ? ship2hor : ship2vert
  return isHor ? ship1hor : ship1vert
}

const validateShipPlacement = (row, col, size, direction, ignoreShipId = null) => {
  if (direction === 'horizontal' && col + size - 1 > 9) return true
  if (direction === 'vertical' && row + size - 1 > 9) return true
  
  const newCells = []
  for (let i = 0; i < size; i++) {
    newCells.push({
      row: direction === 'vertical' ? row + i : row,
      col: direction === 'horizontal' ? col + i : col
    })
  }
  
  return placedShips.value.some(ps => {
    if (ps.id === ignoreShipId) return false
    for (let i = 0; i < ps.size; i++) {
      const pRow = ps.direction === 'vertical' ? ps.row + i : ps.row
      const pCol = ps.direction === 'horizontal' ? ps.col + i : ps.col
      
      if (newCells.some(c => Math.abs(c.row - pRow) <= 1 && Math.abs(c.col - pCol) <= 1)) return true
    }
    return false
  })
}

const handlePlacedShipClick = (ship) => {
  if (gameState.value !== 'placement') return
  const nextDir = ship.direction === 'horizontal' ? 'vertical' : 'horizontal'
  if (!validateShipPlacement(ship.row, ship.col, ship.size, nextDir, ship.id)) {
    ship.direction = nextDir
    saveShipsPlacement()
  } else {
    triggerNotification('❌ Невозможно повернуть: нет места для маневра.', 'error', 2000)
  }
}

const toggleDockShipDirection = (ship) => {
  if (gameState.value !== 'placement') return
  ship.direction = ship.direction === 'horizontal' ? 'vertical' : 'horizontal'
  saveShipsPlacement()
}

const randomizeFleet = () => {
  if (gameState.value !== 'placement') return

  const ships = availableShips.value
  for (const s of ships) {
    s.placed = false
    s.row = null
    s.col = null
  }

  const placed = []
  for (const ship of ships) {
    let ok = false
    for (let attempt = 0; attempt < 200; attempt++) {
      const row = Math.floor(Math.random() * 10)
      const col = Math.floor(Math.random() * 10)
      const dir = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      if (dir === 'horizontal' && col + ship.size - 1 > 9) continue
      if (dir === 'vertical' && row + ship.size - 1 > 9) continue
      const newCells = []
      for (let i = 0; i < ship.size; i++) {
        newCells.push({ row: dir === 'vertical' ? row + i : row, col: dir === 'horizontal' ? col + i : col })
      }
      const conflict = placed.some(p => {
        for (let i = 0; i < p.size; i++) {
          const pr = p.direction === 'vertical' ? p.row + i : p.row
          const pc = p.direction === 'horizontal' ? p.col + i : p.col
          if (newCells.some(c => Math.abs(c.row - pr) <= 1 && Math.abs(c.col - pc) <= 1)) return true
        }
        return false
      })
      if (!conflict) {
        ship.row = row
        ship.col = col
        ship.direction = dir
        ship.placed = true
        placed.push({ row, col, size: ship.size, direction: dir })
        ok = true
        break
      }
    }
    if (!ok) {
      triggerNotification(`❌ Не удалось разместить корабль ${ship.size}-го размера`, 'error', 3000)
    }
  }
  saveShipsPlacement()
}

const leaveLobby = async () => {
  isLeaving.value = true
  emit('back-to-menu')
  try {
    await apiClient.leaveMatchmaking()
  } catch (e) {
    console.warn('Failed to leave matchmaking queue:', e)
  }
  if (props.lobbyId) {
    try {
      await apiClient.leaveLobby(props.lobbyId)
    } catch (e) {
      console.warn('Failed to leave lobby via REST:', e)
    }
  }
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ type: 'leave_lobby' }))
  }
  clearShipsPlacement()
}

const forfeitGame = async () => {
  if (!localGameId.value) return
  try {
    await apiClient.forfeitGame(localGameId.value)
    triggerNotification('⚪ Вы сдались. Игра завершена.', 'error', 5000)
  } catch (err) {
    triggerNotification(`❌ ${err.message}`, 'error', 3000)
  }
}

const removeShipFromBoard = (ship) => { 
  if (gameState.value === 'placement') { 
    ship.placed = false
    ship.row = null
    ship.col = null 
    saveShipsPlacement()
  } 
}

const getDockShipBoxStyle = (ship) => {
  const cellPx = 58
  const w = ship.direction === 'horizontal' ? ship.size * cellPx : cellPx
  const h = ship.direction === 'vertical' ? ship.size * cellPx : cellPx
  return { width: `${w}px`, height: `${h}px`, flexShrink: '0' }
}

const getPlacedShipStyle = (ship) => {
  const gridEl = document.querySelector('.defense-grid .grid-cols-11')
  if (!gridEl) return {}
  const rect = gridEl.getBoundingClientRect()
  const cellW = rect.width / 11
  const cellH = rect.height / 11
  return {
    left: `${(ship.col + 1) * cellW}px`,
    top: `${(ship.row + 1) * cellH}px`,
    width: ship.direction === 'horizontal' ? `${ship.size * cellW}px` : `${cellW}px`,
    height: ship.direction === 'vertical' ? `${ship.size * cellH}px` : `${cellH}px`,
  }
}

const getGameShipStyle = (ship) => {
  const gridEl = document.querySelector('.defense-grid .grid-cols-11')
  if (!gridEl) return {}
  const rect = gridEl.getBoundingClientRect()
  const cellW = rect.width / 11
  const cellH = rect.height / 11
  const sunkOpacity = ship.sunk ? 0.4 : 0.8
  return {
    left: `${(ship.col + 1) * cellW}px`,
    top: `${(ship.row + 1) * cellH}px`,
    width: ship.direction === 'horizontal' ? `${ship.size * cellW}px` : `${cellW}px`,
    height: ship.direction === 'vertical' ? `${ship.size * cellH}px` : `${cellH}px`,
    opacity: sunkOpacity,
  }
}

const handleDragStart = (e, ship, source) => { 
  if (gameState.value !== 'placement') return 
  
  isDragging.value = true
  draggedShip.value = ship
  dragSource.value = source 

  if (source === 'board') {
    originalRow.value = ship.row
    originalCol.value = ship.col
  }

  e.dataTransfer.effectAllowed = 'move'

  const ghost = e.target.cloneNode(true)
  ghost.style.position = 'absolute'
  ghost.style.top = '-1000px'
  ghost.style.left = '-1000px'
  ghost.style.opacity = '0.6'
  ghost.style.pointerEvents = 'none'
  document.body.appendChild(ghost)
  const ghostRect = ghost.getBoundingClientRect()
  const offsetX = e.clientX - (source === 'dock' ? ghostRect.left : ghostRect.left)
  const offsetY = e.clientY - (source === 'dock' ? ghostRect.top : ghostRect.top)
  e.dataTransfer.setDragImage(ghost, offsetX, offsetY)
  setTimeout(() => document.body.removeChild(ghost), 0)
}

const handleDragOver = (row, col) => {
  if (gameState.value !== 'placement' || !draggedShip.value) return
  
  const size = draggedShip.value.size
  const dir = draggedShip.value.direction
  
  const invalid = validateShipPlacement(row, col, size, dir, draggedShip.value.id)
  
  const cells = []
  for (let i = 0; i < size; i++) {
    if (dir === 'horizontal' && col + i <= 9) cells.push({ row, col: col + i })
    if (dir === 'vertical' && row + i <= 9) cells.push({ row: row + i, col })
  }
  
  isHoverInvalid.value = invalid
  activeHoverCells.value = cells
}

const isCellHovered = (row, col) => !isHoverInvalid.value && activeHoverCells.value.some(c => c.row === row && c.col === col)
const isCellHoverInvalid = (row, col) => isHoverInvalid.value && activeHoverCells.value.some(c => c.row === row && c.col === col)

const handleDrop = (row, col) => {
  if (gameState.value !== 'placement' || !draggedShip.value) return

  if (!isHoverInvalid.value) {
    const s = availableShips.value.find(x => x.id === draggedShip.value.id)
    if (s) {
      s.row = row
      s.col = col
      s.placed = true
    }
    saveShipsPlacement()
  } else {
    if (dragSource.value === 'board') {
      triggerNotification('❌ Нельзя поставить сюда: позиция заблокирована или нарушает границы флота', 'error', 3000)
    } else {
      triggerNotification('❌ Неверная позиция для установки', 'error', 2000)
    }
  }

  draggedShip.value = null
  activeHoverCells.value = []
  originalRow.value = null
  originalCol.value = null
  isDragging.value = false
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedShip.value = null
  activeHoverCells.value = []
}

const getRandomTop = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const resetFish1 = async () => { isFish1Active.value = false; fish1Top.value = getRandomTop(10, 42); await nextTick(); isFish1Active.value = true }
const resetFish2 = async () => { isFish2Active.value = false; fish2Top.value = getRandomTop(55, 88); await nextTick(); isFish2Active.value = true }

let lobbyPollInterval = null

onMounted(async () => {
  parseMyIDFromToken()
  loadShipsPlacement()
  initWebSocket()
  document.addEventListener('keydown', handleGlobalKeydown)
  try {
    const profile = await apiClient.getProfile()
    activeFish.value = profile.active_fish || []
  } catch (_) {
    // use default fish
  }

  // Poll for active games while searching (fallback if WS match_found is lost)
  lobbyPollInterval = setInterval(async () => {
    if (!props.isLobbyWait && gameState.value === 'searching') {
      try {
        const matchStatus = await apiClient.getMatchmakingStatus()
        if (matchStatus && matchStatus.status !== 'searching') {
        }
      } catch (_) {}
    }
  }, 5000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (playAgainTimeout.value) {
    clearTimeout(playAgainTimeout.value)
  }
  clearInterval(pingInterval)
  if (lobbyPollInterval) {
    clearInterval(lobbyPollInterval)
    lobbyPollInterval = null
  }
  placementSecondsLeft.value = null
  turnSecondsLeft.value = null
  if (socket.value) {
    socket.value.close()
  }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-scale-pop { animation: scalePop 0.25s ease-out forwards; }
@keyframes scalePop { from { transform: scale(0.94); opacity: 0.5; } to { transform: scale(1); opacity: 1; } }

.fish { position: fixed; z-index: 99; pointer-events: none; will-change: transform; }
.fish-1-container { right: -160px; animation: swim-right-left 14s linear forwards; }
.fish-2-container { left: -160px; animation: swim-left-right 12s linear forwards; }
.fish-wiggle { display: block; animation: fish-live-motion 2.5s ease-in-out infinite alternate; }

@keyframes swim-right-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100vw - 320px)); } }
@keyframes swim-left-right { 0% { transform: translateX(0); } 100% { transform: translateX(calc(100vw + 320px)); } }
@keyframes fish-live-motion { 0% { transform: translateY(-6px) rotate(-5deg); } 100% { transform: translateY(10px) rotate(5deg); } }

.shot-laser-target { background: radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(0,0,0,0) 70%); border: 2px solid #ef4444; animation: laserScan 0.4s linear infinite alternate; }
@keyframes laserScan { from { transform: scale(1.1); opacity: 0.5; } to { transform: scale(0.9); opacity: 1; } }
.explosion-flash { background-color: #ffffff; animation: flashExplode 0.25s ease-out forwards; }
@keyframes flashExplode { 0% { opacity: 1; } 100% { opacity: 0; } }

.text-win  { color: #15803d; }
.text-loss { color: #b91c1c; }
.text-neutral { color: #6b7280; }
.reward-positive { color: #16a34a; }
.reward-negative { color: #dc2626; }

.btn--dimmed {
  opacity: 0.6;
  background-color: #a0a0a0 !important;
  transition: opacity 0.2s, background-color 0.2s;
}
</style>