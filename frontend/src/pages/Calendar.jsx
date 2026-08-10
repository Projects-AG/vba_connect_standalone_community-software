import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'temporal-polyfill/global'
import FullCalendar from '@fullcalendar/react'
import themePlugin from '@fullcalendar/react/themes/monarch'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/blue.css'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import NewMeetingModal from '../components/NewMeetingModal'
import MeetNowModal from '../components/MeetNowModal'
import { meetingApi } from '../services/meetingApi'
import './calendar.css'

function toEventStart(meeting) {
  const date = (meeting.meetingDate || '').trim()
  if (!date) {
    if (meeting.status === 'Live' || meeting.meetingType === 'instant') {
      const d = meeting.createdAt ? new Date(meeting.createdAt) : new Date()
      return d.toISOString()
    }
    return null
  }
  const time = (meeting.meetingTime || '12:00').trim()
  const normalized = time.length === 5 ? `${time}:00` : time
  const iso = `${date}T${normalized}`
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return `${date}T12:00:00`
  return iso
}

function meetingsToEvents(meetings) {
  return (meetings || [])
    .map((m) => {
      const start = toEventStart(m)
      if (!start) return null
      return {
        id: m.meetingId,
        title: m.meetingTitle || 'Meeting',
        start,
        extendedProps: { meeting: m },
      }
    })
    .filter(Boolean)
}

export default function Calendar() {
  const navigate = useNavigate()
  const calendarRef = useRef(null)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [title, setTitle] = useState('')
  const [toast, setToast] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [meetNowOpen, setMeetNowOpen] = useState(false)
  const [modalMode, setModalMode] = useState('schedule')
  const [modalDate, setModalDate] = useState('')

  const events = useMemo(() => meetingsToEvents(meetings), [meetings])

  const loadMeetings = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await meetingApi.listMeetings()
      setMeetings(res.data || [])
    } catch (err) {
      setLoadError(err.message || 'Unable to load meetings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  const showToast = (message, ms = 5000) => {
    setToast(message)
    setTimeout(() => setToast(null), ms)
  }

  const copyInvite = (meeting) => {
    const path = meeting.meetingLink || `/join/${meeting.meetingId}`
    const shareUrl = `${window.location.origin}${path}`
    try {
      navigator.clipboard.writeText(shareUrl)
      showToast(`Invite link copied — ${shareUrl}`)
    } catch {
      showToast(shareUrl)
    }
  }

  const goToActiveCall = (meeting) => {
    copyInvite(meeting)
    navigate('/calls/active', {
      state: {
        ...meeting,
        meetingId: meeting.meetingId,
        roomName: meeting.roomName,
        meetingLink: meeting.meetingLink,
      },
    })
  }

  const openMeetNow = () => {
    setMeetNowOpen(true)
  }

  const openNew = (dateStr = '') => {
    setModalMode('schedule')
    setModalDate(dateStr || '')
    setModalOpen(true)
  }

  const onStartInstant = (meeting) => {
    setModalOpen(false)
    goToActiveCall(meeting)
  }

  const onSchedule = async (meeting) => {
    setModalOpen(false)
    copyInvite(meeting)
    showToast('Scheduled — invite copied')
    await loadMeetings()
  }

  const onMeetNowStart = (meeting) => {
    setMeetNowOpen(false)
    goToActiveCall(meeting)
  }

  const onMeetNowShareLink = async (meeting, url) => {
    setMeetNowOpen(false)
    showToast(`Invite link copied — ${url || ''}`)
    await loadMeetings()
  }

  const getApi = () => calendarRef.current?.getApi?.()

  const goToday = () => getApi()?.today()
  const goPrev = () => getApi()?.prev()
  const goNext = () => getApi()?.next()

  const syncTitle = () => {
    const api = getApi()
    if (api) setTitle(api.view.title)
  }

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader searchPlaceholder="Search people, meetings, or dates" />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex flex-col overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-8 h-auto min-h-16 py-3 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
              <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight ml-1">
                {title || 'Calendar'}
              </h1>
              {loading && (
                <span className="text-body-sm text-on-surface-variant ml-2">Loading…</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openMeetNow}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant font-headline-md text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                Meet now
              </button>
              <button
                type="button"
                onClick={() => openNew()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-headline-md shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New
              </button>
            </div>
          </header>

          {loadError && (
            <div className="mx-8 mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{loadError}</div>
          )}

          <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
            <div className="h-full loop-calendar bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3 card-shadow">
              <FullCalendar
                ref={calendarRef}
                plugins={[themePlugin, dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                height="100%"
                events={events}
                dateClick={(info) => openNew(info.dateStr)}
                eventClick={(info) => {
                  const meeting = info.event.extendedProps?.meeting
                  if (meeting?.meetingId) goToActiveCall(meeting)
                }}
                datesSet={syncTitle}
                dayMaxEvents={3}
                nowIndicator
              />
            </div>
          </div>
        </main>
      </div>

      <NewMeetingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartInstant={onStartInstant}
        onSchedule={onSchedule}
        initialMode={modalMode}
        initialDate={modalDate}
        initialCallType="1:1"
      />

      <MeetNowModal
        open={meetNowOpen}
        onClose={() => setMeetNowOpen(false)}
        onStartMeeting={onMeetNowStart}
        onShareLink={onMeetNowShareLink}
      />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl text-body-md animate-content-entrance max-w-[90vw] truncate">
          {toast}
        </div>
      )}
    </div>
  )
}
