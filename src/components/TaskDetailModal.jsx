import { Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FormField from './FormField'
import PriorityBadge from './PriorityBadge'
import { STATUSES } from '../utils/taskConfig'

export default function TaskDetailModal({
  comments,
  onAddComment,
  onAddSubtask,
  onClose,
  onDeleteTask,
  onDeleteSubtask,
  onUpdateSubtask,
  onUpdateTask,
  profile,
  subtasks,
  task,
}) {
  const [draft, setDraft] = useState(task)
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const taskSubtasks = subtasks.filter((subtask) => subtask.task_id === task.id)
  const taskComments = comments.filter((comment) => comment.task_id === task.id)
  const completeCount = taskSubtasks.filter((subtask) => subtask.is_complete).length
  const progressLabel = `${completeCount}/${taskSubtasks.length} complete`

  const sortedComments = useMemo(
    () =>
      [...taskComments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [taskComments],
  )

  async function saveField(field, value) {
    try {
      setDraft((current) => ({ ...current, [field]: value }))
      await onUpdateTask(task.id, { [field]: value || null }, { silent: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function submitSubtask(event) {
    event.preventDefault()
    if (!newSubtask.trim()) return
    try {
      await onAddSubtask(task.id, newSubtask.trim())
      setNewSubtask('')
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function submitComment(event) {
    event.preventDefault()
    if (!newComment.trim()) return
    try {
      await onAddComment(task.id, profile?.full_name || 'TaskFlow User', newComment.trim())
      setNewComment('')
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function deleteTask() {
    if (!window.confirm('Are you sure? This cannot be undone.')) return
    try {
      await onDeleteTask(task.id)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/35">
      <aside className="h-full w-full max-w-[480px] overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-taskflow-border bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={draft.priority} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-taskflow-muted hover:bg-taskflow-bg"
            aria-label="Close task"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            onBlur={(event) => saveField('title', event.target.value)}
            className="w-full rounded-lg border border-transparent px-0 text-2xl font-bold text-taskflow-text outline-none focus:border-taskflow-border focus:px-3 focus:py-2"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Status"
              as="select"
              value={draft.status}
              onChange={(event) => saveField('status', event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </FormField>
            <FormField
              label="Priority"
              as="select"
              value={draft.priority}
              onChange={(event) => saveField('priority', event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FormField>
            <FormField
              label="Due Date"
              type="date"
              value={draft.due_date || ''}
              onChange={(event) => saveField('due_date', event.target.value)}
            />
            <FormField
              label="Assignee"
              value={draft.assignee_name || ''}
              onChange={(event) => setDraft((current) => ({ ...current, assignee_name: event.target.value }))}
              onBlur={(event) => saveField('assignee_name', event.target.value)}
            />
          </div>

          <FormField
            label="Description"
            as="textarea"
            rows={5}
            value={draft.description || ''}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            onBlur={(event) => saveField('description', event.target.value)}
          />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-taskflow-text">Checklist</h3>
              <span className="text-xs text-taskflow-muted">{progressLabel}</span>
            </div>
            <div className="space-y-2">
              {taskSubtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 rounded-lg border border-taskflow-border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={subtask.is_complete}
                    onChange={(event) => onUpdateSubtask(subtask.id, { is_complete: event.target.checked })}
                    className="h-4 w-4"
                  />
                  <span
                    className={`min-w-0 flex-1 text-sm ${
                      subtask.is_complete ? 'text-taskflow-muted line-through' : 'text-taskflow-text'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteSubtask(subtask.id)}
                    className="text-taskflow-muted hover:text-red-600"
                    aria-label="Delete subtask"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={submitSubtask}>
              <input
                value={newSubtask}
                onChange={(event) => setNewSubtask(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-taskflow-border px-3 py-2 text-sm outline-none focus:border-taskflow-primary"
                placeholder="Add subtask"
              />
              <button className="rounded-lg bg-taskflow-primary px-3 py-2 text-sm font-semibold text-white" type="submit">
                Add
              </button>
            </form>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-taskflow-text">Comments</h3>
            <div className="space-y-3">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-taskflow-bg p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-taskflow-text">{comment.author_name}</p>
                    <time className="text-xs text-taskflow-muted">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm text-taskflow-muted">{comment.content}</p>
                </div>
              ))}
            </div>
            <form className="mt-3 space-y-2" onSubmit={submitComment}>
              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                className="w-full rounded-lg border border-taskflow-border px-3 py-2 text-sm outline-none focus:border-taskflow-primary"
                rows={3}
                placeholder="Add a comment"
              />
              <button className="rounded-lg bg-taskflow-primary px-3 py-2 text-sm font-semibold text-white" type="submit">
                Post
              </button>
            </form>
          </section>

          <button
            type="button"
            onClick={deleteTask}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete Task
          </button>
        </div>
      </aside>
    </div>
  )
}
