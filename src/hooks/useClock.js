import { useEffect, useState } from 'react'

// Current time in the given zone, refreshed every 15s.
export function useClock(timeZone, options = { hour: '2-digit', minute: '2-digit' }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])

  return new Intl.DateTimeFormat('en-IN', { ...options, timeZone }).format(now)
}
