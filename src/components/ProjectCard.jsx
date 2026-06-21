import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProjectCard({ project, onDelete, onRename }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const tasks = project.tasks ?? []
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <article
      className="group relative cursor-pointer rounded-lg border border-taskflow-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/project/${project.id}`)}
      onContextMenu={(event) => {
        event.preventDefault()
        setMenuOpen(true)
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg" style={{ backgroundColor: project.color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-taskflow-text">{project.name}</h2>
          <p className="mt-1 line-clamp-1 text-sm text-taskflow-muted">
            {project.description || 'No description yet'}
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setMenuOpen((open) => !open)
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-taskflow-muted hover:bg-taskflow-bg"
          aria-label="Project menu"
        >
          <MoreVertical size={17} />
        </button>
      </div>
      <p className="mt-6 text-sm text-taskflow-muted">
        {tasks.length} tasks · {doneCount} done
      </p>
      <div className="mt-3 h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: project.color }}
        />
      </div>
      <button className="mt-4 text-sm font-semibold text-taskflow-primary" type="button">
        Open
      </button>

      {menuOpen ? (
        <div
          className="absolute right-4 top-12 z-10 w-36 rounded-lg border border-taskflow-border bg-white p-1 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              onRename(project)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-taskflow-text hover:bg-taskflow-bg"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              onDelete(project)
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ) : null}
    </article>
  )
}
