import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values) {
    setServerError('')
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: values.fullName,
      })
    }

    if (!data.session) {
      toast.success('Account created. Please check your email, then log in.')
      navigate('/login', { replace: true })
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthShell title="Create your account" subtitle="Start turning projects into clean, movable work.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Full Name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords must match',
          })}
        />
        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-taskflow-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-taskflow-muted">
        Already have an account?{' '}
        <Link className="font-semibold text-taskflow-primary" to="/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
