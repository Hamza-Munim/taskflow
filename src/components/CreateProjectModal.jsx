import { useForm } from 'react-hook-form'
import FormField from './FormField'
import Modal from './Modal'
import { PROJECT_COLORS } from '../utils/taskConfig'

export default function CreateProjectModal({ onClose, onSubmit, initialValues, title = 'New Project' }) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      color: initialValues?.color || PROJECT_COLORS[0],
    },
  })
  const selectedColor = watch('color')

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Project Name"
          error={errors.name?.message}
          {...register('name', { required: 'Project name is required' })}
        />
        <FormField label="Description" as="textarea" rows={4} {...register('description')} />
        <div>
          <p className="mb-2 text-sm font-medium text-taskflow-text">Color</p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`h-9 w-9 rounded-full border-2 ${
                  selectedColor === color ? 'border-taskflow-text' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>
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
            {isSubmitting ? 'Saving...' : initialValues ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
