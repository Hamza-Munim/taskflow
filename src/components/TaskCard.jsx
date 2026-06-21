import { CalendarDays } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PriorityBadge from './PriorityBadge'
import { getInitials, isOverdue } from '../utils/taskConfig'

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border border-taskflow-border bg-white p-4 shadow-sm transition ${
        isDragging ? 'opacity-60 shadow-lg' : 'hover:shadow-md'
      }`}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-medium text-taskflow-text">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div
          className={`flex items-center gap-1.5 text-xs ${
            isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-taskflow-muted'
          }`}
        >
          <CalendarDays size={14} />
          <span>{task.due_date || 'No date'}</span>
        </div>
        {task.assignee_name ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-taskflow-primary">
            {getInitials(task.assignee_name)}
          </span>
        ) : null}
      </div>
    </article>
  )
}
