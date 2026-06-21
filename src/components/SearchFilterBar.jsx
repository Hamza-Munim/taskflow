import { Search } from 'lucide-react'

export default function SearchFilterBar({
  priority,
  search,
  overdueOnly,
  onPriorityChange,
  onSearchChange,
  onOverdueChange,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-taskflow-border bg-white p-3 md:flex-row md:items-center">
      <label className="flex flex-1 items-center gap-2 rounded-lg border border-taskflow-border bg-taskflow-bg px-3 py-2 text-sm text-taskflow-muted">
        <Search size={16} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-taskflow-text outline-none"
          placeholder="Search task titles"
        />
      </label>
      <select
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value)}
        className="rounded-lg border border-taskflow-border bg-white px-3 py-2 text-sm text-taskflow-text outline-none"
      >
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <label className="flex items-center gap-2 rounded-lg border border-taskflow-border px-3 py-2 text-sm font-medium text-taskflow-muted">
        <input
          type="checkbox"
          checked={overdueOnly}
          onChange={(event) => onOverdueChange(event.target.checked)}
          className="h-4 w-4 rounded border-taskflow-border text-taskflow-primary"
        />
        Show overdue only
      </label>
    </div>
  )
}
