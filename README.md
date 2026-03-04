# TeamFlow Frontend

A multi-tenant task management frontend built with **Next.js 16 App Router**, React 19, and TypeScript. Organizations can register, manage tasks, invite members, and control access — all from a clean, responsive UI.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [Key Features](#key-features)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Auth & Route Protection](#auth--route-protection)
- [Quick Start](#quick-start)
- [Scripts](#scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Overview

TeamFlow is a multi-tenant SaaS frontend where each organization gets its own isolated workspace. Key capabilities:

- **Organization onboarding** — register a new organization or log in to an existing one
- **Task management** — create, view, filter, and update tasks with status and priority tracking
- **Team management** — view members, assign roles, and send email invites
- **Invite flow** — publicly accessible invite acceptance page for new members
- **Session-aware routing** — middleware enforces auth on all protected pages
- **API proxying** — all API calls go through Next.js rewrites, keeping backend origin private

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Animations | GSAP 3 |
| Icons | Lucide React |

---

## Project Structure

```text
app/                        Next.js App Router pages
  (auth)/                   Login and registration pages
  (dashboard)/              Protected workspace pages
  invite/[token]/           Public invite acceptance page
components/
  auth/                     LoginForm, RegisterOrgForm
  dashboard/                DashboardOverview
  landing/                  LandingPage (with GSAP animations)
  layout/                   DashboardShell, Sidebar, Topbar
  members/                  MembersView, MemberList, InviteModal, RoleBadge
  shared/                   AppProviders, Can (permission gate)
  tasks/                    TaskTable, TaskForm, TaskFilters, TaskDetailView
lib/
  api/                      Axios client + endpoint modules (auth, tasks, members, health)
  hooks/                    React Query hooks (useTasks, useMembers, usePermission, …)
  stores/                   Zustand stores (auth, org)
  utils/                    Shared helpers (error handling)
types/                      Domain interfaces (Task, User, Organization, …)
middleware.ts               Edge middleware for auth-based route protection
next.config.ts              Rewrite proxy + environment config
```

---

## Routes & Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing / marketing page |
| `/login` | Public (guest only) | Login form |
| `/register` | Public (guest only) | Organization registration |
| `/invite/[token]` | Public | Accept an email invite |
| `/dashboard` | Protected | Overview stats and summary |
| `/tasks` | Protected | Task list with filters |
| `/tasks/[id]` | Protected | Task detail view |
| `/members` | Protected | Team members and invite management |
| `/settings` | Protected | Organization settings |

Authenticated users visiting `/login` or `/register` are automatically redirected to `/dashboard`.

---

## Key Features

### Task Management

- Tasks have **status** (`Todo`, `InProgress`, `Done`) and **priority** (`Low`, `Medium`, `High`)
- Filter tasks by status, priority, and assignee
- Full CRUD with optimistic updates via TanStack Query mutations

### Member & Invite System

- View all members of your organization with role badges (`Admin`, `Member`)
- Invite new users by email — they receive a link to `/invite/[token]`
- Role-based permission gating via the `<Can>` component and `usePermission` hook

### Organization Onboarding

- Register a new organization with name, email, and password in a single form
- Login returns a JWT token stored in Zustand and mirrored to a cookie for SSR/middleware access

---

## State Management

### Auth Store (Zustand — persisted)

Stored in `localStorage` and synced to the `teamflow-token` cookie (7-day expiry):

```ts
{
  token: string | null
  user: User | null
  organization: Organization | null
  lastOrgId: string | null
}
```

### React Query

All server data (tasks, members, health) is managed by TanStack Query with:

- `refetchOnWindowFocus: false`
- `retry: 1`
- Optimistic updates on task mutations

---

## API Layer

All API calls use a shared Axios instance (`lib/api/client.ts`) that:

- Automatically attaches the `Authorization: Bearer <token>` header from the auth store
- Handles `401` responses by clearing auth state and redirecting to `/login`

The frontend only calls relative `/api/*` paths. Next.js rewrites forward them to the backend at runtime — the backend origin is never exposed to the browser.

Modules:

| Module | Endpoints |
|---|---|
| `auth.ts` | Login, register, accept invite |
| `tasks.ts` | CRUD for tasks, status/priority mapping |
| `members.ts` | List members, send and accept invites |
| `health.ts` | Health check status |

---

## Auth & Route Protection

Handled by `middleware.ts` at the Next.js Edge:

- Reads the `teamflow-token` cookie or `Authorization` header
- **Protected routes** (redirect to `/login` if unauthenticated): `/dashboard`, `/tasks`, `/members`, `/settings`
- **Auth routes** (redirect to `/dashboard` if already authenticated): `/login`, `/register`
- **Public routes** (always accessible): `/`, `/invite/[token]`
- Unauthenticated redirects preserve the original path as `?next=` for post-login redirect

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd multi-frontend
npm install
```

### 2. Configure environment

Create `.env.local` in the project root and set your backend origin:

```env
BACKEND_API_URL=<your-backend-origin>
```

> In production, the app will fail to start if `BACKEND_API_URL` is not set.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile and optimize for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the codebase |

---

## Deployment (Vercel)

1. Push your code to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add `BACKEND_API_URL` under **Project Settings → Environment Variables** for the `Production` environment (and `Preview` if needed).
3. Deploy. Vercel will run `npm run build` automatically.

> Vercel's Edge Network handles routing and the Next.js rewrites will forward API calls to your backend.

---

## Troubleshooting

### "An unexpected error occurred"

This is usually a backend issue. Check:

- `GET /api/Health` — should return a healthy status
- If `503`, fix backend dependencies (database, Redis, network) before investigating the frontend

### Network / CORS errors

If your backend enforces strict CORS origins, register the **exact** frontend URL including protocol:

```
✅ https://your-app.vercel.app
❌ your-app.vercel.app
```

### Build fails when offline (Google Fonts)

This project uses `next/font/google`. In restricted networks, `next build` may fail if Google Fonts cannot be fetched. Use a local font alternative or configure a font proxy if needed.

### Token not persisting after refresh

Ensure `localStorage` is available (not blocked by browser settings or incognito restrictions). The Zustand store relies on it for persistence.

---

## Notes

- `middleware.ts` runs on the Next.js Edge Runtime. Note that Next.js 16 currently warns that `proxy` is the newer convention for rewrites — this is cosmetic and does not affect functionality.
- API modules include compatibility fallbacks for route casing and path variant differences across backend deployment environments.
- The `<Can>` component and `usePermission` hook provide a consistent pattern for role-based UI gating without scattering conditional logic across components.
