export default function FormField({
  error,
  label,
  as = 'input',
  className = '',
  ...props
}) {
  const Component = as

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-taskflow-text">{label}</span>
      <Component
        className={`w-full rounded-lg border border-taskflow-border bg-white px-3 py-2.5 text-sm text-taskflow-text outline-none transition focus:border-taskflow-primary focus:ring-4 focus:ring-indigo-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  )
}
