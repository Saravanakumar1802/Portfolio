import { useRef, useState } from 'react'
import { FiArrowUpRight, FiGithub, FiServer, FiX, FiLock } from 'react-icons/fi'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { projects } from '../../data/projects'
import SectionTitle from '../ui/SectionTitle'
import { useTilt } from '../../hooks/useTilt'

const flagship = projects.featured.filter((p) => p.tier === 'flagship')
const lab = [...projects.featured.filter((p) => p.tier !== 'flagship'), ...projects.mini]
const STACK_TOP = 88
const STACK_STEP = 26

const hostOf = (url) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function Shot({ image, alt, sizes, eager = false, className = '' }) {
  return (
    <img
      src={image.sm}
      srcSet={`${image.sm} 640w, ${image.lg} 1280w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}

function Links({ project }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={project.demo} target="_blank" rel="noreferrer" className="keycap keycap--crimson">
        Live site <FiArrowUpRight aria-hidden="true" />
      </a>
      <a href={project.repo} target="_blank" rel="noreferrer" className="keycap keycap--ghost">
        <FiGithub aria-hidden="true" /> {project.serverRepo ? 'Client' : 'Code'}
      </a>
      {project.serverRepo && (
        <a href={project.serverRepo} target="_blank" rel="noreferrer" className="keycap keycap--ghost">
          <FiServer aria-hidden="true" /> Server
        </a>
      )}
    </div>
  )
}

function BrowserChrome({ url, children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-[0_40px_90px_-30px_rgb(0_0_0/0.85)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-line bg-raised/80 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-lg bg-midnight/70 px-3 py-1.5 font-mono text-[0.72rem] text-muted">
          <FiLock aria-hidden="true" className="shrink-0 text-mint" />
          <span className="truncate">{hostOf(url)}</span>
        </span>
        <span className="hidden w-[52px] sm:block" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}

function FlagshipCard({ project, index }) {
  const card = useRef(null)
  useTilt(card, { max: 3.5 })
  return (
    <div ref={card} className="tilt-card">
      <BrowserChrome url={project.demo}>
        <div className="grid md:grid-cols-[1.35fr_1fr]">
          <div className="relative overflow-hidden bg-midnight">
            <Shot
              image={project.image}
              alt={`${project.title} screenshot`}
              sizes="(min-width: 768px) 60vw, 100vw"
              className="aspect-[16/10] h-full w-full object-cover object-top transition duration-700 hover:scale-[1.03] lg:max-h-[min(34rem,calc(100svh-15rem))]"
            />
          </div>
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
            <div>
              <p className="flex items-center gap-3 text-sm text-muted">
                <span className="font-mono text-crimson">{String(index + 1).padStart(2, '0')}</span>
                {project.kind}
              </p>
              <h3 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-ink">{project.title}</h3>
              <p className="mt-4 text-pretty leading-relaxed text-muted">{project.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
                {project.stack.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <Links project={project} />
          </div>
        </div>
      </BrowserChrome>
      <span aria-hidden="true" className="tilt-glare" />
    </div>
  )
}

function QuickLook({ project, dialogRef, onClose }) {
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close()
      }}
      aria-labelledby="quicklook-title"
      className="quicklook m-auto w-[min(56rem,calc(100%-2rem))] max-h-[calc(100svh-2rem)] overflow-visible bg-transparent p-0 text-ink"
    >
      {project && (
        <BrowserChrome url={project.demo}>
          <div className="max-h-[calc(100svh-6rem)] overflow-y-auto">
            <Shot
              image={project.image}
              alt={`${project.title} screenshot`}
              sizes="(min-width: 900px) 56rem, 100vw"
              eager
              className="aspect-[16/9] w-full object-cover object-top"
            />
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
              <div>
                <p className="text-sm text-muted">{project.kind}</p>
                <h3 id="quicklook-title" className="display mt-2 text-3xl text-ink sm:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted">{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                  {project.stack.map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <Links project={project} />
            </div>
          </div>
        </BrowserChrome>
      )}
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full bg-ink text-midnight shadow-xl transition hover:scale-110 sm:-right-4 sm:-top-4"
        aria-label="Close preview"
      >
        <FiX aria-hidden="true" />
      </button>
    </dialog>
  )
}

export default function Projects() {
  const root = useRef(null)
  const dialog = useRef(null)
  const [selected, setSelected] = useState(null)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.stack-card')
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // Each window sinks back as the next one slides over it.
        cards.slice(0, -1).forEach((card, i) => {
          gsap.to(card.querySelector('.project-window'), {
            scale: 0.9 + i * 0.02,
            filter: 'brightness(0.45) saturate(0.7)',
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top bottom',
              end: `top ${STACK_TOP + (i + 1) * STACK_STEP}px`,
              scrub: true,
            },
          })
        })
      })
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.launch-tile', {
          autoAlpha: 0,
          y: 40,
          scale: 0.9,
          stagger: 0.06,
          duration: 0.7,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.launchpad', start: 'top 80%', once: true },
        })
      })
      ScrollTrigger.refresh()
    },
    { scope: root },
  )

  const open = (project) => {
    setSelected(project)
    dialog.current?.showModal()
  }

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className="relative py-28 sm:py-36">
      <div className="section-shell">
        <SectionTitle
          id="work-title"
          eyebrow="Selected work"
          title={['Things I’ve', 'designed & shipped.']}
          intro="Full-stack products with real users in mind — each one built end to end, from interface to API to database."
        />

        <div className="mt-16">
          {flagship.map((project, i) => (
            <div
              key={project.id}
              className="stack-card mb-10 last:mb-0 lg:sticky lg:mb-[14vh]"
              style={{ top: STACK_TOP + i * STACK_STEP }}
            >
              <div className="project-window origin-top will-change-transform">
                <FlagshipCard project={project} index={i} />
              </div>
            </div>
          ))}
        </div>

        <div className="launchpad mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The lab</p>
              <h3 className="display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">Experiments & smaller builds.</h3>
            </div>
            <p className="max-w-sm text-muted">Tap any app for a quick look.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {lab.map((project) => (
              <li key={project.id} className="launch-tile">
                <button
                  type="button"
                  onClick={() => open(project)}
                  className="group w-full text-left"
                  aria-haspopup="dialog"
                >
                  <span className="relative block overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-lg transition duration-500 group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[0_24px_50px_-20px_rgb(124_196_255/0.35)]">
                    <Shot
                      image={project.image}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="aspect-[4/3] w-full object-cover object-top transition duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-3 block font-semibold text-ink">{project.title}</span>
                  <span className="block text-sm text-muted">{project.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <QuickLook project={selected} dialogRef={dialog} onClose={() => setSelected(null)} />
    </section>
  )
}
