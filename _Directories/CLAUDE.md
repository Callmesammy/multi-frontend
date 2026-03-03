# 🤖 CLAUDE.md — TeamFlow Frontend

> This file gives Claude (or any AI assistant) full context about this codebase.
> Keep it updated as the project evolves.

---

## Project Summary

**TeamFlow** is a multi-tenant SaaS task management app. This repo is the **Next.js frontend** that connects to a **.NET 8 Clean Architecture REST API**.

Users belong to organizations. Each organization has Admins and Members. Tasks are scoped to an organization. The frontend enforces role-based UI rules that mirror the API's authorization policies.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| HTTP client | Axios |
| Forms | react-hook-form + zod |
| Icons | lucide-react |

---

## Critical Architecture Rules

### 1. Server state vs client state — never mix them
- **TanStack Query** owns everything that comes from the API: tasks, members, invites.
- **Zustand** owns only session-level client state: the JWT token, the current user object, the active org ID.
- Never put API response data into a Zustand store. Never put auth tokens into a Query cache.

### 2. All API calls go through `lib/api/client.ts`
- The Axios instance in `client.ts` automatically injects the `Authorization: Bearer <token>` header.
- On `401` response, it clears the auth store and redirects to `/login`.
- Never call `axios.get(...)` directly — always import from `lib/api/`.

### 3. Route protection is in `middleware.ts`, not in page components
- `middleware.ts` checks for a valid token and redirects unauthenticated users to `/login`.
- Page components should never contain redirect logic for auth.
- The `(auth)` route group is public. The `(dashboard)` route group is protected.

### 4. Role checks use the `<Can>` component or `usePermission` hook
```tsx
// Correct
<Can role="Admin">
  <DeleteTaskButton />
</Can>

// Wrong — don't inline role checks in JSX
{user.role === "Admin" && <DeleteTaskButton />}
```

### 5. Forms always use react-hook-form + zod
- Every form has a zod schema in the same file or a sibling `*.schema.ts` file.
- Never use uncontrolled inputs or manual `useState` for form fields.

### 6. Error handling maps .NET ProblemDetails
The API returns RFC 7807 `ProblemDetails` on errors:
```json
{ "title": "Not found", "status": 404, "detail": "Task not found." }
```
Use the `handleApiError(err)` util in `lib/utils/errors.ts` to extract a user-readable message from any axios error.

---

## File Conventions

| Pattern | Rule |
|---------|------|
| Components | PascalCase, one component per file |
| Hooks | `use` prefix, camelCase (`useTasks.ts`) |
| Stores | `camelCase.store.ts` |
| API modules | `camelCase.ts` inside `lib/api/` |
| Types | PascalCase interfaces in `types/` |
| Page files | `page.tsx` only, no logic — delegate to components |

---

## Types Reference

These mirror the .NET API DTOs exactly. Always keep them in sync.

```typescript
// types/auth.ts
interface LoginRequest { email: string; password: string; }
interface AuthResponse { token: string; user: User; organization: Organization; }

// types/user.ts
interface User { id: string; email: string; name: string; role: "Admin" | "Member"; }

// types/organization.ts
interface Organization { id: string; name: string; }

// types/task.ts
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "Todo" | "InProgress" | "Done";
  priority: "Low" | "Medium" | "High";
  assigneeId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// types/pagination.ts
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## API Endpoints Reference

Base URL: `NEXT_PUBLIC_API_URL` from env (e.g. `http://localhost:5000`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/organizations` | No | Register org + admin user |
| GET | `/api/tasks` | Yes | List tasks (paginated, filtered) |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/{id}` | Yes | Update task |
| DELETE | `/api/tasks/{id}` | Admin only | Delete task |
| GET | `/api/organizations/{id}/members` | Yes | List members |
| POST | `/api/organizations/{id}/invites` | Admin only | Send invite |
| POST | `/api/invites/accept` | No | Accept invite by token |
| GET | `/health` | No | Health check |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.teamflow.yourdomain.com
```

---

## Common Patterns

### Fetching data with TanStack Query
```tsx
// lib/hooks/useTasks.ts
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters),
  });
}
```

### Mutating with optimistic update
```tsx
const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: updateTask,
  onMutate: async (updated) => {
    await queryClient.cancelQueries({ queryKey: ["tasks"] });
    const previous = queryClient.getQueryData(["tasks"]);
    queryClient.setQueryData(["tasks"], (old) => /* patch old with updated */);
    return { previous };
  },
  onError: (_, __, ctx) => queryClient.setQueryData(["tasks"], ctx?.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
});
```

### Zustand auth store
```tsx
// lib/stores/auth.store.ts
interface AuthState {
  token: string | null;
  user: User | null;
  org: Organization | null;
  setAuth: (token: string, user: User, org: Organization) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, user: null, org: null,
      setAuth: (token, user, org) => set({ token, user, org }),
      clearAuth: () => set({ token: null, user: null, org: null }),
    }),
    { name: "teamflow-auth" }
  )
);
```

---

## What Claude Should NOT Do

- Do not create new components inside `app/` — components go in `components/`.
- Do not use the `pages/` directory — this project uses App Router only.
- Do not call API endpoints directly from page components — always go through `lib/api/`.
- Do not add new dependencies without noting them here.
- Do not use `any` type — use `unknown` and narrow, or define a proper type.
- Do not use inline styles — Tailwind classes only.
