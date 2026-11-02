import { useEffect, useRef, useState } from 'react'
import {
  FiArrowUpRight,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiFilter,
  FiGithub,
  FiMaximize2,
  FiPlay,
  FiSearch,
  FiSend,
  FiTarget,
  FiX,
  FiZap,
} from 'react-icons/fi'
import { gsap, useGSAP } from '../../lib/gsap'
import { spotlight as project } from '../../data/projects'
import { useInViewport } from '../../hooks/useInViewport'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import BrowserChrome, { Shot } from '../ui/BrowserChrome'

const AGENT_ICONS = [FiSearch, FiFilter, FiCpu, FiTarget, FiBarChart2]
// Seconds each pipeline step stays lit before handing over to the next.
const STEP_TIME = 0.7
const STEPS = project.agents.length + 1

// The muted preview loop plays only while it is on screen.
function LoopPreview({ onOpen }) {
  const video = useRef(null)
  const reducedMotion = useReducedMotion()
  const inView = useInViewport(video, { margin: '100px' })

  useEffect(() => {
    const el = video.current
    if (inView && !reducedMotion) el.play().catch(() => {})
    else el.pause()
  }, [inView, reducedMotion])

  return (
    <div className="group relative aspect-video overflow-hidden bg-midnight">
      <video
        ref={video}
        className="h-full w-full object-cover object-top"
        poster={project.image.lg}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        <source src={project.preview} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />
      <span className="glass absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-ink">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
        </span>
        Live preview
      </span>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full bg-ink py-1.5 pl-1.5 pr-4 text-sm font-semibold text-midnight shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)] transition hover:scale-[1.04]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-crimson text-white">
          <FiPlay aria-hidden="true" className="translate-x-px" />
        </span>
        <span>
          <span className="hidden sm:inline">Watch the full</span>
          <span className="sm:hidden">Full</span> demo · {project.videoLength}
        </span>
      </button>
    </div>
  )
}

// Five agents in a row, then what you get back. A light runs along the
// track and each step lights up as it passes.
function Pipeline() {
  const steps = [...project.agents.map((name, i) => ({ name, Icon: AGENT_ICONS[i] })), { name: project.output, Icon: FiSend }]
  return (
    <div
      className="pipeline relative mt-7 rounded-2xl border border-line bg-midnight/50 px-3 pb-3 pt-4 sm:px-4"
      style={{ '--step': `${STEP_TIME}s`, '--cycle': `${STEP_TIME * STEPS}s` }}
    >
      <p className="mb-4 flex items-center gap-2 px-1 text-xs font-medium text-muted">
        <FiZap aria-hidden="true" className="text-sky" />
        {project.agents.length} agents, one search
      </p>
      <ol className="relative flex justify-between gap-1">
        <span aria-hidden="true" className="pipeline-track absolute left-[8%] right-[8%] top-[1.2rem] h-px bg-line">
          <span className="pipeline-beam" />
        </span>
        {steps.map(({ name, Icon }, i) => {
          const last = i === steps.length - 1
          return (
            <li
              key={name}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
              style={{ '--i': i }}
            >
              <span
                className={`pipeline-node grid h-10 w-10 place-items-center rounded-xl border text-base ${
                  last ? 'pipeline-node--out border-crimson/50 bg-crimson/15 text-crimson' : 'border-line bg-raised text-ink'
                }`}
              >
                <Icon aria-hidden="true" />
              </span>
              <span className={`text-[0.68rem] leading-tight sm:text-xs ${last ? 'font-semibold text-ink' : 'text-muted'}`}>
                {name}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// One dialog for the full demo (item 0) and the screenshots (1…n).
function Viewer({ dialogRef, index, setIndex }) {
  const video = useRef(null)
  const count = project.gallery.length + 1
  const item = index > 0 ? project.gallery[index - 1] : null
  const step = (by) => setIndex((i) => ((i - 1 + by + count - 1) % (count - 1)) + 1)

  useEffect(() => {
    if (index === 0) video.current?.play().catch(() => {})
  }, [index])

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        video.current?.pause()
        setIndex(null)
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close()
      }}
      onKeyDown={(event) => {
        if (!item) return
        if (event.key === 'ArrowRight') step(1)
        if (event.key === 'ArrowLeft') step(-1)
      }}
      aria-label={item ? item.caption : `${project.title} demo video`}
      className="quicklook m-auto w-[min(72rem,calc(100%-2rem))] max-h-[calc(100svh-2rem)] overflow-visible bg-transparent p-0 text-ink"
    >
      {index !== null && (
        <BrowserChrome url={project.demo}>
          {index === 0 ? (
            <video
              ref={video}
              className="aspect-video w-full bg-black"
              src={project.video}
              poster={project.image.lg}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <figure>
              <Shot
                image={item.image}
                alt={item.caption}
                sizes="(min-width: 1152px) 72rem, 100vw"
                eager
                className="aspect-video w-full bg-midnight object-contain"
              />
              <figcaption className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5 text-sm text-muted">
                <span className="min-w-0 truncate">{item.caption}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs">
                    {index} / {count - 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-raised text-ink transition hover:bg-crimson"
                    aria-label="Previous screenshot"
                  >
                    <FiChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-raised text-ink transition hover:bg-crimson"
                    aria-label="Next screenshot"
                  >
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </span>
              </figcaption>
            </figure>
          )}
        </BrowserChrome>
      )}
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full bg-ink text-midnight shadow-xl transition hover:scale-110 sm:-right-4 sm:-top-4"
        aria-label="Close"
      >
        <FiX aria-hidden="true" />
      </button>
    </dialog>
  )
}

// The newest project as a case study: live preview, agent pipeline and a
// filmstrip of screens, above the stacked project windows.
export default function Spotlight() {
  const root = useRef(null)
  const dialog = useRef(null)
  const [viewing, setViewing] = useState(null)

  const open = (index) => {
    setViewing(index)
    dialog.current?.showModal()
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const scrollTrigger = { trigger: root.current, start: 'top 78%', once: true }
        gsap.from('.spot-window', { autoAlpha: 0, y: 60, scale: 0.96, duration: 1.1, ease: 'expo.out', scrollTrigger })
        gsap.from('.spot-reveal', {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.07,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger,
        })
        gsap.from('.spot-frame', {
          autoAlpha: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.06,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.spot-strip', start: 'top 90%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <article
      ref={root}
      aria-labelledby="spotlight-title"
      className="spotlight relative mt-16 overflow-hidden rounded-[2rem] border border-line p-4 sm:p-6 lg:p-8"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
        <div className="spot-window">
          <BrowserChrome url={project.demo}>
            <LoopPreview onOpen={() => open(0)} />
          </BrowserChrome>
        </div>

        <div className="px-1 sm:px-2 lg:px-0">
          <p className="spot-reveal flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson px-3 py-1 text-xs font-semibold text-white shadow-[0_0_24px_-4px_#e8364f]">
              <FiZap aria-hidden="true" /> {project.badge}
            </span>
            {project.kind}
          </p>
          <h3 id="spotlight-title" className="spot-reveal display mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] text-ink">
            {project.title}
          </h3>
          <p className="spot-reveal mt-4 text-pretty leading-relaxed text-muted">{project.description}</p>
          <div className="spot-reveal">
            <Pipeline />
          </div>
          <ul className="spot-reveal mt-6 flex flex-wrap gap-2" aria-label="Stack">
            {project.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
          <div className="spot-reveal mt-7 flex flex-wrap items-center gap-3">
            <a href={project.demo} target="_blank" rel="noreferrer" className="keycap keycap--crimson">
              Live app <FiArrowUpRight aria-hidden="true" />
            </a>
            <a href={project.repo} target="_blank" rel="noreferrer" className="keycap keycap--ghost">
              <FiGithub aria-hidden="true" /> Code
            </a>
            <span className="text-sm text-mint">{project.note}</span>
          </div>
        </div>
      </div>

      <ul className="spot-strip -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {project.gallery.map((frame, i) => (
          <li key={frame.caption} className="spot-frame w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
            <button
              type="button"
              onClick={() => open(i + 1)}
              aria-haspopup="dialog"
              className="group w-full text-left"
            >
              <span className="relative block overflow-hidden rounded-xl border border-line bg-surface transition duration-500 group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_20px_40px_-18px_rgb(124_196_255/0.4)]">
                <Shot
                  image={frame.image}
                  alt=""
                  sizes="(min-width: 1024px) 20vw, 68vw"
                  className="aspect-video w-full object-cover object-top transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-midnight/50 opacity-0 transition group-hover:opacity-100">
                  <FiMaximize2 aria-hidden="true" className="text-xl text-ink" />
                </span>
              </span>
              <span className="mt-2.5 block text-pretty text-xs leading-snug text-muted transition group-hover:text-ink sm:text-sm">
                {frame.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Viewer dialogRef={dialog} index={viewing} setIndex={setViewing} />
    </article>
  )
}
