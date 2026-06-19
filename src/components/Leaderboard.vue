<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <h1 class="text-2xl font-faero text-center tracking-wider text-black mb-2">Таблица лидеров</h1>

      <div class="flex justify-between mb-3">
        <button
          @click="$emit('close')"
          class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8]"
        >
          Назад
        </button>
      </div>

      <div v-if="loading" class="text-center py-8 text-sm opacity-70">Загрузка...</div>
      <div v-else-if="error" class="text-center py-8 text-sm text-red-600">{{ error }}</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-[#808080] text-white">
              <th class="px-2 py-1 text-left w-12">#</th>
              <th class="px-2 py-1 text-left">Игрок</th>
              <th class="px-2 py-1 text-center w-16">Побед</th>
              <th class="px-2 py-1 text-center w-16">Поражений</th>
              <th class="px-2 py-1 text-center w-20">Всего игр</th>
              <th class="px-2 py-1 text-center w-20">% побед</th>
              <th class="px-2 py-1 text-center w-16">% попаданий</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in rows"
              :key="entry.player_id"
              :class="[
                'border-b border-[#808080] hover:bg-[#e0dcd4]',
                entry.player_id === myId ? 'bg-[#c0d0e0] font-bold' : ''
              ]"
            >
              <td class="px-2 py-1">{{ entry.rank }}</td>
              <td class="px-2 py-1">{{ entry.username }}</td>
              <td class="px-2 py-1 text-center">{{ entry.wins }}</td>
              <td class="px-2 py-1 text-center">{{ entry.losses }}</td>
              <td class="px-2 py-1 text-center">{{ entry.total_games }}</td>
              <td class="px-2 py-1 text-center">{{ formatPct(entry.win_rate) }}</td>
              <td class="px-2 py-1 text-center">{{ formatPct(entry.hit_rate) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!rows.length" class="text-center py-4 text-sm opacity-70">
          Пока нет сыгранных игр
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close'])

const LIMIT = 15
const top = ref([])
const myRank = ref(null)
const myId = ref(null)
const loading = ref(true)
const error = ref(null)

const rows = computed(() => {
  const list = [...top.value]
  if (myRank.value && !list.some(e => e.player_id === myRank.value.player_id)) {
    list.push({ ...myRank.value, _isExtra: true })
  }
  return list
})

const formatPct = (v) => {
  if (v == null) return '—'
  return Math.round(v) + '%'
}

onMounted(async () => {
  myId.value = localStorage.getItem('user_id')
  try {
    const data = await apiClient.getLeaderboard(LIMIT)
    top.value = data.top || []
    myRank.value = data.my_rank || null
  } catch (e) {
    error.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})
</script>
