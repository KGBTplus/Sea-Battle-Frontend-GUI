import FishBase from './FishBase.js'
import { playClick } from './FishSounds.js'

export default class DVDFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'dvd_fish', imageUrl)
    this.speed = 180 + Math.random() * 40
    this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1)
    this.vy = this.speed * (Math.random() > 0.5 ? 1 : -1)
    this.x = Math.random() * (window.innerWidth - this.width)
    this.y = Math.random() * (window.innerHeight - this.height)
    this.angleHitCount = 0
    this.cornerThreshold = 5
    this.lastCornerCheck = 0
    this.syncTransform()
  }

  onClick() {
    playClick()
  }

  update(dt) {
    if (!this.active) return
    const w = window.innerWidth
    const h = window.innerHeight
    let nx = this.x + this.vx * dt
    let ny = this.y + this.vy * dt

    // Bounce off walls
    if (nx <= 0) { nx = 0; this.vx = Math.abs(this.vx); this.rotation = 0 }
    if (nx >= w - this.width) { nx = w - this.width; this.vx = -Math.abs(this.vx); this.rotation = 0 }
    if (ny <= 0) { ny = 0; this.vy = Math.abs(this.vy); this.rotation = 0 }
    if (ny >= h - this.height) { ny = h - this.height; this.vy = -Math.abs(this.vy); this.rotation = 0 }

    // Corner detection: check if close to any corner
    const corners = [
      { x: 0, y: 0 },
      { x: w - this.width, y: 0 },
      { x: 0, y: h - this.height },
      { x: w - this.width, y: h - this.height }
    ]

    for (const c of corners) {
      const dx = Math.abs(nx - c.x)
      const dy = Math.abs(ny - c.y)
      if (dx < this.cornerThreshold && dy < this.cornerThreshold) {
        this.angleHitCount++
        // Flash effect on corner hit
        if (this.el) {
          this.el.style.filter = 'brightness(2)'
          setTimeout(() => {
            if (this.el) this.el.style.filter = ''
          }, 200)
        }
        break
      }
    }

    // Slight rotation based on velocity for visual interest
    if (this.vx !== 0) {
      this.rotation = Math.atan2(this.vy, this.vx) * (180 / Math.PI)
    }

    this.x = nx
    this.y = ny
    this.syncTransform()
  }
}
