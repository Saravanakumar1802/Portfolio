import { useRef } from 'react'
import { useDesktopDrag } from '../../hooks/useDesktopDrag'

// A square paper sticky note: torn tape, a lifted corner, handwriting.
// On wide screens it can be dragged around the desktop like the windows.
export default function StickyNote({ title, note, color, tilt = 0, className = '' }) {
  const paper = useRef(null)
  const { bringToFront, handle } = useDesktopDrag(paper)

  return (
    <li
      ref={paper}
      className={`sticky-note ${className}`}
      style={{ '--note': color, '--tilt': `${tilt}deg` }}
      onPointerDown={bringToFront}
      {...handle}
    >
      <span aria-hidden="true" className="sticky-tape" />
      <p className="sticky-title">{title}</p>
      <svg aria-hidden="true" className="sticky-underline" viewBox="0 0 120 10" preserveAspectRatio="none">
        <path
          d="M2 6 C 20 2, 40 9, 60 5 S 100 2, 118 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <p className="sticky-body">{note}</p>
    </li>
  )
}
