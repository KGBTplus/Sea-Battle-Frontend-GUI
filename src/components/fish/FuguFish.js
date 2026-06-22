import FishBase from './FishBase.js'
import { playFuguExplosion } from './FishSounds.js'

export default class FuguFish extends FishBase {
  constructor(container, imageUrl) {
    super(container, 'fugu_fish', imageUrl)
    this.baseSpeed = 100 + Math.random() * 60
    this.vx = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
    this.vy = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
    this.x = Math.random() * (window.innerWidth - this.width)
    this.y = Math.random() * (window.innerHeight - this.height)
    this.state = 'swimming'
    this.stateTimer = 0
    this.changeDirTimer = 0
    this.changeDirInterval = 1 + Math.random() * 2
    this.particles = []
    this.syncTransform()
  }

  onClick() {
    if (this.state !== 'swimming') return
    this.state = 'puffing'
    this.stateTimer = 0
    this.vx = 0
    this.vy = 0
    playFuguExplosion()
  }

  update(dt) {
    if (!this.active) return

    switch (this.state) {
      case 'swimming': {
        this.changeDirTimer += dt
        if (this.changeDirTimer >= this.changeDirInterval) {
          this.changeDirTimer = 0
          this.changeDirInterval = 1 + Math.random() * 2
          this.vx = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
          this.vy = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
        }
        const w = window.innerWidth
        const h = window.innerHeight
        this.x += this.vx * dt
        this.y += this.vy * dt
        if (this.x < 0 || this.x > w - this.width) { this.vx *= -1; this.x = Math.max(0, Math.min(this.x, w - this.width)) }
        if (this.y < 0 || this.y > h - this.height) { this.vy *= -1; this.y = Math.max(0, Math.min(this.y, h - this.height)) }
        if (this.vx !== 0) {
          this.rotation = Math.atan2(this.vy, this.vx) * (180 / Math.PI)
        }
        break
      }
      case 'puffing': {
        this.stateTimer += dt
        const t = this.stateTimer
        this.scale = 1 + t * 3
        if (this.scale > 3) this.scale = 3
        this.syncTransform()
        if (t >= 0.3) {
          this.state = 'exploding'
          this.stateTimer = 0
          this.spawnParticles()
        }
        break
      }
      case 'exploding': {
        this.stateTimer += dt
        this.opacity = Math.max(0, 1 - this.stateTimer * 3)

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i]
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.life -= dt
          p.vy += 200 * dt
          if (p.el) {
            p.el.style.left = p.x + 'px'
            p.el.style.top = p.y + 'px'
            p.el.style.opacity = Math.max(0, p.life / p.maxLife)
            p.el.style.transform = `scale(${p.life / p.maxLife})`
          }
          if (p.life <= 0) {
            if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el)
            this.particles.splice(i, 1)
          }
        }

        if (this.stateTimer >= 0.6) {
          this.hide()
          this.startRespawn(6000, 7000)
        }
        break
      }
    }
  }

  spawnParticles() {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const count = 20
    const colors = ['#ff4444', '#ff8800', '#ffcc00', '#ffffff', '#ff6666']
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 150 + Math.random() * 300
      const p = {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        el: null
      }
      const pel = document.createElement('div')
      pel.style.position = 'fixed'
      pel.style.width = '6px'
      pel.style.height = '6px'
      pel.style.borderRadius = '50%'
      pel.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      pel.style.pointerEvents = 'none'
      pel.style.zIndex = '999'
      pel.style.left = cx + 'px'
      pel.style.top = cy + 'px'
      document.body.appendChild(pel)
      p.el = pel
      this.particles.push(p)
    }
  }

  respawn() {
    super.respawn()
    this.state = 'swimming'
    this.stateTimer = 0
    this.particles = []
    this.x = Math.random() * (window.innerWidth - this.width)
    this.y = Math.random() * (window.innerHeight - this.height)
    this.vx = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
    this.vy = this.baseSpeed * (Math.random() > 0.5 ? 1 : -1)
  }

  destroy() {
    for (const p of this.particles) {
      if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el)
    }
    this.particles = []
    super.destroy()
  }
}
