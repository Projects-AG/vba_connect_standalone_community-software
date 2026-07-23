import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  authApi,
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setAuthSession,
} from '../services/authApi'
import { avatarDataUri } from '../utils/avatar'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getAccessToken())
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const existing = getAccessToken()
      if (!existing) {
        if (!cancelled) setBooting(false)
        return
      }

      try {
        const { user: me } = await authApi.me()
        if (!cancelled) {
          setUser(me)
          setToken(existing)
          setAuthSession({ accessToken: existing, user: me })
        }
      } catch {
        clearAuthSession()
        if (!cancelled) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password })
    setAuthSession(data)
    setUser(data.user)
    setToken(data.accessToken)
    return data.user
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const data = await authApi.register({ name, email, password })
    setAuthSession(data)
    setUser(data.user)
    setToken(data.accessToken)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(() => {
    const displayUser = user
      ? {
          ...user,
          avatar: avatarDataUri(user.name, user.id),
        }
      : null

    return {
      user: displayUser,
      token,
      isAuthenticated: Boolean(token && user),
      booting,
      login,
      register,
      logout,
    }
  }, [user, token, booting, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
