# TaskFlow

TaskFlow is a full-stack Kanban task management app built with React, Vite, Tailwind CSS, Supabase Auth, and Supabase Postgres.

## Features

- Email/password signup and login with Supabase Auth
- User-owned projects with color accents and progress summaries
- Kanban boards with To Do, In Progress, Review, and Done columns
- Drag-and-drop task movement and ordering with persisted positions
- Task metadata: priority, due date, assignee, description, status
- Task detail drawer with checklist items and comments
- Search, priority filtering, and overdue filtering
- Responsive sidebar and horizontally scrollable mobile board

## Local Setup

Install dependencies:

```powershell
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the development server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Paste and run the contents of `schema.sql`.
4. Copy your Project URL and anon public key into `.env`.
5. In Authentication settings, configure email confirmation according to your preference.

## Deployment

Deploy the frontend to Vercel or Netlify and set these environment variables in the hosting dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The backend is Supabase cloud, so no Express server is required.
