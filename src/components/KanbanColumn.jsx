import { Plus } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

export default function KanbanColumn({ status, tasks, onAddTask, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { type: 'column', status: status.id },
  })

  return (
    <section
      ref={setNodeRef}
      className={`flex h-[calc(100vh-11rem)] min-w-[280px] snap-start flex-col rounded-lg border border-taskflow-border bg-white ${
        isOver ? 'ring-2 ring-taskflow-primary' : ''
      }`}
    >
      <div className={`rounded-t-lg px-4 py-3 ${status.headerClass}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-taskflow-text">{status.label}</h2>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-taskflow-muted">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {!tasks.length ? (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-taskflow-border text-sm text-taskflow-muted">
            Drop tasks here
          </div>
        ) : null}
      </div>
      <div className="border-t border-taskflow-border p-3">
        <button
          type="button"
          onClick={() => onAddTask(status.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-taskflow-border px-3 py-2 text-sm font-semibold text-taskflow-muted hover:bg-taskflow-bg hover:text-taskflow-text"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>
    </section>
  )
}
