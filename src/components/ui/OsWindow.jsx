import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useDesktopDrag } from '../../hooks/useDesktopDrag'

const HIDDEN = { x: 0, y: 30, scale: 0.86, autoAlpha: 0 }
const SHOWN = { x: 0, y: 0, scale: 1, autoAlpha: 1 }

// Where a window goes when minimised: the desktop shortcuts, where its icon
// appears (and where it grows back from when reopened).
function dockOffset(inner) {
  const dock = inner.closest('[data-drag-bounds]')?.querySelector('[data-dock]')
  if (!dock) return null
  const from = inner.getBoundingClientRect()
  const to = dock.getBoundingClientRect()
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.bottom - 40 - (from.top + from.height / 2),
    scale: 0.08,
    autoAlpha: 0,
  }
}

// A desktop-style window. On wide screens it can be dragged by its title bar
// anywhere inside the About area and comes to the front when touched. With
// `onClose`, red closes it with a shrink and yellow minimises it into the
// desktop shortcuts.
export default function OsWindow({
  title,
  icon: Icon,
  className = '',
  bodyClassName = '',
  draggable = true,
  onClose,
  animateIn = false,
  children,
}) {
  const frame = useRef(null)
  const { bringToFront, handle } = useDesktopDrag(frame)

  // Reopened windows grow back out of their shortcut. Explicit start and end
  // values (and a revert on cleanup) mean a re-run can never capture a
  // half-faded state as the end point and leave the window dim.
  useLayoutEffect(() => {
    if (!animateIn) return undefined
    const inner = frame.current.querySelector('.os-window-inner')
    const tween = gsap.fromTo(inner, dockOffset(inner) ?? HIDDEN, {
      ...SHOWN,
      duration: 0.6,
      ease: 'expo.out',
      clearProps: 'transform,opacity,visibility',
    })
    return () => tween.revert()
  }, [animateIn])

  const hide = (minimise) => (event) => {
    event.stopPropagation()
    const inner = frame.current.querySelector('.os-window-inner')
    const to = (minimise && dockOffset(inner)) || HIDDEN
    gsap.to(inner, {
      ...to,
      duration: minimise ? 0.5 : 0.28,
      ease: minimise ? 'power3.in' : 'power2.in',
      onComplete: onClose,
    })
  }

  const light = (color, label, onClick) =>
    onClose ? (
      <button
        type="button"
        aria-label={`${label} ${title}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onClick}
        className="grid h-3 w-3 place-items-center rounded-full text-[8px] font-bold leading-none text-black/0 transition hover:text-black/60"
        style={{ background: color }}
      >
        {label === 'Close' ? '×' : label === 'Minimise' ? '−' : '+'}
      </button>
    ) : (
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
    )

  return (
    <div ref={frame} className={`os-window ${className}`} onPointerDown={bringToFront}>
      <div className="os-window-inner flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.75)] backdrop-blur-xl">
        <div
          className={`flex shrink-0 select-none items-center gap-3 border-b border-line bg-raised/70 px-3.5 py-2.5 ${draggable ? 'lg:cursor-grab lg:active:cursor-grabbing' : ''}`}
          {...(draggable ? handle : {})}
          style={{ touchAction: 'pan-y' }}
        >
          <span className="flex gap-1.5" aria-hidden={onClose ? undefined : 'true'}>
            {light('#ff5f57', 'Close', hide(false))}
            {light('#febc2e', 'Minimise', hide(true))}
            {light('#28c840', 'Focus', bringToFront)}
          </span>
          <span className="flex min-w-0 flex-1 items-center justify-center gap-2 pr-12 text-[0.8rem] font-medium text-muted">
            {Icon && <Icon aria-hidden="true" className="shrink-0" />}
            <span className="truncate">{title}</span>
          </span>
        </div>
        <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
      </div>
    </div>
  )
}
