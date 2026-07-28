# 📈 Analytics Module

The chart-based answer to "is any of this working?" — funnel drop-off, response rates, score distribution, and (the app's signature feature) response/interview/offer rate broken down **by resume version**.

**Files:**
- `src/pages/Analytics.tsx` — the page, all charts (route `/analytics`)
- `src/utils/analytics.ts` — every metric computation, framework-agnostic and pure

---

## Why the math lives in its own file

`src/utils/analytics.ts` has no React, no Recharts, no JSX — just plain functions taking `Application[]` / `Contact[]` and returning plain data. Three different parts of the app call these same functions:

| Consumer | Functions used |
|---|---|
| [Dashboard](dashboard.md) | `computeApplicationSummary`, `computeContactSummary` |
| **Analytics page** (this module) | all seven functions |
| [Export](export.md) (CSV, JSON, PDF) | all seven functions |

Because the computation is centralized, the "average score" shown on the Dashboard, the "average score" in an exported PDF, and the number in the Analytics stat row are guaranteed to be the same value — there's exactly one implementation of "average score," not three that could quietly drift apart.

## The seven computations

### `computeApplicationSummary(applications)`
Overall snapshot: `total`, `active` (via `ACTIVE_STATUSES` from [`statusConfig.ts`](pipeline.md#statusconfigts)), `interviewsThisMonth` (status is `Interview` *and* `dateLastUpdated` falls in the current calendar month), `averageScore`, and `responseRate` — defined as: of applications that aren't still `Wishlist`, what fraction have moved past just `Applied`.

### `computeOverTime(applications)`
Buckets applications by the ISO week their `dateApplied` falls in, then returns a **cumulative** running total per week (not a per-week count) — powers the "Applications over time" area chart, answering "how many total applications existed by this point" rather than "how many were sent this specific week."

### `computeStatusBreakdown(applications)`
A count per pipeline stage, in `STATUSES` order, each tagged with its `STATUS_META` color — feeds the horizontal bar chart and is reused verbatim in export.

### `computeScoreDistribution(applications)`
Ten fixed buckets of 10 points each (`0–9`, `10–19`, ... `90–100`) — a straightforward histogram of match scores.

### `computeFunnel(applications)`
The headline chart. Five **cumulative, not mutually-exclusive** stages — `Applied`, `Phone Screen+`, `Interview+`, `Technical Test+`, `Offer` — each counting every application that has *reached at least* that stage (including ones that later moved to `Rejected` or `Withdrawn`, since those still passed through earlier stages on the way). The denominator excludes `Wishlist` applications (not yet submitted), so percentages read as "of what you actually sent out." Colors come from a five-step ordinal blue ramp (`FUNNEL_RAMP`) rather than the categorical per-status palette — the comment in the file notes these are ordered progress steps, not independent categories, so one hue light-to-dark is the correct pattern (per the project's dataviz conventions) rather than five unrelated colors.

### `computeResumeStats(applications)`
Groups applications by `resumeVersion` (trimmed; blank versions are excluded from the table and counted separately as `unspecified`), then for each version computes: `applied` count, `responseRate`, `interviewRate` (reached `Interview`, `Technical Test`, or `Offer`), and raw `offers` count. Rows are sorted by `applied` descending. This is the calculation the whole product is built around — it's the only place in any job tracker that tells you *which resume is actually working*, not just how many you sent.

### `computeContactStatusBreakdown` / `computeContactSummary`
The [Contacts](contacts.md) equivalents of the two functions above — status counts per `CONTACT_STATUS_META` color, and a summary (`total`, `responseRate`, `interviewingMe`, `awaitingResponse`, `calledMe`). Note `computeContactSummary`'s response rate excludes contacts with status `Called Me` from the denominator entirely (they reached out to *you*, so "did they respond" doesn't apply), then further excludes ones still at `Reached Out` before computing the rate — only contacts that have moved past the initial outreach and aren't inbound calls count toward "responded."

## The Analytics page

Renders, top to bottom: applications-over-time (area chart), funnel (horizontal bar), status breakdown + score distribution (side-by-side bar charts), resume performance (a table, not a chart — precise numbers matter more than a visual here), then — if any contacts exist — a "Your network" section with stat cards and a contact-status breakdown bar chart.

All charts use **Recharts**, with:
- A shared `ChartCard` wrapper (title, optional subtitle, consistent padding/border) and `TooltipBox` (dark, consistent tooltip styling) so every chart looks like one system rather than five separately-styled widgets.
- Custom `content` renderers on every `<Tooltip>` rather than Recharts' defaults, to control exactly what text appears (e.g. `"{count} applications ({pct}%)"`).
- A shared `AXIS_TEXT` style object and `GRID` color constant for consistent typography/gridlines across every chart.

If there are zero applications, the page shows an empty state ("Nothing to chart yet") instead of charts full of zeros.

## Related modules

- [Dashboard](dashboard.md) — the lightweight, non-chart version of the same summary functions
- [Export](export.md) — reuses every function here for CSV/JSON/PDF output
- [Pipeline](pipeline.md) — `STATUS_META` colors used in the status-breakdown chart
- [Contacts](contacts.md) — `CONTACT_STATUS_META` colors used in the contact-status chart
