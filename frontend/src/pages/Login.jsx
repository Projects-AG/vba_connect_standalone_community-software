import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login, isAuthenticated, booting } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!booting && isAuthenticated) {
    return <Navigate to={location.state?.from || '/teams'} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(location.state?.from || '/teams', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 card-shadow">
        <div className="mb-8 text-center">
          <div className="text-primary font-headline-xl text-headline-xl font-bold mb-2">Project Loop</div>
          <p className="text-on-surface-variant text-body-md">Sign in to join teams and calls</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low border-none px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low border-none px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-xl py-3 font-headline-md hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-body-sm text-on-surface-variant">
          No account?{' '}
          <Link to="/register" state={location.state} className="text-primary font-label-md hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
