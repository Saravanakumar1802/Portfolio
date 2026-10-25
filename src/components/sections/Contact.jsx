import { useEffect, useRef, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiCopy, FiDownload, FiMail, FiSend } from 'react-icons/fi'
import { site } from '../../data/site'
import { useInViewport } from '../../hooks/useInViewport'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import SectionTitle from '../ui/SectionTitle'
import { gsap, useGSAP } from '../../lib/gsap'
import avatar from '../../assets/optimized/profile-640.webp'

const OPENERS = [
  'Hey there 👋',
  'Got a product, a role, or just an idea you want to talk through?',
  'Drop a message below — I usually reply within a day.',
]

function Bubble({ from, children }) {
  const mine = from === 'you'
  return (
    <li className={`flex animate-[bubble-in_0.35s_var(--ease-spring)] ${mine ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-[1.3rem] px-4 py-2.5 leading-snug ${
          mine ? 'rounded-br-md bg-crimson text-white' : 'rounded-bl-md bg-raised text-ink'
        }`}
      >
        {children}
      </p>
    </li>
  )
}

function Typing() {
  return (
    <li className="flex" aria-label="Saravana is typing">
      <span className="flex gap-1 rounded-[1.3rem] rounded-bl-md bg-raised px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </li>
  )
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return undefined
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${site.email}`
    }
  }

  return (
    <button type="button" onClick={copy} className="keycap keycap--ghost" aria-live="polite">
      {copied ? <FiCheck aria-hidden="true" className="text-mint" /> : <FiCopy aria-hidden="true" />}
      {copied ? 'Copied!' : 'Copy email'}
    </button>
  )
}

export default function Contact() {
  const form = useRef(null)
  const thread = useRef(null)
  const chat = useRef(null)
  const inView = useInViewport(chat, { margin: '-20% 0px', once: true })
  const reducedMotion = useReducedMotion()
  const [shown, setShown] = useState(0)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')

  // The chat window swings up in 3D as it scrolls into view.
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        chat.current,
        { rotateX: 28, y: 90, transformPerspective: 1200, transformOrigin: '50% 100%' },
        {
          rotateX: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: chat.current, start: 'top bottom', end: 'top 45%', scrub: 0.6 },
        },
      )
    })
  })

  // Openers arrive one by one once the chat scrolls into view.
  useEffect(() => {
    if (!inView || shown >= OPENERS.length) return undefined
    const id = setTimeout(() => setShown((n) => n + 1), reducedMotion ? 0 : shown === 0 ? 300 : 1100)
    return () => clearTimeout(id)
  }, [inView, shown, reducedMotion])

  useEffect(() => {
    const node = thread.current
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [shown, messages, status, reducedMotion])

  const onSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(form.current)
    const name = String(data.get('user_name')).trim()
    const text = String(data.get('message')).trim()
    if (!name || !text) return
    setMessages((m) => [...m, { from: 'you', text }])
    setStatus('sending')
    try {
      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.sendForm(site.emailjs.serviceId, site.emailjs.templateId, form.current, {
        publicKey: site.emailjs.publicKey,
      })
      form.current.reset()
      setMessages((m) => [
        ...m,
        {
          from: 'me',
          text: `Got it, ${name.split(' ')[0]}! Thanks for reaching out — I’ll reply to your email soon. 🙌`,
        },
      ])
      setStatus('sent')
    } catch {
      setMessages((m) => [
        ...m,
        { from: 'me', text: `Hmm, that didn’t go through. Could you email me directly at ${site.email}?` },
      ])
      setStatus('error')
    }
  }

  const sending = status === 'sending'
  const typingOpener = inView && shown < OPENERS.length

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-x-clip py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[30rem] w-[40rem] rounded-full bg-sky/10 blur-[120px]"
      />
      <div className="section-shell grid items-start gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div className="lg:sticky lg:top-24">
          <SectionTitle
            id="contact-title"
            eyebrow="Contact"
            title={['Let’s build', 'something good.']}
            intro="Freelance, full-time or a quick question — this chat goes straight to my inbox."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <CopyEmail />
            <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="keycap keycap--ghost">
              <site.whatsapp.icon aria-hidden="true" /> WhatsApp
            </a>
            <a href={site.resumeUrl} download className="keycap keycap--ghost">
              <FiDownload aria-hidden="true" /> Résumé
            </a>
          </div>
          <ul className="mt-8 flex gap-3" aria-label="Social profiles">
            {site.socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg text-ink transition hover:-translate-y-1 hover:border-white/30 hover:bg-raised"
                >
                  <social.icon aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email"
                className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg text-ink transition hover:-translate-y-1 hover:border-white/30 hover:bg-raised"
              >
                <FiMail aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <div
          ref={chat}
          className="chat-window overflow-hidden rounded-[1.75rem] border border-line bg-surface/90 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.85)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 border-b border-line bg-raised/60 px-5 py-4">
            <span className="relative">
              <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover object-top" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-mint" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-ink">{site.displayName}</p>
              <p className="text-sm text-muted">Usually replies within a day</p>
            </div>
          </div>

          <ol
            ref={thread}
            className="h-[22rem] space-y-2.5 overflow-y-auto px-5 py-5"
            aria-live="polite"
            aria-label="Conversation"
          >
            {OPENERS.slice(0, shown).map((text) => (
              <Bubble key={text} from="me">
                {text}
              </Bubble>
            ))}
            {messages.map((m, i) => (
              <Bubble key={i} from={m.from}>
                {m.text}
              </Bubble>
            ))}
            {(typingOpener || sending) && <Typing />}
          </ol>

          <form ref={form} onSubmit={onSubmit} className="space-y-3 border-t border-line bg-midnight/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">Your name</span>
                <input
                  name="user_name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 focus:border-sky/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="sr-only">Your email</span>
                <input
                  name="user_email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 focus:border-sky/60 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex items-end gap-3">
              <label className="block flex-1">
                <span className="sr-only">Message</span>
                <textarea
                  name="message"
                  required
                  rows={2}
                  placeholder="Type a message…"
                  className="block w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 focus:border-sky/60 focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      form.current.requestSubmit()
                    }
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="keycap keycap--crimson h-[3.25rem] shrink-0 disabled:opacity-60"
              >
                <FiSend aria-hidden="true" />
                <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
                <span className="sr-only sm:hidden">Send</span>
              </button>
            </div>
            <p className="px-1 text-xs text-muted">
              Enter to send · Shift + Enter for a new line · or email{' '}
              <a className="text-ink underline decoration-crimson underline-offset-4" href={`mailto:${site.email}`}>
                {site.email} <FiArrowUpRight aria-hidden="true" className="inline" />
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
