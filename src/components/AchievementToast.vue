<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="fixed top-4 right-4 z-[9999] max-w-sm bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-4 font-mono text-black select-none shadow-[2px_2px_10px_rgba(0,0,0,0.5)]"
    >
      <div class="flex items-start gap-3">
        <div class="text-3xl">🏆</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm text-green-800">Вы заработали достижение!</p>
          <p class="font-bold text-base mt-1">{{ achievement.name }}</p>
          <p class="text-xs text-gray-600 mt-1">{{ achievement.description }}</p>
          <p class="text-xs text-amber-700 mt-1">+{{ achievement.reward_coins }} монет</p>
        </div>
        <button
          @click="dismiss"
          class="text-gray-500 hover:text-black text-lg leading-none flex-shrink-0"
        >✕</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  achievement: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timer = null

const dismiss = () => {
  visible.value = false
  if (timer) clearTimeout(timer)
  emit('close')
}

watch(() => props.achievement, (val) => {
  if (timer) clearTimeout(timer)
  if (val) {
    visible.value = true
    timer = setTimeout(() => {
      visible.value = false
      emit('close')
    }, 8000)
  } else {
    visible.value = false
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.toast-enter-active {
  animation: slideInRight 0.4s ease-out;
}
.toast-leave-active {
  animation: fadeOut 0.3s ease-in forwards;
}

@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; transform: translateX(30%); }
}
</style>
