import { useEffect, useState } from 'react'
import { meetingApi } from '../services/meetingApi'
import { useAuth } from '../auth/AuthContext'

function inviteUrl(meeting) {
  const path = meeting.meetingLink || `/join/${meeting.meetingId}`
  return `${window.location.origin}${path}`
}

async function copyText(text) {
  await navigator.clipboard.writeText(text)
}

/**
 * Teams-style Meet now dialog.
 * props:
 *  - open, onClose
 *  - onStartMeeting(meeting) — after create + copy, host joins
 *  - onShareLink(meeting) — after create + copy, stay on page
 */
export default function MeetNowModal({ open, onClose, onStartMeeting, onShareLink }) {
  const { user } = useAuth()
  const defaultName = user?.name ? `Meeting with ${user.name}` : 'Meeting'
  const [name, setName] = useState(defaultName)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(user?.name ? `Meeting with ${user.name}` : 'Meeting')
    setSubmitting(false)
    setError('')
  }, [open, user?.name])

  if (!open) return null

  const createMeeting = async () => {
    const hostName = user?.name || 'Host'
    const title = name.trim() || defaultName
    const response = await meetingApi.createMeeting({
      roomName: crypto.randomUUID(),
      meetingTitle: title,
      meetingType: 'instant',
      callType: '1:1',
      meetingDate: '',
      meetingTime: '',
      host: hostName,
      participants: [hostName],
    })
    if (!response.success) {
      throw new Error(response.message || 'Unable to create meeting')
    }
    return response.data
  }

  const handleStart = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const meeting = await createMeeting()
      try {
        await copyText(inviteUrl(meeting))
      } catch {
        /* ignore clipboard errors */
      }
      onStartMeeting?.(meeting)
      onClose?.()
    } catch (err) {
      setError(err.message || 'Unable to start meeting')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGetLink = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const meeting = await createMeeting()
      const url = inviteUrl(meeting)
      try {
        await copyText(url)
      } catch {
        /* still notify parent with meeting */
      }
      onShareLink?.(meeting, url)
      onClose?.()
    } catch (err) {
      setError(err.message || 'Unable to create meeting link')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/40 backdrop-blur-sm animate-content-entrance">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl modal-shadow overflow-hidden border border-outline-variant/20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Start a meeting now</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/40 hover:bg-surface-variant transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
              Meeting name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant/40 px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder={defaultName}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/40">
          <button
            type="button"
            onClick={handleStart}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline-md shadow-lg shadow-primary/20 hover:bg-primary-container disabled:opacity-60 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            {submitting ? 'Working…' : 'Start meeting'}
          </button>
          <button
            type="button"
            onClick={handleGetLink}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant font-headline-md text-on-surface hover:bg-surface-container-low disabled:opacity-60 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            Get a link to share
          </button>
        </div>
      </div>
    </div>
  )
}
