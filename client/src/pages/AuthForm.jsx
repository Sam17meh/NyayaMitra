import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import usePageTitle from '../hooks/usePageTitle.js'

export default function AuthForm({ mode }) {
  usePageTitle(mode === 'signup' ? 'NyayaMitra - Sign Up' : 'NyayaMitra - Login')
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await (isSignup ? signUp(email, password) : signIn(email, password))
      navigate(location.state?.from?.pathname || '/chat')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isSignup ? 'Create an account' : 'Sign in to NyayaMitra'}
        </h1>
        <label className="block text-sm text-slate-700">
          Email
          <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block text-sm text-slate-700">
          Password
          <input className="mt-1 w-full rounded border p-2" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white" type="submit">
          {isSignup ? 'Sign up' : 'Sign in'}
        </button>
        <p className="text-sm text-slate-600">
          {isSignup ? 'Already registered?' : 'New to NyayaMitra?'}{' '}
          <Link className="text-indigo-600 underline" to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </main>
  )
}