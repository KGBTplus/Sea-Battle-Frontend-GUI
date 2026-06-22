import FishBase from './FishBase.js'
import { playClick } from './FishSounds.js'

export default class OctopusFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'octopus_fish', imageUrl)
    this.speed = 60 + Math.random() * 30
    this.x = 50 + Math.random() * (window.innerWidth - this.width - 100)
    this.y = -this.height
    this.tentaclePhase = 0
    this.tentacleSpeed = 3 + Math.random() * 2
    this.moveDown = true
    this.syncTransform()
    this.createTentacles()
  }

  createTentacles() {
    if (!this.el) return
    for (let i = 0; i < 6; i++) {
      const tent = document.createElement('div')
      tent.style.position = 'absolute'
      tent.style.bottom = '-20px'
      tent.style.left = (10 + i * 14) + 'px'
      tent.style.width = '6px'
      tent.style.height = '20px'
      tent.style.borderRadius = '0 0 3px 3px'
      tent.style.opacity = '0.7'
      tent.style.transformOrigin = 'top center'
      tent.style.transition = 'transform 0.15s ease'
      const hue = 200 + i * 10
      tent.style.backgroundColor = `hsl(${hue}, 60%, 50%)`
      this.tentacles = this.tentacles || []
      this.tentacles.push(tent)
      this.el.appendChild(tent)
    }
  }

  onClick() {
    playClick()
  }

  update(dt) {
    if (!this.active) return
    const h = window.innerHeight

    this.tentaclePhase += dt * this.tentacleSpeed

    if (this.moveDown) {
      this.y += this.speed * dt
      if (this.y >= h - this.height - 60) {
        this.moveDown = false
      }
    } else {
      this.y -= this.speed * dt
      if (this.y <= 20) {
        this.moveDown = true
      }
    }

    // Animate tentacles
    if (this.tentacles) {
      this.tentacles.forEach((tent, i) => {
        const angle = Math.sin(this.tentaclePhase + i * 0.8) * 25
        tent.style.transform = `rotate(${angle}deg)`
      })
    }

    this.syncTransform()
  }

  destroy() {
    this.tentacles = []
    super.destroy()
  }
}
