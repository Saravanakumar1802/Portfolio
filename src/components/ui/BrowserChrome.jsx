import { FiLock } from 'react-icons/fi'

const hostOf = (url) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

// A responsive screenshot (640w / 1280w WebP pair).
export function Shot({ image, alt, sizes, eager = false, className = '' }) {
  return (
    <img
      src={image.sm}
      srcSet={`${image.sm} 640w, ${image.lg} 1280w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}

// A browser window frame with traffic lights and the site's address.
export default function BrowserChrome({ url, children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-[0_40px_90px_-30px_rgb(0_0_0/0.85)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-line bg-raised/80 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-lg bg-midnight/70 px-3 py-1.5 font-mono text-[0.72rem] text-muted">
          <FiLock aria-hidden="true" className="shrink-0 text-mint" />
          <span className="truncate">{hostOf(url)}</span>
        </span>
        <span className="hidden w-[52px] sm:block" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}
