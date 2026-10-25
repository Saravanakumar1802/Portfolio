import { FiArrowUp } from 'react-icons/fi'
import { site } from '../../data/site'

export default function Footer() {
  return (
    <footer className="border-t border-line pb-28 pt-12">
      <div className="section-shell flex flex-col items-start justify-between gap-6 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {site.displayName}. Designed & built from scratch — React, Three.js and GSAP.
          <br />
          <span className="text-xs text-muted/70">
            3D character based on{' '}
            <a
              className="underline decoration-dotted underline-offset-4 hover:text-ink"
              href="/models/LICENSE-Rocketbox.txt"
              target="_blank"
              rel="noreferrer"
            >
              Microsoft Rocketbox (MIT)
            </a>
            .
          </span>
        </p>
        <a href="#home" className="keycap keycap--ghost text-sm">
          <FiArrowUp aria-hidden="true" /> Back to the studio
        </a>
      </div>
    </footer>
  )
}
