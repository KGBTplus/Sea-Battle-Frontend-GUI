<template>
  <div class="w-full max-w-6xl mx-auto px-4">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-5 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <h1 class="text-3xl font-faero text-center tracking-wider text-black mb-3">Таблица лидеров</h1>

      <div class="flex justify-between items-center mb-4">
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-base font-bold hover:bg-[#c0bdb8]"
        >
          Назад
        </button>

        <div class="relative">
          <button
            @click.stop="showDropdown = !showDropdown"
            class="px-4 py-2 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8] text-left flex items-center gap-2"
          >
            <span>Сортировать по: {{ sortOptions.find(o => o.key === sortKey)?.label }}</span>
            <span class="text-xs">▼</span>
          </button>
          <div v-if="showDropdown"
            class="absolute right-0 top-full mt-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] shadow-md z-50 min-w-[240px]"
          >
            <div
              v-for="opt in sortOptions"
              :key="opt.key"
              @click="sortKey = opt.key; showDropdown = false"
              class="px-3 py-2 text-sm font-bold cursor-pointer hover:bg-[#c0bdb8] flex items-center gap-2 border-b border-gray-400 last:border-b-0"
              :class="{ 'bg-[#e0dcd4]': sortKey === opt.key }"
            >
              <span class="w-5 text-center">{{ sortKey === opt.key ? '✔' : '' }}</span>
              <span>{{ opt.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12 text-base opacity-70">Загрузка...</div>
      <div v-else-if="error" class="text-center py-12 text-base text-red-600">{{ error }}</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-[#808080] text-white">
              <th class="px-3 py-2 text-left w-14">#</th>
              <th class="px-3 py-2 text-left">Игрок</th>
              <th class="px-3 py-2 text-center w-20">Побед</th>
              <th class="px-3 py-2 text-center w-20">Поражений</th>
              <th class="px-3 py-2 text-center w-24">Всего игр</th>
              <th class="px-3 py-2 text-center w-24">% побед</th>
              <th class="px-3 py-2 text-center w-20">% попаданий</th>
              <th class="px-3 py-2 text-center w-24">Заработано</th>
              <th class="px-3 py-2 text-center w-24">Потрачено</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in rows"
              :key="entry.player_id"
              :class="[
                'border-b border-[#808080] hover:bg-[#e0dcd4]',
                entry.player_id === myId ? 'bg-[#f0d060] font-bold' : ''
              ]"
            >
              <td class="px-3 py-2">{{ index + 1 }}</td>
              <td class="px-3 py-2 text-base" style="font-family: Tahoma, 'MS Sans Serif', Verdana, sans-serif;">{{ entry.username }}</td>
              <td class="px-3 py-2 text-center">{{ entry.wins }}</td>
              <td class="px-3 py-2 text-center">{{ entry.losses }}</td>
              <td class="px-3 py-2 text-center">{{ entry.total_games }}</td>
              <td class="px-3 py-2 text-center">{{ formatPct(entry.win_rate) }}</td>
              <td class="px-3 py-2 text-center">{{ formatPct(entry.hit_rate) }}</td>
              <td class="px-3 py-2 text-center">{{ entry.total_earned ?? '—' }}</td>
              <td class="px-3 py-2 text-center">{{ entry.total_spent ?? '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!rows.length" class="text-center py-6 text-base opacity-70">
          Пока нет сыгранных игр
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close'])

const LIMIT = 15
const top = ref([])
const myRank = ref(null)
const myId = ref(null)
const loading = ref(true)
const error = ref(null)

const sortKey = ref('wins')
const showDropdown = ref(false)

const sortOptions = [
  { key: 'wins', label: 'Количество побед' },
  { key: 'win_rate', label: 'Процент побед' },
  { key: 'hit_rate', label: 'Процент попаданий' },
  { key: 'losses', label: 'Количество поражений' },
  { key: 'total_games', label: 'Количество игр' },
  { key: 'total_earned', label: 'Заработано монет' },
  { key: 'total_spent', label: 'Потрачено монет' },
]

const rows = computed(() => {
  const list = [...top.value]
  if (myRank.value && !list.some(e => e.player_id === myRank.value.player_id)) {
    list.push({ ...myRank.value, _isExtra: true })
  }
  const sk = sortKey.value
  list.sort((a, b) => {
    const va = a[sk] ?? 0
    const vb = b[sk] ?? 0
    return vb - va
  })
  return list
})

const formatPct = (v) => {
  if (v == null) return '—'
  return Math.round(v) + '%'
}

const handleClickOutside = (e) => {
  if (showDropdown.value) {
    showDropdown.value = false
  }
}

onMounted(async () => {
  myId.value = localStorage.getItem('user_id')
  document.addEventListener('click', handleClickOutside)
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
