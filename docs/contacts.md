# 🤝 Contacts Module

A lightweight CRM for the people behind the applications — recruiters, hiring managers, referrals. Every contact tracks its own relationship status, independent of the application's pipeline stage, and can optionally link back to the application it came from.

**Files:**
- `src/pages/Contacts.tsx` — table/filter view (route `/contacts`)
- `src/components/ContactDrawer.tsx` — the slide-over panel for create/view/edit
- `src/components/ContactForm.tsx` — the create/edit form
- `src/components/ContactDetail.tsx` — the read-only view, including linked application
- `src/components/ContactStatusBadge.tsx` — status pill
- `src/hooks/useContactsStore.tsx` — the data-fetching context/provider
- `src/hooks/useContactDrawer.tsx` — drawer open/close state machine (separate from the applications drawer)
- `src/contactStatusConfig.ts` — the 7 contact statuses and their colors

---

## The `Contact` shape

```ts
export const CONTACT_STATUSES = [
  'Reached Out', 'Responded', 'No Response', 'Called Me',
  'Interviewing Me', 'Referred Me', 'Cold',
] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export interface Contact {
  id: string
  name: string
  title: string
  company: string
  linkedinUrl: string
  email: string
  phone: string
  applicationId: string | null   // optional link back to an Application
  status: ContactStatus
  dateContacted: string
  notes: string
  dateLastUpdated: string
}
```

`applicationId` is nullable — a contact doesn't have to belong to any application (e.g. a cold LinkedIn networking contact with no specific role attached yet).

## `contactStatusConfig.ts`

Same pattern as [`statusConfig.ts`](pipeline.md#statusconfigts) for the pipeline, but for the 7 contact statuses:

```ts
export const CONTACT_STATUS_META: Record<ContactStatus, ContactStatusMeta> = {
  'Reached Out': { label: 'Reached Out', soft: 'bg-cobalt/10', dot: '#2A78D6' },
  'Called Me': { label: 'Called Me', soft: 'bg-orange/10', dot: '#EB6834' },
  // ...
}
```

Reuses the **same 8-slot validated hex sequence** as the pipeline's `STATUS_META` (blue, orange, aqua, amber, magenta, green, red) — just with contact-relevant labels attached to each slot instead of pipeline-stage labels. The file comment explicitly warns against reordering the hexes independently of `statusConfig.ts`, since the whole point is that both palettes stay colorblind-safe using the same validated adjacency.

## `useContactsStore`

Structurally identical to [`useApplicationsStore`](applications.md#useapplicationsstore---the-data-layer) — a context holding the full `contacts` array plus `add/update/delete/refresh`, all routed through `contactsService` (see [Data Layer](data-layer.md)). Mounted alongside `ApplicationsProvider` in `App.tsx`, so both stores are available to every page and drawer.

## `useContactDrawer`

A separate drawer state machine from the applications one, because a contact drawer needs an extra piece of context on creation — which application (if any) it should be pre-linked to:

```ts
type ContactDrawerState =
  | { mode: 'closed' }
  | { mode: 'create'; applicationId: string | null }
  | { mode: 'view'; contactId: string }
  | { mode: 'edit'; contactId: string }
```

`openCreate(applicationId?)` defaults to `null` when called with no argument (e.g. the "+ Log contact" button on the Contacts page) but is passed an explicit ID when triggered from an application's detail view ("+ Add contact" inside `ApplicationDetail`).

## `ContactDrawer`

Mirrors [`ApplicationDrawer`](applications.md#applicationdrawer)'s structure exactly: one component switching between `ContactForm` (create/edit) and `ContactDetail` (view) based on `state.mode`, with the same two-step delete confirmation and Escape-to-close behavior. On create, `defaultApplicationId` from the drawer state seeds the form's "Linked application" field.

## `ContactForm`

Only `name` is required. The **"Linked application"** field is a `<select>` populated from `useApplicationsStore().applications` — picking one sets `applicationId`; picking "None" sets it back to `null`.

## `ContactDetail`

Shows all contact fields plus, if `applicationId` is set, a pill linking to that application ("`{role}` application ↗") that closes the contact drawer and opens the application drawer in view mode — the same cross-drawer navigation pattern used in reverse from `ApplicationDetail`.

## `Contacts` page

Table/card list (same responsive `md:` breakpoint pattern as [`ApplicationsTable`](applications.md#applicationstable)) with:
- **Search** across name, company, and title.
- **Status filter** dropdown from `CONTACT_STATUSES`.
- A helper, `applicationLabel(id)`, resolves a contact's `applicationId` to a human-readable `"{companyName} — {role}"` string for the "Linked application" column.

No sortable columns here (unlike Applications) — contacts are naturally ordered by most-recently-updated from the store.

## Related modules

- [Applications](applications.md) — the other half of the cross-linking relationship
- [Dashboard](dashboard.md) — "Your network" stat row is computed over this store
- [Analytics](analytics.md) — contact status breakdown chart and response-rate stat
- [Data Layer](data-layer.md) — `contactsService`, the interface `useContactsStore` calls through
- [Export](export.md) — contacts are one of the three exportable data scopes
