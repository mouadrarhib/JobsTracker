import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { STATUSES } from '../types'
import { STATUS_META } from '../statusConfig'
import { useScrollReveal } from '../hooks/useScrollReveal'

const GITHUB_URL = 'https://github.com/mouadrarhib/JobsTracker'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function StampMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron ${className}`}
    >
      <span className="h-3.5 w-3.5 rounded-full bg-saffron" />
    </span>
  )
}

const PATH_D = 'M0 140 C 120 40, 220 200, 340 100 S 560 20, 680 110 S 780 150, 800 90'

function HeroPathLine() {
  const pathRef = useRef<SVGPathElement>(null)
  const dotsRef = useRef<SVGGElement>(null)
  const [dotPoints, setDotPoints] = useState<{ x: number; y: number }[]>([])

  // Sample points directly off the rendered path's geometry, rather than
  // hand-guessing coordinates — guarantees every dot sits exactly on the line.
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    const fractions = [0, 0.2, 0.4, 0.6, 0.8, 1]
    setDotPoints(fractions.map((f) => path.getPointAtLength(f * length)))
  }, [])

  useLayoutEffect(() => {
    const path = pathRef.current
    const dots = dotsRef.current
    if (!path || !dots || dotPoints.length === 0) return

    if (prefersReducedMotion()) {
      gsap.set(path, { strokeDashoffset: 0 })
      gsap.set(dots.children, { opacity: 1, scale: 1 })
      return
    }

    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.set(dots.children, { opacity: 0, scale: 0.4, transformOrigin: 'center' })

    // Dots appear first, as fixed waypoints — then the line draws across and
    // visibly threads through each one, rather than decorating an already-drawn line.
    const tl = gsap.timeline({ delay: 0.3 })
    tl.to(dots.children, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.08, ease: 'back.out(2)' })
    tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, '-=0.1')
  }, [dotPoints])

  return (
    <svg
      viewBox="0 0 800 200"
      className="pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 opacity-[0.16]"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path ref={pathRef} d={PATH_D} fill="none" stroke="#2A78D6" strokeWidth="2.5" strokeLinecap="round" />
      <g ref={dotsRef}>
        {dotPoints.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#D98E2B" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
            <circle cx={p.x} cy={p.y} r="3.5" fill="#D98E2B" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Reveal({
  delay,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useScrollReveal<HTMLDivElement>({ delay })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

function MiniKanban() {
  const cards = [
    { title: 'Data Analyst', company: 'OCP Group', score: 82 },
    { title: 'Product Analyst', company: 'Yassir', score: 91 },
  ]
  return (
    <div className="w-full max-w-xs rounded-xl2 border border-ink/8 bg-paper-dim/70 p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_META.Interview.dot }} />
          <p className="text-xs font-semibold text-ink">Interview</p>
        </div>
        <span className="rounded-full bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">2</span>
      </div>
      <div className="space-y-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-lg border border-ink/8 bg-paper-card p-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-ink">{c.title}</p>
              <span className="rounded-full bg-good/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-good">
                {c.score}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-ink-dim">{c.company}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniContacts() {
  const contacts = [
    { name: 'Yasmine Alaoui', role: 'Talent Acquisition', status: 'Responded', dot: '#1BAF7A' },
    { name: 'Karim Bennani', role: 'Engineering Manager', status: 'Interviewing Me', dot: '#008300' },
    { name: 'Hamza Idrissi', role: 'Recruiter', status: 'Reached Out', dot: '#2A78D6' },
  ]
  return (
    <div className="w-full max-w-xs space-y-2">
      {contacts.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-paper-card p-2.5 shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">{c.name}</p>
            <p className="truncate text-[11px] text-ink-dim">{c.role}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink-dim">
            <span
              className="inline-flex h-3 w-3 items-center justify-center rounded-full"
              style={{ border: `1.5px dashed ${c.dot}` }}
            >
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: c.dot }} />
            </span>
            {c.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-paper-card px-2 py-2.5 text-center shadow-sm">
      <p className="font-mono text-base font-semibold text-ink sm:text-lg">{value}</p>
      <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-ink-dim/70">{label}</p>
    </div>
  )
}

function AnalyticsMockup() {
  const funnel = [
    { label: 'Applied', pct: 100 },
    { label: 'Phone Screen', pct: 55 },
    { label: 'Interview', pct: 30 },
    { label: 'Offer', pct: 8 },
  ]
  const resumeVersions = [
    { label: 'Resume_v4', pct: 84, color: '#008300' },
    { label: 'Resume_v3', pct: 62, color: '#2A78D6' },
    { label: 'Resume_v2', pct: 34, color: '#E34948' },
  ]

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Applications" value="24" />
        <StatTile label="Response rate" value="68%" />
        <StatTile label="Interviews" value="3" />
      </div>

      <div className="rounded-xl2 border border-ink/8 bg-paper-card p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold text-ink">Funnel</p>
        <div className="space-y-2.5">
          {funnel.map((b, i) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[10px] text-ink-dim">{b.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-ink/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${b.pct}%`,
                    backgroundColor: ['#86B6EF', '#5598E7', '#2A78D6', '#104281'][i],
                  }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-ink-dim">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl2 border border-ink/8 bg-paper-card p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold text-ink">Resume performance</p>
        <div className="space-y-2.5">
          {resumeVersions.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate font-mono text-[10px] text-ink-dim">{r.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-ink/5">
                <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-ink-dim">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MiniExport() {
  return (
    <div className="flex w-full max-w-xs flex-wrap gap-2">
      {['JSON', 'CSV', 'PDF'].map((fmt) => (
        <div
          key={fmt}
          className="flex items-center gap-2 rounded-lg border border-ink/8 bg-paper-card px-3.5 py-2.5 shadow-sm"
        >
          <span className="font-mono text-xs font-semibold text-cobalt">{fmt}</span>
        </div>
      ))}
    </div>
  )
}

function FeatureBlock({
  eyebrow,
  title,
  body,
  reverse,
  mockup,
}: {
  eyebrow: string
  title: string
  body: string
  reverse?: boolean
  mockup: React.ReactNode
}) {
  return (
    <Reveal className={`flex flex-col items-center gap-8 md:gap-16 ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <div className="flex-1 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-saffron">{eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">{title}</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim md:mx-0">{body}</p>
      </div>
      <div className="flex flex-1 justify-center">{mockup}</div>
    </Reveal>
  )
}

function PipelineStrip() {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-stage]'), { opacity: 1, x: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-stage]'), {
        opacity: 0,
        x: -16,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
        immediateRender: true,
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
      {STATUSES.map((status, i) => (
        <div key={status} data-stage className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-paper-card px-3 py-1.5 text-xs font-medium text-ink shadow-sm"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_META[status].dot }} />
            {status}
          </span>
          {i < STATUSES.length - 1 && <span className="text-ink-dim/30">→</span>}
        </div>
      ))}
    </div>
  )
}

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = heroRef.current
    if (!el) return

    const targets = el.querySelectorAll('[data-hero-item]')
    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }

    gsap.set(targets, { opacity: 0, y: 24 })
    gsap.to(targets, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.15 })
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-paper">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <StampMark />
          <p className="font-display text-lg font-semibold text-ink">Masār</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-medium text-ink-dim transition hover:text-ink sm:inline"
          >
            View source
          </a>
          <button
            onClick={onGetStarted}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-soft"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden px-4 py-16 md:px-10 md:py-24">
        <HeroPathLine />
        <div className="relative mx-auto max-w-3xl text-center">
          <p data-hero-item className="text-xs font-semibold uppercase tracking-wide text-saffron sm:tracking-widest">
            A personal project — built solo, end to end
          </p>
          <h1
            data-hero-item
            className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Job hunting, run like an engineer builds software.
          </h1>
          <p data-hero-item className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-dim md:text-lg">
            Masār tracks every application, every recruiter conversation, and the one question spreadsheets never
            answer: is your resume actually working?
          </p>
          <div data-hero-item className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="rounded-lg bg-cobalt px-5 py-3 text-sm font-semibold text-white transition hover:bg-cobalt/90"
            >
              Sign in
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
            >
              View source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Why this exists */}
      <Reveal className="mx-auto max-w-2xl px-4 py-16 text-center md:px-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-saffron">Why this exists</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
          A spreadsheet can't tell you why you're not getting responses.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-dim">
          Masār tracks a resume version per application and breaks down response, interview, and offer rate by
          version — so you can tell what's actually working, not just what you've sent.
        </p>
      </Reveal>

      {/* Feature showcase */}
      <div className="mx-auto max-w-4xl space-y-20 px-4 py-8 md:px-10 md:py-16">
        <FeatureBlock
          eyebrow="Pipeline"
          title="Every application, one board."
          body="Drag applications between Wishlist, Applied, Phone Screen, Interview, Technical Test, Offer, Rejected, and Withdrawn — see the whole pipeline at a glance instead of scrolling a spreadsheet."
          mockup={<MiniKanban />}
        />
        <FeatureBlock
          eyebrow="Contacts"
          title="The recruiters and managers you actually talk to."
          body="Log every LinkedIn message, email, and phone call with its own status — Reached Out, Responded, Interviewing Me, Cold — linked to the application it belongs to."
          reverse
          mockup={<MiniContacts />}
        />
        <FeatureBlock
          eyebrow="Analytics"
          title="Numbers that actually answer something."
          body="A real funnel showing where applications stall, response rates, and resume performance broken down by version — not vanity charts."
          mockup={<AnalyticsMockup />}
        />
        <FeatureBlock
          eyebrow="Export"
          title="Your data, in whatever shape you need."
          body="Pick applications, contacts, or the analytics summary, then export as JSON, CSV, or a formatted PDF report."
          reverse
          mockup={<MiniExport />}
        />
      </div>

      {/* How it works */}
      <Reveal className="px-4 py-16 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">One path, eight stages.</h2>
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <PipelineStrip />
        </div>
      </Reveal>

      {/* Built with */}
      <Reveal className="bg-ink px-4 py-16 text-paper md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron">Under the hood</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-paper md:text-3xl">
            Built like a real product, not a prototype.
          </h2>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {[
              {
                title: 'Real security',
                body: 'Row-level security scopes every row to its owner, enforced at the database — not just the UI.',
              },
              {
                title: 'A swappable data layer',
                body: 'This app ran on localStorage before it ran on Postgres, and the components never noticed the difference.',
              },
              {
                title: 'Validated accessibility',
                body: 'Every status color passed a colorblind-safety check before shipping, not just a designer’s eye.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl2 border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-paper">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-paper/60">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Vercel'].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-paper/70"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Final CTA */}
      <Reveal className="px-4 py-16 text-center md:px-10 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">Try it yourself.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-dim">
          It's the same tool I use for my own job search — sign in and it's yours too.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="rounded-lg bg-cobalt px-5 py-3 text-sm font-semibold text-white transition hover:bg-cobalt/90"
          >
            Sign in
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            View source on GitHub
          </a>
        </div>
      </Reveal>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 border-t border-ink/8 px-4 py-8 text-center md:px-10">
        <div className="flex items-center gap-2">
          <StampMark className="h-6 w-6" />
          <p className="font-display text-sm font-semibold text-ink">Masār</p>
        </div>
        <p className="text-xs text-ink-dim">
          Built by{' '}
          <a href="https://github.com/mouadrarhib" target="_blank" rel="noreferrer" className="font-medium text-ink hover:underline">
            Mouad Rarhib
          </a>
          {' · '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:underline">
            Source
          </a>
        </p>
      </footer>
    </div>
  )
}
