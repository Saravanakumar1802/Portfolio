import { FiDownload } from 'react-icons/fi'
import { site } from '../../data/site'
import { useClock } from '../../hooks/useClock'

export default function TopBar({ visible }) {
  const time = useClock(site.timeZone)
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 transition-all duration-500 sm:px-8 ${
        visible ? 'opacity-100' : '-translate-y-full opacity-0 [&_a]:pointer-events-none'
      }`}
    >
      <a
        href="#home"
        tabIndex={visible ? 0 : -1}
        className="pointer-events-auto flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-ink"
        aria-label={`${site.displayName} — back to top`}
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-crimson text-sm text-white shadow-[0_6px_0_#7d1424]">
          SK
        </span>
        <span className="hidden sm:inline">saravana</span>
      </a>
      <div className="pointer-events-auto flex items-center gap-3 text-sm">
        <span className="glass hidden rounded-full px-3.5 py-2 text-muted md:inline">{time} in India</span>
        <a
          href={site.resumeUrl}
          download
          tabIndex={visible ? 0 : -1}
          className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-ink transition hover:bg-raised"
        >
          <FiDownload aria-hidden="true" /> Résumé
        </a>
      </div>
    </header>
  )
}
