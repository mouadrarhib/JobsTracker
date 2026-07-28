# 📋 Applications Module

The core entity of the app. Every job application — company, role, score, status, resume version, notes — is tracked here. This module covers the table view, the create/view/edit drawer, and the store that holds all of it in memory.

**Files:**
- `src/pages/ApplicationsTable.tsx` — sortable, filterable table (route `/applications`)
- `src/components/ApplicationDrawer.tsx` — the slide-over panel that hosts create/view/edit
- `src/components/ApplicationForm.tsx` — the create/edit form
- `src/components/ApplicationDetail.tsx` — the read-only view, including linked contacts
- `src/hooks/useApplicationsStore.tsx` — the data-fetching context/provider
- `src/hooks/useDrawer.tsx` — drawer open/close state machine
- `src/types.ts` — the `Application` / `ApplicationInput` shape

---

## The `Application` shape

```ts
export interface Application {
  id: string
  companyName: string
  role: string
  location: string
  jobUrl: string
  jobDescription: string
  score: number              // 0-100 match score
  status: Status              // one of the 8 pipeline stages
  dateApplied: string
  dateLastUpdated: string     // server-managed, never client-set
  resumeVersion: string       // free text — powers resume-performance analytics
  coverLetterSent: boolean
  contactPerson: string
  salaryRange: string
  notes: string
  source: Source               // LinkedIn, Referral, Indeed, etc.
}

export type ApplicationInput = Omit<Application, 'id' | 'dateLastUpdated'>
```

`resumeVersion` is a plain free-text field, not a foreign key to some "resumes" table — deliberately simple, but it's the field the [Analytics](analytics.md#resume-performance) resume-performance breakdown groups by. Consistent naming across applications (e.g. always typing `Resume_v3_DataAnalyst` the same way) is what makes that breakdown useful.

## `useApplicationsStore` — the data layer

A React context that wraps the whole authenticated app (mounted in `App.tsx` inside `AuthGate`, alongside `ContactsProvider`). It holds the full `applications` array in memory and exposes CRUD:

```ts
interface ApplicationsStoreValue {
  applications: Application[]
  loading: boolean
  error: string | null
  addApplication: (input: ApplicationInput) => Promise<Application>
  updateApplication: (id: string, patch: Partial<ApplicationInput>) => Promise<Application>
  deleteApplication: (id: string) => Promise<void>
  refresh: () => Promise<void>
}
```

Every method calls through to `dataService` (see [Data Layer](data-layer.md)) and then updates the in-memory array optimistically based on the service's response — e.g. `addApplication` prepends the newly-created row returned by the backend, rather than re-fetching the whole list. `refresh()` runs once on mount and is exposed for the [migration banner](data-layer.md#migrationbanner) and [error banner](data-layer.md#dataerrorbanner) to call after a fix.

Errors are caught and stored as a plain string (`errorMessage(err)`), not thrown further — every page checks `loading` before rendering, and `DataErrorBanner` surfaces `error` globally rather than each page building its own error UI.

## `useDrawer` — drawer state machine

A small, single-purpose context (separate from the data store) that models exactly which drawer state is active:

```ts
type DrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'view'; applicationId: string }
  | { mode: 'edit'; applicationId: string }
```

Any component can call `openCreate()`, `openView(id)`, or `openEdit(id)` from anywhere in the tree (the Dashboard, the Pipeline board, the Applications table, even the [Contacts](contacts.md) detail view when jumping to a linked application) — the drawer itself lives once at the top of the tree (`<ApplicationDrawer />` in `App.tsx`) and reacts to whatever state it's given.

## `ApplicationDrawer`

The single component that renders create, view, or edit UI depending on `state.mode` — never more than one at a time:

- **`create`** → `ApplicationForm` with no `initial` value, empty defaults (`EMPTY_APPLICATION`, e.g. `status: 'Wishlist'`, today's date, `score: 50`). On submit, calls `addApplication` then immediately `openView(created.id)` — so submitting a new application drops you straight into its detail view rather than closing the drawer.
- **`view`** → `ApplicationDetail`, showing every field plus any [linked contacts](contacts.md).
- **`edit`** → `ApplicationForm` pre-filled with the existing application. On submit, `updateApplication` then `openView(id)` — same "land on the detail view" pattern.
- **Delete** is a two-step confirmation (`confirmingDelete` local state) rendered as an overlay dialog inside the drawer, not a separate modal component.
- **Escape key** closes the drawer from anywhere (`window.addEventListener('keydown', ...)`), and clicking the backdrop does the same.

## `ApplicationForm`

A fully controlled form (`useState<ApplicationInput>`) with one `set(key, value)` helper used by every field. Notable inputs:

- **Score** is a `range` slider (0–100) paired live with a `ScoreBadge` preview so you see the color tier change as you drag.
- **Status** and **Source** are `<select>`s driven directly from `STATUSES` / `SOURCES` in `types.ts` — again, no duplicated option lists.
- Only `companyName` and `role` are required to submit; everything else can be filled in later.

## `ApplicationDetail`

Read-only view of one application, plus:
- An "Open posting ↗" link if `jobUrl` is set.
- A **Contacts** section listing every [`Contact`](contacts.md) whose `applicationId` matches this application, with a "+ Add contact" shortcut that closes this drawer and opens the contact drawer pre-linked to this application (`openCreateContact(application.id)`).
- Edit and Delete actions in a footer bar.

## `ApplicationsTable`

The full-list view at `/applications`, with:
- **Search** across company name and role.
- **Filters**: status (dropdown from `STATUSES`), location (substring match), date-applied range (from/to).
- **Sortable columns**: company, role, location, score, date applied — clicking a header toggles asc/desc, clicking a different header switches to it ascending.
- **Responsive layout**: a real `<table>` on `md:` and up, a stacked card list below that — same data, two renderings, chosen with Tailwind's `hidden md:block` / `md:hidden` pair rather than a JS breakpoint check.

Every row/card click opens that application in the drawer's view mode (`openView(app.id)`).

## Related modules

- [Pipeline](pipeline.md) — the Kanban view of the same `useApplicationsStore` data
- [Contacts](contacts.md) — contacts link back to an application via `applicationId`
- [Dashboard](dashboard.md) — summary stats computed over this same array
- [Analytics](analytics.md) — deeper analysis, including resume-version performance
- [Data Layer](data-layer.md) — `dataService`, the interface `useApplicationsStore` calls through
- [Export](export.md) — applications are one of the three exportable data scopes
