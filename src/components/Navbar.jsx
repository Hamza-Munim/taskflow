import { Menu, Search } from 'lucide-react'

export default function Navbar({ breadcrumb, onMenuClick, search, onSearchChange, children }) {
  return (
    <header className="sticky top-0 z-20 border-b border-taskflow-border bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-taskflow-border text-taskflow-muted lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-taskflow-muted">{breadcrumb}</p>
        </div>
        {onSearchChange ? (
          <label className="hidden w-64 items-center gap-2 rounded-lg border border-taskflow-border bg-taskflow-bg px-3 py-2 text-sm text-taskflow-muted md:flex">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-transparent text-taskflow-text outline-none"
              placeholder="Search tasks"
            />
          </label>
        ) : null}
        {children}
      </div>
    </header>
  )
}
