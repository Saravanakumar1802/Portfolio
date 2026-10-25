import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useMediaQuery'

// Cycles through roles with a vertical slide. Screen readers get the full list.
export default function RoleTicker({ roles, interval = 2400 }) {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), interval)
    return () => clearInterval(id)
  }, [roles.length, interval, reducedMotion])

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="sr-only">{roles.join(', ')}</span>
      <span aria-hidden="true" className="relative inline-grid h-[1.3em] overflow-hidden">
        {roles.map((role, i) => (
          <span
            key={role}
            className="col-start-1 row-start-1 whitespace-nowrap transition-all duration-700 ease-[var(--ease-out-expo)]"
            style={{
              transform: `translateY(${(i - index) * 110}%)`,
              opacity: i === index ? 1 : 0,
            }}
          >
            {role}
            <span className="text-crimson">.</span>
          </span>
        ))}
      </span>
    </span>
  )
}
