<template>
  <div class="w-full flex flex-col items-center gap-4">
    
    <div class="w-full max-w-3xl bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black font-mono shadow-[2px_2px_10px_rgba(0,0,0,0.5)] select-none">
      
      <div class="bg-[#000080] text-white p-1 px-2 flex justify-between items-center text-xs font-bold font-sans tracking-wide">
        <span>🛰️ BATTLE_LOBBY_EXPLORER.EXE</span>
        <div class="flex gap-1">
          <button @click="$emit('show-profile')" class="bg-[#d4d0c8] text-black border px-1.5 py-0.5 hover:bg-gray-200 active:border-inset text-[10px]">
            👤 ПРОФИЛЬ
          </button>
          <button @click="$emit('show-leaderboard')" class="bg-[#d4d0c8] text-black border px-1.5 py-0.5 hover:bg-gray-200 active:border-inset text-[10px]">
            🏆 ЛИДЕРЫ
          </button>
          <button @click="$emit('logout')" class="bg-[#d4d0c8] text-black border px-1.5 py-0.5 hover:bg-gray-200 active:border-inset text-[10px]">
            LOGOUT
          </button>
        </div>
      </div>

      <div class="p-3 bg-gray-100 border border-gray-400 my-3 text-xs leading-relaxed">
        <p class="font-bold text-blue-900">Командир: <span class="text-black bg-yellow-200 px-1">{{ username }}</span></p>
        <p class="text-gray-600 mt-1">Система переведена на автоматический радарный матчмейкинг. Нажмите кнопку ниже для подключения к глобальной сети поиска соперника.</p>
      </div>

      <div v-if="lobbyError" class="bg-red-100 border-2 border-red-600 text-red-800 p-2 text-xs font-bold mb-3 uppercase tracking-tight">
        ⚠️ {{ lobbyError }}
      </div>

      <div class="flex items-center gap-2 my-3">
        <button 
          @click="startMatchmaking" 
          class="flex-1 py-4 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] font-bold text-sm tracking-widest hover:bg-gray-50 text-emerald-800"
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
      
    </div>

    <div v-if="lobbies.length > 0" class="w-full max-w-3xl border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-[#d4d0c8]">
      <div class="bg-[#000080] text-white text-xs font-bold px-2 py-1 tracking-wide">АКТИВНЫЕ ЛОББИ</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-gray-300 text-left">
              <th class="px-2 py-1 border-r border-b border-gray-400">Создатель</th>
              <th class="px-2 py-1 border-r border-b border-gray-400">Игроки</th>
              <th class="px-2 py-1 border-r border-b border-gray-400">Статус</th>
              <th class="px-2 py-1 border-b border-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lobby in lobbies" :key="lobby.id" class="hover:bg-gray-200">
              <td class="px-2 py-1.5 border-r border-b border-gray-300">{{ lobby.creator_name || '—' }}</td>
              <td class="px-2 py-1.5 border-r border-b border-gray-300">{{ lobby.usernames ? lobby.usernames.length : 0 }} / {{ lobby.max_players }}</td>
              <td class="px-2 py-1.5 border-r border-b border-gray-300">
                <span :class="lobby.status === 'waiting' ? 'text-green-700 font-bold' : 'text-gray-500'">{{ lobby.status === 'waiting' ? 'ожидание' : lobby.status }}</span>
              </td>
              <td class="px-2 py-1.5 border-b border-gray-300">
                <button v-if="lobby.status === 'waiting'"
                  @click="joinLobby(lobby.id)"
                  class="bg-[#d4d0c8] border border-t-[#fff] border-l-[#fff] border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#fff] active:border-r-[#fff] px-2 py-0.5 text-[10px] font-bold hover:bg-gray-100">
                  ПРИСОЕДИНИТЬСЯ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="w-full max-w-3xl border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-[#d4d0c8]">
      <div class="bg-[#000080] text-white text-xs font-bold px-2 py-1 tracking-wide">АКТИВНЫЕ ЛОББИ</div>
      <div class="px-2 py-3 text-xs text-gray-500 text-center">Нет активных лобби. Создайте своё или начните поиск соперника.</div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiClient } from '../api/client'

const props = defineProps({
  username: { type: String, default: 'CyberCommander' }
})

const emit = defineEmits(['game-ready', 'logout', 'show-leaderboard', 'show-profile'])
const lobbyError = ref('')
const lobbies = ref([])
let lobbiesInterval = null

const startMatchmaking = () => {
  lobbyError.value = ''
  emit('game-ready', '')
}

const creating = ref(false)
const createNewLobby = async () => {
  if (creating.value) return
  creating.value = true
  lobbyError.value = ''
  try {
    await apiClient.createLobby({ max_players: 2 })
    emit('game-ready', 'LOBBY_WAIT')
  } catch (err) {
    lobbyError.value = err.message || 'Ошибка создания лобби'
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
    const activeGames = await apiClient.getActiveGame()
    if (activeGames && activeGames.length > 0) {
      const game = activeGames[0]
      emit('game-ready', game.id || '')
    }
  } catch (err) {
    console.error('Ошибка загрузки лобби:', err)
  }
}

onMounted(async () => {
  try {
    const activeGames = await apiClient.getActiveGame()
    if (activeGames && activeGames.length > 0) {
      const game = activeGames[0]
      emit('game-ready', game.id || '')
      return
    }
  } catch (_) {}
  fetchLobbies()
  lobbiesInterval = setInterval(fetchLobbies, 2000)
})

onUnmounted(() => {
  if (lobbiesInterval) {
    clearInterval(lobbiesInterval)
  }
})
</script>

