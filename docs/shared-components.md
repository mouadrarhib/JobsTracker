# 🧩 Shared Components Module

The small, reusable pieces that every page builds on: navigation, badges, and the scroll-reveal animation hook. None of these hold business logic — they're presentation and layout, consumed by the feature modules documented elsewhere.

**Files:**
- `src/components/Sidebar.tsx` — navigation, account, export entry point
- `src/components/PageHeader.tsx` — page title/subtitle bar
- `src/components/StatCard.tsx` — metric tile (label, big number, hint)
- `src/components/StatusBadge.tsx` / `src/components/ContactStatusBadge.tsx` — status pills, application and contact flavors
- `src/components/StatusPill.tsx` — the underlying pill both badges render through
- `src/components/ScoreBadge.tsx` — colored match-score chip
- `src/hooks/useScrollReveal.ts` — GSAP scroll-triggered fade-in

---

## `Sidebar`

The app's persistent navigation, rendered once at the top of the authenticated layout (`App.tsx`) alongside the routed page content. Two responsive forms, not two components:

- **Desktop (`md:` and up)**: a hover-reveal drawer. A thin 4px strip pinned to the left edge (`onMouseEnter` sets `open`) expands into a full 240px sidebar; it collapses again `onMouseLeave`. This keeps the full page width available for content by default, at the cost of the nav being hidden until hovered.
- **Mobile**: a fixed top bar with a hamburger button that opens the same `<aside>` as an overlay (with a backdrop that closes it on click), since hover doesn't exist as an interaction on touch devices.

Contents, top to bottom: logo/wordmark, a "+ Log application" button (`useDrawer().openCreate()`), the five `NavLink`s (Dashboard, Pipeline, Applications, Contacts, Analytics — active route highlighted via `NavLink`'s `isActive` render prop), then a footer block with the live application count, an "Export data..." button that opens `ExportModal` (see [Export](export.md)), and — if signed in — the user's email plus a "Sign out" link (via [`useAuth`](authentication.md#useauth--the-auth-context)).

## `PageHeader`

The single-purpose title bar used identically at the top of every page (`Dashboard`, `Pipeline`, `ApplicationsTable`, `Contacts`, `Analytics`):

```tsx
<PageHeader title="Dashboard" subtitle="Your job search, at a glance." />
```

Just a title, an optional subtitle, and a bottom border — deliberately minimal so every page's header looks and behaves identically without each page rebuilding it.

## `StatCard`

```tsx
<StatCard label="Response rate" value="68%" hint="Beyond initial application" />
```

A bordered tile: small uppercase label, large number/value, optional explanatory hint below. Used across [Dashboard](dashboard.md) and [Analytics](analytics.md) for every headline metric — one component, so every stat tile in the app has identical spacing and typography.

## `StatusPill`, `StatusBadge`, `ContactStatusBadge`

`StatusPill` is the shared rendering primitive — a soft-background pill with a small dashed-ring dot and a label:

```tsx
export function StatusPill({ label, soft, dot, size = 'md' }: {...}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium text-ink ${soft} ${padding}`}>
      <span style={{ border: `1.5px dashed ${dot}` }}>
        <span style={{ backgroundColor: dot }} />
      </span>
      {label}
    </span>
  )
}
```

`StatusBadge` and `ContactStatusBadge` are both one-line wrappers that look up the right `soft`/`dot` values — from [`STATUS_META`](pipeline.md#statusconfigts) or [`CONTACT_STATUS_META`](contacts.md#contactstatusconfigts) respectively — and hand them to `StatusPill`. This split means the pill's visual design lives in exactly one place, while each domain (pipeline status vs. contact status) only needs to supply which color config to read from.

## `ScoreBadge`

A circular chip showing an application's 0–100 match score, colored by tier:

```ts
function scoreTier(score: number) {
  if (score >= 75) return { text: 'text-good', ... }
  if (score >= 50) return { text: 'text-warn', ... }
  return { text: 'text-critical', ... }
}
```

Three tiers (good ≥75, warn ≥50, critical below), used at three sizes (`sm`/`md`/`lg`) across the [Applications table](applications.md), [Pipeline cards](pipeline.md), the [Dashboard](dashboard.md)'s recent list, and the [`ApplicationForm`](applications.md#applicationform)'s live score-slider preview.

## `useScrollReveal`

```ts
export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    if (prefers-reduced-motion) { gsap.set(el, { opacity: 1, y: 0 }); return }
    gsap.from(el, { opacity: 0, y, duration: 0.7, delay, scrollTrigger: { trigger: el, start } })
  }, [...])
  return ref
}
```

A hook returning a ref to attach to any element; when that element scrolls into view, it fades/slides in via GSAP `ScrollTrigger`. Respects `prefers-reduced-motion` (jumps straight to the visible end-state, no animation, if the user has that OS setting on). Also configures `ScrollTrigger.config({ ignoreMobileResize: true })` at module load — a specific fix for iOS Safari, whose address bar showing/hiding during scroll fires spurious resize events that would otherwise cause `ScrollTrigger` to re-measure mid-scroll and misfire reveals.

Used exclusively by the [Landing page](landing-page.md)'s `Reveal` wrapper component — no authenticated-app page currently uses scroll-triggered animation, since none of them scroll long enough to need it.

## Related modules

- [Authentication](authentication.md) — `Sidebar` consumes `useAuth` for the account footer
- [Applications](applications.md) — `Sidebar`'s "+ Log application" opens `useDrawer`
- [Export](export.md) — `Sidebar`'s "Export data..." opens `ExportModal`
- [Landing Page](landing-page.md) — the sole consumer of `useScrollReveal`
