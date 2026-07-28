# 🗂️ Pipeline Module

The drag-and-drop Kanban board — the visual alternative to a spreadsheet row for every application. Applications move between eight fixed stages by dragging a card from one column to another.

**Files:**
- `src/pages/Pipeline.tsx` — the board itself, drag-and-drop wiring
- `src/components/KanbanColumn.tsx` — one droppable column (one status)
- `src/components/KanbanCard.tsx` — one draggable card (one application)
- `src/statusConfig.ts` — the 8 stages, their colors, and which count as "active"

**Route:** `/pipeline`

---

## The eight stages

Defined once in `src/types.ts` and never duplicated:

```ts
export const STATUSES = [
  'Wishlist', 'Applied', 'Phone Screen', 'Interview',
  'Technical Test', 'Offer', 'Rejected', 'Withdrawn',
] as const
export type Status = (typeof STATUSES)[number]
```

Every application has exactly one `status` from this list. `Pipeline` renders one `KanbanColumn` per entry in `STATUSES`, in order — adding a new stage only requires editing this one array and `statusConfig.ts` (see below); every screen that lists statuses (this board, the [Applications table](applications.md) filter, the [Landing page](landing-page.md) pipeline strip) picks it up automatically.

## `statusConfig.ts`

Maps each `Status` to a label, a soft background class, and a dot color:

```ts
export const STATUS_META: Record<Status, StatusMeta> = {
  Wishlist: { label: 'Wishlist', soft: 'bg-cobalt/10', dot: '#2A78D6' },
  Applied: { label: 'Applied', soft: 'bg-orange/10', dot: '#EB6834' },
  // ...
}
```

The eight hex colors follow a **validated 8-slot categorical order** (blue, orange, aqua, amber, magenta, green, red, violet) chosen for colorblind-safe adjacency when shown in this exact pipeline sequence — the comment in the file explicitly warns not to reorder the hex values without re-validating. [`contactStatusConfig.ts`](contacts.md#contactstatusconfigts) reuses the same eight hex values in the same slot order for contact statuses, so the two color systems never clash if both appear near each other in the UI.

`ACTIVE_STATUSES` is a small derived list (`Applied`, `Phone Screen`, `Interview`, `Technical Test`) used by the [Dashboard](dashboard.md)'s "Active" stat — applications currently in motion, as opposed to `Wishlist` (not yet submitted) or a terminal state (`Offer`, `Rejected`, `Withdrawn`).

## Drag and drop (`dnd-kit`)

`Pipeline.tsx` wires up the board with `@dnd-kit/core`:

```tsx
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
```

The 6px activation distance means a plain click (no movement) doesn't trigger a drag — it lets `KanbanCard`'s `onClick` (open the application drawer) and dragging coexist on the same element without conflict.

- **`KanbanColumn`** calls `useDroppable({ id: status })` — each column's droppable ID *is* the status string itself, so on drop there's no lookup table between column and status.
- **`KanbanCard`** calls `useDraggable({ id: application.id })` — the draggable ID is the application's own ID.
- **`handleDragEnd`** reads `event.over.id` directly as the new `Status` and calls `updateApplication(app.id, { status: newStatus })` — a one-line status change, no reordering within a column is tracked or persisted.
- **`DragOverlay`** renders a floating copy of the card being dragged (`activeApplication`), so the card in its original column doesn't need to visually follow the cursor — `dnd-kit` handles the "ghost" separately from the source element (which just gets `opacity-40` while `isDragging`).

## Layout

Applications are grouped into a `Map<Status, Application[]>` once per render via `useMemo`, keyed off the live `STATUSES` array so every column always exists even if empty ("Drop applications here" placeholder). Columns are horizontally scrollable (`overflow-x-auto` on the container) rather than wrapping, since eight columns rarely fit one viewport — this is the one page in the app that intentionally doesn't collapse into a mobile card-list layout; it stays a horizontal-scroll board on every screen size (each column is `w-[80vw] max-w-72` so exactly ~1.2 columns show on a phone, hinting that more are off-screen).

## Related modules

- [Applications](applications.md) — `Pipeline` reads/writes the same `useApplicationsStore` and opens the same drawer on card click
- [Dashboard](dashboard.md) — `ACTIVE_STATUSES` powers the "Active" stat there
- [Analytics](analytics.md) — `STATUS_META` colors are reused for the status-breakdown chart
- [Contacts](contacts.md) — `contactStatusConfig.ts` mirrors this file's color slots for contact statuses
