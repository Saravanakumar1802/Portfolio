import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

// Counts up to `value` the first time it scrolls into view.
export default function Counter({ value, decimals = 0, suffix = '' }) {
  const node = useRef(null)

  useGSAP(
    () => {
      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: node.current, start: 'top 90%', once: true },
        onUpdate: () => {
          if (node.current) node.current.textContent = state.n.toFixed(decimals) + suffix
        },
      })
    },
    { dependencies: [value, decimals, suffix] },
  )

  return (
    <span ref={node} aria-label={`${value}${suffix}`}>
      {`${(0).toFixed(decimals)}${suffix}`}
    </span>
  )
}
