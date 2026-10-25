// Painters for the monitor screens. Each returns { texture, update(dt, state) };
// update() repaints only when the visible content changes.
import * as THREE from 'three'

const CODE = [
  [
    ['kw', 'import'],
    ['tx', ' { '],
    ['fn', 'extract'],
    ['tx', ' } '],
    ['kw', 'from'],
    ['st', " './ai/documents'"],
  ],
  [
    ['kw', 'import'],
    ['tx', ' { '],
    ['fn', 'ContractSchema'],
    ['tx', ' } '],
    ['kw', 'from'],
    ['st', " './schemas'"],
  ],
  [],
  [['cm', '// Contract analysis: PDF in, structured insight out']],
  [
    ['kw', 'export async function'],
    ['fn', ' analyse'],
    ['tx', '(pdf) {'],
  ],
  [
    ['tx', '  '],
    ['kw', 'const'],
    ['tx', ' text = '],
    ['kw', 'await'],
    ['fn', ' readPdf'],
    ['tx', '(pdf)'],
  ],
  [
    ['tx', '  '],
    ['kw', 'const'],
    ['tx', ' data = '],
    ['kw', 'await'],
    ['fn', ' extract'],
    ['tx', '(text, ContractSchema)'],
  ],
  [],
  [
    ['tx', '  '],
    ['kw', 'return'],
    ['tx', ' {'],
  ],
  [['tx', '    parties: data.parties,']],
  [['tx', '    renewal: data.renewalDate,']],
  [
    ['tx', '    risks: data.clauses.'],
    ['fn', 'filter'],
    ['tx', '(c => c.risk '],
    ['kw', '>'],
    ['nu', ' 0.7'],
    ['tx', '),'],
  ],
  [
    ['tx', '    summary: '],
    ['kw', 'await'],
    ['fn', ' summarise'],
    ['tx', '(data)'],
    ['tx', ','],
  ],
  [['tx', '  }']],
  [['tx', '}']],
]

const COLORS = {
  kw: '#ff6b81',
  fn: '#7cc4ff',
  st: '#5ee0a8',
  nu: '#ffd166',
  cm: '#5d6a90',
  tx: '#dfe5f7',
}

const TOTAL_CHARS = CODE.reduce((sum, line) => sum + line.reduce((n, [, t]) => n + t.length, 0) + 1, 0)

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return { canvas, ctx: canvas.getContext('2d'), texture }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

// The OS wallpaper the camera "lands" in; matches the About section background.
export function paintWallpaper(ctx, w, h, alpha) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#1b2350')
  g.addColorStop(0.55, '#121a3d')
  g.addColorStop(1, '#3a1730')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w * 0.75, h * 0.8, 0, w * 0.75, h * 0.8, w * 0.5)
  glow.addColorStop(0, 'rgba(232,54,79,0.45)')
  glow.addColorStop(1, 'rgba(232,54,79,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

export function createCodeScreen() {
  const W = 1280
  const H = 550
  const { ctx, texture } = makeCanvas(W, H)
  let typed = 0
  let caretTimer = 0
  let lastKey = ''
  let hold = 0

  function paint(chars, caretOn, wallpaper) {
    ctx.fillStyle = '#0d1226'
    ctx.fillRect(0, 0, W, H)
    // Activity bar + file tree.
    ctx.fillStyle = '#0a0e1e'
    ctx.fillRect(0, 0, 52, H)
    ctx.fillStyle = '#10162e'
    ctx.fillRect(52, 0, 210, H)
    ;['#7cc4ff', '#5d6a90', '#5d6a90', '#5d6a90'].forEach((c, i) => {
      ctx.fillStyle = c
      roundRect(ctx, 16, 22 + i * 46, 20, 20, 5)
    })
    ctx.font = '500 15px "Martian Mono Variable", monospace'
    const files = [
      ['▾ src', '#8f9bbd'],
      ['   analyse.js', '#eef1fb'],
      ['   Character.jsx', '#8f9bbd'],
      ['▾ ai', '#8f9bbd'],
      ['   assistant.js', '#8f9bbd'],
      ['▾ server', '#8f9bbd'],
      ['   api.js', '#8f9bbd'],
      ['   db.js', '#8f9bbd'],
    ]
    files.forEach(([name, color], i) => {
      if (i === 1) {
        ctx.fillStyle = 'rgba(124,196,255,0.12)'
        ctx.fillRect(52, 46 + i * 30 - 20, 210, 28)
      }
      ctx.fillStyle = color
      ctx.fillText(name, 70, 46 + i * 30)
    })
    // Tab strip.
    ctx.fillStyle = '#0a0e1e'
    ctx.fillRect(262, 0, W - 262, 40)
    ctx.fillStyle = '#0d1226'
    ctx.fillRect(262, 0, 170, 40)
    ctx.fillStyle = '#e8364f'
    ctx.fillRect(262, 0, 170, 3)
    ctx.fillStyle = '#eef1fb'
    ctx.fillText('analyse.js', 284, 26)

    // Code with syntax colours, revealed up to `chars`.
    ctx.font = '500 19px "Martian Mono Variable", monospace'
    let remaining = chars
    let caret = null
    CODE.forEach((line, row) => {
      const y = 82 + row * 27
      ctx.fillStyle = '#3c4670'
      ctx.textAlign = 'right'
      ctx.fillText(String(row + 1), 312, y)
      ctx.textAlign = 'left'
      let x = 336
      for (const [kind, text] of line) {
        if (remaining <= 0) break
        const part = text.slice(0, remaining)
        ctx.fillStyle = COLORS[kind]
        ctx.fillText(part, x, y)
        x += ctx.measureText(part).width
        remaining -= part.length
      }
      if (remaining > 0) {
        remaining -= 1
        if (remaining <= 0) caret = { x: 336, y: y + 27 }
      } else if (!caret) caret = { x, y }
    })
    if (caret && caretOn) {
      ctx.fillStyle = '#e8364f'
      ctx.fillRect(caret.x + 2, caret.y - 19, 3, 24)
    }
    // Status bar.
    ctx.fillStyle = '#e8364f'
    ctx.fillRect(0, H - 30, W, 30)
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 14px "Onest Variable", sans-serif'
    ctx.fillText('main ✓   Ln ' + Math.max(1, CODE.length) + '   React · Node · Python · AI', 16, H - 10)
    ctx.textAlign = 'right'
    ctx.fillText('saravana@studio', W - 16, H - 10)
    ctx.textAlign = 'left'
    paintWallpaper(ctx, W, H, wallpaper)
  }

  paint(0, true, 0)

  return {
    texture,
    update(dt, { typing, wallpaper }) {
      caretTimer += dt
      const caretOn = caretTimer % 1 < 0.55
      if (typing) {
        if (typed >= TOTAL_CHARS) {
          hold += dt
          if (hold > 3) {
            typed = 0
            hold = 0
          }
        } else {
          typed = Math.min(TOTAL_CHARS, typed + dt * 34)
        }
      }
      const key = `${Math.floor(typed)}|${caretOn}|${wallpaper.toFixed(2)}`
      if (key === lastKey) return
      lastKey = key
      paint(Math.floor(typed), caretOn, wallpaper)
      texture.needsUpdate = true
    },
    // Show a finished file instantly (reduced motion / skipped intro).
    complete() {
      typed = TOTAL_CHARS
    },
  }
}

// The side monitor: a team #dev-help channel cycling through coding questions
// and Saravana's answers, with inline code.
const THREADS = [
  [
    { who: 'Arun', text: 'useEffect fires twice on mount 😵 bug?' },
    { who: 'Saravana', text: 'StrictMode in dev — it mounts twice to surface side effects. Return a cleanup:' },
    { who: 'Saravana', code: 'return () => controller.abort()' },
    { who: 'Arun', text: 'Cleanup fixed it 🙌' },
  ],
  [
    { who: 'Priya', text: 'CORS error calling /api/login from the client' },
    { who: 'Saravana', text: 'Allow the client origin on the Express app:' },
    { who: 'Saravana', code: 'app.use(cors({ origin: CLIENT_URL }))' },
    { who: 'Priya', text: 'Works now, thanks!' },
  ],
  [
    { who: 'Dev', text: 'Orders query is slow on 1M docs 🐢' },
    { who: 'Saravana', text: 'Add a compound index for that filter + sort:' },
    { who: 'Saravana', code: 'createIndex({ userId: 1, createdAt: -1 })' },
    { who: 'Dev', text: '1.2s → 4ms. Wow.' },
  ],
]
const PEOPLE = { Saravana: '#e8364f', Arun: '#7cc4ff', Priya: '#5ee0a8', Dev: '#ffd166' }
const STEP = 2.4

export function createDevChatScreen() {
  const W = 360
  const H = 600
  const { ctx, texture } = makeCanvas(W, H)
  let timer = 0
  let lastKey = ''

  function wrap(text, max) {
    const words = text.split(' ')
    const lines = []
    let line = ''
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (ctx.measureText(next).width > max && line) {
        lines.push(line)
        line = word
      } else line = next
    }
    lines.push(line)
    return lines
  }

  function paint(thread, count, typing) {
    ctx.fillStyle = '#0d1226'
    ctx.fillRect(0, 0, W, H)
    // Channel header.
    ctx.fillStyle = '#10162e'
    ctx.fillRect(0, 0, W, 58)
    ctx.fillStyle = '#eef1fb'
    ctx.font = '700 19px "Syne Variable", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('# dev-help', 18, 30)
    ctx.font = '500 12px "Onest Variable", sans-serif'
    ctx.fillStyle = '#5ee0a8'
    ctx.beginPath()
    ctx.arc(22, 45, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8f9bbd'
    ctx.fillText('4 online · coding questions', 32, 49)

    let y = 78
    let previous = null
    thread.slice(0, count).forEach((message) => {
      const colour = PEOPLE[message.who]
      if (message.who !== previous) {
        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.arc(30, y + 14, 13, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0b1020'
        ctx.font = '700 13px "Onest Variable", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(message.who[0], 30, y + 19)
        ctx.textAlign = 'left'
        ctx.fillStyle = colour
        ctx.font = '700 14px "Onest Variable", sans-serif'
        ctx.fillText(message.who, 52, y + 12)
        y += 20
      }
      if (message.code) {
        ctx.font = '500 11px "Martian Mono Variable", monospace'
        const lines = wrap(message.code, W - 90)
        const h = lines.length * 17 + 14
        ctx.fillStyle = '#060a18'
        roundRect(ctx, 52, y + 2, W - 68, h, 8)
        ctx.fillStyle = '#e8364f'
        ctx.fillRect(52, y + 2, 3, h)
        ctx.fillStyle = '#5ee0a8'
        lines.forEach((l, i) => ctx.fillText(l, 64, y + 20 + i * 17))
        y += h + 10
      } else {
        ctx.font = '500 14px "Onest Variable", sans-serif'
        ctx.fillStyle = '#dfe5f7'
        const lines = wrap(message.text, W - 74)
        lines.forEach((l, i) => ctx.fillText(l, 52, y + 14 + i * 19))
        y += lines.length * 19 + 10
      }
      previous = message.who
    })
    if (typing) {
      ctx.fillStyle = '#8f9bbd'
      ctx.font = 'italic 500 12px "Onest Variable", sans-serif'
      ctx.fillText(`${typing} is typing…`, 18, H - 78)
    }
    // Composer.
    ctx.fillStyle = '#141a30'
    roundRect(ctx, 14, H - 62, W - 28, 46, 12)
    ctx.fillStyle = '#5d6a90'
    ctx.font = '500 14px "Onest Variable", sans-serif'
    ctx.fillText('Message #dev-help', 30, H - 33)
  }

  paint(THREADS[0], 0, null)

  return {
    texture,
    update(dt) {
      timer += dt
      // Each thread plays message by message, holds, then the next begins.
      const threadTime = THREADS[0].length * STEP + 3
      const index = Math.floor(timer / threadTime) % THREADS.length
      const thread = THREADS[index]
      const t = timer % threadTime
      const count = Math.min(thread.length, Math.floor(t / STEP) + 1)
      const next = thread[count]
      const typing = next && t % STEP > 1.1 ? next.who : null
      const key = `${index}|${count}|${typing}`
      if (key === lastKey) return
      lastKey = key
      paint(thread, count, typing)
      texture.needsUpdate = true
    },
  }
}
