import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { jumpTo, navigateTo, setNavigationHandler } from '../../lib/navigation'
import { SECTIONS } from '../../data/sections'
import { useReducedMotion } from '../../hooks/useMediaQuery'

// The liquid edge of a wave layer, in a 0–100 viewBox. `edge` is where the
// wave front sits; `bulge` lifts its middle so the front reads as fluid.
const covering = (edge, bulge) => `M0 100 L0 ${edge} Q50 ${edge - bulge} 100 ${edge} L100 100 Z`
const leaving = (edge, bulge) => `M0 0 L100 0 L100 ${edge} Q50 ${edge - bulge} 0 ${edge} Z`
const bulgeAt = (edge) => 26 * Math.sin(((100 - edge) / 100) * Math.PI)

// Animates one wave layer's path from bottom to top.
function wave(path, shape, vars) {
  const state = { edge: 100 }
  return gsap.to(state, {
    edge: 0,
    ...vars,
    onUpdate: () => path.setAttribute('d', shape(state.edge, bulgeAt(state.edge))),
  })
}

// Every in-page navigation plays this: a two-tone liquid wave rises in the
// direction of travel, the destination's title flips in letter by letter,
// the page jumps underneath, then the wave washes away and the section settles.
export default function SectionTransition() {
  const root = useRef(null)
  const svg = useRef(null)
  const lead = useRef(null)
  const body = useRef(null)
  const busy = useRef(false)
  const reducedMotion = useReducedMotion()
  const [section, setSection] = useState(SECTIONS[0])
  // A pending run: set on click, played once React has rendered its title.
  const [run, setRun] = useState(null)

  useEffect(() => {
    const go = (id) => {
      if (busy.current) return
      const next = SECTIONS.find((s) => s.id === id)
      const target = document.getElementById(id)
      if (reducedMotion || !next || !target || !root.current) {
        jumpTo(id)
        return
      }
      busy.current = true
      setSection(next)
      setRun({ id, goingUp: target.getBoundingClientRect().top < 0 })
    }
    return setNavigationHandler(go)
  }, [reducedMotion])

  // The title letters are keyed per section, so the timeline must be built
  // after the new letters exist in the DOM.
  useLayoutEffect(() => {
    if (!run) return
    const { id, goingUp } = run
    const target = document.getElementById(id)
    // Travel direction decides which way the wave rolls.
    gsap.set(svg.current, { scaleY: goingUp ? -1 : 1 })

    const q = gsap.utils.selector(root)
    const letters = q('.transition-letter')
    const meta = q('.transition-meta')
    const line = q('.transition-line')

    gsap
      .timeline({
        onComplete: () => {
          busy.current = false
          gsap.set(root.current, { visibility: 'hidden' })
          setRun(null)
        },
      })
      .set(root.current, { visibility: 'visible' })
      .set([lead.current, body.current], { attr: { d: covering(100, 0) } })
      .add(wave(lead.current, covering, { duration: 0.75, ease: 'power3.inOut' }), 0)
      .add(wave(body.current, covering, { duration: 0.75, ease: 'power3.inOut' }), 0.12)
      .fromTo(
        letters,
        { yPercent: 70, rotateX: -100, opacity: 0 },
        { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.7, stagger: 0.035, ease: 'back.out(1.6)' },
        0.5,
      )
      .fromTo(meta, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 }, 0.55)
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.65)
      .add(() => {
        jumpTo(id)
        ScrollTrigger.update()
      }, 1.15)
      // Exit: title lifts away, the dark body clears first, the crimson trails.
      .to(letters, { yPercent: -70, rotateX: 100, opacity: 0, duration: 0.45, stagger: 0.02, ease: 'power2.in' }, 1.45)
      .to([...meta, ...line], { y: -14, opacity: 0, duration: 0.35 }, 1.45)
      .set([lead.current, body.current], { attr: { d: leaving(100, 0) } }, 1.75)
      .add(wave(body.current, leaving, { duration: 0.75, ease: 'power3.inOut' }), 1.75)
      .add(wave(lead.current, leaving, { duration: 0.75, ease: 'power3.inOut' }), 1.85)
      .add(() => {
        // The destination settles into place as it is revealed.
        if (id === 'home') return
        gsap.fromTo(
          target,
          { y: goingUp ? -50 : 50, scale: 0.985 },
          { y: 0, scale: 1, duration: 1, ease: 'expo.out', clearProps: 'transform' },
        )
      }, 1.8)
  }, [run])

  // Every in-page link uses the transition.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      const link = event.target.closest?.('a[href^="#"]')
      const id = link?.getAttribute('href').slice(1)
      if (!id || id === 'main' || !SECTIONS.some((s) => s.id === id)) return
      event.preventDefault()
      navigateTo(id)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const index = SECTIONS.findIndex((s) => s.id === section.id) + 1
  const Icon = section.icon

  return (
    <div ref={root} className="invisible fixed inset-0 z-[90]" aria-hidden="true">
      <svg ref={svg} className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path ref={lead} fill="#e8364f" />
        <path ref={body} fill="#0b1020" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="transition-meta flex items-center gap-3 font-mono text-sm text-muted">
          <span className="text-crimson">{String(index).padStart(2, '0')}</span>
          <span className="h-px w-10 bg-white/20" />
          <span>{String(SECTIONS.length).padStart(2, '0')}</span>
        </div>
        <span className="transition-meta grid h-16 w-16 place-items-center rounded-2xl bg-crimson text-3xl text-white shadow-[0_10px_0_#7d1424,0_24px_50px_-10px_rgb(232_54_79/0.6)]">
          <Icon />
        </span>
        <h2
          className="display flex text-[clamp(3.2rem,11vw,9rem)] leading-none text-ink"
          style={{ perspective: '900px' }}
        >
          {Array.from(section.label).map((letter, i) => (
            <span key={`${section.id}-${i}`} className="transition-letter inline-block origin-bottom">
              {letter}
            </span>
          ))}
        </h2>
        <span className="transition-line block h-[3px] w-[min(22rem,60vw)] origin-left rounded-full bg-gradient-to-r from-crimson via-sun to-sky" />
        <p className="transition-meta text-lg text-muted">{section.tagline}</p>
      </div>
    </div>
  )
}
