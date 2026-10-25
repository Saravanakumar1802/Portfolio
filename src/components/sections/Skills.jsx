import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { skillCategories, skills } from '../../data/skills'
import { keyboard, useKeyboard } from '../../lib/store'
import { supportsWebGL } from '../../lib/device'
import { useInViewport } from '../../hooks/useInViewport'
import { keyIdForSkill } from '../../three/skills/keyboardLayout'
import SectionTitle from '../ui/SectionTitle'

const SkillsKeyboard = lazy(() => import('../../three/skills/SkillsKeyboard'))

// Physical keyboard: a letter presses the next skill that starts with it.
function useTypeToPress(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const cursor = {}
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return
      const letter = event.key?.toLowerCase()
      if (!letter || letter.length !== 1) return
      const matches = skills.filter((s) => s.name.toLowerCase().startsWith(letter))
      if (!matches.length) return
      cursor[letter] = ((cursor[letter] ?? -1) + 1) % matches.length
      const skill = matches[cursor[letter]]
      const keyId = keyIdForSkill.get(skill.id)
      const current = keyboard.get()
      keyboard.set({ activeId: skill.id, pressId: keyId ?? null, pressToken: current.pressToken + 1 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}

function InfoCard() {
  const activeId = useKeyboard((s) => s.activeId)
  const skill = skills.find((s) => s.id === activeId)
  const category = skill ? skillCategories[skill.category] : null
  return (
    <div className="glass min-h-[8.5rem] rounded-2xl p-5" aria-live="polite">
      {skill ? (
        <>
          <p className="flex items-center gap-2 text-sm" style={{ color: category.color }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />
            {category.label}
          </p>
          <p className="display mt-2 text-3xl text-ink">{skill.name}</p>
          <p className="mt-1 text-muted">{skill.note}</p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">Nothing selected</p>
          <p className="display mt-2 text-2xl text-ink">Hover a key.</p>
          <p className="mt-1 text-muted">Or type R, N, M, A on your own keyboard.</p>
        </>
      )}
    </div>
  )
}

export default function Skills() {
  const root = useRef(null)
  const stage = useRef(null)
  const near = useInViewport(stage, { margin: '400px', once: true })
  const visible = useInViewport(stage)
  const [webgl] = useState(supportsWebGL)
  useTypeToPress(visible)

  // The board swings up from flat as the section scrolls into view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        keyboard.set({ entry: 0 })
        ScrollTrigger.create({
          trigger: stage.current,
          start: 'top 95%',
          end: 'top 35%',
          scrub: true,
          onUpdate: (self) => keyboard.set({ entry: self.progress }),
        })
        return () => keyboard.set({ entry: 1 })
      })
    },
    { scope: root },
  )

  return (
    <section id="skills" ref={root} aria-labelledby="skills-title" className="relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson/10 blur-[120px]"
      />
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <SectionTitle
            id="skills-title"
            eyebrow="Toolkit"
            title={['My toolkit,', 'one key away.']}
            intro="The languages, frameworks and tools I reach for — from interface design to APIs, data, Python and AI integrations."
          />
          <div className="mt-8 space-y-6">
            <InfoCard />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Categories">
              {Object.values(skillCategories).map((cat) => (
                <li key={cat.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                  {cat.label}
                </li>
              ))}
            </ul>
          </div>
          <ul className="sr-only">
            {skills.map((skill) => (
              <li key={skill.id}>
                {skill.name} — {skillCategories[skill.category].label}: {skill.note}
              </li>
            ))}
          </ul>
        </div>

        <div ref={stage} className="relative aspect-[4/3] w-full sm:aspect-[16/11]" aria-hidden="true">
          {webgl && near ? (
            <Suspense fallback={null}>
              <SkillsKeyboard active={visible} />
            </Suspense>
          ) : (
            <div className="grid h-full grid-cols-4 content-center gap-2 sm:grid-cols-5">
              {skills.map((skill) => (
                <span key={skill.id} className="keycap justify-center text-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
