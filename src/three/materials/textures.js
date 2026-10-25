import * as THREE from 'three'

// Every texture in the studio is painted on a canvas at runtime: zero image
// downloads, and each one is generated once and cached for the session.
const cache = new Map()

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvasTexture(key, width, height, paint, { srgb = true, repeat = [1, 1] } = {}) {
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  paint(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(...repeat)
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

// Converts a height function into a tangent-space normal map.
function normalFromHeight(key, size, height, strength, repeat) {
  return canvasTexture(
    key,
    size,
    size,
    (ctx) => {
      const heights = new Float32Array(size * size)
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) heights[y * size + x] = height(x, y)
      }
      const image = ctx.createImageData(size, size)
      const at = (x, y) => heights[((y + size) % size) * size + ((x + size) % size)]
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (at(x + 1, y) - at(x - 1, y)) * strength
          const dy = (at(x, y + 1) - at(x, y - 1)) * strength
          const len = Math.hypot(dx, dy, 1)
          const i = (y * size + x) * 4
          image.data[i] = ((-dx / len) * 0.5 + 0.5) * 255
          image.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
          image.data[i + 2] = (1 / len) * 0.5 * 255 + 127
          image.data[i + 3] = 255
        }
      }
      ctx.putImageData(image, 0, 0)
    },
    { srgb: false, repeat },
  )
}

export function denimNormal() {
  const rand = seeded(7)
  const noise = Array.from({ length: 128 * 128 }, () => rand())
  // Diagonal twill ridges plus slub noise.
  return normalFromHeight(
    'denim-n',
    128,
    (x, y) => Math.sin(((x + y) / 128) * Math.PI * 2 * 22) * 0.6 + noise[y * 128 + x] * 0.4,
    1.6,
    [12, 12],
  )
}

export function weaveNormal() {
  const rand = seeded(11)
  const noise = Array.from({ length: 128 * 128 }, () => rand())
  return normalFromHeight(
    'weave-n',
    128,
    (x, y) =>
      Math.sin((x / 128) * Math.PI * 2 * 32) * Math.sin((y / 128) * Math.PI * 2 * 32) * 0.4 + noise[y * 128 + x] * 0.25,
    1.2,
    [5, 5],
  )
}

export function leatherNormal() {
  const rand = seeded(23)
  const noise = Array.from({ length: 128 * 128 }, () => rand())
  return normalFromHeight('leather-n', 128, (x, y) => noise[y * 128 + x], 0.9, [3, 3])
}

export function walnutTexture() {
  return canvasTexture('walnut', 1024, 256, (ctx, w, h) => {
    const rand = seeded(3)
    const base = ctx.createLinearGradient(0, 0, 0, h)
    base.addColorStop(0, '#4a2c1c')
    base.addColorStop(0.5, '#5b3622')
    base.addColorStop(1, '#43271a')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    // Long, gently waving grain lines.
    for (let i = 0; i < 140; i++) {
      const y0 = rand() * h
      const amp = 2 + rand() * 6
      const freq = 0.004 + rand() * 0.01
      ctx.strokeStyle = `rgba(${rand() > 0.5 ? '30,16,9' : '120,78,48'},${0.12 + rand() * 0.25})`
      ctx.lineWidth = 0.6 + rand() * 1.8
      ctx.beginPath()
      for (let x = 0; x <= w; x += 8) {
        const y = y0 + Math.sin(x * freq + i) * amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}

export function floorTexture() {
  return canvasTexture(
    'floor',
    1024,
    1024,
    (ctx, w, h) => {
      const rand = seeded(5)
      const plank = h / 8
      for (let row = 0; row < 8; row++) {
        let x = -rand() * 300
        while (x < w) {
          const len = 260 + rand() * 340
          const tone = 26 + rand() * 10
          ctx.fillStyle = `rgb(${tone + 8},${tone + 2},${tone - 2})`
          ctx.fillRect(x, row * plank, len, plank)
          for (let g = 0; g < 10; g++) {
            ctx.fillStyle = `rgba(0,0,0,${0.05 + rand() * 0.08})`
            ctx.fillRect(x, row * plank + rand() * plank, len, 1 + rand() * 2)
          }
          ctx.fillStyle = 'rgba(0,0,0,0.55)'
          ctx.fillRect(x, row * plank, 3, plank)
          x += len
        }
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, row * plank, w, 3)
      }
    },
    { repeat: [3, 3] },
  )
}

export function rugTexture() {
  return canvasTexture('rug', 512, 512, (ctx, w) => {
    const c = w / 2
    const rings = ['#1c2446', '#232d57', '#1a2142', '#8f2028', '#1c2446', '#2a3566', '#1a2142']
    rings.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(c, c, c * (1 - i * 0.13), 0, Math.PI * 2)
      ctx.fill()
    })
    const rand = seeded(9)
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand() * 0.035})`
      ctx.fillRect(rand() * w, rand() * w, 1.5, 1.5)
    }
  })
}

export function cityTexture() {
  return canvasTexture('city', 1024, 512, (ctx, w, h) => {
    const rand = seeded(42)
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#060a1c')
    sky.addColorStop(0.55, '#141c44')
    sky.addColorStop(1, '#3a2340')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    // Stars and moon.
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand() * 0.7})`
      ctx.fillRect(rand() * w, rand() * h * 0.5, 1.4, 1.4)
    }
    const moon = ctx.createRadialGradient(w * 0.78, h * 0.18, 0, w * 0.78, h * 0.18, 90)
    moon.addColorStop(0, 'rgba(235,240,255,1)')
    moon.addColorStop(0.18, 'rgba(220,228,255,0.95)')
    moon.addColorStop(0.22, 'rgba(160,180,255,0.25)')
    moon.addColorStop(1, 'rgba(120,140,255,0)')
    ctx.fillStyle = moon
    ctx.fillRect(0, 0, w, h)
    // Two layers of skyline with lit windows.
    const layers = [
      { color: '#0d1330', min: 0.35, max: 0.62, lit: 0.18 },
      { color: '#070b1d', min: 0.45, max: 0.85, lit: 0.3 },
    ]
    layers.forEach(({ color, min, max, lit }) => {
      let x = 0
      while (x < w) {
        const bw = 30 + rand() * 70
        const top = h * (1 - (min + rand() * (max - min)))
        ctx.fillStyle = color
        ctx.fillRect(x, top, bw, h - top)
        for (let wy = top + 8; wy < h - 6; wy += 9) {
          for (let wx = x + 5; wx < x + bw - 5; wx += 8) {
            if (rand() < lit) {
              const warm = rand() > 0.3
              ctx.fillStyle = warm
                ? `rgba(255,${200 + rand() * 40},${130 + rand() * 50},${0.5 + rand() * 0.5})`
                : `rgba(140,200,255,${0.4 + rand() * 0.4})`
              ctx.fillRect(wx, wy, 3, 4)
            }
          }
        }
        x += bw + 2
      }
    })
  })
}

export function posterTexture() {
  return canvasTexture('poster', 512, 720, (ctx, w, h) => {
    ctx.fillStyle = '#e8364f'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#0b1020'
    ctx.beginPath()
    ctx.arc(w * 0.5, h * 0.42, w * 0.34, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#eef1fb'
    ctx.font = '700 120px "Syne Variable", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ship', w / 2, h * 0.4)
    ctx.fillText('it.', w / 2, h * 0.56)
    ctx.fillStyle = '#0b1020'
    ctx.font = '500 26px "Onest Variable", sans-serif'
    ctx.fillText('build · break · learn · repeat', w / 2, h * 0.9)
  })
}

export function noteTexture(text, color) {
  return canvasTexture(`note-${text}`, 128, 128, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.font = '600 22px "Onest Variable", sans-serif'
    ctx.textAlign = 'center'
    text.split('\n').forEach((line, i) => ctx.fillText(line, w / 2, 52 + i * 28))
  })
}
