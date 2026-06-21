import { X } from 'lucide-react'

export default function Modal({ children, onClose, title, width = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 px-4 py-6">
      <section className={`max-h-full w-full overflow-y-auto rounded-lg bg-white shadow-xl ${width}`}>
        <div className="flex items-center justify-between border-b border-taskflow-border px-5 py-4">
          <h2 className="text-lg font-semibold text-taskflow-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-taskflow-muted hover:bg-taskflow-bg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  )
}
