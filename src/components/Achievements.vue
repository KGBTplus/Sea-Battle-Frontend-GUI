<template>
  <div class="w-full max-w-6xl mx-auto px-4">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-5 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-faero tracking-wider text-black">🏆 Достижения</h1>
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-base font-bold hover:bg-[#c0bdb8]"
        >
          Назад
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-base opacity-70">Загрузка...</div>
      <div v-else-if="pageError" class="text-center py-12 text-base text-red-600">{{ pageError }}</div>

      <div v-else class="space-y-3">
        <div v-if="successMessage" class="bg-green-100 border-2 border-green-600 text-green-800 p-3 text-sm font-bold mb-3">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="bg-red-100 border-2 border-red-600 text-red-800 p-3 text-sm font-bold mb-3">
          {{ errorMessage }}
        </div>

        <div
          v-for="ach in achievements"
          :key="ach.id"
          class="border-2 p-4 flex items-center gap-4"
          :class="ach.completed
            ? 'border-green-600 bg-green-50'
            : 'border-gray-400 bg-gray-100 opacity-60'"
        >
          <div class="w-12 h-12 flex items-center justify-center text-3xl">
            {{ ach.completed ? '🏆' : '🔒' }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-bold text-base">{{ ach.name }}</p>
            <p class="text-sm text-gray-600">{{ ach.description }}</p>
            <p class="text-xs text-amber-700 mt-1">+{{ ach.reward_coins }} монет</p>
          </div>

          <div class="flex-shrink-0 text-right">
            <div v-if="ach.reward_claimed" class="text-green-700 font-bold text-sm">
              ✔ Получено
            </div>
            <div v-else-if="ach.completed" class="text-green-700 font-bold text-sm mb-1">
              Выполнено!
            </div>
            <div v-else class="text-gray-500 text-xs">
              Прогресс: {{ ach.progress }} / {{ ach.condition_value }}
            </div>

            <button
              v-if="ach.completed && !ach.reward_claimed"
              @click="handleClaim(ach.id)"
              :disabled="claimingId === ach.id"
              class="mt-1 px-4 py-1.5 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8] text-amber-800 disabled:opacity-50 w-full"
            >
              {{ claimingId === ach.id ? '...' : '🎁 Забрать награду' }}
            </button>
          </div>
        </div>

        <div v-if="!achievements.length" class="text-center py-6 text-base opacity-70">
          Нет доступных достижений
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close', 'balance-updated'])

const achievements = ref([])
const loading = ref(true)
const pageError = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const claimingId = ref(null)

const loadData = async () => {
  loading.value = true
  pageError.value = ''
  try {
    achievements.value = await apiClient.getAchievements()
  } catch (e) {
    pageError.value = e.message || 'Ошибка загрузки'
    achievements.value = []
  } finally {
    loading.value = false
  }
}

const handleClaim = async (achId) => {
  claimingId.value = achId
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const result = await apiClient.claimAchievement(achId)
    emit('balance-updated', result.new_balance)
    successMessage.value = `Награда получена! Баланс: ${result.new_balance} монет`
    await loadData()
  } catch (e) {
    errorMessage.value = e.message || 'Ошибка получения награды'
  } finally {
    claimingId.value = null
  }
}

onMounted(loadData)
</script>
