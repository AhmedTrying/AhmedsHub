# Ahmed's Hub

Personal Facilities Management estimator workspace.

Notion-inspired, desktop-first, single-user. Built with **Next.js (App Router) + TypeScript + Tailwind + Zustand**. Currently a frontend-only build with `localStorage` persistence — a Neon Postgres + Drizzle backend is planned next.

## Run locally

```bash
npm install
npm run dev    # http://localhost:3000
```

Other scripts:

```bash
npm run build  # production build
npm run lint   # eslint
```

## Project layout

```
src/
  app/            # Next.js App Router pages
    page.tsx          # Dashboard
    projects/         # Projects list + [projectId] detail
    estimates/        # [estimateId] BOQ builder
    rates/            # Rate Library
    rfqs/             # RFQ Kanban
    site-visits/      # Site visit checklist
    notes/            # Notes split-view
    templates/        # Templates
    settings/         # Personal settings, export/import/reset
  components/     # Sidebar, Topbar, Modals, CommandPalette, etc.
  lib/
    types.ts          # Domain models
    seed.ts           # Realistic FM seed data
    store.ts          # Zustand + localStorage persist
    calc.ts           # Estimate totals
    format.ts         # AED / number / date helpers
    tints.ts          # Notion-style status/scope pill tones
Frontend/         # Original HTML/JSX prototype (visual reference)
```

## Features

- Dashboard with stats, today's focus, RFQ table, this-week list
- Projects table + board view, full CRUD with persisted modal
- Project detail with Notes / Estimate / Site Visit / Tasks / Files tabs
- Estimate Builder — editable BOQ rows, pull-from-rate-library, live quotation preview, generate quotation modal
- Rate Library — search, filter, add rate, use-in-estimate
- Site Visit — grouped checklist with progress, field notes, editable quick info
- Notes — split view, search, tag filter, pin, in-place edit
- RFQ Kanban — drag-and-drop with `@dnd-kit`, status syncs to project
- Templates — estimate templates create real drafts
- Settings — theme, currency, default markup, export/import JSON, reset workspace
- Command palette (⌘K), light/dark theme, toast notifications

## What's intentionally deferred

- Backend (Neon Postgres + Drizzle)
- Auth
- File attachments and PDF/Excel export
- Photo uploads on site visits
