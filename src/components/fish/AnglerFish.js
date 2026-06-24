import FishBase from './FishBase.js'

export default class AnglerFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'angler_fish', imageUrl)
    this.speed = 25 + Math.random() * 10
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.x = this.direction > 0 ? -this.width : window.innerWidth
    this.y = 100 + Math.random() * (window.innerHeight - 200)
    this.verticalDrift = (Math.random() - 0.5) * 20
    this.syncTransform()
  }

  onClick() {
  }

  update(dt) {
    if (!this.active) return
    const w = window.innerWidth
    const h = window.innerHeight

    this.x += this.speed * this.direction * dt
    this.y += this.verticalDrift * dt
    this.rotation = this.verticalDrift * 0.5

    if (this.y < 20 || this.y > h - this.height - 20) {
      this.verticalDrift *= -1
    }

    if (this.direction > 0 && this.x > w + this.width) {
      this.direction = -1
      this.x = w + this.width
      this.y = 100 + Math.random() * (h - 200)
      this.verticalDrift = (Math.random() - 0.5) * 20
    }
    if (this.direction < 0 && this.x < -this.width * 2) {
      this.direction = 1
      this.x = -this.width
      this.y = 100 + Math.random() * (h - 200)
      this.verticalDrift = (Math.random() - 0.5) * 20
    }

    this.syncTransform()
  }
}
