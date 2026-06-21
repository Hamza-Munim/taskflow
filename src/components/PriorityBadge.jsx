import { PRIORITIES } from '../utils/taskConfig'

export default function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority] || PRIORITIES.medium

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${config.className}`}>
      {config.label}
    </span>
  )
}
