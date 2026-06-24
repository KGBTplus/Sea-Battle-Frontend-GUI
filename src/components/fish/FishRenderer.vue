<template>
  <div ref="fishContainer" class="fish-renderer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import DVDFish from './DVDFish.js'
import FuguFish from './FuguFish.js'
import EdKichiginFish from './EdKichiginFish.js'
import FatBobFish from './FatBobFish.js'
import OctopusFish from './OctopusFish.js'
import SharkFish from './SharkFish.js'
import AnglerFish from './AnglerFish.js'
import SalmonFish from './SalmonFish.js'

import dvdImg from '../../assets/images/fish/dvd_fish.png'
import fuguImg from '../../assets/images/fish/fugu_fish.png'
import edImg from '../../assets/images/fish/ed_kichigin_fish.png'
import bobImg from '../../assets/images/fish/fat_bob_fish.png'
import octoImg from '../../assets/images/fish/octopus_fish.png'
import sharkImg from '../../assets/images/fish/shark_fish.png'
import anglerImg from '../../assets/images/fish/angler_fish.png'
import salmonImg from '../../assets/images/fish/salmon_fish.png'

const fishImageMap = {
  dvd_fish: dvdImg,
  fugu_fish: fuguImg,
  ed_kichigin_fish: edImg,
  fat_bob_fish: bobImg,
  octopus_fish: octoImg,
  shark_fish: sharkImg,
  angler_fish: anglerImg,
  salmon_fish: salmonImg,
}

const fishClassMap = {
  dvd_fish: DVDFish,
  fugu_fish: FuguFish,
  ed_kichigin_fish: EdKichiginFish,
  fat_bob_fish: FatBobFish,
  octopus_fish: OctopusFish,
  shark_fish: SharkFish,
  angler_fish: AnglerFish,
  salmon_fish: SalmonFish,
}

const props = defineProps({
  activeFishIds: {
    type: Array,
    default: () => []
  }
})

const fishContainer = ref(null)
let fishInstances = []
let animFrameId = null
let lastTime = 0

function createFish(fishId) {
  const container = fishContainer.value
  if (!container) return null
  const imgUrl = fishImageMap[fishId]
  const FishClass = fishClassMap[fishId]
  if (!imgUrl || !FishClass) return null
  return new FishClass(container, imgUrl)
}

function syncFish() {
  const currentIds = fishInstances.map(f => f.fishId)
  const targetIds = props.activeFishIds || []

  // Remove fish not in target
  for (let i = fishInstances.length - 1; i >= 0; i--) {
    if (!targetIds.includes(fishInstances[i].fishId)) {
      fishInstances[i].destroy()
      fishInstances.splice(i, 1)
    }
  }

  // Add new fish
  for (const id of targetIds) {
    if (!currentIds.includes(id)) {
      const fish = createFish(id)
      if (fish) fishInstances.push(fish)
    }
  }
}

function animate(time) {
  const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
  lastTime = time
  for (const fish of fishInstances) {
    if (fish.active) {
      fish.update(dt)
    }
  }
  animFrameId = requestAnimationFrame(animate)
}

watch(() => props.activeFishIds, () => {
  syncFish()
}, { deep: true })

onMounted(() => {
  syncFish()
  lastTime = 0
  animFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  for (const fish of fishInstances) {
    fish.destroy()
  }
  fishInstances = []
})
</script>

<style scoped>
.fish-renderer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 98;
  pointer-events: none;
}
</style>

<style>
@keyframes angler-glow-pulse {
  0% { opacity: 0.4; transform: scale(0.9); }
  100% { opacity: 0.8; transform: scale(1.1); }
}
</style>
