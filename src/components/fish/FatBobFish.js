import FishBase from './FishBase.js'
import { playSpin } from './FishSounds.js'

export default class FatBobFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'fat_bob_fish', imageUrl)
    this.speed = 90 + Math.random() * 40
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.bobAmplitude = 15 + Math.random() * 15
    this.bobSpeed = 4 + Math.random() * 2
    this.time = Math.random() * Math.PI * 2
    this.x = this.direction > 0 ? -this.width : window.innerWidth
    this.y = 100 + Math.random() * (window.innerHeight - 200)
    this.baseY = this.y
    this.state = 'swimming'
    this.stateTimer = 0
    this.syncTransform()
  }

  onClick() {
    if (this.state !== 'swimming') return
    this.state = 'spinning'
    this.stateTimer = 0
    this.vx = this.speed * this.direction
    this.speed = Math.abs(this.vx)
    playSpin()
  }

  update(dt) {
    if (!this.active) return
    const w = window.innerWidth

    switch (this.state) {
      case 'swimming': {
        this.time += dt
        this.x += this.speed * this.direction * dt
        this.y = this.baseY + Math.sin(this.time * this.bobSpeed) * this.bobAmplitude

        if (this.direction > 0 && this.x > w + this.width) {
          this.x = -this.width
          this.y = 100 + Math.random() * (window.innerHeight - 200)
          this.baseY = this.y
        }
        if (this.direction < 0 && this.x < -this.width) {
          this.x = w + this.width
          this.y = 100 + Math.random() * (window.innerHeight - 200)
          this.baseY = this.y
        }
        break
      }
      case 'spinning': {
        this.stateTimer += dt
        this.rotation += 360 * 3 * dt
        if (this.stateTimer >= 1) {
          this.rotation = 0
          this.state = 'swimming'
          this.stateTimer = 0
          this.x += this.vx * dt
        }
        break
      }
    }

    this.syncTransform()
  }
}
