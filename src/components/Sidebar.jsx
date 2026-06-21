import { CheckCircle2, LogOut, Plus, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { getInitials } from '../utils/taskConfig'

export default function Sidebar({
  isOpen,
  onClose,
  onCreateProject,
  profile,
  projects,
  signOut,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-gray-900/30 transition lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-taskflow-border bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-taskflow-border px-5">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-taskflow-primary text-white">
              <CheckCircle2 size={20} />
            </span>
            <span className="text-lg font-bold text-taskflow-text">TaskFlow</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-taskflow-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-taskflow-muted">Projects</p>
            <button
              type="button"
              onClick={onCreateProject}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-taskflow-primary hover:bg-indigo-50"
              aria-label="Create project"
            >
              <Plus size={17} />
            </button>
          </div>
          <nav className="space-y-1">
            {projects.map((project) => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-taskflow-primary'
                      : 'text-taskflow-muted hover:bg-taskflow-bg hover:text-taskflow-text'
                  }`
                }
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                <span className="text-xs">{project.tasks?.length ?? 0}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-taskflow-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: profile?.avatar_color || '#6366F1' }}
            >
              {getInitials(profile?.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-taskflow-text">
                {profile?.full_name || 'TaskFlow User'}
              </p>
              <p className="text-xs text-taskflow-muted">Workspace owner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-taskflow-border px-3 py-2 text-sm font-medium text-taskflow-muted transition hover:bg-taskflow-bg hover:text-taskflow-text"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
