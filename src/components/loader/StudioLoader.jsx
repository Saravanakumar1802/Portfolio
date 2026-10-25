import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { studio, useStudio } from '../../lib/store'

// Loader: an isometric CSS-3D model of the studio assembles itself while the
// real 3D scene loads, lights up at 100%, and the camera dives into it.
//
// Everything that moves is a CSS transform/opacity animation, which the
// browser runs on the compositor — so the loader keeps gliding even while the
// main thread is busy parsing three.js or uploading the scene to the GPU.
// React only re-renders on milestones, never per frame.

const STEPS = [
  [0, 'Pouring the floor…'],
  [0.15, 'Raising the walls…'],
  [0.35, 'Building the desk…'],
  [0.55, 'Plugging in the monitors…'],
  [0.7, 'Waking Saravana up…'],
  [0.9, 'Warming up the GPU…'],
]
// Pieces up to AUTO_UNTIL assemble on a fixed schedule over BUILD_TIME; the
// rest wait for real progress (the character drops in once the model loads).
const AUTO_UNTIL = 0.62
const BUILD_TIME = 2000
const DROP_TIME = 900
const LATE_STAGGER = 90
// Lights-on hold, then the dive; the page takes over partway through it.
const LIT_HOLD = 750
const REVEAL_DELAY = 450
const SAFETY_TIMEOUT = 20000

// A face colour lit from the north-west: > 1 lightens, < 1 darkens.
const shaded = (color, shade) =>
  shade >= 1
    ? `color-mix(in srgb, ${color} ${Math.round((2 - shade) * 100)}%, white)`
    : `color-mix(in srgb, ${color} ${Math.round(shade * 100)}%, black)`

// A solid box in the floor plane (x right, y toward the viewer, z up).
// Faces: top + the four sides, each shaded for a fixed light from the north-west.
function Box({ x, y, z = 0, w, d, h, color, at, className = '', faces = {} }) {
  const face = (name, style, shade) => (
    <div
      className={`iso-face ${faces[name]?.className ?? ''}`}
      style={{ ...style, background: faces[name]?.background ?? shaded(color, shade) }}
    >
      {faces[name]?.children}
    </div>
  )
  return (
    <Drop at={at}>
      <div
        className={`iso-box ${className}`}
        style={{ left: x, top: y, width: w, height: d, transform: `translateZ(${z}px)` }}
      >
        {face('top', { width: w, height: d, transform: `translateZ(${h}px)` }, 1.15)}
        {face(
          'south',
          { width: w, height: h, top: d - h, transformOrigin: 'bottom', transform: 'rotateX(-90deg)' },
          0.82,
        )}
        {face('north', { width: w, height: h, top: 0, transformOrigin: 'top', transform: 'rotateX(90deg)' }, 0.6)}
        {face(
          'east',
          { width: h, height: d, left: w - h, transformOrigin: 'right', transform: 'rotateY(90deg)' },
          0.68,
        )}
        {face('west', { width: h, height: d, left: 0, transformOrigin: 'left', transform: 'rotateY(-90deg)' }, 0.95)}
      </div>
    </Drop>
  )
}

// Pieces fall in from above. The wrapper has no transform of its own, so the
// drop animation never disturbs the piece's 3D placement (and no opacity:
// that would flatten the 3D context).
function Drop({ at, children }) {
  return (
    <div className="iso-drop" data-at={at}>
      {children}
    </div>
  )
}

// Mini honeycomb for the back wall (rows of 4-5-6-5-4, like the 3D one).
const HEXES = [4, 5, 6, 5, 4].flatMap((count, row) =>
  Array.from({ length: count }, (_, i) => [
    56 + (i - (count - 1) / 2) * 13,
    52 - row * 11.5,
    (row === 0 && i === 2) || (row === 1 && i === 2) || (row === 2 && i === 3) || (row === 3 && i === 3),
  ]),
)

function Studio() {
  return (
    <div className="iso-scene">
      <div className="iso-flat iso-shadow" />
      {/* Floor + walls */}
      <Box at={0} x={0} y={0} w={260} d={260} h={12} color="#1a2140" faces={{ top: { className: 'iso-floor' } }} />
      <Box
        at={0.12}
        x={0}
        y={0}
        w={260}
        d={10}
        h={160}
        z={12}
        color="#1b2242"
        faces={{
          south: {
            children: (
              <>
                <span className="iso-hexes">
                  {HEXES.map(([x, y, accent], i) => (
                    <i key={i} style={{ left: x, top: y }} className={accent ? 'is-accent' : undefined} />
                  ))}
                </span>
                <span className="iso-clock" />
              </>
            ),
          },
        }}
      />
      <Box
        at={0.18}
        x={0}
        y={10}
        w={10}
        d={250}
        h={160}
        z={12}
        color="#161c38"
        faces={{ east: { className: 'iso-window-wall', children: <span className="iso-window" /> } }}
      />
      {/* Rug */}
      <Drop at={0.26}>
        <div
          className="iso-flat iso-rug"
          style={{ left: 120, top: 80, width: 120, height: 120, transform: 'translateZ(12.5px)' }}
        />
      </Drop>
      {/* Desk: top + legs */}
      <Box at={0.34} x={146} y={22} w={98} d={46} h={5} z={58} color="#5b3622" />
      <Box at={0.3} x={150} y={26} w={5} d={38} h={46} z={12} color="#1a1d29" />
      <Box at={0.3} x={235} y={26} w={5} d={38} h={46} z={12} color="#1a1d29" />
      {/* Monitor with a live screen */}
      <Box at={0.48} x={188} y={36} w={6} d={4} h={10} z={63} color="#141824" />
      <Box
        at={0.52}
        x={166}
        y={32}
        w={50}
        d={4}
        h={28}
        z={72}
        color="#0f1220"
        faces={{ south: { className: 'iso-screen', children: <span className="iso-code" /> } }}
      />
      <Box
        at={0.58}
        x={222}
        y={34}
        w={14}
        d={3}
        h={22}
        z={70}
        color="#0f1220"
        faces={{ south: { className: 'iso-screen iso-screen--side' } }}
      />
      <Box at={0.62} x={172} y={50} w={34} d={10} h={2} z={63} color="#e9e2d8" />
      {/* Chair */}
      <Box at={0.68} x={180} y={96} w={32} d={30} h={6} z={34} color="#1a1f36" />
      <Box at={0.7} x={180} y={124} w={32} d={6} h={52} z={38} color="#e8364f" />
      <Box at={0.66} x={193} y={108} w={5} d={5} h={22} z={12} color="#141824" />
      {/* A tiny Saravana at work: red shirt, curly black hair. */}
      <Box at={0.72} x={186} y={100} w={20} d={14} h={30} z={40} color="#9a222b" />
      <Box
        at={0.74}
        x={190}
        y={98}
        w={12}
        d={12}
        h={12}
        z={72}
        color="#b06a45"
        faces={{ top: { background: '#141012' } }}
      />
      {/* Lamp */}
      <Box at={0.76} x={152} y={30} w={3} d={3} h={30} z={63} color="#e9e2d8" />
      <Box at={0.78} x={150} y={36} w={12} d={10} h={6} z={92} color="#e8364f" className="iso-lamp" />
      {/* Plant */}
      <Box at={0.82} x={24} y={40} w={22} d={22} h={24} z={12} color="#e9e2d8" />
      <Drop at={0.84}>
        <div className="iso-plant" style={{ left: 22, top: 40, width: 22, height: 22, transform: 'translateZ(36px)' }}>
          <i />
          <i />
          <i />
          <i />
        </div>
      </Drop>
      {/* Neon sign */}
      <Drop at={0.9}>
        <div className="iso-neon" style={{ left: 60, top: 10, transform: 'translateZ(150px) rotateX(-90deg)' }}>
          &lt;/&gt;
        </div>
      </Drop>
    </div>
  )
}

export default function StudioLoader({ reducedMotion }) {
  const root = useRef(null)
  const started = useRef(0)
  const landing = useRef(0)
  const [phase, setPhase] = useState('build')
  const [clock, setClock] = useState(0)
  const [gone, setGone] = useState(false)
  const target = useStudio((s) => s.loadProgress)
  const sceneReady = useStudio((s) => s.sceneReady)

  // Take over seamlessly from the static boot splash in index.html.
  useLayoutEffect(() => {
    started.current = performance.now()
    document.getElementById('boot')?.remove()
  }, [])

  useEffect(() => {
    document.body.classList.add('is-loading')
    const safety = setTimeout(() => studio.set({ sceneReady: true, loadProgress: 1 }), SAFETY_TIMEOUT)
    return () => {
      clearTimeout(safety)
      document.body.classList.remove('is-loading')
    }
  }, [])

  // Captions follow the scheduled part of the build.
  useEffect(() => {
    const timers = STEPS.filter(([at]) => at > 0 && at <= AUTO_UNTIL).map(([at]) =>
      setTimeout(() => setClock((c) => Math.max(c, at)), reducedMotion ? 0 : at * BUILD_TIME),
    )
    return () => timers.forEach(clearTimeout)
  }, [reducedMotion])

  // Hand each piece its drop. Scheduled pieces get a CSS delay up front; late
  // ones drop as progress passes them, never before the room under them.
  useLayoutEffect(() => {
    const elapsed = performance.now() - started.current
    let stagger = 0
    root.current.querySelectorAll('.iso-drop:not(.is-placed)').forEach((node) => {
      const at = Number(node.dataset.at)
      if (at > AUTO_UNTIL && at > target && !sceneReady) return
      let delay = Math.max(0, at * BUILD_TIME - elapsed)
      if (at > AUTO_UNTIL) delay += stagger++ * LATE_STAGGER
      if (reducedMotion) delay = 0
      node.style.setProperty('--delay', `${Math.round(delay)}ms`)
      node.classList.add('is-placed')
      landing.current = Math.max(landing.current, elapsed + delay + (reducedMotion ? 0 : DROP_TIME))
    })
  }, [target, sceneReady, reducedMotion])

  // Lights on once the scene is warm and the last piece has landed.
  useEffect(() => {
    if (!sceneReady || phase !== 'build') return undefined
    const wait = Math.max(0, landing.current - (performance.now() - started.current)) + 200
    const timer = setTimeout(() => setPhase('lit'), wait)
    return () => clearTimeout(timer)
  }, [sceneReady, phase])

  useEffect(() => {
    if (phase === 'lit') {
      const timer = setTimeout(() => setPhase('exit'), reducedMotion ? 0 : LIT_HOLD)
      return () => clearTimeout(timer)
    }
    if (phase === 'exit') {
      const timer = setTimeout(
        () => {
          studio.set({ revealed: true })
          document.body.classList.remove('is-loading')
        },
        reducedMotion ? 0 : REVEAL_DELAY,
      )
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase, reducedMotion])

  if (gone) return null

  const building = phase === 'build'
  const level = building ? Math.max(clock, Math.min(target, 0.94)) : 1
  const label = building ? STEPS.filter(([at]) => level >= at).at(-1)[1] : 'Lights on.'
  // The bar eases toward a point a little past the real progress over a long
  // transition, so it keeps creeping through slow steps instead of stalling.
  const done = !building || sceneReady
  const shown = done ? 1 : Math.min(0.94, target + (1 - target) * 0.22)
  const bar = {
    transform: `translateX(${(shown - 1) * 100}%)`,
    transitionDuration: done ? '0.5s' : '2.6s',
  }

  return (
    <div
      ref={root}
      data-phase={phase}
      className="studio-loader fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-midnight"
      role="progressbar"
      aria-label="Loading the studio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((done ? 1 : target) * 100)}
      onAnimationEnd={(event) => event.animationName === 'loader-out' && setGone(true)}
    >
      <div aria-hidden="true" className="loader-glow pointer-events-none absolute inset-0" />
      <div className="iso-camera" aria-hidden="true">
        <Studio />
      </div>
      <div aria-hidden="true" className="loader-flood pointer-events-none" />

      <div
        aria-hidden="true"
        className="loader-copy loader-brand absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-5 pt-5 text-sm sm:px-8 sm:pt-7"
      >
        <span className="display text-base text-ink">
          Saravana <span className="text-crimson">Kumar</span>
        </span>
        <span className="hidden text-muted sm:block">Full-stack · Design · AI integrations</span>
      </div>

      <div className="loader-copy absolute inset-x-0 bottom-[calc(9vh+1.4rem)] flex justify-center overflow-hidden px-6 pb-1 text-center">
        <p key={label} className="loader-label display text-2xl text-ink sm:text-3xl">
          {label}
        </p>
      </div>
      <div className="loader-copy loader-track" aria-hidden="true">
        <span className="loader-fill" style={bar} />
      </div>
      <div className="loader-copy loader-track loader-track--head" aria-hidden="true">
        <span className="loader-fill" style={bar}>
          <i />
        </span>
      </div>
    </div>
  )
}
