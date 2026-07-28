# 🏠 Landing Page Module

The marketing page shown to signed-out visitors. It sells the product using the app's own real UI patterns — mock Kanban cards, mock contact rows, mock charts — instead of generic stock screenshots, so what you see on the landing page is what you get after signing in.

**File:** `src/pages/Landing.tsx`
**Route:** none — rendered directly by `AuthGate` in `src/App.tsx` when there is no signed-in user and the visitor hasn't clicked through to `Login` yet.

---

## Where it fits

```
App.tsx
└── AuthGate               (holds view state: 'landing' | 'login')
    ├── user is null, view === 'landing'  →  <Landing onGetStarted={...} />
    ├── user is null, view === 'login'    →  <Login onBack={...} />
    └── user is present                   →  the full authenticated app
```

`Landing` is the only page lazy-loaded (`lazy(() => import('./pages/Landing'))`), because it pulls in GSAP for animation and is never needed once a user is signed in — no reason to ship it in the main bundle for returning users.

`Landing` takes a single prop, `onGetStarted: () => void`, called from both the nav bar and the hero/footer CTAs. `AuthGate` wires that prop to flip its local view state to `'login'`, which swaps in the `Login` page. The landing page itself has no auth logic, no router awareness, and no knowledge of what happens after the click — it's a pure presentational component.

## Structure

The page is one long scroll of sections, top to bottom:

| Section | Purpose |
|---|---|
| Nav | Logo, "View source" link to GitHub, "Sign in" button |
| Hero | Headline, subhead, animated path illustration, CTA buttons |
| "Why this exists" | One-paragraph pitch: resume-version tracking is the differentiator |
| Feature showcase | Four `FeatureBlock`s (Pipeline, Contacts, Analytics, Export), alternating left/right, each paired with a small mock of the real UI |
| "How it works" | The 8-stage pipeline rendered as a horizontal strip (`PipelineStrip`) |
| "Under the hood" | Dark section: three credibility cards (RLS security, swappable data layer, validated accessibility) + tech badge row |
| Final CTA | Repeat sign-in / view-source buttons |
| Footer | Logo, author credit, source link |

## Mock components

These render fake data — they exist purely to look like the real screens without depending on any store or backend call:

- **`MiniKanban`** — two hardcoded application cards under an "Interview" column header, styled identically to `KanbanCard`/`KanbanColumn`.
- **`MiniContacts`** — three hardcoded contact rows with status pills.
- **`AnalyticsMockup`** — three `StatTile`s plus two hand-built bar charts (funnel, resume performance) drawn with plain divs, not Recharts — no need for a charting library just to fake a preview.
- **`MiniExport`** — three static pills: `JSON`, `CSV`, `PDF`.
- **`PipelineStrip`** — the *real* `STATUSES` array from `src/types.ts` and `STATUS_META` from `src/statusConfig.ts`, rendered as connected pills. This one **is** live data (well, live config), so the stage names and colors can never drift from the actual app.

## Animation

All animation is GSAP, gated behind `prefers-reduced-motion`:

```ts
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

Every animated block checks this first and, if true, jumps straight to the end state (`opacity: 1`, `y: 0`, etc.) with no tween — the page is instantly fully visible.

- **Hero items** (`[data-hero-item]`) fade/slide in with a staggered `gsap.to` on mount.
- **`HeroPathLine`** draws an SVG path stroke-by-stroke using `strokeDasharray`/`strokeDashoffset`, with dots appearing at fixed points along the path first, then the line animating through them. Dot positions are sampled from the actual rendered path geometry (`path.getPointAtLength`) rather than hardcoded coordinates, so they always sit exactly on the curve regardless of viewBox tweaks.
- **`Reveal`** (wraps `useScrollReveal`, see [Shared Components](shared-components.md#usescrollreveal)) fades sections in as they scroll into view, using GSAP's `ScrollTrigger`.
- **`PipelineStrip`** staggers each stage pill in from the left as it scrolls into view.

## Design notes

- Uses the same Tailwind design tokens as the authenticated app (`ink`, `paper`, `cobalt`, `saffron`, etc.) — no separate marketing theme to keep in sync.
- `GITHUB_URL` is a single constant (`https://github.com/mouadrarhib/JobsTracker`) reused across every "View source" link and the footer.
- The hero copy and "why this exists" section deliberately foreground the **resume-version analytics** feature as the product's real differentiator, not just another applicant tracker.

## Related modules

- [Authentication](authentication.md) — what `onGetStarted` ultimately leads to
- [Pipeline](pipeline.md), [Contacts](contacts.md), [Analytics](analytics.md), [Export](export.md) — the real features `Landing` previews
- [Shared Components](shared-components.md) — `useScrollReveal`, badges, and pills reused from the mock components
