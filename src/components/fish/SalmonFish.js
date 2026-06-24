import FishBase from './FishBase.js'
import { playSalmonHook } from './FishSounds.js'

export default class SalmonFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'salmon_fish', imageUrl)
    this.speed = 130 + Math.random() * 40
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.x = -this.width
    this.y = 100 + Math.random() * (this.h - 200)
    this.pathTime = 0
    this.pathPoint = 0
    this.state = 'swimming'
    this.stateTimer = 0
    this.hookEl = null
    this.lineEl = null
    this.syncTransform()
  }

  onClick() {
    if (this.state !== 'swimming') return
    this.state = 'hooking'
    this.stateTimer = 0
    this.vx = this.speed
    this.prevX = this.x
    this.prevY = this.y
    playSalmonHook()
  }

  createFishingLine() {
    this.lineEl = document.createElement('div')
    this.lineEl.style.position = 'fixed'
    this.lineEl.style.top = '0'
    this.lineEl.style.left = (this.x + this.width / 2 - 1) + 'px'
    this.lineEl.style.width = '3px'
    this.lineEl.style.backgroundColor = '#888'
    this.lineEl.style.zIndex = '999'
    this.lineEl.style.pointerEvents = 'none'
    this.lineEl.style.transition = 'height 1.5s ease-in, left 1.5s ease-in'
    document.body.appendChild(this.lineEl)

    this.hookEl = document.createElement('div')
    this.hookEl.textContent = '🪝'
    this.hookEl.style.position = 'fixed'
    this.hookEl.style.fontSize = '24px'
    this.hookEl.style.zIndex = '999'
    this.hookEl.style.pointerEvents = 'none'
    this.hookEl.style.left = (this.x + this.width / 2 - 12) + 'px'
    this.hookEl.style.top = '0px'
    this.hookEl.style.transition = 'top 1.5s ease-in, left 1.5s ease-in'
    document.body.appendChild(this.hookEl)

    // Animate hook dropping
    requestAnimationFrame(() => {
      if (!this.hookEl || !this.lineEl) return
      this.hookEl.style.top = (this.y + this.height / 2) + 'px'
      this.hookEl.style.left = (this.x + this.width / 2 - 12) + 'px'
      this.lineEl.style.height = (this.y + this.height / 2) + 'px'
      this.lineEl.style.left = (this.x + this.width / 2 - 1.5) + 'px'
    })
  }

  removeFishingLine() {
    if (this.hookEl && this.hookEl.parentNode) {
      this.hookEl.parentNode.removeChild(this.hookEl)
    }
    if (this.lineEl && this.lineEl.parentNode) {
      this.lineEl.parentNode.removeChild(this.lineEl)
    }
    this.hookEl = null
    this.lineEl = null
  }

  update(dt) {
    if (!this.active) return

    switch (this.state) {
      case 'swimming': {
        this.pathTime += dt * this.speed * 0.005

        // Complex path: loops and flips
        const cx = this.x
        const cy = this.y
        this.x += Math.cos(this.pathTime * 1.5) * this.speed * dt * 0.8
        this.y += Math.sin(this.pathTime * 2.3) * this.speed * dt * 0.6 +
                  Math.sin(this.pathTime * 4.7) * this.speed * dt * 0.3

        // Periodically do a barrel roll (rotation)
        const rollPhase = (this.pathTime * 3) % (Math.PI * 2)
        if (rollPhase > Math.PI * 0.5 && rollPhase < Math.PI * 1.5) {
          this.rotation = Math.sin(rollPhase) * 360
        } else {
          const dx = this.x - cx
          const dy = this.y - cy
          this.rotation = Math.atan2(dy, dx) * (180 / Math.PI) || 0
        }

        if (this.x > this.w + this.width) { this.x = -this.width; this.y = 100 + Math.random() * (this.h - 200) }
        if (this.x < -this.width) { this.x = this.w + this.width; this.y = 100 + Math.random() * (this.h - 200) }
        if (this.y < 30) this.y = 30
        if (this.y > this.h - this.height - 30) this.y = this.h - this.height - 30
        break
      }
      case 'hooking': {
        this.stateTimer += dt
        if (this.stateTimer < 0.05) {
          this.createFishingLine()
        }
        if (this.stateTimer >= 0.05 && this.stateTimer < 1.8) {
          // Fish is being caught - slight upward movement
          this.y -= 30 * dt
          this.rotation = 0
        }
        if (this.stateTimer >= 1.8 && this.stateTimer < 2.5) {
          // Fish lifts up with hook
          this.y -= 200 * dt
          this.x += 20 * dt
          if (this.hookEl) {
            this.hookEl.style.top = this.y + 'px'
            this.hookEl.style.left = (this.x + this.width / 2 - 12) + 'px'
          }
          if (this.lineEl) {
            this.lineEl.style.height = this.y + 'px'
          }
        }
        if (this.stateTimer >= 2.5) {
          this.removeFishingLine()
          this.hide()
          this.startRespawn(12000, 12000)
        }
        break
      }
    }
    this.syncTransform()
  }

  respawn() {
    super.respawn()
    this.state = 'swimming'
    this.stateTimer = 0
    this.pathTime = Math.random() * Math.PI * 2
    this.x = -this.width
    this.y = 100 + Math.random() * (this.h - 200)
  }

  destroy() {
    this.removeFishingLine()
    super.destroy()
  }
}
