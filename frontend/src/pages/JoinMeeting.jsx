import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { meetingApi } from '../services/meetingApi'
import { useAuth } from '../auth/AuthContext'

export default function JoinMeeting() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [meeting, setMeeting] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await meetingApi.getMeeting(meetingId)
        if (!cancelled) setMeeting(res.data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Meeting not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (meetingId) load()
    return () => {
      cancelled = true
    }
  }, [meetingId])

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${meetingId}`
      : `/join/${meetingId}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy link')
    }
  }

  const joinCall = async () => {
    if (!meeting || joining) return
    setJoining(true)
    try {
      navigate('/calls/active', {
        state: {
          ...meeting,
          meetingId: meeting.meetingId,
          roomName: meeting.roomName,
          meetingLink: meeting.meetingLink,
        },
      })
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 card-shadow">
        <div className="mb-6 text-center">
          <div className="text-primary font-headline-xl text-headline-xl font-bold mb-2">Project Loop</div>
          <p className="text-on-surface-variant text-body-md">Join meeting</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span>Loading meeting…</span>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-4">
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            <Link to="/calls" className="block text-center text-primary font-label-md hover:underline">
              Back to Calls
            </Link>
          </div>
        )}

        {!loading && meeting && (
          <div className="space-y-5">
            <div className="rounded-xl bg-surface-container-low p-4 space-y-1">
              <p className="font-headline-md text-headline-md text-on-surface">{meeting.meetingTitle}</p>
              <p className="text-body-sm text-on-surface-variant">
                Hosted by {meeting.host || 'Unknown'}
                {meeting.status ? ` · ${meeting.status}` : ''}
              </p>
              {user?.name && (
                <p className="text-body-sm text-outline">Joining as {user.name}</p>
              )}
            </div>

            <button
              type="button"
              onClick={joinCall}
              disabled={joining}
              className="w-full bg-primary text-on-primary rounded-xl py-3 font-headline-md hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {joining ? 'Joining…' : 'Join call'}
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 border border-outline-variant rounded-xl py-3 font-label-md text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              {copied ? 'Link copied' : 'Copy invite link'}
            </button>

            <p className="text-center text-body-sm text-outline break-all">{shareUrl}</p>
          </div>
        )}
      </div>
    </div>
  )
}
