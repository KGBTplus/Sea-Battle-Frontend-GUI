<template>
  <div class="w-full flex flex-col items-center gap-0">
    
    <SeaBattleHeader />

    <div class="w-full max-w-6xl bg-[#d4d0c8] border-l-2 border-r-2 border-b-2 border-l-[#fff] border-r-[#404040] border-b-[#404040] p-4 text-black font-mono shadow-[2px_2px_10px_rgba(0,0,0,0.5)] select-none">
      
      <div class="flex flex-row flex-wrap items-center justify-center gap-2 py-2">
        <button @click="$emit('show-inventory')" class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          🎒 ИНВЕНТАРЬ
        </button>
        <button @click="$emit('show-shop')" class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          🛒 МАГАЗИН
        </button>
        <button @click="$emit('show-leaderboard')" class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          🏆 ЛИДЕРЫ
        </button>
        <button @click="$emit('show-match-history')" class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          📜 ИСТОРИЯ
        </button>
        <button @click="$emit('show-profile')" class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          👤 ПРОФИЛЬ
        </button>
        <button @click="$emit('logout')" class="bg-[#d4d0c8] text-red-700 border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-4 py-2 hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm whitespace-nowrap font-bold">
          🚪 ВЫЙТИ
        </button>
      </div>

      <div v-if="lobbyError" class="bg-red-100 border-2 border-red-600 text-red-800 p-2 text-sm font-bold mb-3 uppercase tracking-tight">
        ⚠️ {{ lobbyError }}
      </div>

      <div class="flex items-center gap-2 my-3">
        <button 
          @click="startMatchmaking" 
          :disabled="isSearching"
          class="flex-1 py-4 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] font-bold text-sm tracking-widest hover:bg-gray-50 text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎯 НАЧАТЬ ПОИСК СОПЕРНИКА
        </button>
        <button 
          @click="createNewLobby"
          :disabled="creating"
          class="px-4 py-4 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] font-bold text-sm tracking-wider hover:bg-gray-50 text-blue-800 disabled:opacity-50"
        >
          ➕ СОЗДАТЬ ЛОББИ
        </button>
      </div>

      <!-- Статус лобби / поиска -->
      <div v-if="myLobbyId" class="bg-gray-100 border border-gray-400 p-2 mb-2 text-sm">
        <div class="font-bold text-blue-900 mb-1">📡 ЛОББИ {{ myLobbyId.slice(0, 8) }}...</div>
        <div v-if="myLobbyOpponent" class="text-green-700">
          👥 Соперник: <span class="font-bold">{{ myLobbyOpponent }}</span>
        </div>
        <div v-else class="text-gray-500">
          ⏳ Ожидание игрока...
        </div>
      </div>
      
    </div>

    <div v-if="lobbies.length > 0" class="w-full max-w-6xl border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-[#d4d0c8]">
      <div class="bg-[#000080] text-white text-sm font-bold px-3 py-2 tracking-wide">АКТИВНЫЕ ЛОББИ</div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-300 text-left">
              <th class="px-3 py-2 border-r border-b border-gray-400">Создатель</th>
              <th class="px-3 py-2 border-r border-b border-gray-400">Игроки</th>
              <th class="px-3 py-2 border-r border-b border-gray-400">Статус</th>
              <th class="px-3 py-2 border-b border-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lobby in lobbies" :key="lobby.id" class="hover:bg-gray-200">
              <td class="px-3 py-2 border-r border-b border-gray-300" style="font-family: Tahoma, 'MS Sans Serif', Verdana, sans-serif;">{{ lobby.creator_name || '—' }}</td>
              <td class="px-3 py-2 border-r border-b border-gray-300">{{ lobby.usernames ? lobby.usernames.length : 0 }} / {{ lobby.max_players }}</td>
              <td class="px-3 py-2 border-r border-b border-gray-300">
                <span :class="lobby.status === 'waiting' ? 'text-green-700 font-bold' : 'text-gray-500'">{{ lobby.status === 'waiting' ? 'ожидание' : lobby.status }}</span>
              </td>
              <td class="px-3 py-2 border-b border-gray-300">
                <button v-if="lobby.status === 'waiting'"
                  @click="joinLobby(lobby.id)"
                  class="bg-[#d4d0c8] border border-t-[#fff] border-l-[#fff] border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#fff] active:border-r-[#fff] px-3 py-1 text-xs font-bold hover:bg-gray-100">
                  ПРИСОЕДИНИТЬСЯ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="w-full max-w-6xl border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-[#d4d0c8]">
      <div class="bg-[#000080] text-white text-sm font-bold px-3 py-2 tracking-wide">АКТИВНЫЕ ЛОББИ</div>
      <div class="px-3 py-4 text-sm text-gray-500 text-center">Нет активных лобби. Создайте своё или начните поиск соперника.</div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiClient } from '../api/client'
import SeaBattleHeader from './SeaBattleHeader.vue'

const props = defineProps({
  username: { type: String, default: 'CyberCommander' }
})

const emit = defineEmits(['game-ready', 'logout', 'show-leaderboard', 'show-profile', 'show-shop', 'show-inventory', 'show-match-history'])
const lobbyError = ref('')
const isSearching = ref(false)
const lobbies = ref([])
const myLobbyId = ref('')
const myLobbyOpponent = ref('')
let lobbiesInterval = null

const startMatchmaking = async () => {
  if (isSearching.value) return
  isSearching.value = true
  lobbyError.value = ''
  myLobbyId.value = ''
  myLobbyOpponent.value = ''
  try {
    const result = await apiClient.startMatchmaking()
    if (result?.game_id) {
      isSearching.value = false
      emit('game-ready', result.game_id)
      return
    }
  } catch (err) {
    console.warn('[LOBBY] startMatchmaking error:', err)
  }
  isSearching.value = false
  emit('game-ready', '')
}

const creating = ref(false)
const createNewLobby = async () => {
  if (creating.value) return
  creating.value = true
  lobbyError.value = ''
  myLobbyId.value = ''
  myLobbyOpponent.value = ''
  console.log('[LOBBY] createNewLobby called')
  try {
    const result = await apiClient.createLobby({ max_players: 2 })
    console.log('[LOBBY] createNewLobby result:', result)
    if (result?.game_id) {
      emit('game-ready', result.game_id)
    } else if (result?.id) {
      myLobbyId.value = result.id
      emit('game-ready', 'LOBBY_' + result.id)
    } else {
      emit('game-ready', 'LOBBY_WAIT')
    }
  } catch (err) {
    lobbyError.value = err.message || 'Ошибка создания лобби'
    console.warn('[LOBBY] createNewLobby error:', err)
  } finally {
    creating.value = false
  }
}

const joinLobby = async (lobbyId) => {
  lobbyError.value = ''
  try {
    const result = await apiClient.joinLobby(lobbyId)
    if (result && result.game_id) {
      emit('game-ready', result.game_id)
    } else {
      emit('game-ready', '')
    }
  } catch (err) {
    lobbyError.value = err.message || 'Ошибка присоединения к лобби'
  }
}

const fetchLobbies = async () => {
  try {
    lobbies.value = await apiClient.getLobbies()
    console.log('[LOBBY] fetched lobbies:', lobbies.value.length)
    // Check if my lobby has an opponent
    if (myLobbyId.value) {
      const myLobby = lobbies.value.find(l => l.id === myLobbyId.value)
      if (myLobby && myLobby.usernames && myLobby.usernames.length >= 2) {
        const myUsername = localStorage.getItem('username') || ''
        const opponent = myLobby.usernames.find(u => u !== myUsername)
        if (opponent) {
          myLobbyOpponent.value = opponent
          console.log('[LOBBY] opponent found in lobby:', opponent)
        }
      } else if (myLobby && myLobby.usernames && myLobby.usernames.length === 1) {
        console.log('[LOBBY] waiting for opponent, usernames:', myLobby.usernames)
      }
    }
  } catch (err) {
    console.error('[LOBBY] Ошибка загрузки лобби:', err)
  }
}

onMounted(async () => {
  fetchLobbies()
  lobbiesInterval = setInterval(fetchLobbies, 5000)
})

onUnmounted(() => {
  if (lobbiesInterval) {
    clearInterval(lobbiesInterval)
  }
})
</script>

