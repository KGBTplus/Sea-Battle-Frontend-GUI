<template>
  <div class="w-full max-w-xl bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black font-mono shadow-[2px_2px_10px_rgba(0,0,0,0.5)] select-none">
    
    <div class="bg-[#000080] text-white p-1 px-2 flex justify-between items-center text-xs font-bold font-sans tracking-wide">
      <span>🛰️ BATTLE_LOBBY_EXPLORER.EXE</span>
      <button @click="$emit('logout')" class="bg-[#d4d0c8] text-black border px-1.5 py-0.5 hover:bg-gray-200 active:border-inset text-[10px]">
        LOGOUT
      </button>
    </div>

    <div class="p-3 bg-gray-100 border border-gray-400 my-3 text-xs leading-relaxed">
      <p class="font-bold text-blue-900">Командир: <span class="text-black bg-yellow-200 px-1">{{ username }}</span></p>
      <p class="text-gray-600 mt-1">Система переведена на автоматический радарный матчмейкинг. Нажмите кнопку ниже для подключения к глобальной сети поиска соперника.</p>
    </div>

    <div v-if="lobbyError" class="bg-red-100 border-2 border-red-600 text-red-800 p-2 text-xs font-bold mb-3 uppercase tracking-tight">
      ⚠️ {{ lobbyError }}
    </div>

    <div class="space-y-4">
      <button 
        @click="startMatchmaking" 
        class="w-full py-5 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#000] border-r-[#000] active:border-t-[#000] active:border-l-[#000] active:border-b-[#fff] active:border-r-[#fff] font-bold text-base tracking-widest hover:bg-gray-50 text-emerald-800"
      >
        🎯 НАЧАТЬ ПОИСК СОПЕРНИКА
      </button>

      <div class="border-2 border-t-[#808080] border-l-[#808080] border-b-[#fff] border-r-[#fff] bg-white p-3 min-h-[120px] flex flex-col justify-center items-center text-center">
        <div class="text-gray-400 text-xs font-mono space-y-1">
          <p class="text-gray-500 font-bold">СВЯЗЬ С СЕРВЕРОМ: <span class="text-green-600">ONLINE</span></p>
          <p>Протокол матчмейкинга: WebSocket-Secure (WSS)</p>
          <p class="text-[10px] text-gray-400 mt-2">Готовность к развертыванию боевого интерфейса 100%</p>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  username: { type: String, default: 'CyberCommander' }
})

const emit = defineEmits(['game-ready', 'logout'])
const lobbyError = ref('')

// Функция запуска матчмейкинга
const startMatchmaking = () => {
  lobbyError.value = ''
  
  // Передаем пустую строку наверх в родительский компонент. 
  // Родитель увидит событие и смонтирует GameBoard.vue с пустым gameId,
  // а GameBoard.vue при монтировании запустит сокет и поймает реальный game_id.
  emit('game-ready', '')
}
</script>