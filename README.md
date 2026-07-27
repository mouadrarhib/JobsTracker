<div align="center">

# 🧭 Masār

### *Masār* — Arabic for "path." A job search tracker built for one goal: find work, fast.

[![Live](https://img.shields.io/badge/Live-masar.mouadrarhib.com-2A78D6?style=for-the-badge&logo=vercel&logoColor=white)](https://masar.mouadrarhib.com)

[![React](https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

Most job trackers are a spreadsheet. Masār is the spreadsheet's replacement: a Kanban pipeline, a contacts CRM for the recruiters and hiring managers you actually talk to, and analytics that answer one real question — **is anything you're doing working?**

## ✨ What it does

**📋 Track every application**
Company, role, score, status, resume version, source, salary range, notes — one place instead of a dozen browser tabs.

**🗂️ A real pipeline, not a list**
Wishlist → Applied → Phone Screen → Interview → Technical Test → Offer / Rejected / Withdrawn, as a drag-and-drop Kanban board.

**🤝 Your network, tracked like a CRM**
Log every recruiter and hiring manager you talk to — LinkedIn, email, phone — with a status of its own: Reached Out, Responded, No Response, Called Me, Interviewing Me, Referred Me, Cold. Link them to the application they belong to.

**📊 Analytics that answer real questions**
- A **funnel** showing exactly where applications stall
- **Resume performance** — response/interview/offer rate broken down *by resume version*, so you know which one actually works
- Response rates, status breakdowns, score distribution, applications-over-time

**📤 Export, your way**
Pick applications, contacts, and/or the analytics summary, then pick JSON, CSV, or a formatted PDF report.

**🔒 Private by default**
Email/password auth, Postgres row-level security — every row scoped to its owner, enforced at the database, not just the UI.

**📱 One app, every screen**
Hover-reveal sidebar on desktop, tap-triggered menu on mobile, tables that become card lists on small screens.

## 🖥️ Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS — custom design tokens, no default theme |
| Charts | Recharts, with a colorblind-validated categorical palette |
| Drag & drop | dnd-kit |
| Backend | Supabase (Postgres, Row-Level Security, Auth) |
| PDF export | jsPDF + jspdf-autotable, lazy-loaded so it doesn't cost everyone else the bundle size |
| Hosting | Vercel, auto-deployed from `main` |

## 🏗️ Architecture notes

- **The data layer is an interface, not a library call.** Every screen talks to `dataService` / `contactsService` (`src/services/`) — small interfaces with `get/add/update/delete`. The app started on `localStorage` and moved to Supabase without touching a single component; swapping backends again means writing one new file.
- **One source of truth for the math.** Funnel, resume performance, status breakdowns, response rates — computed once in `src/utils/analytics.ts` and reused by the Dashboard, the Analytics page, *and* the export feature, so the numbers never drift between them.
- **Colors are validated, not eyeballed.** The 8-stage pipeline and 7-stage contact-status palettes were run through an accessibility validator for colorblind-safe adjacency and contrast — see `statusConfig.ts` / `contactStatusConfig.ts`.

## 🚀 Getting started

```bash
git clone https://github.com/mouadrarhib/JobsTracker.git
cd JobsTracker
npm install
cp .env.example .env   # then fill in your Supabase project URL + publishable key
npm run dev
```

### Supabase setup

Run these once, in order, in your project's [SQL Editor](https://supabase.com/dashboard/project/_/sql/new):

1. `supabase/schema.sql` — creates the `applications` table + RLS policies
2. `supabase/contacts.sql` — creates the `contacts` table + RLS policies (safe to re-run if you add the feature later)

Want to see the app populated without typing anything in by hand? `supabase/seed_demo_user.sql` fills a demo account with 20 realistic applications and 10 contacts across every pipeline stage — instructions are in the file's header comment.

## 📦 Deployment

Deployed on [Vercel](https://vercel.com), auto-deploying every push to `main`. The only required environment variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

`vercel.json` rewrites every route to `index.html` so client-side routing survives a direct link or a refresh.

## 📁 Project structure

```
src/
├── components/     # Reusable UI — badges, drawers, forms, the Kanban board
├── hooks/          # Context providers (applications, contacts, drawers, auth)
├── pages/          # Dashboard, Pipeline, Applications, Contacts, Analytics
├── services/       # dataService / contactsService — the swappable data layer
├── utils/          # Shared analytics math + export builders (JSON/CSV/PDF)
├── statusConfig.ts         # Application pipeline colors + metadata
└── contactStatusConfig.ts  # Contact status colors + metadata

supabase/
├── schema.sql            # applications table + RLS
├── contacts.sql          # contacts table + RLS
└── seed_demo_user.sql     # optional demo data for a test account
```

---

<div align="center">

Built iteratively with [Claude Code](https://claude.com/claude-code) — from a static localStorage prototype to a deployed, RLS-secured, mobile-responsive app.

</div>
