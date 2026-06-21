<template>
  <div class="w-full max-w-xl bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 text-black font-mono shadow-[2px_2px_10px_rgba(0,0,0,0.5)] select-none animate-fade-in">

    <!-- Title bar -->
    <div class="bg-[#000080] text-white text-xs font-bold px-2 py-1 tracking-wide mb-3 flex items-center justify-between">
      <span>📜 ИСТОРИЯ МАТЧЕЙ</span>
      <button @click="$emit('close')"
        class="bg-[#d4d0c8] text-black border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] px-2 py-0.5 text-[10px] font-bold hover:bg-gray-200 active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff]">
        ← НАЗАД
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-xs text-gray-500 py-6">Загрузка...</div>

    <!-- Empty state -->
    <div v-else-if="matches.length === 0" class="text-center text-xs text-gray-500 py-6">
      Нет сыгранных матчей.
    </div>

    <!-- Match list -->
    <div v-else class="space-y-1.5">
      <div v-for="m in matches" :key="m.id"
        class="flex items-center justify-between px-2 py-1.5 border border-gray-400 bg-gray-100 text-[11px]">
        <!-- Result -->
        <span class="font-bold w-24" :class="resultColor(m.result)">
          {{ resultLabel(m.result) }}
        </span>
        <!-- Coins change -->
        <span class="font-bold w-24 text-center" :class="coinsColor(m.coins_change)">
          {{ coinsLabel(m.coins_change) }}
        </span>
        <!-- Opponent -->
        <span class="w-28 text-center text-gray-600 truncate" :title="m.opponent_name" style="font-family: Tahoma, 'MS Sans Serif', Verdana, sans-serif;">
          {{ m.opponent_name || '—' }}
        </span>
        <!-- Time -->
        <span class="w-28 text-right" style="color: #aaa;">
          {{ formatTimeAgo(m.created_at) }}
        </span>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-3 text-xs">
      <button @click="prevPage" :disabled="page <= 1"
        class="bg-[#d4d0c8] border border-t-[#fff] border-l-[#fff] border-b-[#808080] border-r-[#808080] px-2 py-0.5 font-bold disabled:opacity-40 active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#fff] active:border-r-[#fff]">
        ←
      </button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages"
        class="bg-[#d4d0c8] border border-t-[#fff] border-l-[#fff] border-b-[#808080] border-r-[#808080] px-2 py-0.5 font-bold disabled:opacity-40 active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#fff] active:border-r-[#fff]">
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close'])

const matches = ref([])
const total = ref(0)
const page = ref(1)
const limit = 20
const loading = ref(true)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const fetchHistory = async () => {
  loading.value = true
  try {
    const data = await apiClient.getMatchHistory(page.value, limit)
    matches.value = data.matches || []
    total.value = data.total || 0
  } catch (e) {
    console.error('Failed to load match history:', e)
  } finally {
    loading.value = false
  }
}

const prevPage = () => { if (page.value > 1) { page.value--; fetchHistory() } }
const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchHistory() } }

const resultLabel = (r) => {
  if (r === 'win') return 'Победа'
  if (r === 'loss') return 'Поражение'
  return 'Ничья'
}

const resultColor = (r) => {
  if (r === 'win') return 'text-green-700'
  if (r === 'loss') return 'text-red-700'
  return 'text-gray-500'
}

const coinsLabel = (c) => {
  if (c > 0) return `+${c}`
  return String(c)
}

const coinsColor = (c) => {
  if (c > 0) return 'text-green-700'
  if (c < 0) return 'text-red-700'
  return 'text-gray-500'
}

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин. назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч. назад`
  const days = Math.floor(hours / 24)
  return `${days} дн. назад`
}

onMounted(fetchHistory)
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
</style>
