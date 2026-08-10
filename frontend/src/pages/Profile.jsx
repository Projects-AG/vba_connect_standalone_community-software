import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../services/authApi'
import { avatarDataUri, initialsFromName } from '../utils/avatar'

function formatMemberSince(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString([], { month: 'long', year: 'numeric' })
}

function shortId(id = '') {
  if (!id || id.length < 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(user)
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setProfile(user)
  }, [user])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setRefreshing(true)
      try {
        const { user: me } = await authApi.me()
        if (!cancelled && me) {
          setProfile({
            ...me,
            avatar: avatarDataUri(me.name, me.id),
          })
        }
      } catch {
        /* keep AuthContext user */
      } finally {
        if (!cancelled) setRefreshing(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const copyId = useCallback(async () => {
    if (!profile?.id) return
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [profile?.id])

  const display = profile || user
  const memberSince = formatMemberSince(display?.createdAt)
  const initials = initialsFromName(display?.name || '?')

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-between items-center px-8 h-16 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex-shrink-0">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">
              Profile
            </h1>
            {refreshing && (
              <span className="text-body-sm text-on-surface-variant">Updating…</span>
            )}
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="loop-profile-stage relative min-h-full px-6 py-10 md:px-10">
              <div className="loop-profile-glow" aria-hidden />

              <div className="relative z-[1] max-w-xl mx-auto animate-fluid-entrance">
                {/* Identity */}
                <section className="flex flex-col items-center text-center mb-10">
                  <div className="loop-profile-avatar-wrap mb-6">
                    <div className="loop-profile-avatar-ring" aria-hidden />
                    <div className="loop-profile-avatar-ring loop-profile-avatar-ring--delay" aria-hidden />
                    <div className="loop-profile-avatar">
                      {display?.avatar ? (
                        <img
                          src={display.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">{initials}</span>
                      )}
                    </div>
                  </div>

                  <p className="font-label-md text-label-md text-primary tracking-[0.14em] uppercase mb-2">
                    Your account
                  </p>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    {display?.name || 'User'}
                  </h2>
                  <p className="mt-2 text-body-lg text-on-surface-variant">
                    {display?.email || '—'}
                  </p>
                  {memberSince && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-body-sm text-outline">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      Member since {memberSince}
                    </p>
                  )}
                </section>

                {/* Basic info */}
                <section className="loop-profile-panel space-y-1">
                  <h3 className="px-1 pb-3 font-headline-md text-headline-md text-on-surface">
                    Basic info
                  </h3>

                  <div className="loop-profile-row">
                    <span className="loop-profile-row__icon" aria-hidden>
                      <span className="material-symbols-outlined">person</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-md text-outline uppercase tracking-wider">
                        Display name
                      </p>
                      <p className="text-body-lg text-on-surface truncate mt-0.5">
                        {display?.name || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="loop-profile-row">
                    <span className="loop-profile-row__icon" aria-hidden>
                      <span className="material-symbols-outlined">mail</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-md text-outline uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-body-lg text-on-surface truncate mt-0.5">
                        {display?.email || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="loop-profile-row">
                    <span className="loop-profile-row__icon" aria-hidden>
                      <span className="material-symbols-outlined">fingerprint</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-md text-outline uppercase tracking-wider">
                        Account ID
                      </p>
                      <p
                        className="text-body-md text-on-surface mt-0.5 font-mono tracking-tight"
                        title={display?.id}
                      >
                        {shortId(display?.id)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyId}
                      className="flex-shrink-0 h-9 px-3 rounded-full text-body-sm font-label-md text-primary hover:bg-primary/8 transition-colors"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {memberSince && (
                    <div className="loop-profile-row">
                      <span className="loop-profile-row__icon" aria-hidden>
                        <span className="material-symbols-outlined">schedule</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-outline uppercase tracking-wider">
                          Member since
                        </p>
                        <p className="text-body-lg text-on-surface mt-0.5">{memberSince}</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Actions */}
                <section className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/chat"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-on-primary font-headline-md hover:opacity-90 transition-opacity active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Go to Chat
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-headline-md hover:bg-surface-container transition-colors active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out
                  </button>
                </section>

                <p className="mt-8 text-center text-body-sm text-outline">
                  Profile editing coming soon
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
