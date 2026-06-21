<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <div class="flex justify-between items-center mb-3">
        <h1 class="text-2xl font-faero tracking-wider text-black">🎒 Инвентарь</h1>
        <button @click="$emit('close')" class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8]">
          Назад
        </button>
      </div>

      <div v-if="loading" class="text-center py-8 text-sm opacity-70">Загрузка инвентаря...</div>
      <div v-else-if="invError" class="text-center py-8 text-sm text-red-600">{{ invError }}</div>

      <template v-else>
        <div v-if="successMessage" class="bg-green-100 border-2 border-green-600 text-green-800 p-2 text-xs font-bold mb-3 uppercase">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="bg-red-100 border-2 border-red-600 text-red-800 p-2 text-xs font-bold mb-3 uppercase">
          {{ errorMessage }}
        </div>

        <div v-if="inventory.length === 0" class="text-center py-8 text-sm text-gray-500">
          У вас пока нет рыбок. Зайдите в магазин!
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs text-gray-600 mb-2">Нажмите на рыбку, чтобы выбрать/убрать из активных. Выбранные рыбки отображаются во время боя.</p>
          <div v-for="fish in inventory" :key="fish.id"
            @click="toggleFish(fish.id)"
            class="bg-gray-100 border border-gray-400 p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
            :class="{ 'border-green-500 bg-green-50': selectedFish.has(fish.id) }">
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-lg">
              🐟
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm">{{ fish.name }}</p>
              <p class="text-xs text-gray-500">ID: {{ fish.id }}</p>
            </div>
            <div v-if="selectedFish.has(fish.id)" class="text-green-700 text-sm font-bold">
              ✔ Активна
            </div>
          </div>
        </div>

        <button v-if="inventory.length > 0"
          @click="handleEquip"
          :disabled="saving"
          class="mt-4 w-full py-3 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] font-bold text-sm tracking-wider hover:bg-gray-50 text-blue-800 disabled:opacity-50">
          {{ saving ? 'Сохранение...' : '💾 Сохранить выбор' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../api/client'

const emit = defineEmits(['close', 'profile-updated'])

const shopItems = ref([])
const inventory = ref([])
const selectedFish = ref(new Set())
const loading = ref(true)
const saving = ref(false)
const invError = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const loadData = async () => {
  loading.value = true
  invError.value = ''
  try {
    const [shopData, profile] = await Promise.all([
      apiClient.getShop(),
      apiClient.getProfile(),
    ])
    const shopMap = {}
    for (const item of shopData) {
      shopMap[item.id] = item
    }
    const inv = (profile.inventory || []).map(id => shopMap[id]).filter(Boolean)
    inventory.value = inv
    selectedFish.value = new Set(profile.active_fish || [])
  } catch (e) {
    invError.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

const toggleFish = (id) => {
  const next = new Set(selectedFish.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedFish.value = next
}

const handleEquip = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const result = await apiClient.equipFish([...selectedFish.value])
    selectedFish.value = new Set(result.active_fish || [])
    successMessage.value = 'Выбор сохранён!'
    emit('profile-updated', { active_fish: result.active_fish })
  } catch (e) {
    errorMessage.value = e.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>
