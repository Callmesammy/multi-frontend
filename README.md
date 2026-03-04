# TeamFlow Frontend

Multi-tenant task management frontend built with Next.js App Router.

## Overview

This app provides:

- Organization onboarding (register + login)
- Dashboard and task management
- Members and invite flows
- Session-aware route protection
- API proxying through Next.js rewrites

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Zustand
- Axios
- Zod + React Hook Form

## Project Structure

```text
app/                    Route segments (auth, dashboard, invite, landing)
components/             UI and feature components
lib/api/                API clients (auth, tasks, members, health)
lib/hooks/              React Query hooks
lib/stores/             Zustand stores
lib/utils/              Shared helpers (error handling, etc.)
types/                  Domain types
next.config.ts          Backend rewrite proxy config
middleware.ts           Auth route guard middleware
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - run ESLint

## Auth and Route Protection

- Token is stored in Zustand + mirrored to cookie `teamflow-token`.
- `middleware.ts` protects:
  - `/dashboard`
  - `/tasks`
  - `/members`
  - `/settings`
- Public invite route: `/invite/[token]`

## Deployment (Vercel)

1. Redeploy.

## Troubleshooting

### "An unexpected error occurred"

Usually backend-side. Check backend health first:

- `GET /api/Health` should be healthy.
- If it returns `503`, fix backend dependencies (DB/Redis/network) before frontend changes.

### Network/CORS errors

If backend uses strict CORS origins, include exact protocol + domain:

- `https://your-frontend.vercel.app` (correct)
- `your-frontend.vercel.app` (incorrect)

### Build fails when offline fetching fonts

This project uses `next/font/google`. In restricted networks, `next build` can fail if Google Fonts cannot be fetched.

## Notes

- `middleware.ts` works on Next.js 16 but the framework currently warns that `proxy` is the newer convention.
- API integrations include compatibility fallbacks for route casing/variant differences across backend deployments.
