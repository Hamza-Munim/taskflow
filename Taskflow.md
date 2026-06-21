# AGENT PROMPT — PROJECT 2: "TaskFlow" Task Management App

Copy everything below this line into your coding agent as a single prompt.

---

Build a complete, production-quality, full-stack Kanban-style task management web app called **"TaskFlow"**. Follow every specification below exactly, including the full database schema and API contract. Do not skip sections.

## 1. Tech Stack
- **Frontend:** React 18 + Vite, Tailwind CSS, React Router DOM, `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop, `zustand` or React Context for global state, `react-hook-form` for forms, `lucide-react` for icons
- **Backend/Data layer:** Supabase (Postgres database + built-in Auth + auto-generated REST/JS client) — use the `@supabase/supabase-js` client directly from the frontend, no separate Express server needed
- **Deployment target:** Vercel/Netlify for frontend, Supabase cloud project for backend

## 2. Database Schema (create these exact tables in Supabase)

```sql
-- Users are handled by Supabase Auth automatically (auth.users table)

-- Profiles (extends auth.users with app-specific data)
create table profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  avatar_color text default '#6366F1', -- hex color for avatar placeholder
  created_at timestamp with time zone default now()
);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  color text default '#6366F1', -- accent color for project card
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  position integer not null default 0, -- for ordering within a column
  assignee_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Task comments/notes
create table task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  author_name text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Subtasks/checklist items
create table subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  is_complete boolean default false,
  position integer not null default 0
);
```

**Row Level Security (RLS):** Enable RLS on all tables. Policies: a user can only `select`/`insert`/`update`/`delete` projects where `owner_id = auth.uid()`, and tasks/comments/subtasks only where the parent project's `owner_id = auth.uid()` (use a join/exists subquery policy for these).

## 3. Project Structure
```
src/
  components/
    Navbar.jsx
    Sidebar.jsx
    ProjectCard.jsx
    KanbanColumn.jsx
    TaskCard.jsx
    TaskDetailModal.jsx
    CreateProjectModal.jsx
    CreateTaskModal.jsx
    PriorityBadge.jsx
    SearchFilterBar.jsx
  pages/
    Login.jsx
    Signup.jsx
    Dashboard.jsx
    ProjectBoard.jsx
  lib/
    supabaseClient.js
  hooks/
    useAuth.js
    useProjects.js
    useTasks.js
  App.jsx
  main.jsx
```

## 4. Design System

**Colors:**
- Background: `#F8F9FB` (very light gray)
- Sidebar background: `#FFFFFF` with right border `#E5E7EB`
- Primary accent (buttons, active states): `#6366F1` (indigo)
- Text primary: `#111827`
- Text muted: `#6B7280`
- Border/divider: `#E5E7EB`
- Priority colors: Low = `#10B981` (green), Medium = `#F59E0B` (amber), High = `#EF4444` (red)
- Column header backgrounds: To Do = `#F3F4F6`, In Progress = `#DBEAFE`, Review = `#FEF3C7`, Done = `#D1FAE5`

**Typography:**
- Font: `Inter` throughout (Google Fonts)
- Headings: semibold/bold, sizes `text-2xl` (page titles) down to `text-sm` (labels)
- Card titles: `text-sm font-medium`

**Style direction:** Minimal SaaS dashboard aesthetic (Linear/Notion-inspired) — lots of whitespace, subtle shadows (`shadow-sm`), thin borders instead of heavy dividers, rounded corners (`rounded-lg`), small/compact UI density.

## 5. Page-by-Page & Feature Specification

### PAGE: Signup (`/signup`)
- Centered card on a plain background, app logo/name "TaskFlow" above
- Fields: Full Name, Email, Password, Confirm Password — all required, password min 6 chars, confirm must match
- Inline validation errors (red text below field on blur/submit)
- On submit: call `supabase.auth.signUp()`, then insert a row into `profiles` with the user id and full name
- On success: redirect to `/dashboard`
- Link at bottom: "Already have an account? Log in" → `/login`

### PAGE: Login (`/login`)
- Same card style as signup
- Fields: Email, Password
- "Forgot password?" link (can be non-functional/placeholder)
- On submit: call `supabase.auth.signInWithPassword()`, redirect to `/dashboard` on success, show error message on failure (e.g., "Invalid email or password")
- Link at bottom: "Don't have an account? Sign up" → `/signup`

### Global Layout (after login): Sidebar + Top bar
- **Sidebar (left, fixed width ~240px):** App logo/name top, "Projects" section header, list of all user's projects (name + small color dot + task count), "+ New Project" button at bottom of list, user profile section at very bottom (avatar circle with initials, name, "Log out" button)
- **Top bar (above main content):** breadcrumb (Dashboard > Project Name when inside a project), search bar (right side, see Search & Filter below)

### PAGE: Dashboard (`/dashboard`)
- H1 "Your Projects"
- "+ New Project" button (top right, primary style)
- Grid of project cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap-6):
  - Each card: colored top border or left accent matching project color, project name (bold), description (1 line, truncated), task count summary ("12 tasks · 5 done"), small progress bar showing % done, "Open" on click navigates to that project's board
  - Card has a hover state (slight lift/shadow increase)
  - Right-click or small "⋮" menu icon on each card: Rename, Delete (with confirmation dialog before delete)
- Empty state if no projects: centered illustration/icon, "No projects yet", "Create your first project" button

**Create Project Modal:**
- Triggered by "+ New Project" button
- Fields: Project Name (required), Description (optional, textarea), Color picker (6-8 preset color swatches to choose from)
- "Create" and "Cancel" buttons
- On submit: insert into `projects` table, close modal, navigate to new project's board, update sidebar/dashboard list

### PAGE: Project Board (`/project/:projectId`)
- Top bar shows project name (editable inline — click to rename) and the search/filter bar
- **Kanban board:** 4 columns side by side (horizontal scroll on mobile/narrow screens): **To Do, In Progress, Review, Done**
  - Each column: header with column name + task count badge + colored background per the design system above, "+ Add task" button at bottom of each column
  - Task cards within columns are draggable between columns (and reorderable within a column) using `@dnd-kit`
  - On drop into a new column: update that task's `status` field in Supabase immediately (optimistic UI update, then persist)

**Task Card (within column):**
- Title (truncated to 2 lines max)
- Priority badge (small colored pill, top right of card: Low/Medium/High)
- Due date (small calendar icon + date, red text if overdue and not done)
- Assignee initial avatar (bottom right, small circle)
- Click anywhere on card opens Task Detail Modal

**Create Task Modal (triggered by "+ Add task" in any column):**
- Fields: Title (required), Description (optional, textarea), Priority (dropdown: Low/Medium/High, default Medium), Due Date (optional date picker), Assignee Name (optional text input)
- Task is created directly into the column it was triggered from (sets `status` accordingly)
- "Create Task" and "Cancel" buttons

**Task Detail Modal (triggered by clicking a task card):**
- Full-screen-ish modal/drawer (slides in from right, ~480px wide on desktop, full width on mobile)
- Editable title (click to edit inline)
- Status dropdown (can change column from here too)
- Priority dropdown
- Due date picker
- Assignee name field
- Description textarea (editable, auto-save on blur)
- **Checklist/Subtasks section:** list of subtask items with checkboxes (toggle complete), "+ Add subtask" inline input, delete icon per subtask, small progress indicator ("2/5 complete")
- **Comments section:** list of existing comments (author name, timestamp, content), input box at bottom to add a new comment with "Post" button
- Delete Task button (bottom, red/destructive style, with confirmation before deleting)
- Close button (X icon, top right of modal)

### Search & Filter Bar (visible on Project Board page)
- Search input (magnifying glass icon): filters visible task cards by title match in real-time as you type, across all columns
- Priority filter dropdown (multi-select or single-select: All / Low / Medium / High): hides non-matching task cards
- Due date filter (optional toggle: "Show overdue only")
- Filters combine (AND logic) with search

## 6. API/Data Layer Behavior Requirements
- All reads/writes go through the Supabase JS client (`supabase.from('projects').select()`, `.insert()`, `.update()`, `.delete()`, etc.) — wrap these in custom hooks (`useProjects`, `useTasks`) that handle loading states, errors, and re-fetching/local state sync after mutations
- Use Supabase's `onAuthStateChange` listener to keep auth state in sync globally and protect routes (redirect to `/login` if not authenticated, wrap protected routes in a `<ProtectedRoute>` component)
- Drag-and-drop status changes must persist to the database, not just update local UI state — on page refresh the board state must be accurate
- Task `position` field should update when reordering within/between columns so order persists correctly on reload

## 7. Polish Requirements
- Loading skeletons/spinners while data fetches (don't show blank screens)
- Toast notifications (use a simple custom toast component or a library like `react-hot-toast`) for: task created, task moved, task deleted, project created, error states
- Empty states for: no projects, no tasks in a column ("Drop tasks here" placeholder text)
- Fully responsive: sidebar collapses to a hamburger-triggered drawer on mobile, Kanban columns become horizontally scrollable with snap-to-column behavior on mobile
- Confirm-before-delete dialogs for projects and tasks (simple modal: "Are you sure? This cannot be undone" with Cancel/Delete buttons)

## 8. Deliverable
A fully working full-stack application where: a new user can sign up, log in, create multiple projects, build out Kanban boards per project with full drag-and-drop, create/edit/delete tasks with all metadata (priority, due date, assignee, description, subtasks, comments), and have all of this data persist correctly in a real Postgres database via Supabase — verified by refreshing the page and confirming state is unchanged. Include a `.env.example` file showing required Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and the full SQL schema above as a `schema.sql` file in the project root.
