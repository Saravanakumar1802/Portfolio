import { useLayoutEffect, useRef, useState } from 'react'
import { FiBookOpen, FiGitBranch, FiGitCommit } from 'react-icons/fi'
import { gsap, useGSAP } from '../../lib/gsap'
import { site } from '../../data/site'
import SectionTitle from '../ui/SectionTitle'

const LANE_COLORS = {
  interface: '#7cc4ff',
  systems: '#e8364f',
  ai: '#5ee0a8',
  shipping: '#ffd166',
}
const MAIN_X = 20
const LANE_X = 54

// Stable fake commit hash for display.
function shortHash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

// Measures its own height so the SVG can be drawn in real pixels.
function useHeight() {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => setHeight(Math.round(entry.contentRect.height)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, height]
}

function Rail({ height, color, commits = 0, top = false, bottom = false }) {
  if (!height) return null
  const h = height
  const branch = color
    ? `M${MAIN_X} 26 C${MAIN_X} 58 ${LANE_X} 44 ${LANE_X} 76 L${LANE_X} ${h - 76} C${LANE_X} ${h - 44} ${MAIN_X} ${h - 58} ${MAIN_X} ${h - 26}`
    : null
  const dots = Array.from({ length: commits }, (_, i) => 110 + ((h - 220) / Math.max(1, commits - 1)) * i)

  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible" width="80" height={h} aria-hidden="true">
      <line
        x1={MAIN_X}
        x2={MAIN_X}
        y1={top ? 26 : 0}
        y2={bottom ? 26 : h}
        stroke="#8f9bbd"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {branch && (
        <>
          <path d={branch} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="3" />
          <path
            className="rail-draw"
            d={branch}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          {dots.map((y) => (
            <circle
              key={y}
              className="rail-dot"
              cx={LANE_X}
              cy={y}
              r="6"
              fill="#0b1020"
              stroke={color}
              strokeWidth="3"
            />
          ))}
          <circle cx={MAIN_X} cy="26" r="5" fill="#8f9bbd" />
          <circle cx={MAIN_X} cy={h - 26} r="5" fill="#8f9bbd" />
        </>
      )}
    </svg>
  )
}

function BranchRow({ branch }) {
  const row = useRef(null)
  const [ref, height] = useHeight()
  const color = LANE_COLORS[branch.id]
  const measured = height > 0

  // Set up once the rail exists (it renders after the first measurement).
  useGSAP(
    () => {
      if (!measured) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.rail-draw', { strokeDashoffset: 0 })
      })
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.rail-draw', {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: row.current, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
        })
        gsap.from('.rail-dot', {
          scale: 0,
          transformOrigin: 'center',
          stagger: 0.12,
          duration: 0.5,
          ease: 'back.out(3)',
          scrollTrigger: { trigger: row.current, start: 'top 60%', once: true },
        })
      })
    },
    { scope: row, dependencies: [measured] },
  )

  return (
    <li ref={row} className="grid grid-cols-[64px_1fr] sm:grid-cols-[96px_1fr]">
      <div ref={ref} className="relative">
        <Rail height={height} color={color} commits={branch.commits.length} />
      </div>
      <article className="py-8">
        <div className="glass grid gap-6 rounded-2xl p-6 transition-colors hover:border-white/25 sm:p-7 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs" style={{ color }}>
              <FiGitBranch aria-hidden="true" /> {branch.label}
            </p>
            <h3 className="display mt-3 text-2xl text-ink sm:text-3xl">{branch.title}</h3>
            <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted">{branch.copy}</p>
          </div>
          <ul className="space-y-2.5 md:border-l md:border-line md:pl-8">
            {branch.commits.map((commit) => (
              <li key={commit} className="flex items-baseline gap-3 text-sm">
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.72rem] text-muted">
                  {shortHash(branch.id + commit)}
                </code>
                <span className="text-ink/90">{commit}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  )
}

function EndRow({ kind, children }) {
  const [ref, height] = useHeight()
  return (
    <li className="grid grid-cols-[64px_1fr] sm:grid-cols-[96px_1fr]">
      <div ref={ref} className="relative">
        <Rail height={height} top={kind === 'head'} bottom={kind === 'root'} />
        <span
          className={`absolute left-[11px] top-[17px] grid h-[18px] w-[18px] place-items-center rounded-full ${kind === 'head' ? 'bg-crimson shadow-[0_0_0_6px_rgb(232_54_79/0.2)]' : 'bg-ink'}`}
          aria-hidden="true"
        >
          {kind === 'head' && <span className="h-full w-full animate-ping rounded-full bg-crimson/60" />}
        </span>
      </div>
      <div className="pb-6">{children}</div>
    </li>
  )
}

export default function Experience() {
  const root = useRef(null)
  const { experience, education } = site

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('article', root.current).forEach((card) => {
          gsap.from(card, {
            autoAlpha: 0,
            x: 40,
            duration: 0.9,
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      id="experience"
      ref={root}
      aria-labelledby="experience-title"
      className="relative overflow-x-clip py-28 sm:py-36"
    >
      <div className="section-shell">
        <SectionTitle
          id="experience-title"
          eyebrow="Experience"
          title={[`${site.experienceYears} years of commits,`, 'one main branch.']}
          intro={experience.summary}
        />

        <ol className="mt-16">
          <EndRow kind="head">
            <p className="font-mono text-xs text-crimson">HEAD → main · {experience.period}</p>
            <p className="display mt-2 text-3xl text-ink sm:text-4xl">{experience.title}</p>
            <p className="mt-1 text-lg text-muted">{experience.company}</p>
          </EndRow>

          {experience.branches.map((branch) => (
            <BranchRow key={branch.id} branch={branch} />
          ))}

          <EndRow kind="root">
            <div className="glass rounded-2xl p-6 sm:p-7">
              <p className="inline-flex items-center gap-2 font-mono text-xs text-muted">
                <FiGitCommit aria-hidden="true" /> initial commit · {education.status}
              </p>
              <h3 className="display mt-3 flex items-center gap-3 text-2xl text-ink sm:text-3xl">
                <FiBookOpen aria-hidden="true" className="shrink-0 text-sky" />
                {education.degree}
              </h3>
              <p className="mt-1 text-muted">{education.school}</p>
              <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted">{education.summary}</p>
            </div>
          </EndRow>
        </ol>
      </div>
    </section>
  )
}
