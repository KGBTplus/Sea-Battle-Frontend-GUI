<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-4 font-mono text-black select-none shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6)]">
      <div class="flex justify-between items-center mb-3">
        <h1 class="text-2xl font-faero tracking-wider text-black">🛒 Магазин рыбок</h1>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold">💰 {{ coins }} монет</span>
          <button @click="$emit('close')" class="px-4 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-sm font-bold hover:bg-[#c0bdb8]">
            Назад
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8 text-sm opacity-70">Загрузка магазина...</div>
      <div v-else-if="shopError" class="text-center py-8 text-sm text-red-600">{{ shopError }}</div>

      <template v-else>
        <div v-if="successMessage" class="bg-green-100 border-2 border-green-600 text-green-800 p-2 text-xs font-bold mb-3 uppercase">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="bg-red-100 border-2 border-red-600 text-red-800 p-2 text-xs font-bold mb-3 uppercase">
          {{ errorMessage }}
        </div>

        <div class="space-y-2">
          <div v-for="fish in shopItems" :key="fish.id"
            class="bg-gray-100 border border-gray-400 p-3 flex items-center justify-between"
            :class="{ 'opacity-50': ownedFish.has(fish.id) }">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-900/10 rounded-lg flex items-center justify-center text-lg overflow-hidden border border-gray-300">
                <img v-if="fishImage(fish.id)" :src="fishImage(fish.id)" class="w-full h-full object-contain" />
                <span v-else>🐟</span>
              </div>
              <div class="max-w-[280px]">
                <p class="font-bold text-sm">{{ fish.name }}</p>
                <p class="text-[10px] text-gray-500 leading-tight">{{ fish.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-sm font-bold">{{ fish.price }} 💰</span>
              <button v-if="!ownedFish.has(fish.id)"
                @click.stop="handleBuy(fish.id)"
                :disabled="buyingId === fish.id"
                class="px-3 py-1 bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-[#fff] active:border-r-[#fff] text-xs font-bold hover:bg-[#c0bdb8] disabled:opacity-50">
                {{ buyingId === fish.id ? '...' : 'Купить' }}
              </button>
              <span v-else class="text-xs text-green-700 font-bold">✔ Куплено</span>
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

const shopItems = ref([])
const coins = ref(0)
const ownedFish = ref(new Set())
const loading = ref(true)
const shopError = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const buyingId = ref(null)

const loadData = async () => {
  loading.value = true
  shopError.value = ''
  try {
    const [shopData, profile] = await Promise.all([
      apiClient.getShop(),
      apiClient.getProfile(),
    ])
    shopItems.value = shopData
    coins.value = profile.coins || 0
    ownedFish.value = new Set(profile.inventory || [])
  } catch (e) {
    shopError.value = e.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

const handleBuy = async (fishId) => {
  buyingId.value = fishId
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const result = await apiClient.buyFish(fishId)
    coins.value = result.coins
    ownedFish.value = new Set(result.inventory || [])
    successMessage.value = 'Рыбка куплена!'
    emit('profile-updated', { coins: result.coins, inventory: result.inventory })
  } catch (e) {
    errorMessage.value = e.message || 'Ошибка покупки'
  } finally {
    buyingId.value = null
  }
}

onMounted(loadData)
</script>
