import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

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
          .from('projects')
          .insert(payload)
          .select()
          .single()

        if (requestError) throw requestError
        toast.success('Project created')
        await fetchProjects()
        return data
      },
      updateProject: async (projectId, updates) => {
        const { error: requestError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)

        if (requestError) throw requestError
        toast.success('Project updated')
        await fetchProjects()
      },
      deleteProject: async (projectId) => {
        const { error: requestError } = await supabase.from('projects').delete().eq('id', projectId)
        if (requestError) throw requestError
        toast.success('Project deleted')
        await fetchProjects()
      },
      refetch: fetchProjects,
    }),
    [fetchProjects],
  )

  return { projects, loading, error, ...actions }
}
