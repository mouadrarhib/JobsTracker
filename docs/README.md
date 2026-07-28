<div align="center">

# 🧭 Masār — Module Documentation

### A module-by-module reference for every part of the app: what it does, how it's built, and how it connects to everything else.

</div>

---

This isn't API reference docs auto-generated from types — each page explains the *why* behind a module's design, not just its shape. Start with whichever module you're touching; each page links to the ones it depends on and the ones that depend on it.

For a top-level project overview (tech stack, setup, deployment), see the [main README](../README.md).

## 📖 Modules

### User-facing pages

| Module | What it covers |
|---|---|
| [🏠 Landing Page](landing-page.md) | The marketing page shown to signed-out visitors — mock previews of every real feature, GSAP scroll animation |
| [🔒 Authentication](authentication.md) | Sign in / sign up, session state, and the `AuthGate` that decides what a visitor sees |
| [📊 Dashboard](dashboard.md) | The post-login home screen — headline stats, network summary, recently-updated feed |
| [🗂️ Pipeline](pipeline.md) | The drag-and-drop Kanban board across the 8 pipeline stages |
| [📋 Applications](applications.md) | The core entity — table view, create/view/edit drawer, and the applications data store |
| [🤝 Contacts](contacts.md) | The recruiter/hiring-manager CRM, cross-linked to applications |
| [📈 Analytics](analytics.md) | Every chart and metric — funnel, resume performance, response rates, score distribution |
| [📤 Export](export.md) | JSON / CSV / PDF export, any combination of applications, contacts, and analytics |

### Infrastructure

| Module | What it covers |
|---|---|
| [🔌 Data Layer](data-layer.md) | The swappable `dataService` / `contactsService` interfaces — the abstraction that let this app move from `localStorage` to Supabase without touching a component |
| [🧩 Shared Components](shared-components.md) | Sidebar, badges, page headers, and the scroll-reveal hook reused across every page |
| [🗄️ Database Schema](database-schema.md) | The Postgres tables, RLS policies, and demo-seed script in `supabase/` |

## 🗺️ How it fits together

```
Landing Page ──(sign in)──▶ Authentication ──▶ Dashboard / Pipeline / Applications / Contacts / Analytics
                                                        │
                                                        ├── Shared Components (Sidebar, badges, headers)
                                                        ├── Data Layer ──▶ Database Schema (Supabase)
                                                        └── Export ──▶ Analytics (shared metric functions)
```

- **Applications** and **Contacts** cross-link to each other (a contact can point at an application; an application's detail view lists its contacts) but are otherwise independent stores.
- **Analytics**, **Dashboard**, and **Export** all compute their numbers from the exact same functions in `src/utils/analytics.ts` — one implementation of every metric, reused three places.
- **Pipeline** and **Applications** read and write the same underlying store; Pipeline is just a different view (Kanban vs. table) over identical data.
- Every screen that talks to the backend goes through **Data Layer**'s `dataService` / `contactsService` interfaces, never Supabase directly — see that page for why.
