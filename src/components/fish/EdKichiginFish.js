import FishBase from './FishBase.js'
import { playClick } from './FishSounds.js'

export default class EdKichiginFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'ed_kichigin_fish', imageUrl)
    this.speed = 140 + Math.random() * 40
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.segmentLength = 200 + Math.random() * 200
    this.segmentProgress = 0
    this.x = this.direction > 0 ? -this.width : window.innerWidth
    this.targetY = window.innerHeight / 2 + (Math.random() - 0.5) * (window.innerHeight * 0.25)
    this.y = this.targetY
    this.syncTransform()
  }

  onClick() {
    playClick()
  }

  pickTargetY() {
    const h = window.innerHeight
    const margin = h * 0.15
    const range = h * 0.6
    this.targetY = margin + Math.random() * range
  }

  update(dt) {
    if (!this.active) return
    const w = window.innerWidth
    const h = window.innerHeight

    this.x += this.speed * this.direction * dt
    this.segmentProgress += this.speed * dt

    const dy = this.targetY - this.y
    const dist = Math.abs(dy)
    if (dist > 1) {
      const step = this.speed * 1.5 * dt
      this.y += Math.sign(dy) * Math.min(step, dist)
    }

    if (this.segmentProgress >= this.segmentLength) {
      this.segmentProgress = 0
      this.segmentLength = 200 + Math.random() * 200
      this.pickTargetY()
    }

    if (Math.abs(dy) > 5) {
      this.rotation = Math.sign(dy) * 25
    } else {
      this.rotation = 0
    }

    if (this.direction > 0 && this.x > w + this.width) {
      this.x = -this.width
      this.y = 100 + Math.random() * (h - 200)
      this.targetY = this.y
      this.segmentProgress = 0
      this.segmentLength = 200 + Math.random() * 200
    }
    if (this.direction < 0 && this.x < -this.width * 2) {
      this.x = w + this.width
      this.y = 100 + Math.random() * (h - 200)
      this.targetY = this.y
      this.segmentProgress = 0
      this.segmentLength = 200 + Math.random() * 200
    }

    this.syncTransform()
  }
}
