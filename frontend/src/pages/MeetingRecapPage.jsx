import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { meetingApi } from '../services/meetingApi'

function formatTimestamp(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '00:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatDueDate(value) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatStatus(status) {
  if (typeof status !== 'string' || status.trim() === '') return 'Pending'
  return status
    .trim()
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function getSummaryText(intelligence) {
  if (!intelligence) return ''
  return intelligence.summary || intelligence.overview || ''
}

function getKeyPoints(intelligence) {
  if (!intelligence) return []
  return intelligence.key_points || []
}

export default function MeetingRecapPage() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSegment, setActiveSegment] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackToken, setPlaybackToken] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [exportSections, setExportSections] = useState({
    details: true,
    summary: true,
    action_items: true,
    decisions: true,
    transcript: true,
  })
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [statusOverrides, setStatusOverrides] = useState({})
  const [updatingItem, setUpdatingItem] = useState(null)
  const videoRef = useRef(null)

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
        if (!cancelled) setError(err.message || 'Unable to load meeting recap')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (meetingId) load()
    return () => {
      cancelled = true
    }
  }, [meetingId])

  // Fetch a short-lived playback token for a recording. Token failures are
  // swallowed so they never crash the recap page or hide transcript/summary.
  async function fetchPlaybackToken(recordingId) {
    try {
      const data = await meetingApi.generatePlaybackToken(recordingId)
      setPlaybackToken(data.token)
    } catch {
      setPlaybackToken(null)
    }
  }

  const detail = useMemo(() => {
    if (!meeting || !meeting.recordings?.length) return null
    return insights.find((item) => item.recordingId === meeting.recordings[0]?.recordingId) || null
  }, [insights, meeting])

  const transcript = detail?.transcript || []
  const actionItems = detail?.actionItems || []
  const decisions = detail?.decisions || []
  const summary = getSummaryText(detail?.intelligence)
  const keyPoints = getKeyPoints(detail?.intelligence)
  const activeRecording = meeting?.recordings?.[0] || null

  const stats = useMemo(() => ({
    duration: activeRecording?.durationSeconds || 0,
    transcriptSegments: transcript.length,
    keyPoints: keyPoints.length,
    decisions: decisions.length,
    actionItems: actionItems.length,
  }), [activeRecording, transcript.length, keyPoints.length, decisions.length, actionItems.length])

  // Fetch a short-lived playback token whenever the active recording changes.
  useEffect(() => {
    if (activeRecording?.recordingId) {
      fetchPlaybackToken(activeRecording.recordingId)
    } else {
      setPlaybackToken(null)
    }
  }, [activeRecording?.recordingId])

  useEffect(() => {
    if (!transcript.length) return
    const next = transcript.find((segment) => {
      const start = Number(segment.start_time ?? 0)
      const end = Number(segment.end_time ?? start)
      return currentTime >= start && currentTime <= end
    })
    setActiveSegment(next || transcript[0] || null)
  }, [currentTime, transcript])

  const handleSeek = (seconds) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Number(seconds || 0)
    setCurrentTime(Number(seconds || 0))
  }

  const toggleExportSection = (sectionId) => {
    setExportError('')
    setExportSections((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  const hasSelectedSection = Object.values(exportSections).some(Boolean)

  async function handleExport() {
    setExportError('')
    if (!hasSelectedSection) {
      setExportError('Select at least one section to export.')
      return
    }
    setExporting(true)
    try {
      const params = new URLSearchParams({ format: exportFormat, ...exportSections })
      const res = await meetingApi.exportMeeting(meetingId, exportFormat, exportSections)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Export failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${meeting.meetingTitle || 'meeting'}.${exportFormat}`
      link.rel = 'noopener'
      link.style.display = 'none'
      document.body.appendChild(link)
      try {
        link.click()
      } finally {
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
      setExportOpen(false)
      setExportError('')
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleToggleActionItem(item) {
    const originKey = item.originKey
    if (!originKey) return
    if (updatingItem === originKey) return

    const currentEffective = statusOverrides[originKey] ?? item.status
    const nextStatus = currentEffective === 'completed' ? 'pending' : 'completed'

    // Optimistic update
    setStatusOverrides((prev) => ({ ...prev, [originKey]: nextStatus }))
    setUpdatingItem(originKey)

    try {
      await meetingApi.updateActionItemStatus(meetingId, originKey, nextStatus)
    } catch (err) {
      // Revert on failure
      setStatusOverrides((prev) => {
        const next = { ...prev }
        if (next[originKey] === nextStatus) {
          delete next[originKey]
        }
        return next
      })
      setExportError(
        err instanceof Error ? err.message : 'Failed to update action item.',
      )
    } finally {
      setUpdatingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface min-h-screen">
        <TopHeader searchPlaceholder="Meeting recap" />
        <div className="flex h-screen pt-12">
          <NavRail withTopOffset />
          <main className="ml-20 flex-1 flex items-center justify-center text-on-surface-variant">
            Loading recap…
          </main>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="bg-surface min-h-screen">
        <TopHeader searchPlaceholder="Meeting recap" />
        <div className="flex h-screen pt-12">
          <NavRail withTopOffset />
          <main className="ml-20 flex-1 p-8">
            <div className="max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error || 'Meeting not found'}
            </div>
            <div className="mt-4">
              <Link to="/calls" className="text-primary hover:underline">Back to Calls</Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const recordingUrl = activeRecording?.recordingId
    ? `${import.meta.env.VITE_API_URL || ''}/video/recording/download/${encodeURIComponent(activeRecording.recordingId)}${playbackToken ? `?token=${playbackToken}` : ''}`
    : ''

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader searchPlaceholder="Meeting recap" />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-body-sm uppercase tracking-[0.14em] text-primary">Meeting recap</p>
                <h1 className="mt-1 font-headline-xl text-headline-xl text-on-surface">
                  {meeting.meetingTitle || 'Meeting'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/calls')}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md"
                >
                  Back to Calls
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/calls/active', { state: { ...meeting, meetingId: meeting.meetingId, roomName: meeting.roomName, meetingLink: meeting.meetingLink } })}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md"
                >
                  Rejoin
                </button>
                <button
                  type="button"
                  onClick={() => setExportOpen(true)}
                  disabled={exporting}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md"
                >
                  {exporting ? 'Exporting…' : 'Export'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              {[['Duration', formatTimestamp(stats.duration)],
                ['Transcript', `${stats.transcriptSegments}`],
                ['Key points', `${stats.keyPoints}`],
                ['Decisions', `${stats.decisions}`],
                ['Action items', `${stats.actionItems}`]].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <p className="text-body-sm text-on-surface-variant">{label}</p>
                  <p className="mt-2 text-2xl font-headline-lg text-on-surface">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <p className="text-body-sm text-on-surface-variant">Recording</p>
                  {activeRecording?.recordingId ? (
                    <video
                      ref={videoRef}
                      controls
                      className="mt-4 aspect-video w-full rounded-xl bg-black"
                      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                      preload="metadata"
                    >
                      <source src={recordingUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container p-6 text-body-sm text-on-surface-variant">
                      No recording is available yet for this meeting.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Summary</h3>
                    {detail?.intelligence?.status && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
                        {detail.intelligence.status}
                      </span>
                    )}
                  </div>
                  {summary ? (
                    <p className="text-body-md text-on-surface-variant leading-7">{summary}</p>
                  ) : (
                    <p className="text-body-sm text-on-surface-variant">No summary is available yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Transcript</h3>
                    <span className="text-body-sm text-on-surface-variant">{transcript.length} segments</span>
                  </div>
                  <div className="mt-4 space-y-2 max-h-[620px] overflow-y-auto pr-1">
                    {!transcript.length && (
                      <p className="text-body-sm text-on-surface-variant">Transcript is still processing or not available.</p>
                    )}
                    {transcript.map((segment, index) => {
                      const isActive = activeSegment && activeSegment === segment
                      return (
                        <button
                          key={`${segment.speaker || 'speaker'}-${segment.start_time ?? index}`}
                          type="button"
                          onClick={() => handleSeek(segment.start_time ?? 0)}
                          className={`w-full rounded-xl border p-3 text-left transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container'}`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                            <span>{segment.speaker || 'Speaker'}</span>
                            <span>{formatTimestamp(segment.start_time ?? 0)}</span>
                          </div>
                          <p className="mt-2 text-body-sm text-on-surface-variant">{segment.text}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">Key points</h3>
                {!keyPoints.length && <p className="mt-3 text-body-sm text-on-surface-variant">No key points available.</p>}
                <ul className="mt-3 list-disc pl-5 space-y-2 text-body-sm text-on-surface-variant">
                  {keyPoints.map((point, index) => (
                    <li key={`${point.text || 'kp'}-${index}`}>
                      {point.timestamp != null ? `[${formatTimestamp(point.timestamp)}] ` : ''}
                      {point.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">Decisions</h3>
                {!decisions.length && <p className="mt-3 text-body-sm text-on-surface-variant">No decisions recorded.</p>}
                <ul className="mt-3 list-disc pl-5 space-y-2 text-body-sm text-on-surface-variant">
                  {decisions.map((decision, index) => (
                    <li key={`${decision.decision || 'decision'}-${index}`}>
                      {decision.timestamp != null ? `[${formatTimestamp(decision.timestamp)}] ` : ''}
                      {decision.decision || decision.context || 'Decision'}
                    </li>
                  ))}
                </ul>
              </div>

              {/* MeetNote-style Action Items: card per item with checkbox, status badge, assignee, due date */}
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">Action items</h3>
                {!actionItems.length && (
                  <p className="mt-3 text-body-sm text-on-surface-variant">No action items recorded.</p>
                )}
                <ul className="mt-3 space-y-3">
                  {actionItems.map((item, index) => {
                    const effectiveStatus =
                      statusOverrides[item.originKey] ??
                      (item.status ?? 'pending')
                    const completed = formatStatus(effectiveStatus) === 'Completed'
                    const due = formatDueDate(item.dueDate)
                    return (
                      <li
                        key={item.originKey || `${item.task}-${index}`}
                        className="flex gap-3 rounded-xl border border-outline-variant/30 p-3 transition-colors hover:border-outline-variant/50"
                      >
                        <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
                          <input
                            type="checkbox"
                            checked={completed}
                            disabled={updatingItem === item.originKey}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/50"
                            aria-label={item.task || 'Action item'}
                            onChange={() => handleToggleActionItem(item)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`text-sm font-medium ${completed ? 'text-on-surface-variant/60 line-through' : 'text-on-surface'}`}>
                                {item.task || 'Action item'}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}
                              >
                                {formatStatus(effectiveStatus)}
                              </span>
                            </span>
                            {item.assignee || due ? (
                              <span className="mt-1 block text-[11px] text-on-surface-variant">
                                {item.assignee ? `Assigned to: ${item.assignee}` : ''}
                                {item.assignee && due ? ' · ' : ''}
                                {due ? `Due: ${due}` : ''}
                              </span>
                            ) : null}
                            {item.timestamp != null ? (
                              <span className="mt-1 block text-[11px] text-on-surface-variant cursor-pointer hover:text-primary" onClick={() => handleSeek(item.timestamp)}>
                                [{formatTimestamp(item.timestamp)}]
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Export dialog */}
          {exportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <button
                type="button"
                className="absolute inset-0 bg-surface/60 backdrop-blur-sm"
                aria-label="Close"
                onClick={() => setExportOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-meeting-heading"
                aria-describedby="export-meeting-description"
                className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant/50 bg-surface-container p-6 shadow-lg"
              >
                <h2 id="export-meeting-heading" className="text-base font-semibold text-on-surface">
                  Export meeting
                </h2>
                <p id="export-meeting-description" className="mt-1 text-sm text-on-surface-variant">
                  Download the saved notes for “{meeting.meetingTitle || 'Meeting'}”.
                </p>
                {exportError && (
                  <p role="alert" className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {exportError}
                  </p>
                )}
                <form className="mt-4 space-y-5" onSubmit={(e) => { e.preventDefault(); handleExport() }}>
                  <fieldset disabled={exporting}>
                    <legend className="text-sm font-medium text-on-surface-variant">Format</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {[
                        { id: 'pdf', label: 'PDF', description: 'Formatted report for sharing or printing' },
                        { id: 'docx', label: 'Word (DOCX)', description: 'Editable document' },
                        { id: 'txt', label: 'Plain text (TXT)', description: 'Simple text file' },
                        { id: 'json', label: 'JSON', description: 'Structured data with IDs and timestamps' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${exportFormat === item.id ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container/50'}`}
                        >
                          <input
                            type="radio"
                            name="export-format"
                            value={item.id}
                            checked={exportFormat === item.id}
                            onChange={() => setExportFormat(item.id)}
                            className="mt-0.5 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/50"
                          />
                          <span>
                            <span className="block font-medium text-on-surface">{item.label}</span>
                            <span className="block text-xs leading-5 text-on-surface-variant/70">{item.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset disabled={exporting}>
                    <legend className="text-sm font-medium text-on-surface-variant">Include</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {[
                        { id: 'details', label: 'Meeting details' },
                        { id: 'summary', label: 'Summary and key points' },
                        { id: 'transcript', label: 'Full transcript' },
                        { id: 'action_items', label: 'Action items' },
                        { id: 'decisions', label: 'Decisions' },
                      ].map((section) => (
                        <label key={section.id} className="flex cursor-pointer items-center gap-3 text-sm text-on-surface">
                          <input
                            type="checkbox"
                            checked={Boolean(exportSections[section.id])}
                            onChange={() => toggleExportSection(section.id)}
                            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/50"
                          />
                          {section.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {exporting ? (
                    <p role="status" className="text-sm text-on-surface-variant">
                      Preparing your {exportFormat.toUpperCase()} file. Long transcripts can take a few seconds.
                    </p>
                  ) : null}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setExportOpen(false)}
                      disabled={exporting}
                      className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={exporting || !hasSelectedSection}
                      className={`px-4 py-2 rounded-xl font-label-md disabled:opacity-50 disabled:cursor-not-allowed ${exporting || !hasSelectedSection ? 'border border-outline-variant text-on-surface-variant/40' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
                    >
                      {exporting ? 'Exporting…' : 'Export'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
