import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

// Eyebrow + display heading whose lines rise into place on scroll.
export default function SectionTitle({ eyebrow, title, intro, align = 'left', id }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.title-line > span', {
          yPercent: 105,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
        })
        gsap.from('.title-fade', {
          autoAlpha: 0,
          y: 18,
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
        })
      })
    },
    { scope: root },
  )

  const lines = Array.isArray(title) ? title : [title]
  return (
    <header ref={root} className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="eyebrow title-fade">{eyebrow}</p>
      <h2 id={id} className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)] text-balance">
        {lines.map((line, i) => (
          <span key={i} className="title-line block overflow-hidden pb-[0.08em]">
            <span className="inline-block">{line}</span>
          </span>
        ))}
      </h2>
      {intro && <p className="title-fade mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{intro}</p>}
    </header>
  )
}
