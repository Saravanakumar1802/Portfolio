import { useEffect, useState } from 'react'
import { useStudio } from '../../lib/store'

export default function SpeechBubble() {
  const speech = useStudio((s) => s.speech)
  const [count, setCount] = useState(0)

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
      role="status"
      aria-live="polite"
      className="relative w-max max-w-[min(18rem,70vw)] origin-bottom animate-[bubble-in_0.35s_var(--ease-spring)] rounded-[1.4rem] rounded-bl-md bg-ink px-4 py-3 text-[0.95rem] font-semibold leading-snug text-midnight shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)]"
    >
      <span aria-hidden="true">{chars.slice(0, count).join('')}</span>
      <span className="sr-only">{speech}</span>
      {count < chars.length && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-crimson" />
      )}
      <span className="absolute -bottom-2 left-4 h-4 w-4 rotate-45 rounded-sm bg-ink" />
    </div>
  )
}
