import { useForm } from 'react-hook-form'
import FormField from './FormField'
import Modal from './Modal'

export default function CreateTaskModal({ onClose, onSubmit, status }) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      assignee_name: '',
      status,
    },
  })

  return (
    <Modal title="Create Task" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Title"
          error={errors.title?.message}
          {...register('title', { required: 'Task title is required' })}
        />
        <FormField label="Description" as="textarea" rows={4} {...register('description')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Priority" as="select" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </FormField>
          <FormField label="Due Date" type="date" {...register('due_date')} />
        </div>
        <FormField label="Assignee Name" {...register('assignee_name')} />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-taskflow-border px-4 py-2 text-sm font-medium text-taskflow-muted hover:bg-taskflow-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-taskflow-primary px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
