# 🔌 Data Layer Module

The swappable persistence boundary. Every screen in the app talks to `dataService` or `contactsService` — small interfaces, not a specific database client — which is why this app ran entirely on `localStorage` in an earlier version and now runs on Supabase Postgres without a single component needing to change.

**Files:**
- `src/services/dataService.ts` — the `DataService` interface + active implementation for applications
- `src/services/localStorageDataService.ts` — the original `localStorage`-backed implementation (kept in the codebase, no longer wired up)
- `src/services/supabaseDataService.ts` — the active Supabase-backed implementation for applications
- `src/services/contactsService.ts` — the `ContactsService` interface + active implementation for contacts
- `src/services/supabaseContactsService.ts` — the active Supabase-backed implementation for contacts
- `src/services/seedData.ts` — sample applications used to seed a fresh `localStorage` store
- `src/components/MigrationBanner.tsx` — one-time prompt to import old `localStorage` data into Supabase
- `src/components/DataErrorBanner.tsx` — global banner when a store fails to load

---

## The interface pattern

```ts
// dataService.ts
export interface DataService {
  getApplications(): Promise<Application[]>
  getApplication(id: string): Promise<Application | undefined>
  addApplication(input: ApplicationInput): Promise<Application>
  updateApplication(id: string, patch: Partial<ApplicationInput>): Promise<Application>
  deleteApplication(id: string): Promise<void>
  exportAll(): Promise<Application[]>
  importAll(applications: Application[]): Promise<void>
}

export const dataService: DataService = supabaseDataService
```

Everything upstream — [`useApplicationsStore`](applications.md#useapplicationsstore---the-data-layer), the `MigrationBanner` — imports `dataService` from this one file and calls its methods. **Nothing outside `dataService.ts` knows or cares which concrete implementation is behind it.** Swapping backends again (e.g. to a different provider) means writing one new file that satisfies `DataService` and changing the one export line above — no component, hook, or page changes.

`contactsService.ts` mirrors this exact pattern one level down (a slightly smaller interface — no `exportAll`/`importAll`, since the migration flow was only ever needed for applications, which existed before the contacts feature did).

## `supabaseDataService` / `supabaseContactsService`

The active implementations. Both follow the same shape:
- A `*Row` interface matching the Postgres `snake_case` column names exactly.
- `fromRow()` / `toRow()` converters translating between the API's `camelCase` `Application`/`Contact` types and the database's `snake_case` rows — this mapping layer is what lets the rest of the app use idiomatic JS naming while the database uses idiomatic SQL naming, with the conversion isolated to one function on each side.
- Every method is a thin wrapper around a `supabase.from('table')...` call, throwing the Supabase `error` if present so the calling store's `try/catch` can turn it into a user-facing message.
- `toRow()` is built to only include keys that are actually present on the input (`if (input.x !== undefined) row.x = ...`), which is what makes it safe to reuse for both a full `addApplication` (all fields) and a `Partial` `updateApplication` (only changed fields) — an update patch never accidentally overwrites unrelated columns with `undefined`.

`exportAll` on `supabaseDataService` just calls `this.getApplications()` — there's no separate export-shaped query; it's the same data, same order.

## `localStorageDataService`

The original implementation, from before Supabase was introduced. Reads/writes a single JSON blob under the key `masar_applications_v1`, using `uuid` to generate new IDs and seeding itself from `SEED_APPLICATIONS` (`seedData.ts`) the very first time it's read (`localStorage.getItem` returns `null`). It's no longer referenced by `dataService.ts`'s active export, but it's kept in the codebase as the reference implementation of the `DataService` interface and as the origin of the [migration flow](#migrationbanner) below.

## `seedData.ts`

Five realistic sample applications (OCP Group, Capgemini, Yassir, Deloitte, a stealth fintech startup) spanning different pipeline stages, used only by `localStorageDataService` to avoid a blank first-run experience. Dates are generated relative to "today" (`today(offsetDays)`) rather than hardcoded, so the sample data always looks recent regardless of when the app is run. (For seeding a real Supabase demo account instead, see `supabase/seed_demo_user.sql` in [Database Schema](database-schema.md#seed_demo_usersql).)

## `MigrationBanner`

A one-time UI shown at the top of the authenticated app (mounted in `App.tsx`, above `Sidebar`) for any user who has leftover data in `localStorage` under the old key `masar_applications_v1` — a leftover from when the app only supported local storage. It:

1. Checks `localStorage` directly (bypassing `dataService`, since the whole point is to reach the *old* store) for anything under `masar_applications_v1`.
2. If found and not already dismissed (tracked via a separate `masar_migration_done_v1` flag), shows a banner offering to import them.
3. "Import now" calls `dataService.importAll(localApplications)` — routing through the *current* active service (Supabase), so the import lands in Postgres — then `refresh()`s the store and dismisses itself.
4. "Dismiss" just sets the flag without importing, for a user who doesn't want the old data.

This banner is effectively dead for any user who never used the old `localStorage`-only version of the app, since the check on `localApplications.length === 0` makes it render nothing.

## `DataErrorBanner`

A global banner (also mounted at the top level, above `MigrationBanner`) that watches both `useApplicationsStore().error` and `useContactsStore().error` and renders one row per failing store. Each row names the specific SQL migration file needed (`supabase/schema.sql` or `supabase/contacts.sql`) — this is the app's way of surfacing "you haven't run the setup SQL yet" as an actionable message instead of a silent blank page, plus a "Retry" button that calls that store's `refresh()`.

## Related modules

- [Applications](applications.md) — `useApplicationsStore` is the sole consumer of `dataService`
- [Contacts](contacts.md) — `useContactsStore` is the sole consumer of `contactsService`
- [Authentication](authentication.md) — `supabaseClient.ts`, the client both Supabase services share
- [Database Schema](database-schema.md) — the Postgres tables and RLS policies these services query against
