# Team Task Manager — Frontend

A role-aware team task management dashboard built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. It provides a ClickUp-inspired UI for Admins to manage projects and tasks and for Members to track their assigned work.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios (via centralized `api.ts`) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Font | Google Fonts — Inter (via Next.js font optimization) |

---

## Project Structure

```
frontend/
├── .env.local                         # Environment variables
├── src/
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout (font, toast provider)
│   │   ├── globals.css                # Global CSS resets + Tailwind base
│   │   ├── page.tsx                   # Dashboard (/) — stats, charts
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── signup/
│   │   │   └── page.tsx               # Signup / registration page
│   │   ├── projects/
│   │   │   ├── page.tsx               # Projects list page
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Project board page (kanban by project)
│   │   └── tasks/
│   │       └── page.tsx               # My Tasks page (member assigned tasks)
│   ├── components/                    # Reusable UI components
│   │   ├── Button.tsx                 # Shared button with variants + loading state
│   │   ├── ConfirmModal.tsx           # Custom delete confirmation dialogue
│   │   ├── CreateProjectModal.tsx     # Create / edit project modal
│   │   ├── CreateTaskModal.tsx        # Create / edit task modal (RBAC-aware)
│   │   ├── DashboardLayout.tsx        # App shell: sidebar, header, nav links
│   │   ├── Loader.tsx                 # Spinner + skeleton loaders
│   │   ├── LoginIllustration.tsx      # SVG blob illustration for auth pages
│   │   ├── ProjectViewModal.tsx       # Project detail read-only modal
│   │   ├── StatusBadge.tsx            # Coloured status pill component
│   │   ├── TaskBoard.tsx              # Task grid with delete confirmation
│   │   ├── TaskBoardSkeleton.tsx      # Skeleton loading state for task board
│   │   ├── TaskCard.tsx               # Individual task card with action buttons
│   │   └── TaskViewModal.tsx          # Task detail read-only modal
│   └── lib/
│       ├── api.ts                     # Axios instance with auth interceptor
│       └── auth.ts                    # Token decode helpers, role/name getters
```

---

## Environment Variables

Create a `.env.local` file in the `frontend/` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend |

> All API calls go through `src/lib/api.ts` which reads this variable. No URL is hardcoded anywhere else in the codebase.

---

## Pages and Routes

| Route | File | Access | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Auth required | Dashboard with stats cards and charts |
| `/login` | `app/login/page.tsx` | Public | Email + password login form |
| `/signup` | `app/signup/page.tsx` | Public | Registration form (name, email, password, role) |
| `/projects` | `app/projects/page.tsx` | Auth required | Project cards list; Admin can create/edit/delete |
| `/projects/[id]` | `app/projects/[id]/page.tsx` | Auth required | Kanban-style task board for a specific project |
| `/tasks` | `app/tasks/page.tsx` | Auth required | Member's personal task list with status filter |

---

## Components

### `DashboardLayout.tsx`
- App shell wrapping all authenticated pages
- Left sidebar with nav links: Dashboard, Project Management, Task Management
- Top header with user avatar and logout
- Highlights the active route with orange accent

### `TaskBoard.tsx`
- Fetches tasks from the API (optionally filtered by `project_id` or `statusFilter`)
- Renders a responsive 1/2/3 column grid of `TaskCard` components
- Manages the `ConfirmModal` state for task deletion
- Empty states for zero tasks and zero filtered tasks

### `TaskCard.tsx`
- Displays: title, description, assignee avatar + name, due date, status badge
- Inline action icons (View, Edit, Delete) — always visible
- Date tags (Started, Estimated, Closed) as coloured pills
- Opens `TaskViewModal` on the eye icon

### `CreateTaskModal.tsx`
- Dual mode: Create (Admin) or Edit (Admin/Member)
- Role-aware: when `userRole === 'Member'`, all fields except Status are rendered as read-only inputs with a notice "You can only update the status of this task."
- Resolves project name via `initialData.projectName` (returned by the API) — does not depend on client-side project list lookup

### `ConfirmModal.tsx`
- Reusable confirmation dialogue replacing `window.confirm()`
- Props: `title`, `message`, `confirmText`, `cancelText`, `isLoading`
- Red confirm button, animated backdrop blur overlay

### `CreateProjectModal.tsx`
- Create or edit a project
- Fields: title, description, status, start date, estimation date, closed date

### `Button.tsx`
- Shared button component
- Variants: `primary`, `secondary`
- Props: `isLoading` (shows spinner), `disabled`

### `LoginIllustration.tsx`
- Custom SVG zig-zag blob illustration shown on the left panel of auth pages

### `StatusBadge.tsx`
- Coloured pill for displaying task/project status

### `Loader.tsx` and `TaskBoardSkeleton.tsx`
- `Loader` — spinner with optional text label
- `LoaderSkeleton` — animated grey placeholder blocks
- `TaskBoardSkeleton` — card-shaped skeletons for the task board

---

## Authentication Flow

1. User submits login form → `POST /login/access-token` (OAuth2 form data)
2. On success, the app stores in `localStorage`:
   - `token` — the JWT bearer token
   - `role` — `Admin` or `Member`
   - `user_name` — display name
3. `src/lib/api.ts` attaches `Authorization: Bearer <token>` to every outgoing request via an Axios request interceptor
4. On a `401` response, the Axios response interceptor clears localStorage and redirects to `/login`
5. Role and name are read back via `src/lib/auth.ts` helpers:
   - `getStoredUserRole()` — reads `localStorage.role` or decodes the JWT payload
   - `getStoredUserName()` — reads `localStorage.user_name` or decodes the JWT payload

---

## RBAC in the UI

### Admin view
- "New Project" and "New Task" buttons are visible
- Full edit / delete actions on project cards
- Full edit / delete actions on task cards
- `CreateTaskModal` renders all fields as editable inputs

### Member view
- "New Task" / "New Project" buttons are hidden
- A blue info banner: "You can only update the status of your assigned tasks."
- `CreateTaskModal` renders title, description, project, assignee, dates as read-only — only the Status dropdown is editable
- The Project field displays the project name (via `projectName` from the API response) instead of the raw UUID

---

## API Integration

All HTTP requests are made through the centralized `src/lib/api.ts` Axios instance. This means:
- Base URL comes from `NEXT_PUBLIC_API_URL` (no hardcoded URLs)
- Auth token is automatically injected on every request
- 401 handling is centralised (auto-logout)

Key API calls per page:

| Page | API Calls |
|---|---|
| Dashboard | `GET /dashboard/admin` or `GET /dashboard/member` |
| Projects | `GET /projects/`, `POST /projects/`, `PUT /projects/:id`, `DELETE /projects/:id` |
| Project Board | `GET /projects/:id`, `GET /tasks/?project_id=:id`, `POST /tasks/`, `PUT /tasks/:id` |
| Tasks | `GET /tasks/`, `PUT /tasks/:id` |
| Create/Edit Task Modal | `GET /users/`, `GET /projects/` |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 3. Start the dev server
npm run dev
```

App will be available at: `http://localhost:3000`

> Make sure the backend is running first at `http://localhost:8000` before starting the frontend.

---

## Key Design Decisions

- **Centralized API client** — `api.ts` is the single source of truth for all HTTP config; changing the backend URL only requires updating `.env.local`
- **Role-aware components** — UI adapts based on the user's role without extra API calls; the role is decoded from the JWT stored in localStorage
- **`projectName` from API** — the backend sends `projectName` alongside each task response, so the Member's edit modal can display a readable project name even if the member has no direct access to the projects list endpoint
- **`ConfirmModal` over `window.confirm()`** — gives full control over styling, loading states, and UX without blocking the browser's UI thread
- **Recharts for visualisation** — `PieChart` for task completion percentage and `BarChart` for task-by-status breakdown on the dashboard
