import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import CreateProjectModal from '../components/CreateProjectModal'
import CreateTaskModal from '../components/CreateTaskModal'
import KanbanColumn from '../components/KanbanColumn'
import SearchFilterBar from '../components/SearchFilterBar'
import TaskDetailModal from '../components/TaskDetailModal'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { STATUSES, isOverdue } from '../utils/taskConfig'

export default function ProjectBoard() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { createProject } = useProjects()
  const {
    addComment,
    addSubtask,
    createTask,
    comments,
    deleteSubtask,
    deleteTask,
    loading,
    project,
    reorderTasks,
    subtasks,
    tasks,
    updateSubtask,
    updateTask,
    updateProject,
  } = useTasks(projectId)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [taskModalStatus, setTaskModalStatus] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [creatingProject, setCreatingProject] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priority === 'all' || task.priority === priority
      const matchesOverdue = !overdueOnly || isOverdue(task.due_date, task.status)
      return matchesSearch && matchesPriority && matchesOverdue
    })
  }, [overdueOnly, priority, search, tasks])

  const groupedTasks = useMemo(() => {
    return STATUSES.reduce((groups, status) => {
      groups[status.id] = filteredTasks
        .filter((task) => task.status === status.id)
        .sort((a, b) => a.position - b.position)
      return groups
    }, {})
  }, [filteredTasks])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  async function handleCreateTask(values) {
    try {
      await createTask({
        ...values,
        description: values.description || null,
        due_date: values.due_date || null,
        assignee_name: values.assignee_name || null,
        status: taskModalStatus,
      })
      setTaskModalStatus(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function handleProjectRename(values) {
    try {
      await updateProject(values)
      setEditingProject(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function handleCreateProject(values) {
    try {
      const nextProject = await createProject(values)
      setCreatingProject(false)
      navigate(`/project/${nextProject.id}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTask = tasks.find((task) => task.id === active.id)
    if (!activeTask) return

    const overTask = tasks.find((task) => task.id === over.id)
    const targetStatus = overTask?.status || STATUSES.find((status) => status.id === over.id)?.id
    if (!targetStatus) return

    const columns = STATUSES.reduce((groups, status) => {
      groups[status.id] = tasks
        .filter((task) => task.id !== activeTask.id && task.status === status.id)
        .sort((a, b) => a.position - b.position)
      return groups
    }, {})

    const insertIndex = overTask
      ? columns[targetStatus].findIndex((task) => task.id === overTask.id)
      : columns[targetStatus].length

    columns[targetStatus].splice(Math.max(insertIndex, 0), 0, {
      ...activeTask,
      status: targetStatus,
    })

    const nextTasks = STATUSES.flatMap((status) =>
      columns[status.id].map((task, index) => ({ ...task, position: index })),
    )

    try {
      await reorderTasks(nextTasks, activeTask.status === targetStatus ? 'Task reordered' : 'Task moved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <AppLayout
      breadcrumb={`Dashboard > ${project?.name || 'Project'}`}
      onCreateProject={() => setCreatingProject(true)}
      search={search}
      onSearchChange={setSearch}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => setEditingProject(true)}
            className="text-left text-2xl font-bold text-taskflow-text hover:text-taskflow-primary"
          >
            {project?.name || 'Loading project...'}
          </button>
          <p className="mt-1 text-sm text-taskflow-muted">
            {project?.description || 'Build and move work across your team flow.'}
          </p>
        </div>
      </div>

      <SearchFilterBar
        priority={priority}
        search={search}
        overdueOnly={overdueOnly}
        onPriorityChange={setPriority}
        onSearchChange={setSearch}
        onOverdueChange={setOverdueOnly}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {STATUSES.map((status) => (
            <div key={status.id} className="h-[60vh] animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex snap-x gap-4 overflow-x-auto pb-4">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={groupedTasks[status.id] || []}
                onAddTask={setTaskModalStatus}
                onTaskClick={(task) => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </DndContext>
      )}

      {taskModalStatus ? (
        <CreateTaskModal
          status={taskModalStatus}
          onClose={() => setTaskModalStatus(null)}
          onSubmit={handleCreateTask}
        />
      ) : null}
      {editingProject && project ? (
        <CreateProjectModal
          title="Edit Project"
          initialValues={project}
          onClose={() => setEditingProject(false)}
          onSubmit={handleProjectRename}
        />
      ) : null}
      {creatingProject ? (
        <CreateProjectModal
          onClose={() => setCreatingProject(false)}
          onSubmit={handleCreateProject}
        />
      ) : null}
      {selectedTask ? (
        <TaskDetailModal
          comments={comments}
          onAddComment={addComment}
          onAddSubtask={addSubtask}
          onClose={() => setSelectedTaskId(null)}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onUpdateSubtask={updateSubtask}
          onUpdateTask={updateTask}
          profile={profile}
          subtasks={subtasks}
          task={selectedTask}
        />
      ) : null}
    </AppLayout>
  )
}
