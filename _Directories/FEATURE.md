# 🧩 TeamFlow Frontend — Feature Specifications

> Detailed breakdown of every UI feature, component, and API integration.

---

## V1 — Core UI + Auth + Tasks

---

### 1. Axios Client Setup

**File:** `lib/api/client.ts`

**What it does:**
- Creates a single Axios instance used across all API calls
- Reads base URL from `NEXT_PUBLIC_API_URL`
- Request interceptor: injects `Authorization: Bearer <token>` from Zustand store
- Response interceptor: on `401` → calls `clearAuth()` and redirects to `/login`

```typescript
const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
  }
  return Promise.reject(error);
});
```

---

### 2. Authentication Pages

#### Login — `/app/(auth)/login/page.tsx`

**Fields:** Email, Password
**On submit:** `POST /api/auth/login` → store token + user + org in Zustand → redirect to `/dashboard`
**Validation (zod):**
- Email: valid email format
- Password: min 6 characters

**UI:** Card centered on screen, shadcn/ui `Input`, `Button`, `Form` components, error toast on failure.

#### Register Organization — `/app/(auth)/register/page.tsx`

**Fields:** Organization Name, Your Name, Email, Password, Confirm Password
**On submit:** `POST /api/organizations` → auto-login with returned token → redirect to `/dashboard`
**Validation (zod):**
- Org name: min 2 chars, max 50 chars
- Password: min 8 chars, must match confirm

---

### 3. Route Protection — `middleware.ts`

**What it does:**
- Runs on every request before the page renders
- Checks for `teamflow-auth` cookie or token in headers
- Redirects unauthenticated users to `/login`
- Redirects already-authenticated users away from `/login` and `/register`

**Protected:** All routes under `/(dashboard)/`
**Public:** `/login`, `/register`, `/invite/[token]`

---

### 4. Dashboard Shell

**File:** `app/(dashboard)/layout.tsx`

**Components:**
- `<Sidebar />` — org name at top, nav links (Dashboard, Tasks, Members, Settings), user avatar + logout at bottom
- `<Topbar />` — page title, breadcrumb, optional action buttons
- Content area with scroll

**Sidebar nav links:**

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | /dashboard | LayoutDashboard |
| Tasks | /tasks | CheckSquare |
| Members | /members | Users |
| Settings | /settings | Settings |

**Responsive:** Sidebar collapses to icon-only on medium screens, hidden on mobile with hamburger toggle.

---

### 5. Task List Page

**File:** `app/(dashboard)/tasks/page.tsx`

**What it shows:**
- Page header with "Tasks" title and "New Task" button (Admin + Member)
- Filter bar: Status dropdown, Priority dropdown, Assignee select
- Task table (desktop) / Task cards (mobile)
- Pagination controls at the bottom

**API call:** `GET /api/tasks?page=1&pageSize=20&status=...&priority=...`

**Task table columns:**

| Column | Notes |
|--------|-------|
| Title | Clickable → task detail |
| Status | Colored badge (Todo/InProgress/Done) |
| Priority | Colored badge (Low/Medium/High) |
| Assignee | Avatar + name |
| Created | Relative date (e.g. "2 days ago") |
| Actions | Edit (all), Delete (Admin only) |

**Empty state:** Illustrated empty state with "No tasks yet. Create your first one." CTA.

---

### 6. Task Create / Edit

**Component:** `components/tasks/TaskForm.tsx` (used in both create and edit)

**Trigger:**
- Create: "New Task" button → opens `<Dialog>` modal
- Edit: Edit icon in table row → opens same modal pre-filled

**Fields:**

| Field | Type | Validation |
|-------|------|------------|
| Title | Text input | Required, max 100 chars |
| Description | Textarea | Optional, max 500 chars |
| Status | Select | Todo / InProgress / Done |
| Priority | Select | Low / Medium / High |
| Assignee | Combobox | Lists org members |

**On submit:**
- Create: `POST /api/tasks` → invalidate tasks query → success toast → close modal
- Edit: `PUT /api/tasks/{id}` → optimistic update → success toast → close modal

---

### 7. Task Delete

**Trigger:** Delete icon (Admin only, hidden for Members)
**Flow:** Clicking delete opens `<ConfirmDialog>` → "Are you sure? This action cannot be undone." → Confirm → `DELETE /api/tasks/{id}` → invalidate query → success toast.

---

### 8. Task Detail Page

**File:** `app/(dashboard)/tasks/[id]/page.tsx`

**What it shows:**
- Full task title + description
- Status + priority badges
- Assignee info
- Created / updated timestamps
- Edit button (inline, opens same TaskForm modal)
- Back to tasks link

---

### 9. Members Page

**File:** `app/(dashboard)/members/page.tsx`

**What it shows:**
- List of all org members with avatar, name, email, role badge
- "Invite Member" button (Admin only)
- Admin can see remove button next to each Member (not self)

**API call:** `GET /api/organizations/{orgId}/members`

**Role badges:**
- Admin → blue badge
- Member → gray badge

---

### 10. Invite Flow

#### Send Invite (Admin only)

**Trigger:** "Invite Member" button on Members page → opens `<InviteModal>`
**Fields:** Email address
**On submit:** `POST /api/organizations/{orgId}/invites` → success toast → "Invite sent to {email}"

#### Accept Invite — `/invite/[token]`

**File:** `app/invite/[token]/page.tsx`

**What it does:**
- Public page (no auth required)
- If user is not logged in: show name + password fields to create account
- If user is logged in: show "Join [Org Name]" confirmation button
- On confirm: `POST /api/invites/accept` with token → login + redirect to `/dashboard`
- Expired token: show "This invite has expired" message with link to contact admin

---

## V2 — Performance & UX Polish

---

### 11. TanStack Query Integration

**Setup:** `QueryClientProvider` in root `app/layout.tsx`

**Query keys convention:**
```typescript
["tasks", { page, pageSize, status, priority, assigneeId }]
["members", orgId]
["task", taskId]
```

All data fetching hooks live in `lib/hooks/`. Components never call API functions directly.

---

### 12. Pagination UI

**Component:** `components/shared/Pagination.tsx`

**Features:**
- Previous / Next buttons
- Page number display ("Page 2 of 8")
- Shows total count ("87 tasks")
- Syncs with URL search params (`?page=2`) so links are shareable

---

### 13. Filter Bar

**Component:** `components/tasks/TaskFilters.tsx`

**Filters:**
- **Status** — shadcn/ui `Select` (All / Todo / InProgress / Done)
- **Priority** — `Select` (All / Low / Medium / High)
- **Assignee** — `Combobox` with member search
- **Clear filters** — shown when any filter is active

Filters update URL params, which drive the `useQuery` key, which re-fetches automatically.

---

### 14. Optimistic Task Status Toggle

**Interaction:** Clicking a status badge on a task card cycles through statuses instantly — no loading spinner — and syncs with the API in the background. Reverts on error with an error toast.

---

### 15. Skeleton Loaders

**Component:** `components/tasks/TaskTableSkeleton.tsx`

Shown while `isLoading` is true on initial task fetch. Matches the shape of the real table — same number of rows, same column widths — so there's no layout shift when data arrives.

---

### 16. Toast Notifications

**Tool:** shadcn/ui `Sonner` (toast)

| Event | Toast |
|-------|-------|
| Task created | "Task created successfully" (success) |
| Task updated | "Task updated" (success) |
| Task deleted | "Task deleted" (success) |
| Invite sent | "Invite sent to {email}" (success) |
| Any API error | Error message from `ProblemDetails.detail` (error) |
| Network error | "Something went wrong. Please try again." (error) |

---

## V3 — Scalability & DX

---

### 17. `<Can>` Role Guard Component

**File:** `components/shared/Can.tsx`

```tsx
interface CanProps {
  role: "Admin" | "Member";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

Reads the current user's role from Zustand. Renders `children` if role matches, `fallback` (or nothing) otherwise. Used for all role-conditional UI elements.

---

### 18. `handleApiError` Utility

**File:** `lib/utils/errors.ts`

Parses any Axios error and returns a user-friendly string:
- If `error.response.data` has a `detail` field (ProblemDetails) → return `detail`
- If `error.response.data` has a `title` field → return `title`
- If network error → return "Network error. Check your connection."
- Fallback → "An unexpected error occurred."

---

### 19. Error Boundary

**File:** `components/shared/ErrorBoundary.tsx`

Wraps the dashboard layout. On uncaught render error, shows a friendly "Something went wrong" page with a "Reload" button instead of a blank crash screen.

---

### 20. Zustand Persist

Auth store uses `zustand/middleware/persist` to survive page refresh:
- Persisted to `localStorage` under key `teamflow-auth`
- On app load, Axios interceptor reads token from rehydrated store immediately
- No flash of unauthenticated content

---

## V4 — Production Polish

---

### 21. Dark Mode

**Implementation:**
- Tailwind `darkMode: "class"` in `tailwind.config.ts`
- shadcn/ui ships with dark variants out of the box
- Toggle button in Sidebar footer → sets `dark` class on `<html>`
- Preference saved to `localStorage`

---

### 22. Responsive Layout

| Breakpoint | Behavior |
|------------|----------|
| Mobile (`< md`) | Sidebar hidden, hamburger menu, stacked task cards |
| Tablet (`md`) | Sidebar shows icons only (collapsed) |
| Desktop (`lg+`) | Full sidebar with labels, task table |

---

### 23. Docker Support

**File:** `Dockerfile` (in frontend root)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
```

Added to the backend's `docker-compose.yml` as a `web` service alongside `api`, `postgres`, and `redis`.

---

### 24. CI/CD — GitHub Actions

**File:** `.github/workflows/frontend.yml`
**Trigger:** Push or PR to `main`

**Steps:**
```
1. Checkout code
2. Setup Node 20
3. Install dependencies (npm ci)
4. Type check (tsc --noEmit)
5. Lint (eslint)
6. Build (next build)
7. Docker build (verify image builds)
```

Build status badge in README.
