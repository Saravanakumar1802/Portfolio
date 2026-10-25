import { useEffect } from 'react'

// Pointer-driven 3D tilt with a moving glare, for cards. Writes CSS variables
// (--rx, --ry, --gx, --gy) so styling stays in CSS and no re-renders happen.
export function useTilt(ref, { max = 6 } = {}) {
  useEffect(() => {
    const node = ref.current
    if (!node || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame = 0
    let pending = null
    const apply = () => {
      frame = 0
      if (!pending) return
      const { x, y } = pending
      node.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`)
      node.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`)
      node.style.setProperty('--gx', `${x * 100}%`)
      node.style.setProperty('--gy', `${y * 100}%`)
    }
    const onMove = (event) => {
      const rect = node.getBoundingClientRect()
      pending = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      pending = { x: 0.5, y: 0.5 }
      if (!frame) frame = requestAnimationFrame(apply)
    }
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [ref, max])
}
