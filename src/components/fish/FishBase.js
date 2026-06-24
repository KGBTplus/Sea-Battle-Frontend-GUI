export default class FishBase {
  constructor(containerEl, fishId, imageUrl) {
    this.container = containerEl
    this.fishId = fishId
    this.imageUrl = imageUrl
    this.el = null
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.width = 100
    this.height = 60
    this.rotation = 0
    this.scale = 1
    this.opacity = 1
    this.active = true
    this.clickable = true
    this.respawnTimer = null
    this.onClickCallback = null

    this.createEl()
  }

  createEl() {
    this.el = document.createElement('div')
    this.el.style.position = 'fixed'
    this.el.style.zIndex = '99'
    this.el.style.cursor = 'pointer'
    this.el.style.pointerEvents = 'auto'
    this.el.style.width = this.width + 'px'
    this.el.style.height = this.height + 'px'
    this.el.style.willChange = 'transform'
    this.el.addEventListener('click', (e) => {
      e.stopPropagation()
      if (this.clickable && this.active && this.onClickCallback) {
        this.onClick()
      }
    })
    const img = document.createElement('img')
    img.src = this.imageUrl
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'contain'
    img.draggable = false
    this.el.appendChild(img)
    this.container.appendChild(this.el)
    this.syncTransform()
  }

  syncTransform() {
    if (!this.el) return
    this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${this.scale})`
    this.el.style.opacity = this.opacity
  }

  onClick() {
    if (this.onClickCallback) this.onClickCallback()
  }

  update(dt) {}

  startRespawn(minMs, maxMs) {
    const delay = minMs + Math.random() * (maxMs - minMs)
    this.respawnTimer = setTimeout(() => {
      this.respawn()
    }, delay)
  }

  respawn() {
    this.active = true
    this.opacity = 1
    this.scale = 1
    this.rotation = 0
    this.clickable = true
    if (this.el) this.el.style.display = 'block'
    this.syncTransform()
  }

  hide() {
    this.active = false
    if (this.el) this.el.style.display = 'none'
  }

  destroy() {
    if (this.respawnTimer) {
      clearTimeout(this.respawnTimer)
      this.respawnTimer = null
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el)
    }
    this.el = null
  }

  setOnClick(cb) {
    this.onClickCallback = cb
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
    this.syncTransform()
  }

  setRotation(deg) {
    this.rotation = deg
    this.syncTransform()
  }

  setScale(s) {
    this.scale = s
    this.syncTransform()
  }
}
