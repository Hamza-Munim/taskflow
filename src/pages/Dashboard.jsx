import { FolderKanban, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import CreateProjectModal from '../components/CreateProjectModal'
import ProjectCard from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'

export default function Dashboard() {
  const navigate = useNavigate()
  const { createProject, deleteProject, loading, projects, updateProject } = useProjects()
  const [modalMode, setModalMode] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  async function handleCreate(values) {
    try {
      const project = await createProject(values)
      setModalMode(null)
      navigate(`/project/${project.id}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function handleRename(values) {
    try {
      await updateProject(selectedProject.id, values)
      setSelectedProject(null)
      setModalMode(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function handleDelete(project) {
    if (!window.confirm('Are you sure? This cannot be undone.')) return
    try {
      await deleteProject(project.id)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <AppLayout
      breadcrumb="Dashboard"
      onCreateProject={() => setModalMode('create')}
      toolbar={
        <button
          type="button"
          onClick={() => setModalMode('create')}
          className="hidden items-center gap-2 rounded-lg bg-taskflow-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:inline-flex"
        >
          <Plus size={16} />
          New Project
        </button>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-taskflow-text">Your Projects</h1>
          <p className="mt-1 text-sm text-taskflow-muted">Plan, track, and finish work board by board.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalMode('create')}
          className="inline-flex items-center gap-2 rounded-lg bg-taskflow-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:hidden"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-lg border border-taskflow-border bg-white" />
          ))}
        </div>
      ) : projects.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRename={(nextProject) => {
                setSelectedProject(nextProject)
                setModalMode('rename')
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[55vh] items-center justify-center rounded-lg border border-dashed border-taskflow-border bg-white">
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-taskflow-primary">
              <FolderKanban size={26} />
            </div>
            <h2 className="text-lg font-semibold text-taskflow-text">No projects yet</h2>
            <p className="mt-2 text-sm text-taskflow-muted">Create your first project and start shaping a board.</p>
            <button
              type="button"
              onClick={() => setModalMode('create')}
              className="mt-5 rounded-lg bg-taskflow-primary px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create your first project
            </button>
          </div>
        </div>
      )}

      {modalMode === 'create' ? (
        <CreateProjectModal onClose={() => setModalMode(null)} onSubmit={handleCreate} />
      ) : null}
      {modalMode === 'rename' ? (
        <CreateProjectModal
          title="Edit Project"
          initialValues={selectedProject}
          onClose={() => setModalMode(null)}
          onSubmit={handleRename}
        />
      ) : null}
    </AppLayout>
  )
}
