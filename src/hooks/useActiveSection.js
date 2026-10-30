import { useEffect, useState } from 'react'

// Tracks which section crosses a line near the top of the viewport. Sections
// can overlap (About slides over the end of the hero dive), so when several
// cross the line the one furthest down the page wins.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const crossing = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) crossing.add(entry.target.id)
          else crossing.delete(entry.target.id)
        })
        const last = ids.findLast((id) => crossing.has(id))
        if (last) setActive(last)
      },
      { rootMargin: '-20% 0px -80% 0px' },
    )
    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [ids])

  return active
}
