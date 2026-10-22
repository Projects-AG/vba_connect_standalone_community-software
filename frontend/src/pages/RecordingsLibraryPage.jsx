import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { meetingApi } from '../services/meetingApi'

function formatDuration(value) {
  const seconds = Number(value || 0)

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'Unavailable'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`

  return `${Math.floor(seconds)}s`
}

function formatDateTime(meeting) {
  const date = meeting?.meetingDate || ''
  const time = meeting?.meetingTime || ''

  return [date, time].filter(Boolean).join(' ') || 'No date'
}

function getRecordingStatus(recording) {
  return String(
    recording?.processingStatus || recording?.status || 'pending',
  ).toLowerCase()
}

function hasRecording(meeting) {
  return Array.isArray(meeting?.recordings) && meeting.recordings.length > 0
}

function isProcessed(recording) {
  return getRecordingStatus(recording) === 'completed'
}

function isProcessing(recording) {
  const status = getRecordingStatus(recording)

  return [
    'pending',
    'starting',
    'processing',
    'uploading',
    'in_progress',
  ].includes(status)
}

function isFailed(recording) {
  return getRecordingStatus(recording) === 'failed'
}

export default function RecordingsLibraryPage() {
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const response = await meetingApi.listMeetings()

        if (!active) return

        const allMeetings = Array.isArray(response?.data)
          ? response.data
          : []

        const recordedMeetings = allMeetings
          .filter((meeting) => meeting?.meetingId && hasRecording(meeting))
          .sort((a, b) => {
            const aDate = new Date(
              a.meetingDate || a.createdAt || 0,
            ).getTime()

            const bDate = new Date(
              b.meetingDate || b.createdAt || 0,
            ).getTime()

            return bDate - aDate
          })

        setMeetings(recordedMeetings)
      } catch (err) {
        if (!active) return

        setError(err.message || 'Unable to load recordings')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const recordings = meetings.flatMap((meeting) =>
      Array.isArray(meeting.recordings) ? meeting.recordings : [],
    )

    const totalDurationSeconds = recordings.reduce(
      (total, recording) => {
        const duration = Number(recording.durationSeconds || 0)

        return total + (
          Number.isFinite(duration) && duration > 0 ? duration : 0
        )
      },
      0,
    )

    return {
      totalMeetings: meetings.length,
      totalRecordings: recordings.length,
      recordingHours: (totalDurationSeconds / 3600).toFixed(1),
      processing: recordings.filter(isProcessing).length,
      processed: recordings.filter(isProcessed).length,
      failed: recordings.filter(isFailed).length,
    }
  }, [meetings])

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader searchPlaceholder="Search recordings" />

      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />

        <main className="ml-20 flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-8 h-16 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
            <div>
              <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">
                Recordings &amp; Recaps
              </h1>

              <p className="mt-1 text-body-sm text-on-surface-variant">
                Your meeting recordings and AI-generated recaps
              </p>
            </div>

            <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-primary">
              {stats.totalMeetings} meetings
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
              {error && (
                <div
                  role="alert"
                  className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
                >
                  {error}
                </div>
              )}

              <section
                aria-label="Recording statistics"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                  <p className="text-body-sm text-on-surface-variant">
                    Recorded meetings
                  </p>

                  <p className="mt-2 text-3xl font-headline-lg text-on-surface">
                    {stats.totalMeetings}
                  </p>
                </div>

                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                  <p className="text-body-sm text-on-surface-variant">
                    Total recordings
                  </p>

                  <p className="mt-2 text-3xl font-headline-lg text-on-surface">
                    {stats.totalRecordings}
                  </p>
                </div>

                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                  <p className="text-body-sm text-on-surface-variant">
                    Recording hours
                  </p>

                  <p className="mt-2 text-3xl font-headline-lg text-on-surface">
                    {stats.recordingHours}
                  </p>
                </div>

                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                  <p className="text-body-sm text-on-surface-variant">
                    Processing
                  </p>

                  <p className="mt-2 text-3xl font-headline-lg text-on-surface">
                    {stats.processing}
                  </p>

                  {stats.failed > 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      {stats.failed} failed
                    </p>
                  )}
                </div>
              </section>

              <section aria-label="Meeting recordings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    All recordings
                  </h2>

                  <span className="text-body-sm text-on-surface-variant">
                    {stats.processed} processed
                  </span>
                </div>

                {loading && (
                  <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 text-body-sm text-on-surface-variant">
                    Loading meeting recordings…
                  </div>
                )}

                {!loading && !error && meetings.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6">
                    <h3 className="font-headline-md text-on-surface">
                      No recordings yet
                    </h3>

                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      Complete a meeting with recording enabled to see its
                      recording and recap here.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/calls')}
                      className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md"
                    >
                      Go to Calls
                    </button>
                  </div>
                )}

                {!loading && meetings.length > 0 && (
                  <div className="space-y-3">
                    {meetings.map((meeting) => {
                      const recordings = Array.isArray(meeting.recordings)
                        ? meeting.recordings
                        : []

                      const primary = recordings[0]
                      const status = primary
                        ? getRecordingStatus(primary)
                        : 'pending'

                      const meetingDuration = recordings.reduce(
                        (total, recording) => {
                          const duration = Number(
                            recording.durationSeconds || 0,
                          )

                          return total + (
                            Number.isFinite(duration) && duration > 0
                              ? duration
                              : 0
                          )
                        },
                        0,
                      )

                      const transcriptReady = recordings.some(isProcessed)
                      const failed = recordings.some(isFailed)

                      return (
                        <article
                          key={meeting.meetingId}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5"
                        >
                          <div className="min-w-0 space-y-1">
                            <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                              {meeting.meetingTitle || 'Untitled meeting'}
                            </h3>

                            <p className="text-body-sm text-on-surface-variant">
                              {formatDateTime(meeting)}
                            </p>

                            <p className="text-body-sm text-on-surface-variant">
                              {recordings.length}{' '}
                              {recordings.length === 1
                                ? 'recording'
                                : 'recordings'}
                              {' · '}
                              {formatDuration(meetingDuration)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-on-secondary-container">
                              {meeting.status || 'Unknown'}
                            </span>

                            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
                              {status}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                                failed
                                  ? 'border-red-300 text-red-600'
                                  : transcriptReady
                                    ? 'border-green-300 text-green-700'
                                    : 'border-outline-variant text-on-surface-variant'
                              }`}
                            >
                              {failed
                                ? 'Processing failed'
                                : transcriptReady
                                  ? 'AI processing complete'
                                  : 'Processing pending'}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/recordings/${meeting.meetingId}`)
                              }
                              className="px-3 py-2 rounded-lg border border-outline-variant text-primary hover:bg-primary/5 font-label-md"
                            >
                              View recap
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}