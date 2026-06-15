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
      </div>

      <div class="flex flex-col xl:flex-row gap-8 w-full justify-center items-stretch">
        
        <div class="w-full xl:w-[240px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black flex flex-col shadow-sm">
          <h2 class="text-xl font-faero mb-3 text-center border-b-2 border-gray-400 pb-2 tracking-wide">SHIP DOCK</h2>
          
          <div class="text-[10px] font-mono mb-3 text-center text-gray-600 bg-gray-200 p-2 border border-gray-400">
            <template v-if="gameState === 'placement'">
              <p class="font-bold text-blue-800">⚓ Расстановка:</p>
              <p>Перетащите корабль на поле</p>
              <p class="font-bold text-emerald-800 mt-1">🔄 Поворот:</p>
              <p>Кликните по кораблю на поле</p>
            </template>
            <template v-else>
              <p class="text-red-700 font-bold">ИГРА АКТИВНА</p>
              <p class="text-xs mt-1">Следите за индикатором хода сверху.</p>
            </template>
          </div>
          
          <div class="flex flex-wrap xl:flex-col gap-4 justify-center items-center overflow-y-auto flex-grow max-h-[450px] p-2 bg-gray-300/50 border border-inset border-gray-400">
            <template v-for="ship in availableShips" :key="ship.id">
              <div 
                v-if="!ship.placed"
                :draggable="gameState === 'placement'"
                @dragstart="handleDragStart($event, ship)"
                class="border border-transparent bg-gray-600/20 relative overflow-hidden flex items-center justify-center"
                :class="gameState === 'placement' ? 'cursor-grab active:cursor-grabbing hover:brightness-110 hover:border-blue-500' : 'opacity-40'"
                :style="getDockShipBoxStyle(ship)"
              >
                <img :src="getShipImage(ship.size, 'horizontal')" class="pointer-events-none w-full h-full object-fill" />
              </div>
            </template>
          </div>
        </div>

        <div class="w-full max-w-[500px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-6 text-black shadow-md">
          <h2 class="text-2xl font-faero mb-4 text-center border-b-2 border-gray-400 pb-2 tracking-wide">YOUR FLEET</h2>
          
          <div class="w-full aspect-square border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] p-2 relative"
               :style="{ backgroundImage: `url(${water1Url})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            
            <div class="absolute inset-2 z-20 pointer-events-none grid grid-cols-11 grid-rows-11">
              <div></div>
              <div v-for="i in 110" :key="'spacer-'+i"></div>
              
              <div 
                v-for="ship in placedShips" 
                :key="'placed-'+ship.id"
                @click="handlePlacedShipClick(ship)"
                @contextmenu.prevent="handlePlacedShipClick(ship)"
                @dblclick="removeShipFromBoard(ship)"
                class="absolute pointer-events-auto border border-white/40 shadow-md overflow-hidden bg-blue-950/20"
                :class="gameState === 'placement' ? 'cursor-pointer' : 'cursor-default'"
                :style="getPlacedShipStyle(ship)"
              >
                <img :src="getShipImage(ship.size, ship.direction)" class="pointer-events-none w-full h-full object-fill absolute inset-0" />
              </div>
            </div>

            <div class="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 text-center items-center text-sm font-bold text-white bg-blue-950/20">
              <div></div>
              <div v-for="letter in letters" :key="letter">{{ letter }}</div>
              
              <template v-for="rowIdx in 10" :key="rowIdx">
                <div class="text-right pr-2 text-black font-mono bg-[#d4d0c8]/80 h-full flex items-center justify-end border-r border-gray-400">{{ rowIdx }}</div>
                <div 
                  v-for="colIdx in 10" 
                  :key="colIdx"
                  class="w-full h-full aspect-square border border-white/10 relative flex items-center justify-center"
                  :class="{ 
                    'bg-cyan-500/40': gameState === 'placement' && isCellHovered(rowIdx - 1, colIdx - 1), 
                    'bg-red-500/50': gameState === 'placement' && isCellHoverInvalid(rowIdx - 1, colIdx - 1) 
                  }"
                  @dragover.prevent="handleDragOver(rowIdx - 1, colIdx - 1)"
                  @drop="handleDrop(rowIdx - 1, colIdx - 1)"
                >
                  <span v-if="playerDefenseGrid[rowIdx - 1][colIdx - 1] === 'hit'" class="text-base z-30 filter drop-shadow animate-scale-pop">💥</span>
                  <span v-if="playerDefenseGrid[rowIdx - 1][colIdx - 1] === 'miss'" class="text-xs z-30 text-cyan-300 font-mono">⭕</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="w-full max-w-[500px] bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-6 text-black shadow-md">
          <h2 class="text-2xl font-faero mb-4 text-center border-b-2 border-gray-400 pb-2 tracking-wide">ENEMY FLEET</h2>
          
          <div class="w-full aspect-square border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] p-2 relative"
               :style="{ backgroundImage: `url(${water2Url})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            
            <div class="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 text-center items-center text-sm font-bold text-white bg-slate-950/25">
              <div></div>
              <div v-for="letter in letters" :key="letter">{{ letter }}</div>
              
              <template v-for="rowIdx in 10" :key="rowIdx">
                <div class="text-right pr-2 text-black font-mono bg-[#d4d0c8]/80 h-full flex items-center justify-end border-r border-gray-400">{{ rowIdx }}</div>
                <div 
                  v-for="colIdx in 10" 
                  :key="colIdx"
                  class="w-full h-full aspect-square border border-white/10 bg-lime-500/5 hover:bg-lime-400/30 transition-colors duration-100 relative flex items-center justify-center overflow-hidden"
                  :class="canUserShoot ? 'cursor-crosshair' : 'cursor-not-allowed opacity-80'"
                  @click="handleEnemyCellShot(rowIdx - 1, colIdx - 1)"
                >
                  <div v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].animating" class="absolute inset-0 z-30 shot-laser-target"></div>
                  <div v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].exploding" class="absolute inset-0 z-40 explosion-flash"></div>
                  
                  <span v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].status === 'hit'" class="text-base z-10 filter drop-shadow animate-scale-pop">💥</span>
                  <span v-if="enemyAttackGrid[rowIdx - 1][colIdx - 1].status === 'miss'" class="text-xs z-10 text-cyan-300 font-mono animate-fade-in">⭕</span>
                </div>
              </template>
            </div>
          </div>
        </div>

      </div>

      <div v-if="allShipsPlaced && gameState === 'placement'" class="w-full max-w-xs animate-bounce-short z-30 mt-4">
        <button 
          @click="sendShipsToServer"
          class="w-full py-4 text-xl font-faero text-black bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] shadow-md hover:bg-gray-100 transition-colors tracking-widest"
        >
          CONFIRM FLEET
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

// Импорт ассетов окружения
import sceneryUrl from '../assets/images/scenery.jpeg'
import fish1Url from '../assets/images/fish1.png'
import fish2Url from '../assets/images/fish2.png'
import water1Url from '../assets/images/water1.gif'
import water2Url from '../assets/images/water2.gif'

// Импорт ассетов кораблей
import ship1hor from '../assets/images/ship1hor.jpeg'
import ship1vert from '../assets/images/ship1vert.jpeg'
import ship2hor from '../assets/images/ship2hor.jpeg'
import ship2vert from '../assets/images/ship2vert.jpeg'
import ship3hor from '../assets/images/ship3hor.jpeg'
import ship3vert from '../assets/images/ship3vert.jpeg'
import ship4hor from '../assets/images/ship4hor.jpeg'
import ship4vert from '../assets/images/ship4vert.jpeg'

const props = defineProps({
  gameId: { type: String, required: true } // Передается из роутера / лобби при создании комнаты
})
const emit = defineEmits(['back-to-menu'])

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

// Данные анимации рыб
const fish1Top = ref(20)
const fish2Top = ref(70)
const isFish1Active = ref(true)
const isFish2Active = ref(true)

// Состояние сессии
const gameState = ref('placement') // 'placement', 'waiting', 'player-turn', 'enemy-turn', 'finished'
const currentTurnPlayerID = ref(null) 
const myPlayerID = ref(null) 

// Экземпляр WebSocket соединения
const socket = ref(null)

// Игровые сетки 10x10 (строго индексы 0-9)
const enemyAttackGrid = ref(
  Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ({ status: 'none', animating: false, exploding: false })))
)
const playerDefenseGrid = ref(Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 'none')))

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

const draggedShip = ref(null)
const activeHoverCells = ref([])
const isHoverInvalid = ref(false)

const placedShips = computed(() => availableShips.value.filter(s => s.placed))
const allShipsPlaced = computed(() => availableShips.value.every(s => s.placed))

// Валидация права на выстрел
const canUserShoot = computed(() => {
  return gameState.value === 'player-turn' && currentTurnPlayerID.value === myPlayerID.value
})

// Чтение собственного UUID (sub) из сохраненного JWT токена авторизации
const parseMyIDFromToken = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    const claims = JSON.parse(jsonPayload)
    myPlayerID.value = claims.sub
  } catch (e) {
    console.error("Не удалось распарсить JWT для получения UUID:", e)
  }
}

/**
 * ИНИЦИАЛИЗАЦИЯ WEBSOCKET СОЕДИНЕНИЯ
 */
const initWebSocket = () => {
  const token = localStorage.getItem('auth_token')
  
  // 1. Берем базовый HTTP URL из .env (например, http://31.128.40.90:32000)
  // Если переменная не задана, откатываемся на текущий домен
  const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin
  
  // 2. Меняем http/https протокол на ws/wss
  const wsProtocol = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
  
  // 3. Очищаем адрес от протокола 'http://' или 'https://', чтобы оставить только хост и порт
  const cleanHost = apiBaseUrl.replace(/^https?:\/\//, '')
  
  // 4. Собираем финальный рабочий URL для подключения к подом в K8s
  const wsUrl = `${wsProtocol}//${cleanHost}/api/games/${props.gameId}/ws?token=${token}`
  
  console.log("🔗 Попытка подключения к WS:", wsUrl)
  
  socket.value = new WebSocket(wsUrl)

  socket.value.onopen = () => {
    console.log("📡 WebSocket успешно подключен к серверной комнате:", props.gameId)
  }

  socket.value.onmessage = (event) => {
    try {
      const gameUpdate = JSON.parse(event.data)
      processServerGameState(gameUpdate)
    } catch (err) {
      console.error("Ошибка десериализации пакета от сервера:", err)
    }
  }

  socket.value.onerror = (error) => {
    console.error("❌ Ошибка WebSocket канала:", error)
  }

  socket.value.onclose = () => {
    console.warn("⚠️ WebSocket соединение закрыто сервером")
  }
}

/**
 * ОБЩИЙ МЕТОД ДЛЯ ОТПРАВКИ КОМАНД ЧЕРЕЗ СОКЕТ
 */
const sendWsMessage = (actionType, payload = {}) => {
  if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
    console.error("Невозможно отправить сообщение: соединение не установлено")
    return
  }
  const message = {
    action: actionType,
    ...payload
  }
  socket.value.send(JSON.stringify(message))
}

/**
 * ПАРСИНГ СОСТОЯНИЯ КОМНАТЫ ОТ СЕРВЕРА
 */
const processServerGameState = (game) => {
  // 1. Изменение фаз
  if (game.Status === 'placing_ships') {
    // Если мы уже кликнули 'Confirm Fleet', но сервер все еще в этой фазе — значит ждем врага
    if (gameState.value !== 'placement') {
      gameState.value = 'waiting'
    }
    return
  }
  
  if (game.Status === 'finished') {
    gameState.value = 'finished'
    const isWinner = game.WinnerID === myPlayerID.value
    alert(isWinner ? '🎉 Поздравляем! Вы разгромили флот соперника!' : '💥 Ваш флот полностью уничтожен. Поражение.')
    emit('back-to-menu')
    return
  }

  if (game.Status === 'playing') {
    currentTurnPlayerID.value = game.CurrentTurn
    gameState.value = (game.CurrentTurn === myPlayerID.value) ? 'player-turn' : 'enemy-turn'
  }

  // 2. Отрисовка истории выстрелов (game.Moves) на сетках
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      playerDefenseGrid.value[r][c] = 'none'
      enemyAttackGrid.value[r][c].status = 'none'
    }
  }

  if (game.Moves && Array.isArray(game.Moves)) {
    game.Moves.forEach(move => {
      const isMyMove = move.PlayerID === myPlayerID.value
      const status = move.IsHit ? 'hit' : 'miss' 

      if (isMyMove) {
        enemyAttackGrid.value[move.Y][move.X].status = status
      } else {
        playerDefenseGrid.value[move.Y][move.X] = status
      }
    })
  }
}

/**
 * ДЕЙСТВИЕ: ОТПРАВКА КОРДИНАТ КОРАБЛЕЙ
 */
const sendShipsToServer = () => {
  const payload = {
    ships: availableShips.value.map(ship => ({
      ship_type: ship.size,
      start_x: ship.col,
      start_y: ship.row,
      horizontal: ship.direction === 'horizontal'
    }))
  }
  
  // Отправляем пакет на сервер в сокет канал
  sendWsMessage('PLACE_SHIPS', payload)
  gameState.value = 'waiting' 
}

/**
 * ДЕЙСТВИЕ: ВЫСТРЕЛ ПО СЕТКЕ ВРАГА
 */
const handleEnemyCellShot = (row, col) => {
  if (!canUserShoot.value) return
  if (enemyAttackGrid.value[row][col].status !== 'none' || enemyAttackGrid.value[row][col].animating) return
  
  enemyAttackGrid.value[row][col].animating = true
  
  // Мгновенно отправляем координаты хода через WebSocket
  sendWsMessage('MAKE_MOVE', { x: col, y: row })
  
  // Анимация прицеливания гаснет автоматически при обновлении состояния от сервера
  setTimeout(() => {
    if (enemyAttackGrid.value[row][col].animating) {
      enemyAttackGrid.value[row][col].animating = false
    }
  }, 1000)
}

// Вычислительные сообщения статусов интерфейса
const getStatusMessage = computed(() => {
  switch (gameState.value) {
    case 'placement': return '⚓ СТАДИЯ РАССТАНОВКИ ФЛОТА: Разместите 10 кораблей на левой сетке'
    case 'waiting': return '📡 ОЖИДАНИЕ: Соперник завершает расстановку сил...'
    case 'player-turn': return '💥 ВАШ ХОД! Сделайте выстрел по правому сектору врага'
    case 'enemy-turn': return '🛡️ ХОД СОПЕРНИКА: Ожидайте вражеского залпа...'
    case 'finished': return '🏆 СЕЙШЕН ЗАВЕРШЕН'
    default: return 'Синхронизация сессии...'
  }
})

const getStatusColorClass = computed(() => {
  if (gameState.value === 'player-turn') return 'text-emerald-700 font-extrabold'
  if (gameState.value === 'enemy-turn') return 'text-red-700'
  if (gameState.value === 'waiting') return 'text-amber-700 animate-pulse'
  return 'text-blue-800'
})

const getShipImage = (size, direction) => {
  const isHor = direction === 'horizontal'
  if (size === 4) return isHor ? ship4hor : ship4vert
  if (size === 3) return isHor ? ship3hor : ship3vert
  if (size === 2) return isHor ? ship2hor : ship2vert
  return isHor ? ship1hor : ship1vert
}

// Валидаторы перетаскивания (локальные правила)
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
  if (!validateShipPlacement(ship.row, ship.col, ship.size, nextDir, ship.id)) ship.direction = nextDir
}

const removeShipFromBoard = (ship) => { if (gameState.value === 'placement') { ship.placed = false; ship.row = null; ship.col = null } }
const getDockShipBoxStyle = (ship) => ({ width: `${ship.size * 32}px`, height: `32px` })
const getPlacedShipStyle = (ship) => {
  const u = 100 / 11
  return {
    left: ((ship.col + 1) * u) + '%', top: ((ship.row + 1) * u) + '%',
    width: (ship.direction === 'horizontal' ? ship.size * u : u) + '%',
    height: (ship.direction === 'vertical' ? ship.size * u : u) + '%',
    zIndex: 25
  }
}

const handleDragStart = (e, ship) => { if (gameState.value === 'placement') { draggedShip.value = ship; e.dataTransfer.effectAllowed = 'move' } }
const handleDragOver = (row, col) => {
  if (gameState.value !== 'placement' || !draggedShip.value) return
  const size = draggedShip.value.size, dir = draggedShip.value.direction
  const invalid = validateShipPlacement(row, col, size, dir, draggedShip.value.id)
  const cells = []
  for (let i = 0; i < size; i++) {
    if (dir === 'horizontal' && col + i <= 9) cells.push({ row, col: col + i })
    if (dir === 'vertical' && row + i <= 9) cells.push({ row: row + i, col })
  }
  isHoverInvalid.value = invalid; activeHoverCells.value = cells
}
const isCellHovered = (row, col) => !isHoverInvalid.value && activeHoverCells.value.some(c => c.row === row && c.col === col)
const isCellHoverInvalid = (row, col) => isHoverInvalid.value && activeHoverCells.value.some(c => c.row === row && c.col === col)
const handleDrop = (row, col) => {
  if (gameState.value === 'placement' && draggedShip.value && !isHoverInvalid.value) {
    const s = availableShips.value.find(x => x.id === draggedShip.value.id)
    if (s) { s.row = row; s.col = col; s.placed = true }
  }
  draggedShip.value = null; activeHoverCells.value = []
}

// Сброс и запуск циклов плавания рыб
const getRandomTop = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const resetFish1 = async () => { isFish1Active.value = false; fish1Top.value = getRandomTop(10, 42); await nextTick(); isFish1Active.value = true }
const resetFish2 = async () => { isFish2Active.value = false; fish2Top.value = getRandomTop(55, 88); await nextTick(); isFish2Active.value = true }

onMounted(() => {
  parseMyIDFromToken()
  initWebSocket()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.close()
  }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-scale-pop { animation: scalePop 0.25s ease-out forwards; }
@keyframes scalePop { from { transform: scale(0.4); } to { transform: scale(1); } }

/* РЫБЫ НА ПЕРЕДНЕМ ПЛАНЕ С МЯГКОЙ РЕТРО-ТЕНЬЮ */
.fish {
  position: fixed;
  z-index: 99; /* Поверх всех сеток интерфейса */
  pointer-events: none;
  will-change: transform;
}
.fish-1-container {
  right: -160px;
  animation: swim-right-left 14s linear forwards;
}
.fish-2-container {
  left: -160px;
  animation: swim-left-right 12s linear forwards;
}
.fish-wiggle {
  display: block;
  animation: fish-live-motion 2.5s ease-in-out infinite alternate;
}

@keyframes swim-right-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-100vw - 320px)); }
}
@keyframes swim-left-right {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(100vw + 320px)); }
}
@keyframes fish-live-motion {
  0% { transform: translateY(-6px) rotate(-5deg); }
  100% { transform: translateY(10px) rotate(5deg); }
}

.shot-laser-target {
  background: radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(0,0,0,0) 70%);
  border: 2px solid #ef4444;
  animation: laserScan 0.4s linear infinite alternate;
}
@keyframes laserScan { from { transform: scale(1.1); opacity: 0.5; } to { transform: scale(0.9); opacity: 1; } }

.explosion-flash { background-color: #ffffff; animation: flashExplode 0.25s ease-out forwards; }
@keyframes flashExplode { 0% { opacity: 1; } 100% { opacity: 0; } }
</style>