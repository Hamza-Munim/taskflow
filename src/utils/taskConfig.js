export const STATUSES = [
  { id: 'todo', label: 'To Do', headerClass: 'bg-gray-100' },
  { id: 'in_progress', label: 'In Progress', headerClass: 'bg-blue-100' },
  { id: 'review', label: 'Review', headerClass: 'bg-amber-100' },
  { id: 'done', label: 'Done', headerClass: 'bg-emerald-100' },
]

export const PRIORITIES = {
  low: { label: 'Low', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  high: { label: 'High', className: 'bg-red-50 text-red-700 ring-red-200' },
}

export const PROJECT_COLORS = [
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#0EA5E9',
  '#EC4899',
  '#14B8A6',
]

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TF'
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${dueDate}T00:00:00`) < today
}
