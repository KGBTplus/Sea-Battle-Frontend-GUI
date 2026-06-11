<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
    
    <video
      ref="videoRef" 
      autoplay 
      muted 
      playsinline 
      class="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
    />

    <div class="relative z-10 w-full flex flex-col items-center justify-center min-h-[400px]">
      
      <div 
        v-if="isStartScreen" 
        @click="startApp"
        class="cursor-pointer group select-none flex flex-col items-center justify-center space-y-4 animate-pulse-slow"
      >
        <h1 class="text-7xl font-faero text-center tracking-widest px-4 py-2 
                  text-white 
                  [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]
                  transition-all duration-500
                  group-hover:scale-105">
          Sea battle
        </h1>
        
        <p class="font-mono text-xs text-white
                  [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]
                  transition-opacity duration-300
                  group-hover:opacity-100 opacity-90">
          [ Нажмите на надпись, чтобы начать ]
        </p>
      </div>

      <div v-else class="w-full flex flex-col items-center animate-fade-in">
        <div class="w-full max-w-md bg-[#d4d0c8] border-2 border-t-[#fff] border-l-[#fff] border-b-[#404040] border-r-[#404040] p-3 mb-6 font-mono text-black select-none
          shadow-[1px_1px_0_0_#000,inset_0_12px_16px_-6px_rgba(255,255,255,0.6),inset_0_-12px_12px_-6px_rgba(0,0,0,0.4)]">
          <h1 class="text-4xl font-faero text-center tracking-wider text-black">
            Sea battle
          </h1>
        </div>
        <AuthForm @close="isStartScreen = true" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AuthForm from './components/AuthForm.vue'
import Hls from 'hls.js'

const isStartScreen = ref(true)
const videoRef = ref(null)
let hlsInstance = null

const streamUrl = '/stream/playlist.m3u8'

const startApp = () => {
  isStartScreen.value = false
}

onMounted(async () => {
  await nextTick()
  const video = videoRef.value
  if (!video) return

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      maxMaxBufferLength: 10,
      enableWorker: true,
      lowLatencyMode: true
    })
    
    hlsInstance.loadSource(streamUrl)
    hlsInstance.attachMedia(video)
    
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.warn("Автозапуск ожидает клика:", err))
    })

    // Поскольку ENDLIST из файла удален, плеер не блокируется.
    // Принудительно возвращаем видео на начало за 0.3 сек до завершения сегментов.
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        video.currentTime = 0
        video.play().catch(() => {})
      }
    })

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Безупречный нативный loop для Safari
    video.src = streamUrl
    video.loop = true
    video.play().catch(() => {})
  }
})

onBeforeUnmount(() => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
})
</script>

<style scoped>
@keyframes pulseSlow {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.09); opacity: 1; }
}
.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>