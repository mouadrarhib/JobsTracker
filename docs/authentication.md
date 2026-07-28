# 🔒 Authentication Module

Email/password authentication backed by Supabase Auth. Every other module in the app assumes a signed-in user exists — this is the gate that decides whether the visitor sees the [Landing page](landing-page.md), the sign-in form, or the real app.

**Files:**
- `src/hooks/useAuth.tsx` — the auth context/provider
- `src/pages/Login.tsx` — sign-in / sign-up form
- `src/services/supabaseClient.ts` — the Supabase client instance
- `src/App.tsx` (`AuthGate`) — the routing decision built on top of `useAuth`

---

## `supabaseClient.ts`

A single shared Supabase client, created once from environment variables:

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
```

Every service that talks to the database (`supabaseDataService`, `supabaseContactsService`) and `useAuth` itself import this one instance — there is exactly one Supabase client in the app.

## `useAuth` — the auth context

`AuthProvider` wraps the whole app (see `App.tsx`) and exposes:

```ts
interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
}
```

On mount, it does two things:
1. Calls `supabase.auth.getSession()` once to get the current session immediately (and flips `loading` to `false` once resolved).
2. Subscribes via `supabase.auth.onAuthStateChange` so `user` stays in sync with sign-in, sign-out, and token refresh events for the lifetime of the app — no polling, no manual refresh logic.

`signUp` returns `{ needsEmailConfirmation: !data.session }` — if Supabase didn't hand back a session immediately, that means email confirmation is required before the account is usable, and the caller (the `Login` page) uses that to show a "check your email" state instead of treating sign-up as instantly complete.

`useAuth()` is the consumption hook; it throws if called outside `AuthProvider`, which is a fast way to catch a missing provider during development rather than silently returning `undefined`.

## `AuthGate` (in `App.tsx`)

```tsx
function AuthGate() {
  const { user, loading } = useAuth()
  const [view, setView] = useState<'landing' | 'login'>('landing')

  if (loading) return <blank screen />
  if (!user) {
    return view === 'login' ? <Login onBack={...} /> : <Landing onGetStarted={...} />
  }
  return <the full authenticated app, all providers + routes>
}
```

This is the single branch point for the entire app:

- **`loading`** — briefly true while the initial session check resolves; renders a blank `bg-ink` screen rather than a flash of the landing page or a spinner.
- **No user** — shows `Landing` by default, or `Login` if the visitor already clicked through. This local `view` state lives in `AuthGate`, not in the router, so there's no `/login` URL to bookmark or share — sign-in is a modal-like flow layered over the marketing page, not a distinct route.
- **User present** — mounts every data provider (`ApplicationsProvider`, `ContactsProvider`, `DrawerProvider`, `ContactDrawerProvider`) and the routed pages. These providers are intentionally *inside* the `user` check — they only start fetching once there's someone to fetch data for.

## `Login` page

A single component handling both sign-in and sign-up, toggled by local `mode` state (`'signIn' | 'signUp'`). Key behaviors:

- **Status machine**: `'idle' | 'submitting' | 'confirmEmail' | 'error'` drives which UI shows — the form, a spinner-label on the submit button, the "check your email" confirmation screen, or an inline error message.
- **Validation is minimal and native**: `required` on both fields, `minLength={6}` on password — Supabase enforces the real password policy server-side; the form just avoids obviously-empty submits.
- **Errors** are surfaced via `err.message` when `err instanceof Error`, falling back to a generic "Something went wrong." string.
- **`onBack`** (optional prop) renders a "← Back" link that returns to the landing page — omitted entirely if not passed, so the component also works as a plain full-screen login if ever used standalone.

## Data flow

```
supabaseClient.ts  →  useAuth (session state + sign in/up/out)  →  AuthGate (routing decision)
                                                                  →  Login page (calls signIn/signUp)
                                                                  →  Sidebar (reads user.email, calls signOut)
```

No other module reads Supabase auth state directly — everything goes through `useAuth()`. The [Sidebar](shared-components.md#sidebar) is the other consumer, displaying the signed-in user's email and exposing "Sign out."

## Security notes

Authentication is only half the security model. Every table in Postgres also has **Row-Level Security** scoping rows to `auth.uid()` — so even if a client somehow queried another user's row ID, the database itself refuses the read. See [Database Schema](database-schema.md#row-level-security) for the actual policies.

## Related modules

- [Landing Page](landing-page.md) — what's shown before `onGetStarted`
- [Shared Components](shared-components.md) — `Sidebar` consumes `useAuth` for the sign-out control
- [Database Schema](database-schema.md) — RLS policies that enforce per-user data isolation at the database layer
