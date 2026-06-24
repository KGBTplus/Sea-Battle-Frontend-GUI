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

        <div v-if="inventory.length === 0" class="text-center py-8 text-sm text-gray-500">
          У вас пока нет рыбок. Зайдите в магазин!
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs text-gray-600 mb-2">Нажмите на рыбку, чтобы включить/выключить. Изменения применяются сразу.</p>
          <div v-for="fish in inventory" :key="fish.id"
            @click="handleToggle(fish)"
            class="bg-gray-100 border border-gray-400 p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
            :class="{ 'border-green-500 bg-green-50': fish.active }">
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-lg overflow-hidden">
              <img v-if="fishImage(fish.id)" :src="fishImage(fish.id)" class="w-full h-full object-contain" />
              <span v-else>🐟</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm">{{ fish.name }}</p>
              <p class="text-xs text-gray-500">{{ fish.price }}💰</p>
            </div>
            <div class="flex items-center gap-2">
              <div v-if="togglingId === fish.id" class="text-xs text-blue-600">...</div>
              <div v-else class="relative w-10 h-5 rounded-full border-2 cursor-pointer"
                   :class="fish.active ? 'bg-green-400 border-green-600' : 'bg-gray-300 border-gray-500'">
                <div class="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200"
                     :class="fish.active ? 'left-[18px]' : 'left-[2px]'"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../api/client'

import dvdImg from '../assets/images/fish/dvd_fish.png'
import fuguImg from '../assets/images/fish/fugu_fish.png'
import edImg from '../assets/images/fish/ed_kichigin_fish.png'
import bobImg from '../assets/images/fish/fat_bob_fish.png'
import octoImg from '../assets/images/fish/octopus_fish.png'
import sharkImg from '../assets/images/fish/shark_fish.png'
import anglerImg from '../assets/images/fish/angler_fish.png'
import salmonImg from '../assets/images/fish/salmon_fish.png'

const fishImages = {
  dvd_fish: dvdImg,
  fugu_fish: fuguImg,
  ed_kichigin_fish: edImg,
  fat_bob_fish: bobImg,
  octopus_fish: octoImg,
  shark_fish: sharkImg,
  angler_fish: anglerImg,
  salmon_fish: salmonImg,
}

const fishImage = (id) => fishImages[id] || null

const emit = defineEmits(['close', 'profile-updated'])

const inventory = ref([])
const loading = ref(true)
const togglingId = ref(null)
const invError = ref('')
const successMessage = ref('')

const loadData = async () => {
  loading.value = true
  invError.value = ''
  try {
    const data = await apiClient.getInventory()
    inventory.value = data.inventory || []
  } catch (e) {
    invError.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

const handleToggle = async (fish) => {
  togglingId.value = fish.id
  successMessage.value = ''
  try {
    const result = await apiClient.toggleFish(fish.id, !fish.active)
    fish.active = !fish.active
    emit('profile-updated', { active_fish: result.active_fish })
  } catch (e) {
    invError.value = e.message || 'Ошибка переключения'
  } finally {
    togglingId.value = null
  }
}

onMounted(loadData)
</script>
