import { useCallback, useRef } from 'react'

let topZ = 10

// Drag behaviour for desktop windows and notes (lg screens only). Movement is
// clamped to the nearest `[data-drag-bounds]` ancestor, so items can travel the
// full width of the About section, not just the column they start in.
export function useDesktopDrag(target) {
  const drag = useRef(null)
  const offset = useRef({ x: 0, y: 0 })

  const bringToFront = useCallback(() => {
    topZ += 1
    if (target.current) target.current.style.zIndex = String(topZ)
  }, [target])

  const onPointerDown = useCallback(
    (event) => {
      const node = target.current
      const bounds = node?.closest('[data-drag-bounds]')
      if (event.button !== 0 || !node || !bounds || !window.matchMedia('(min-width: 1024px)').matches) return
      bringToFront()
      event.currentTarget.setPointerCapture(event.pointerId)
      const item = node.getBoundingClientRect()
      const area = bounds.getBoundingClientRect()
      const o = offset.current
      drag.current = {
        startX: event.clientX,
        startY: event.clientY,
        baseX: o.x,
        baseY: o.y,
        // How far the item may travel before leaving the drag area.
        minX: o.x + (area.left + 8 - item.left),
        maxX: o.x + (area.right - 8 - item.right),
        minY: o.y + (area.top + 8 - item.top),
        maxY: o.y + (area.bottom - 8 - item.bottom),
      }
      node.dataset.dragging = 'true'
    },
    [target, bringToFront],
  )

  const onPointerMove = useCallback(
    (event) => {
      const d = drag.current
      if (!d) return
      const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
      offset.current = {
        x: clamp(d.baseX + event.clientX - d.startX, d.minX, d.maxX),
        y: clamp(d.baseY + event.clientY - d.startY, d.minY, d.maxY),
      }
      target.current.style.translate = `${offset.current.x}px ${offset.current.y}px`
    },
    [target],
  )

  const onPointerUp = useCallback(() => {
    drag.current = null
    if (target.current) delete target.current.dataset.dragging
  }, [target])

  return {
    bringToFront,
    handle: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}
