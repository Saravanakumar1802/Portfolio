import { useLayoutEffect, useRef, useState } from 'react'
import { SECTIONS } from '../../data/sections'

// Floating navigation pill. A crimson indicator springs to the active section
// and expands to show its name; a hairline underneath tracks page progress.
export default function Dock({ active }) {
  const list = useRef(null)
  const progress = useRef(null)
  const [indicator, setIndicator] = useState(null)
  const hidden = active === 'home'

  // Measure the active item so the indicator can glide to it.
  useLayoutEffect(() => {
    const measure = () => {
      const item = list.current?.querySelector(`[data-id="${active}"]`)
      if (item) setIndicator({ left: item.offsetLeft, width: item.offsetWidth })
    }
    measure()
    // Watch every item: one label collapses while another expands, so the
    // list's overall width may not change at all.
    const observer = new ResizeObserver(measure)
    list.current?.querySelectorAll('[data-id]').forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [active])

  useLayoutEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav
      aria-label="Sections"
      className={`fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${
        hidden ? 'pointer-events-none translate-y-[140%] opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="glass relative overflow-hidden rounded-full p-1.5 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.85)]">
        <ul ref={list} className="relative flex items-center">
          {indicator && (
            <li
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-crimson shadow-[0_8px_24px_-6px_rgb(232_54_79/0.7)] transition-[left,width] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const current = active === id
            return (
              <li key={id} data-id={id} className="relative">
                <a
                  href={`#${id}`}
                  aria-current={current ? 'location' : undefined}
                  aria-label={label}
                  tabIndex={hidden ? -1 : 0}
                  className={`group flex h-11 items-center gap-2 rounded-full px-3.5 text-[0.95rem] transition-colors duration-300 ${
                    current ? 'text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                  <span
                    className={`hidden overflow-hidden whitespace-nowrap font-semibold transition-[max-width,opacity] duration-300 sm:inline-block ${
                      current ? 'max-w-[8rem] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {label}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
        <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px bg-white/10">
          <span ref={progress} className="block h-full origin-left bg-gradient-to-r from-crimson to-sky" />
        </span>
      </div>
    </nav>
  )
}
