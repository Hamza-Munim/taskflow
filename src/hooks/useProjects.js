import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

const PROJECTS_CHANGED_EVENT = 'taskflow:projects-changed'

function notifyProjectsChanged() {
  window.dispatchEvent(new Event(PROJECTS_CHANGED_EVENT))
}

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    const { data, error: requestError } = await supabase
      .from('projects')
      .select('*, tasks(id, status)')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })

    if (requestError) {
      setError(requestError.message)
      toast.error(requestError.message)
    } else {
      setProjects(data ?? [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    window.addEventListener(PROJECTS_CHANGED_EVENT, fetchProjects)
    return () => window.removeEventListener(PROJECTS_CHANGED_EVENT, fetchProjects)
  }, [fetchProjects])

  const actions = useMemo(
    () => ({
      createProject: async (payload) => {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !currentUser) {
          throw new Error('Please log in again before creating a project.')
        }

        const { data, error: requestError } = await supabase
          .rpc('create_project', {
            project_name: payload.name,
            project_description: payload.description || null,
            project_color: payload.color || '#6366F1',
          })

        if (requestError) throw requestError
        const createdProject = Array.isArray(data) ? data[0] : data
        if (!createdProject?.id) {
          throw new Error('Project was created, but Supabase did not return its id.')
        }

        toast.success('Project created')
        await fetchProjects()
        notifyProjectsChanged()
        return createdProject
      },
      updateProject: async (projectId, updates) => {
        const { error: requestError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)

        if (requestError) throw requestError
        toast.success('Project updated')
        await fetchProjects()
        notifyProjectsChanged()
      },
      deleteProject: async (projectId) => {
        const { error: requestError } = await supabase.from('projects').delete().eq('id', projectId)
        if (requestError) throw requestError
        toast.success('Project deleted')
        await fetchProjects()
        notifyProjectsChanged()
      },
      refetch: fetchProjects,
    }),
    [fetchProjects],
  )

  return { projects, loading, error, ...actions }
}
