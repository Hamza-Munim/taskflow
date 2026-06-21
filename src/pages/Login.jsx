import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values) {
    setServerError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError('Invalid email or password')
      return
    }

    navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
  }

  return (
    <AuthShell title="Log in" subtitle="Pick up your boards exactly where you left them.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <div className="flex justify-end">
          <button type="button" className="text-xs font-medium text-taskflow-primary">
            Forgot password?
          </button>
        </div>
        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-taskflow-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-taskflow-muted">
        Don't have an account?{' '}
        <Link className="font-semibold text-taskflow-primary" to="/signup">
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}
