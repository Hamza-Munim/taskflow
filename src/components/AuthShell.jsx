import { CheckCircle2 } from 'lucide-react'

export default function AuthShell({ children, title, subtitle }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-taskflow-bg px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-taskflow-primary text-white shadow-sm">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="text-3xl font-bold text-taskflow-text">TaskFlow</h1>
          <p className="mt-2 text-sm text-taskflow-muted">{subtitle}</p>
        </div>
        <div className="rounded-lg border border-taskflow-border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-taskflow-text">{title}</h2>
          {children}
        </div>
      </section>
    </main>
  )
}
