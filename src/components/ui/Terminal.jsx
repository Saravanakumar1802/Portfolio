import { useEffect, useRef, useState } from 'react'
import { site } from '../../data/site'
import { projects } from '../../data/projects'
import { skillCategories, skills } from '../../data/skills'
import { SECTIONS } from '../../data/sections'
import { navigateTo } from '../../lib/navigation'
import { useInViewport } from '../../hooks/useInViewport'
import { useReducedMotion } from '../../hooks/useMediaQuery'

const PROMPT = 'saravana@studio:~$'
const flagship = projects.featured.filter((p) => p.tier === 'flagship')
const social = (name) => site.socials.find((s) => s.name === name)

// Colour themes (`theme <name>`).
const THEMES = {
  midnight: { bg: '#070b19', prompt: '#e8364f', accent: '#7cc4ff', ok: '#5ee0a8' },
  matrix: { bg: '#03110a', prompt: '#39ff88', accent: '#9dffc4', ok: '#39ff88' },
  crimson: { bg: '#14060b', prompt: '#ff5c73', accent: '#ffb3bf', ok: '#ffd166' },
}

// Lines are strings or arrays of parts: { text, tone, href }. Tones map to the
// active theme so output restyles when the theme changes.
const t = (text, tone) => ({ text, tone })

function openProfile(profile) {
  window.open(profile.href, '_blank', 'noopener,noreferrer')
  return [[t(`↗ Opening ${profile.name} ${profile.handle}`, 'ok')]]
}

const COMMANDS = {
  help: {
    about: 'list commands',
    run: () => [
      [t('Commands', 'accent')],
      ...Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => [t(`  ${name.padEnd(12)}`, 'prompt'), t(c.about, 'muted')]),
      [t('Tips: Tab completes · ↑↓ history · Ctrl+L clears', 'muted')],
    ],
  },
  whoami: {
    about: 'who is this?',
    run: () => [[t(site.displayName, 'ink'), t(` — ${site.roles.join(' · ')}`, 'muted')]],
  },
  neofetch: { about: 'system info, the classic way', run: () => [{ neofetch: true }] },
  about: { about: 'a short story', run: () => [site.about.heading, ...site.about.paragraphs.slice(0, 2)] },
  skills: {
    about: 'my toolkit by category',
    run: () =>
      Object.entries(skillCategories).map(([key, cat]) => [
        t(`${cat.label.padEnd(16)}`, 'muted'),
        {
          text: skills
            .filter((s) => s.category === key)
            .map((s) => s.name)
            .join(', '),
          color: cat.color,
        },
      ]),
  },
  projects: {
    about: 'things I shipped',
    run: () => [
      ...flagship.map((p, i) => [t(`  ${i + 1}. ${p.title.padEnd(16)}`, 'ink'), t(p.kind, 'muted')]),
      [t('Try ', 'muted'), t('project 1', 'accent'), t(' for details.', 'muted')],
    ],
  },
  project: {
    about: 'details, e.g. "project 2"',
    run: (arg) => {
      const p = flagship[Number(arg) - 1]
      if (!p) return [[t(`project: choose 1–${flagship.length}`, 'muted')]]
      return [
        [t(p.title, 'ink'), t(` · ${p.kind}`, 'muted')],
        p.description,
        [t('stack  ', 'muted'), t(p.stack.join(' · '), 'accent')],
        [t('live   ', 'muted'), { text: p.demo.replace('https://', ''), href: p.demo, tone: 'accent' }],
        [t('code   ', 'muted'), { text: p.repo.replace('https://', ''), href: p.repo, tone: 'accent' }],
      ]
    },
  },
  experience: {
    about: 'where I work',
    run: () => [
      [t(site.experience.title, 'ink'), t(` @ ${site.experience.company}`, 'prompt')],
      [t(`${site.experience.period} · ${site.experienceYears} years`, 'muted')],
      ...site.experience.branches.map((b) => [t(`  ${b.label.padEnd(14)}`, 'accent'), t(b.title, 'muted')]),
    ],
  },
  ai: {
    about: 'watch an AI contract analysis run',
    run: () => ({
      stream: [
        [t('$ analyse ./contracts/msa-acme.pdf', 'muted')],
        [t('› reading PDF (12 pages) ................ ', 'muted'), t('✓', 'ok')],
        [
          t('› extracting parties .................... ', 'muted'),
          t('✓ ', 'ok'),
          t('Acme Corp ↔ Northwind Ltd', 'ink'),
        ],
        [t('› finding key dates ..................... ', 'muted'), t('✓ ', 'ok'), t('renews 2027-03-31', 'ink')],
        [t('› scoring clauses for risk .............. ', 'muted'), t('⚠ 2 high-risk clauses', 'prompt')],
        [t('› validating against ContractSchema ..... ', 'muted'), t('✓', 'ok')],
        [t('{ "parties": 2, "renewal": "2027-03-31", "risks": ["auto-renewal", "liability cap"] }', 'accent')],
        [t('Done in 2.4s — structured data, ready for the dashboard.', 'ok')],
      ],
      delay: 420,
    }),
  },
  now: {
    about: 'what I am up to',
    run: () => site.about.now.map(({ label, value }) => [t(`${label.padEnd(10)}`, 'muted'), t(value, 'ok')]),
  },
  open: {
    about: 'jump to a section, e.g. "open work"',
    run: (arg) => {
      const target = SECTIONS.find((s) => s.id === arg || s.label.toLowerCase() === arg)
      if (!target) return [[t(`open: try ${SECTIONS.map((s) => s.id).join(', ')}`, 'muted')]]
      setTimeout(() => navigateTo(target.id), 500)
      return [[t(`↪ Opening ${target.label}…`, 'ok')]]
    },
  },
  github: { about: 'open my GitHub', run: () => openProfile(social('GitHub')) },
  leetcode: { about: 'open my LeetCode', run: () => openProfile(social('LeetCode')) },
  linkedin: { about: 'open my LinkedIn', run: () => openProfile(social('LinkedIn')) },
  resume: {
    about: 'download my CV',
    run: () => {
      const link = document.createElement('a')
      link.href = site.resumeUrl
      link.download = ''
      link.click()
      return [[t('↓ Downloading Saravana-Cv.pdf', 'ok')]]
    },
  },
  contact: {
    about: 'ways to reach me',
    run: () => [
      [t('email    ', 'muted'), { text: site.email, href: `mailto:${site.email}`, tone: 'accent' }],
      [t('whatsapp ', 'muted'), { text: site.whatsapp.label, href: site.whatsapp.href, tone: 'accent' }],
    ],
  },
  theme: {
    about: 'midnight · matrix · crimson',
    run: (arg, ctx) => {
      if (!THEMES[arg]) return [[t(`theme: choose ${Object.keys(THEMES).join(', ')}`, 'muted')]]
      ctx.setTheme(arg)
      return [[t(`✓ Theme set to ${arg}`, 'ok')]]
    },
  },
  history: {
    about: 'previous commands',
    run: (_, ctx) => (ctx.history.length ? [...ctx.history].reverse().map((h, i) => `  ${i + 1}  ${h}`) : ['(empty)']),
  },
  echo: { about: 'print text', run: (arg) => [arg || ''] },
  ls: { about: 'list files', run: () => [[t('about.txt  me.jpg  profiles.app  projects/  resume.pdf', 'accent')]] },
  cat: {
    about: 'read a file',
    run: (arg) => (arg === 'about.txt' ? [site.about.heading, ...site.about.paragraphs] : [`cat: try "cat about.txt"`]),
  },
  date: {
    about: 'time in India',
    run: () => [new Date().toLocaleString('en-IN', { timeZone: site.timeZone }) + ' IST'],
  },
  clear: { about: 'clear the screen', run: () => null },
  sudo: {
    about: 'try "sudo hire-me"',
    run: (arg) => {
      if (arg !== 'hire-me') return ['sudo: permission denied. (try "sudo hire-me")']
      setTimeout(() => navigateTo('contact'), 900)
      return [[t('✔ Permission granted. Opening a chat with Saravana…', 'ok')]]
    },
  },
  coffee: {
    hidden: true,
    run: () => [
      '   ( (',
      '    ) )',
      '  ........',
      '  |      |]',
      '  \\      /',
      "   `----'",
      [t('Brewing… ☕ fuel for the next feature.', 'ok')],
    ],
  },
}

const CHIPS = ['help', 'neofetch', 'ai', 'projects', 'sudo hire-me']

const LOGO = [
  '███████╗██╗  ██╗',
  '██╔════╝██║ ██╔╝',
  '███████╗█████╔╝ ',
  '╚════██║██╔═██╗ ',
  '███████║██║  ██╗',
  '╚══════╝╚═╝  ╚═╝',
]

function Neofetch({ theme }) {
  const rows = [
    ['user', 'saravana@studio'],
    ['os', 'SaravanaOS v4 (After Hours)'],
    ['host', site.experience.company],
    ['uptime', `${site.experienceYears} years shipping`],
    ['shell', 'zsh + caffeine'],
    ['stack', 'React · Node · Express · MongoDB · Python'],
    ['ai', 'PDF extraction · contract analysis'],
    ['location', site.location],
  ]
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 py-1">
      <pre className="leading-[1.15]" style={{ color: theme.prompt }}>
        {LOGO.join('\n')}
      </pre>
      <div>
        {rows.map(([k, v]) => (
          <p key={k}>
            <span style={{ color: theme.accent }}>{k.padEnd(9)}</span>
            <span className="text-ink/90">{v}</span>
          </p>
        ))}
        <p className="mt-1 flex gap-1" aria-hidden="true">
          {['#e8364f', '#ffd166', '#5ee0a8', '#7cc4ff', '#b8c2e0', '#141a30'].map((c) => (
            <span key={c} className="h-3 w-5 rounded-sm" style={{ background: c }} />
          ))}
        </p>
      </div>
    </div>
  )
}

function Line({ line, theme }) {
  if (line?.neofetch) return <Neofetch theme={theme} />
  if (typeof line === 'string') return <p className="whitespace-pre-wrap text-ink/85">{line}</p>
  const colour = (part) =>
    part.color ??
    { prompt: theme.prompt, accent: theme.accent, ok: theme.ok, ink: '#eef1fb', muted: '#8f9bbd' }[part.tone]
  return (
    <p className="whitespace-pre-wrap">
      {line.map((part, i) =>
        part.href ? (
          <a
            key={i}
            href={part.href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-4 hover:decoration-solid"
            style={{ color: colour(part) }}
          >
            {part.text}
          </a>
        ) : (
          <span key={i} style={{ color: colour(part) }}>
            {part.text}
          </span>
        ),
      )}
    </p>
  )
}

export default function Terminal() {
  const root = useRef(null)
  const input = useRef(null)
  const scroller = useRef(null)
  const timers = useRef([])
  const inView = useInViewport(root, { margin: '-15% 0px', once: true })
  const reducedMotion = useReducedMotion()
  const [theme, setTheme] = useState('midnight')
  const [entries, setEntries] = useState([
    { lines: [[t('SaravanaOS v4 — type ', 'muted'), t('help', 'accent'), t(' or tap a command below.', 'muted')]] },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)
  const [completion, setCompletion] = useState(null)
  const demoed = useRef(false)
  const palette = THEMES[theme]

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = (raw) => {
    const text = raw.trim()
    if (!text) return
    const [name, ...rest] = text.split(/\s+/)
    const arg = rest.join(' ').toLowerCase()
    const command = COMMANDS[name.toLowerCase()]
    setHistory((h) => [text, ...h].slice(0, 30))
    setCursor(-1)
    if (name.toLowerCase() === 'clear') {
      setEntries([])
      return
    }
    const result = command
      ? command.run(arg, { setTheme, history })
      : [[t(`command not found: ${name}. Try `, 'muted'), t('help', 'accent')]]
    if (result?.stream) {
      // Stream lines one by one for the animated demos.
      setEntries((e) => [...e, { command: text, lines: [] }])
      result.stream.forEach((line, i) => {
        const id = setTimeout(
          () =>
            setEntries((e) => {
              const copy = e.slice()
              const last = copy[copy.length - 1]
              copy[copy.length - 1] = { ...last, lines: [...last.lines, line] }
              return copy
            }),
          reducedMotion ? 0 : (i + 1) * result.delay,
        )
        timers.current.push(id)
      })
      return
    }
    setEntries((e) => [...e, { command: text, lines: result ?? [] }])
  }

  // A one-time demo: type "whoami" when the terminal first appears.
  useEffect(() => {
    if (!inView || demoed.current) return undefined
    demoed.current = true
    if (reducedMotion) {
      run('whoami')
      return undefined
    }
    const word = 'whoami'
    const ids = word.split('').map((_, i) => setTimeout(() => setValue(word.slice(0, i + 1)), 500 + i * 110))
    ids.push(
      setTimeout(
        () => {
          run(word)
          setValue('')
        },
        500 + word.length * 110 + 350,
      ),
    )
    return () => ids.forEach(clearTimeout)
  }, [inView, reducedMotion]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [entries])

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      run(value)
      setValue('')
      setCompletion(null)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = Math.max(-1, Math.min(history.length - 1, cursor + (event.key === 'ArrowUp' ? 1 : -1)))
      setCursor(next)
      setValue(next === -1 ? '' : history[next])
    } else if (event.key === 'Tab') {
      // Cycle through every command that matches what was typed.
      event.preventDefault()
      const stem = completion?.stem ?? value.toLowerCase()
      const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(stem))
      if (!stem || !matches.length) return
      const index = completion ? (completion.index + 1) % matches.length : 0
      setCompletion({ stem, index })
      setValue(matches[index])
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault()
      setEntries([])
    } else if (event.key === 'c' && event.ctrlKey && value) {
      event.preventDefault()
      setEntries((e) => [...e, { command: `${value}^C`, lines: [] }])
      setValue('')
    } else {
      setCompletion(null)
    }
  }

  return (
    <div
      ref={root}
      className="flex h-full min-h-[16rem] flex-col font-mono text-[0.74rem] leading-6 transition-colors duration-500"
      style={{ background: palette.bg }}
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
        {entries.map((entry, i) => (
          <div key={i}>
            {entry.command && (
              <p>
                <span style={{ color: palette.prompt }}>{PROMPT}</span>{' '}
                <span className="text-ink">{entry.command}</span>
              </p>
            )}
            {entry.lines.map((line, j) => (
              <Line key={j} line={line} theme={palette} />
            ))}
          </div>
        ))}
        <label className="flex items-center gap-2">
          <span className="shrink-0" style={{ color: palette.prompt }}>
            {PROMPT}
          </span>
          <span className="sr-only">Terminal command</span>
          <input
            ref={input}
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setCompletion(null)
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none"
            style={{ caretColor: palette.prompt }}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-white/5 px-3 py-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              run(chip)
            }}
            className="rounded-md border border-white/10 px-2 py-0.5 text-[0.68rem] text-muted transition hover:border-white/25 hover:text-ink"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
