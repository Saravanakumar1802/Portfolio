import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { FiArrowDownRight, FiMousePointer, FiRotateCcw, FiSkipForward } from 'react-icons/fi'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { frame, studio, useStudio } from '../../lib/store'
import { supportsWebGL } from '../../lib/device'
import { loadHeroScene } from '../../lib/sceneLoader'
import { useInViewport } from '../../hooks/useInViewport'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { site } from '../../data/site'
import profile from '../../assets/optimized/profile-640.webp'
import RoleTicker from '../ui/RoleTicker'

const HeroScene = lazy(loadHeroScene)

function Fallback() {
  return (
    <div className="absolute inset-0 grid place-items-center os-wallpaper">
      <img
        src={profile}
        alt=""
        className="absolute right-[8%] top-1/2 hidden w-[min(28rem,34vw)] -translate-y-1/2 rotate-3 rounded-[2rem] border border-line shadow-2xl md:block"
      />
    </div>
  )
}

export default function Hero() {
  const section = useRef(null)
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(supportsWebGL)
  const inView = useInViewport(section, { margin: '120px' })
  const revealed = useStudio((s) => s.revealed)
  const phase = useStudio((s) => s.phase)

  useEffect(() => {
    if (!webgl) studio.set({ sceneReady: true, loadProgress: 1 })
  }, [webgl])

  useEffect(() => {
    const onMove = (event) => {
      frame.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      frame.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Scroll drives the camera dive; the copy fades and the screen takes over.
  useGSAP(
    () => {
      if (reducedMotion) {
        frame.heroProgress = 0
        return
      }
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          frame.heroProgress = self.progress
        },
      })
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
        })
        .to('.hero-copy', { autoAlpha: 0, y: -80, duration: 0.28 }, 0)
        .to('.hero-hud', { autoAlpha: 0, duration: 0.12 }, 0)
        // The About desktop then fades in on this wallpaper (see About).
        .fromTo('.hero-screen', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, 0.78)
        .to({}, { duration: 0.1 })
    },
    { scope: section, dependencies: [reducedMotion] },
  )

  // Entrance once the loader hands over.
  useGSAP(
    () => {
      if (!revealed || reducedMotion) return
      gsap
        .timeline({ delay: 0.6 })
        .from('.hero-letter', { yPercent: 110, duration: 1, stagger: 0.035, ease: 'expo.out' })
        .from('.hero-reveal', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08 }, '-=0.7')
        .from('.hero-hud > *', { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, '-=0.5')
    },
    { scope: section, dependencies: [revealed, reducedMotion] },
  )

  const words = site.displayName.split(' ')

  return (
    <section
      id="home"
      ref={section}
      aria-label="Introduction"
      className={reducedMotion ? 'relative h-svh' : 'relative h-[260svh]'}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          {webgl ? (
            <Suspense fallback={null}>
              <HeroScene active={inView} reducedMotion={reducedMotion} />
            </Suspense>
          ) : (
            <Fallback />
          )}
        </div>

        {/* Readability scrims: left on desktop, bottom on mobile. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent md:bg-gradient-to-r md:from-midnight/90 md:via-midnight/30 md:to-transparent" />

        <div className="hero-copy pointer-events-none absolute inset-x-0 bottom-28 px-5 sm:px-8 md:bottom-auto md:left-[max(2rem,calc((100vw-1240px)/2))] md:right-auto md:top-1/2 md:max-w-[34rem] md:-translate-y-1/2 md:px-0">
          <p className="hero-reveal glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            Open to new projects
          </p>
          <h1 aria-label={site.displayName} className="display mt-5 text-[clamp(3rem,7.4vw,6.4rem)]">
            {words.map((word, w) => (
              <span key={word} aria-hidden="true" className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
                {Array.from(word).map((letter, i) => (
                  <span key={i} className={`hero-letter inline-block ${w === 1 ? 'text-crimson' : ''}`}>
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="hero-reveal mt-4 text-xl font-medium text-ink sm:text-2xl">
            <RoleTicker roles={site.roles} />
          </div>
          <p className="hero-reveal mt-4 max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {site.tagline}
          </p>
          <div className="hero-reveal pointer-events-auto mt-7 flex flex-wrap items-center gap-4">
            <a href="#work" className="keycap keycap--crimson">
              See my work <FiArrowDownRight aria-hidden="true" />
            </a>
            <a href="#contact" className="keycap keycap--ghost">
              Say hello
            </a>
            <span className="text-sm text-muted">
              <strong className="font-semibold text-ink">{site.experienceYears}</strong> yrs shipping
            </span>
          </div>
        </div>

        <div className="hero-hud pointer-events-none absolute inset-x-0 bottom-5 flex items-end justify-between gap-4 px-5 text-sm text-muted sm:px-8">
          <p className="hidden items-center gap-2 md:flex">
            <FiMousePointer aria-hidden="true" className="text-sky" />
            Click Saravana — or flip the lamp.
          </p>
          <p className="mx-auto flex flex-col items-center gap-2 md:mx-0">
            <span className="relative h-9 w-5 rounded-full border border-muted/60">
              <span className="absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 animate-bounce rounded-full bg-ink" />
            </span>
            Scroll to dive in
          </p>
          {webgl && !reducedMotion && (
            <div className="pointer-events-auto hidden gap-2 md:flex">
              <button
                type="button"
                className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-ink transition hover:bg-raised"
                onClick={() => studio.set((s) => ({ replayToken: s.replayToken + 1 }))}
              >
                <FiRotateCcw aria-hidden="true" /> Replay
              </button>
              {phase !== 'work' && phase !== 'break' && (
                <button
                  type="button"
                  className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-ink transition hover:bg-raised"
                  onClick={() => studio.set((s) => ({ skipToken: s.skipToken + 1 }))}
                >
                  <FiSkipForward aria-hidden="true" /> Skip intro
                </button>
              )}
            </div>
          )}
        </div>

        {/* The monitor's wallpaper fills the view at the end of the dive. */}
        <div className="hero-screen os-wallpaper pointer-events-none invisible absolute inset-0 opacity-0" />
      </div>
    </section>
  )
}
