import FishBase from './FishBase.js'
import { playSharkBoost } from './FishSounds.js'

export default class SharkFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'shark_fish', imageUrl)
    this.baseSpeed = 200 + Math.random() * 60
    this.speed = this.baseSpeed
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.x = this.direction > 0 ? -this.width : window.innerWidth
    this.y = 50 + Math.random() * (window.innerHeight - 100)
    this.state = 'swimming'
    this.boostTimer = 0
    this.swimTimer = 0
    this.swimDuration = 3 + Math.random() * 3
    this.syncTransform()
  }

  onClick() {
    if (this.state !== 'swimming') return
    this.state = 'boosting'
    this.boostTimer = 0
    this.speed = this.baseSpeed * 2
    playSharkBoost()
  }

  update(dt) {
    if (!this.active) return
    const w = window.innerWidth

    switch (this.state) {
      case 'swimming': {
        this.x += this.speed * this.direction * dt
        this.swimTimer += dt
        if (this.swimTimer >= this.swimDuration) {
          this.swimTimer = 0
          this.swimDuration = 3 + Math.random() * 3
          this.direction *= -1
          this.y = 50 + Math.random() * (window.innerHeight - 100)
        }
        if (this.direction > 0 && this.x > w + this.width) {
          this.x = -this.width
          this.y = 50 + Math.random() * (window.innerHeight - 100)
        }
        if (this.direction < 0 && this.x < -this.width) {
          this.x = w + this.width
          this.y = 50 + Math.random() * (window.innerHeight - 100)
        }
        break
      }
      case 'boosting': {
        this.boostTimer += dt
        this.x += this.speed * this.direction * dt
        if (this.direction > 0 && this.x > w + this.width) {
          this.x = -this.width
        }
        if (this.direction < 0 && this.x < -this.width) {
          this.x = w + this.width
        }
        if (this.boostTimer >= 2.5) {
          this.speed = this.baseSpeed
          this.state = 'swimming'
          this.boostTimer = 0
        }
        break
      }
    }

    if (this.direction < 0) {
      this.el.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(-1)`
    } else {
      this.syncTransform()
    }
  }
}
