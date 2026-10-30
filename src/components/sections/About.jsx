import { useRef, useState } from 'react'
import {
  FiActivity,
  FiArrowUpRight,
  FiAtSign,
  FiBatteryCharging,
  FiFileText,
  FiImage,
  FiTerminal,
  FiWifi,
} from 'react-icons/fi'
import { gsap, useGSAP } from '../../lib/gsap'
import { site } from '../../data/site'
import { useClock } from '../../hooks/useClock'
import OsWindow from '../ui/OsWindow'
import Counter from '../ui/Counter'
import Terminal from '../ui/Terminal'
import StickyNote from '../ui/StickyNote'
import profileSm from '../../assets/optimized/profile-640.webp'
import profileLg from '../../assets/optimized/profile-1280.webp'

const NOTE_COLORS = ['#ffd166', '#7cc4ff', '#5ee0a8']

// Window placement on the desktop (lg+). Below lg they stack in this order.
const WINDOWS = {
  about: { title: site.about.file, icon: FiFileText, place: 'lg:left-0 lg:top-[2%] lg:w-[42%]' },
  photo: {
    title: 'me.jpg',
    icon: FiImage,
    place: 'mx-auto w-full max-w-sm lg:left-[44%] lg:top-0 lg:mx-0 lg:w-[20%]',
  },
  profiles: { title: 'profiles.app', icon: FiAtSign, place: 'lg:left-[66%] lg:top-[2%] lg:w-[26%]' },
  activity: { title: 'Activity', icon: FiActivity, place: 'lg:left-[66%] lg:top-[37%] lg:w-[26%]' },
  terminal: {
    title: 'terminal — zsh',
    icon: FiTerminal,
    place: 'h-[21rem] lg:left-[40%] lg:bottom-[2%] lg:h-[40%] lg:w-[52%]',
  },
}

function MenuBar() {
  const time = useClock(site.timeZone, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-midnight/40 px-4 py-2 text-[0.8rem] text-ink/90 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2 font-semibold">
          <span className="h-3 w-3 rounded-full bg-crimson shadow-[0_0_12px_#e8364f]" aria-hidden="true" />
          SaravanaOS
        </span>
        <span className="hidden gap-4 text-ink/60 sm:flex" aria-hidden="true">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-ink/70" aria-hidden="true">
        <FiWifi />
        <FiBatteryCharging />
        <span className="font-medium text-ink/90">{time}</span>
      </div>
    </div>
  )
}

function DesktopIcon({ label, icon: Icon, href, download, onClick }) {
  const body = (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-2xl text-ink shadow-lg ring-1 ring-white/10 transition group-hover:scale-110 group-hover:bg-white/15">
        <Icon aria-hidden="true" />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </>
  )
  const className =
    'desk-icon group flex w-20 flex-col items-center gap-1.5 rounded-xl p-2 text-center text-xs text-ink/85 transition hover:bg-white/10'
  return href ? (
    <a href={href} download={download} className={className}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} aria-label={`Open ${label}`}>
      {body}
    </button>
  )
}

function Profiles() {
  const profiles = site.socials.filter((s) => s.name !== 'X')
  return (
    <ul className="divide-y divide-line">
      {profiles.map(({ name, handle, href, icon: Icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-raised text-xl text-ink ring-1 ring-line transition group-hover:bg-crimson group-hover:text-white">
              <Icon aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{name}</span>
              <span className="block truncate text-xs text-muted">{handle}</span>
            </span>
            <FiArrowUpRight
              aria-hidden="true"
              className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function About() {
  const root = useRef(null)
  const [closed, setClosed] = useState([])
  const [reopened, setReopened] = useState([])

  const close = (id) => setClosed((list) => [...list, id])
  const reopen = (id) => {
    setClosed((list) => list.filter((x) => x !== id))
    setReopened((list) => [...list, id])
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The section overlaps the last screen of the hero dive. It stays
        // hidden while the camera flies in, then the desktop switches on over
        // the monitor's wallpaper and settles from a slight zoom.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: root.current, start: 'top 18%', end: 'top top', scrub: 0.5 },
          })
          .fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
          .fromTo('.os-desktop', { scale: 1.08, y: 40 }, { scale: 1, y: 0, duration: 1 }, 0)
        gsap.from('.os-window-inner', {
          scale: 0.88,
          autoAlpha: 0,
          y: 40,
          duration: 0.9,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: root.current, start: 'top 16%', once: true },
        })
        gsap.from('.sticky-note', {
          y: 60,
          autoAlpha: 0,
          clearProps: 'transform',
          duration: 0.9,
          delay: 0.35,
          stagger: 0.1,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: root.current, start: 'top 16%', once: true },
        })
      })
    },
    { scope: root },
  )

  const win = (id, children, bodyClassName = '') =>
    !closed.includes(id) && (
      <OsWindow
        key={id}
        title={WINDOWS[id].title}
        icon={WINDOWS[id].icon}
        className={`relative lg:absolute ${WINDOWS[id].place}`}
        bodyClassName={bodyClassName}
        onClose={() => close(id)}
        animateIn={reopened.includes(id)}
      >
        {children}
      </OsWindow>
    )

  return (
    <section id="about" ref={root} aria-labelledby="about-title" className="os-wallpaper relative z-10 overflow-hidden motion-safe:-mt-[100svh]">
      <MenuBar />
      {/* Windows and notes can be dragged anywhere in this full-width area. */}
      <div data-drag-bounds className="relative">
        <div className="section-shell pb-24 pt-14 lg:pb-16">
          <h2 id="about-title" className="sr-only">
            About Saravana
          </h2>
          <div className="os-desktop relative flex origin-top flex-col gap-6 lg:block lg:h-[min(860px,calc(100svh-6rem))] lg:min-h-[740px]">
            {win(
              'about',
              <>
                <p className="display text-[clamp(1.9rem,3.4vw,2.9rem)] text-ink">{site.about.heading}</p>
                <div className="mt-5 space-y-4 text-pretty leading-relaxed text-muted">
                  {site.about.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </>,
              'p-6 sm:p-8',
            )}

            {win(
              'photo',
              <figure>
                <img
                  src={profileSm}
                  srcSet={`${profileSm} 640w, ${profileLg} 1280w`}
                  sizes="(min-width: 1024px) 21vw, 90vw"
                  alt="Portrait of Saravana Kumar in a white shirt"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
                <figcaption className="border-t border-line px-4 py-2.5 text-xs text-muted">
                  The real one — {site.location}
                </figcaption>
              </figure>,
            )}

            {win('profiles', <Profiles />)}

            {win(
              'activity',
              site.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-w-0 flex-col items-center justify-center px-2 py-4 text-center"
                >
                  <p className="display flex items-baseline gap-1 whitespace-nowrap text-ink">
                    <span className="text-[clamp(1.6rem,2.3vw,2.2rem)] leading-none">
                      <Counter value={stat.value} decimals={stat.decimals} />
                    </span>
                    {stat.unit && <span className="text-sm text-crimson">{stat.unit}</span>}
                  </p>
                  <p className="mt-2 text-[0.7rem] leading-snug text-muted">{stat.short ?? stat.label}</p>
                </div>
              )),
              'grid grid-cols-3 divide-x divide-line',
            )}

            {win('terminal', <Terminal />)}

            <ul className="grid grid-cols-2 gap-6 px-2 pt-4 sm:grid-cols-3 lg:absolute lg:bottom-[3%] lg:left-0 lg:flex lg:w-[38%] lg:gap-4 lg:p-0">
              {site.roleCards.map((role, i) => (
                <StickyNote
                  key={role.title}
                  title={role.title}
                  note={role.note}
                  color={NOTE_COLORS[i]}
                  tilt={[-3, 2, -1.5][i]}
                  className="lg:w-[31%]"
                />
              ))}
            </ul>

            <nav
              data-dock
              aria-label="Desktop shortcuts"
              className="flex flex-wrap justify-center gap-2 lg:absolute lg:right-0 lg:top-[2%] lg:w-20 lg:flex-col"
            >
              <DesktopIcon href={site.resumeUrl} download label="Résumé" icon={FiFileText} />
              {closed.map((id) => (
                <DesktopIcon key={id} label={WINDOWS[id].title} icon={WINDOWS[id].icon} onClick={() => reopen(id)} />
              ))}
            </nav>
          </div>
          <p className="mt-6 hidden text-center text-sm text-ink/60 lg:block">
            Drag the windows and notes anywhere, close them, or type <code className="font-mono text-sky">help</code> in
            the terminal.
          </p>
        </div>
      </div>
    </section>
  )
}
