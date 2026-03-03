# 📋 TeamFlow Frontend — Project Plan

> Next.js 14 · Tailwind CSS · shadcn/ui · Zustand · Connected to TeamFlow .NET API

---

## 🏗️ Project Structure

```
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group — no sidebar layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Route group — with sidebar layout
│   │   ├── layout.tsx          # Sidebar + topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx        # Task list
│   │   │   └── [id]/page.tsx   # Task detail
│   │   ├── members/page.tsx
│   │   └── settings/page.tsx
│   ├── invite/[token]/page.tsx # Public invite accept page
│   └── layout.tsx              # Root layout (fonts, providers)
│
├── components/
│   ├── ui/                     # shadcn/ui auto-generated
│   ├── layout/                 # Sidebar, Topbar, PageHeader
│   ├── tasks/                  # TaskCard, TaskForm, TaskFilters, TaskTable
│   ├── members/                # MemberList, InviteModal, RoleBadge
│   └── shared/                 # ConfirmDialog, EmptyState, LoadingSpinner
│
├── lib/
│   ├── api/                    # All API calls (axios instances + endpoints)
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── members.ts
│   ├── stores/                 # Zustand stores
│   │   ├── auth.store.ts
│   │   └── org.store.ts
│   ├── hooks/                  # Custom hooks (useAuth, useTasks, etc.)
│   └── utils/                  # cn(), formatDate(), etc.
│
├── types/                      # Shared TypeScript types (mirrors API DTOs)
├── middleware.ts               # Route protection (Next.js middleware)
└── .env.local                  # NEXT_PUBLIC_API_URL
```

**Stack:**  shadcn/ui · Zustand · Axios · TanStack Query

---

## 🗂️ Phases

---

### ✅ V1 — Core UI + Auth + Tasks

**Goal:** Fully working app connected to the .NET API.

| # | Task | Notes |
|---|------|-------|
| 1 | Project scaffold | `npx create-next-app`, install Tailwind + shadcn/ui |
| 2 | Axios client setup | Base URL from env, JWT interceptor, 401 auto-logout |
| 3 | Auth stores + hooks | Zustand `authStore` — token, user, org context |
| 4 | Login / Register pages | Forms with validation (react-hook-form + zod) |
| 5 | Route protection | `middleware.ts` redirects unauthenticated users |
| 6 | Dashboard shell | Sidebar, topbar, responsive layout |
| 7 | Task list page | Table + cards, connect to `GET /api/tasks` |
| 8 | Task create/edit | Modal form, connect to POST/PUT endpoints |
| 9 | Task delete | Confirm dialog, Admin only |
| 10 | Members page | List org members, show roles |
| 11 | Invite flow | Admin sends invite → user accepts via `/invite/[token]` |

**Exit criteria:** Full CRUD on tasks works against the live API, auth persists on refresh, role-based UI elements shown/hidden correctly.

---

### ⚡ V2 — Performance & UX Polish

**Goal:** Fast, smooth, production-feeling UI.

| # | Task | Notes |
|---|------|-------|
| 1 | TanStack Query | Replace raw axios calls with `useQuery` / `useMutation` |
| 2 | Pagination UI | Page controls connected to `?page=` API params |
| 3 | Filters + search | Status, priority, assignee filter bar |
| 4 | Optimistic updates | Task status toggle feels instant |
| 5 | Skeleton loaders | Replace spinners with content-shaped skeletons |
| 6 | Toast notifications | Success/error feedback on all mutations |
| 7 | Debounced search | Search input debounced before hitting API |

---

### 🔁 V3 — Scalability & DX

**Goal:** Maintainable, extensible codebase.

| # | Task | Notes |
|---|------|-------|
| 1 | Error boundary | Catch render errors, show fallback UI |
| 2 | API error handling | Map `.NET ProblemDetails` → user-friendly messages |
| 3 | Role-based rendering | `<Can role="Admin">` wrapper component |
| 4 | Form abstraction | Reusable `TaskForm` used in both create and edit |
| 5 | Zustand persist | Auth token survives page refresh via `localStorage` |
| 6 | Environment config | `.env.local` / `.env.production` separation |

---

### 🚀 V4 — Production Polish

**Goal:** Deployable, professional.

| # | Task | Notes |
|---|------|-------|
| 1 | Dark mode | Tailwind `dark:` classes + shadcn/ui theme toggle |
| 2 | Responsive design | Mobile-first layout, collapsible sidebar |
| 3 | Loading states everywhere | Every async action has a loading indicator |
| 4 | Empty states | Illustrated empty state for tasks, members |
| 5 | Docker support | `Dockerfile` for Next.js, added to backend `docker-compose.yml` |
| 6 | CI/CD | GitHub Actions: lint → type-check → build on push |

---

## 📅 Suggested Timeline

| Phase | Scope | Est. Time |
|-------|-------|-----------|
| V1 | Auth + core pages + API connection | 1–2 weeks |
| V2 | TanStack Query + UX polish | 3–5 days |
| V3 | Error handling + DX | 2–3 days |
| V4 | Dark mode + Docker + CI | 2–3 days |

---

## 🔑 Key Decisions

- **App Router over Pages Router** — layouts, server components, and route groups make auth shells clean.
- **Axios over fetch** — interceptors handle JWT injection and 401 redirect in one place.
- **TanStack Query for server state, Zustand for client state** — don't mix them; Query owns all API data, Zustand owns auth/org context.
- **shadcn/ui as a base, not a constraint** — copy components into `/components/ui/` and customize freely.
- **Middleware for route protection** — faster than client-side redirects; runs on the edge before the page renders.
