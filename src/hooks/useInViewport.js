import { useEffect, useState } from 'react'

// True while `ref` is within `margin` of the viewport. Used to pause canvases
// and to lazy-mount heavy sections.
export function useInViewport(ref, { margin = '0px', once = false } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin: margin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, margin, once])

  return inView
}
