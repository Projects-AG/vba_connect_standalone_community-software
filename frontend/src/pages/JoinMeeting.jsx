import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { meetingApi } from '../services/meetingApi'
import { useAuth } from '../auth/AuthContext'
import LoopBrand from '../components/LoopBrand'

export default function JoinMeeting() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [meeting, setMeeting] = useState(null)
  const [insights, setInsights] = useState([])
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
        const [meetingRes, insightsRes] = await Promise.all([
          meetingApi.getMeeting(meetingId),
          meetingApi.getMeetingInsights(meetingId).catch(() => ({ data: { insights: [] } })),
        ])
        if (!cancelled) {
          setMeeting(meetingRes.data)
          setInsights(insightsRes?.data?.insights || [])
        }
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

  const insightMap = insights.reduce((acc, item) => {
    if (item?.recordingId) acc[item.recordingId] = item
    return acc
  }, {})

  const formatTimestamp = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return ''
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

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
    <div className="loop-auth-shell">
      <div className="loop-auth-card">
        <LoopBrand variant="auth" showTagline className="mb-6" />
        <p className="text-center text-on-surface-variant text-body-md -mt-4 mb-6">Join meeting</p>

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

            {!meeting.recordings?.length && (
              <div className="rounded-xl bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
                No recordings or AI recap are available yet for this meeting. The recap will appear here once the recording finishes processing.
              </div>
            )}

            {meeting.recordings?.length > 0 && (
              <div className="rounded-xl bg-surface-container-low p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-headline-md text-headline-md text-on-surface">Recordings</p>
                </div>
                {meeting.recordings.map((recording) => {
                  const detail = insightMap[recording.recordingId]
                  const summary = detail?.intelligence?.summary
                  const keyPoints = detail?.intelligence?.key_points || []
                  const transcript = detail?.transcript || []
                  const actionItems = detail?.actionItems || []
                  const decisions = detail?.decisions || []
                  const questions = detail?.intelligence?.open_questions || []

                  return (
                    <div key={recording.recordingId || recording.egressId || recording.roomName} className="rounded-xl bg-surface-container p-3 border border-outline-variant/20 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-label-md text-label-md text-primary">{recording.status || 'unknown'}</span>
                        {recording.meetnoteStatus && (
                          <span className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                            {recording.meetnoteStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant">{recording.fileName || recording.roomName || 'loop recording'}</p>
                      {recording.recordingId && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await meetingApi.downloadRecording(recording.recordingId)
                            } catch (downloadError) {
                              setError(downloadError.message || 'Unable to download recording')
                            }
                          }}
                          className="inline-flex items-center gap-1 text-primary font-label-md hover:underline"
                        >
                          Download recording
                        </button>
                      )}

                      {detail?.error && (
                        <p className="text-body-sm text-red-600">{detail.error}</p>
                      )}

                      {summary && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">AI summary</p>
                          <p className="text-body-sm text-on-surface-variant">{summary}</p>
                        </div>
                      )}

                      {keyPoints.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">Key points</p>
                          <ul className="list-disc pl-5 text-body-sm text-on-surface-variant space-y-1">
                            {keyPoints.map((point, index) => (
                              <li key={`${recording.recordingId}-kp-${index}`}>
                                {point.timestamp ? `[${formatTimestamp(point.timestamp)}] ` : ''}
                                {point.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {transcript.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">Transcript</p>
                          <div className="space-y-2">
                            {transcript.slice(0, 8).map((segment, index) => (
                              <div key={`${recording.recordingId}-t-${index}`} className="rounded-lg bg-surface-container-low px-2 py-1.5">
                                <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-on-surface-variant">
                                  <span>{segment.speaker || 'Speaker'}</span>
                                  {segment.start_time != null && (
                                    <span>{formatTimestamp(segment.start_time)} - {formatTimestamp(segment.end_time || segment.start_time)}</span>
                                  )}
                                </div>
                                <p className="mt-1 text-body-sm text-on-surface-variant">{segment.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {decisions.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">Decisions</p>
                          <ul className="list-disc pl-5 text-body-sm text-on-surface-variant space-y-1">
                            {decisions.map((decision, index) => (
                              <li key={`${recording.recordingId}-d-${index}`}>
                                {decision.timestamp != null ? `[${formatTimestamp(decision.timestamp)}] ` : ''}
                                {decision.decision || decision.context || 'Decision'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {actionItems.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">Action items</p>
                          <ul className="list-disc pl-5 text-body-sm text-on-surface-variant space-y-1">
                            {actionItems.map((item, index) => (
                              <li key={`${recording.recordingId}-a-${index}`}>
                                {item.task || 'Action item'}
                                {item.assignee ? ` · ${item.assignee}` : ''}
                                {item.status ? ` · ${item.status}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {questions.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-label-md text-label-md text-on-surface">Open questions</p>
                          <ul className="list-disc pl-5 text-body-sm text-on-surface-variant space-y-1">
                            {questions.map((question, index) => (
                              <li key={`${recording.recordingId}-q-${index}`}>
                                {question.question || question.text || 'Open question'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

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
