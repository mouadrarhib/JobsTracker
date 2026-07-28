# 📊 Dashboard Module

The default landing screen after sign-in (route `/`). A single at-a-glance summary of the job search: headline stats, a network summary, and a "recently updated" feed — no charts here, that's what [Analytics](analytics.md) is for.

**File:** `src/pages/Dashboard.tsx`
**Route:** `/` (exact match, via `<Route path="/" element={<Dashboard />} />` in `App.tsx`)

---

## What it shows

1. **Empty state** — if there are zero applications, a centered call-to-action ("Nothing logged yet") with a "+ Log application" button that opens the [application drawer](applications.md#applicationdrawer) in create mode. Nothing below this renders until at least one application exists.
2. **Application stat row** (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5`) — five `StatCard`s:
   - Total applications
   - Active (applications in an open pipeline stage — see `ACTIVE_STATUSES` in [`statusConfig.ts`](pipeline.md#statusconfigts))
   - Interviews this month
   - Average score
   - Response rate
3. **Network stat row** — only rendered if `networkStats.total > 0` (i.e. at least one contact exists): interviewing-me count, awaiting-response count, called-me-first count, and contact response rate.
4. **Recently updated** — the six most recently touched applications (`dateLastUpdated` descending), each row clickable to open that application in the drawer's view mode.

## Data flow

```tsx
const { applications, loading } = useApplicationsStore()
const { contacts } = useContactsStore()
const { openCreate, openView } = useDrawer()

const stats = useMemo(() => computeApplicationSummary(applications), [applications])
const networkStats = useMemo(() => computeContactSummary(contacts), [contacts])
```

Dashboard does no computation of its own — every number on the page comes from `src/utils/analytics.ts` (`computeApplicationSummary`, `computeContactSummary`), the same functions the [Analytics page](analytics.md) and the [Export](export.md) feature use. This is a deliberate architectural choice: the math is computed once and shared, so the "average score" on the Dashboard can never drift from the "average score" in an exported PDF.

`recent` is computed locally with a simple sort/slice — the one piece of Dashboard-specific logic that doesn't belong in the shared analytics module because it's a display concern (which six rows to show), not a metric.

While `loading` is true, the component renders `null` — there's no dashboard-specific skeleton; the surrounding `AuthGate` already shows a blank screen during the slower initial auth check, and store loading is normally fast enough that a skeleton wasn't worth building.

## Building blocks

- **`PageHeader`** — title + subtitle bar, shared across every page. See [Shared Components](shared-components.md#pageheader).
- **`StatCard`** — label / big number / optional hint, the tile used for every metric on this page. See [Shared Components](shared-components.md#statcard).
- **`StatusBadge`**, **`ScoreBadge`** — used in the "Recently updated" rows to show each application's stage and match score inline.

## Related modules

- [Applications](applications.md) — the drawer Dashboard opens for create/view actions
- [Contacts](contacts.md) — source of the network stats
- [Analytics](analytics.md) — the deeper, chart-based version of the same underlying numbers
- [Shared Components](shared-components.md) — `PageHeader`, `StatCard`, badges
