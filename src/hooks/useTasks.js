import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'

export function useTasks(projectId) {
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBoard = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError('')

    const [projectResult, tasksResult] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase
        .from('tasks')
        .select('*, subtasks(*), task_comments(*)')
        .eq('project_id', projectId)
        .order('position', { ascending: true }),
    ])

    if (projectResult.error || tasksResult.error) {
      const message = projectResult.error?.message || tasksResult.error?.message
      setError(message)
      toast.error(message)
      setLoading(false)
      return
    }

    setProject(projectResult.data)
    setTasks(tasksResult.data ?? [])
    setSubtasks((tasksResult.data ?? []).flatMap((task) => task.subtasks ?? []))
    setComments((tasksResult.data ?? []).flatMap((task) => task.task_comments ?? []))
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const actions = useMemo(
    () => ({
      createTask: async (payload) => {
        const position = tasks.filter((task) => task.status === payload.status).length
        const { data, error: requestError } = await supabase
          .from('tasks')
          .insert({ ...payload, project_id: projectId, position })
          .select()
          .single()

        if (requestError) throw requestError
        setTasks((current) => [...current, data])
        toast.success('Task created')
        return data
      },
      updateTask: async (taskId, updates, options = {}) => {
        setTasks((current) =>
          current.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        )

        const { error: requestError } = await supabase.from('tasks').update(updates).eq('id', taskId)
        if (requestError) {
          await fetchBoard()
          throw requestError
        }

        if (!options.silent) toast.success(options.message || 'Task updated')
      },
      deleteTask: async (taskId) => {
        const { error: requestError } = await supabase.from('tasks').delete().eq('id', taskId)
        if (requestError) throw requestError
        setTasks((current) => current.filter((task) => task.id !== taskId))
        toast.success('Task deleted')
      },
      reorderTasks: async (nextTasks, message = 'Task moved') => {
        setTasks(nextTasks)
        const updates = nextTasks.map((task) =>
          supabase
            .from('tasks')
            .update({ status: task.status, position: task.position })
            .eq('id', task.id),
        )
        const results = await Promise.all(updates)
        const failed = results.find((result) => result.error)
        if (failed) {
          await fetchBoard()
          throw failed.error
        }
        toast.success(message)
      },
      updateProject: async (updates) => {
        const { data, error: requestError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)
          .select()
          .single()

        if (requestError) throw requestError
        setProject(data)
        toast.success('Project updated')
      },
      addSubtask: async (taskId, title) => {
        const position = subtasks.filter((subtask) => subtask.task_id === taskId).length
        const { data, error: requestError } = await supabase
          .from('subtasks')
          .insert({ task_id: taskId, title, position })
          .select()
          .single()

        if (requestError) throw requestError
        setSubtasks((current) => [...current, data])
      },
      updateSubtask: async (subtaskId, updates) => {
        const { error: requestError } = await supabase
          .from('subtasks')
          .update(updates)
          .eq('id', subtaskId)

        if (requestError) throw requestError
        setSubtasks((current) =>
          current.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, ...updates } : subtask,
          ),
        )
      },
      deleteSubtask: async (subtaskId) => {
        const { error: requestError } = await supabase.from('subtasks').delete().eq('id', subtaskId)
        if (requestError) throw requestError
        setSubtasks((current) => current.filter((subtask) => subtask.id !== subtaskId))
      },
      addComment: async (taskId, authorName, content) => {
        const { data, error: requestError } = await supabase
          .from('task_comments')
          .insert({ task_id: taskId, author_name: authorName, content })
          .select()
          .single()

        if (requestError) throw requestError
        setComments((current) => [...current, data])
      },
      refetch: fetchBoard,
    }),
    [fetchBoard, projectId, subtasks, tasks],
  )

  return { comments, error, loading, project, subtasks, tasks, ...actions }
}
