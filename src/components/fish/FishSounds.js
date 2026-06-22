let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playClick() {
  try {
    const ctx = getCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 520
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.08)
  } catch {}
}

export function playFuguExplosion() {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * 0.35
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 3000
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start()
  } catch {}
}

export function playSharkBoost() {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * 0.25
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(500, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + 0.25)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start()
  } catch {}
}

export function playSpin() {
  try {
    const ctx = getCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(300, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3)
    o.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.6)
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.6)
  } catch {}
}

export function playAnglerGlow() {
  try {
    const ctx = getCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 1200
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.setValueAtTime(0.08, ctx.currentTime + 0.1)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.4)
  } catch {}
}

export function playSalmonHook() {
  try {
    const ctx = getCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(400, ctx.currentTime)
    o.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1.5)
    g.gain.setValueAtTime(0.1, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.8)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 1.5)
  } catch {}
}
