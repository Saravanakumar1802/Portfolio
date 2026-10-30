import { useEffect, useRef, useState } from 'react'
import { useStudio } from '../../lib/store'

// Gap kept between the bubble and the screen edges.
const EDGE = 12
// How close the tail may get to the bubble's rounded corners.
const TAIL_INSET = 18

// The bubble is centred on the character's head, which can sit near the edge
// of a narrow screen. Each frame, slide the bubble back inside the viewport
// and move its tail so it still points at the head.
function useKeepOnScreen(box, tail) {
  useEffect(() => {
    let frame
    let shift = 0
    const fit = () => {
      const el = box.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const left = rect.left - shift
        const head = left + rect.width / 2
        const max = document.documentElement.clientWidth - EDGE - rect.width
        const next = Math.round(Math.min(Math.max(left, EDGE), Math.max(max, EDGE)) - left)
        if (next !== shift) {
          shift = next
          el.style.translate = `${shift}px 0`
        }
        const tip = Math.min(Math.max(head - (left + shift), TAIL_INSET), rect.width - TAIL_INSET)
        tail.current.style.left = `${tip}px`
      }
      frame = requestAnimationFrame(fit)
    }
    fit()
    return () => cancelAnimationFrame(frame)
  }, [box, tail])
}

export default function SpeechBubble() {
  const speech = useStudio((s) => s.speech)
  const [count, setCount] = useState(0)
  const box = useRef(null)
  const tail = useRef(null)
  useKeepOnScreen(box, tail)

  // Restart typing whenever the text changes.
  const [shownFor, setShownFor] = useState(speech)
  if (shownFor !== speech) {
    setShownFor(speech)
    setCount(0)
  }

  useEffect(() => {
    if (count >= Array.from(speech).length) return undefined
    const id = setTimeout(() => setCount((c) => c + 1), 28)
    return () => clearTimeout(id)
  }, [count, speech])

  const chars = Array.from(speech)
  return (
    <div
      ref={box}
      role="status"
      aria-live="polite"
      className="relative w-max max-w-[min(18rem,70vw)] origin-bottom animate-[bubble-in_0.35s_var(--ease-spring)] rounded-[1.4rem] bg-ink px-4 py-3 text-[0.95rem] font-semibold leading-snug text-midnight shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)]"
    >
      <span aria-hidden="true">{chars.slice(0, count).join('')}</span>
      <span className="sr-only">{speech}</span>
      {count < chars.length && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-crimson" />
      )}
      <span ref={tail} className="absolute -bottom-2 left-1/2 -ml-2 h-4 w-4 rotate-45 rounded-sm bg-ink" />
    </div>
  )
}
