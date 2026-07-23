import { useState } from 'react'
import { contacts } from '../data/mockData'
import { meetingApi } from "../services/meetingApi";
import { useAuth } from '../auth/AuthContext'
/**
 * NewMeetingModal
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onStartInstant: (meeting) => void   // fired for "Meet Now"
 *  - onSchedule: (meeting) => void       // fired for "Schedule"
 */
export default function NewMeetingModal({ open, onClose, onStartInstant, onSchedule }) {
  const { user } = useAuth()
  const [mode, setMode] = useState('instant') // 'instant' | 'schedule'
  const [callType, setCallType] = useState('1:1') // '1:1' | 'group'
  const [selectedIds, setSelectedIds] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const toggleContact = (id) => {
    if (callType === '1:1') {
      setSelectedIds([id])
    } else {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }
  }

  const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id))
  const canSubmit = selectedIds.length > 0 && (mode === 'instant' || (title && date && time))

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    const payload = {
      roomName: crypto.randomUUID(),
      meetingTitle:
        title ||
        (callType === "1:1"
          ? selectedContacts[0]?.name
          : `Group Call (${selectedContacts.length})`),
      meetingType: mode,
      callType,
      meetingDate: date || "",
      meetingTime: time || "",
      host: user?.name || "Host",
      participants: selectedContacts.map((p) => p.name),
    };

    try {
      const response = await meetingApi.createMeeting(payload);

      if (!response.success) {
        alert(response.message || "Unable to create meeting");
        return;
      }

      const meeting = response.data;

      if (mode === "instant") {
        onStartInstant?.(meeting);
      } else {
        onSchedule?.(meeting);
      }

      reset();
    } catch (err) {
      alert(err.message || "Unable to create meeting");
    } finally {
      setSubmitting(false);
    }
  };
  const reset = () => {
    setMode('instant')
    setCallType('1:1')
    setSelectedIds([])
    setTitle('')
    setDate('')
    setTime('')
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/40 backdrop-blur-sm animate-content-entrance">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl modal-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">New Meeting</h2>
          <button
            onClick={reset}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instant vs Schedule toggle */}
          <div className="flex bg-surface-container-low rounded-xl p-1">
            <button
              onClick={() => setMode('instant')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-headline-md text-headline-md transition-all duration-200 ${mode === 'instant' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Meet Now
            </button>
            <button
              onClick={() => setMode('schedule')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-headline-md text-headline-md transition-all duration-200 ${mode === 'schedule' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              Schedule
            </button>
          </div>

          {/* 1:1 vs Group toggle */}
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Call Type</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCallType('1:1')
                  setSelectedIds((prev) => prev.slice(0, 1))
                }}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border font-label-md text-label-md transition-all ${callType === '1:1'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                One-to-One
              </button>
              <button
                onClick={() => setCallType('group')}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border font-label-md text-label-md transition-all ${callType === 'group'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">groups</span>
                Group Call
              </button>
            </div>
          </div>

          {/* Meeting title (schedule mode only, optional for instant) */}
          {mode === 'schedule' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Alignment: Q4 Roadmap"
                  className="w-full mt-1 bg-surface-container border border-outline-variant/40 rounded-lg py-2.5 px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 bg-surface-container border border-outline-variant/40 rounded-lg py-2.5 px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-1 bg-surface-container border border-outline-variant/40 rounded-lg py-2.5 px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Contact picker */}
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">
              {callType === '1:1' ? 'Choose a person' : `Choose people (${selectedIds.length} selected)`}
            </p>
            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {contacts.map((c) => {
                const active = selectedIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-primary/10' : 'hover:bg-surface-container-low'
                      }`}
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      {c.initials ? (
                        <span className="text-body-sm font-bold text-on-surface-variant">{c.initials}</span>
                      ) : (
                        <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest ${c.status === 'online' ? 'bg-green-500' : c.status === 'away' ? 'bg-yellow-500' : 'bg-outline-variant'
                          }`}
                      />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-body-md text-on-surface leading-tight">{c.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{c.role}</p>
                    </div>
                    {active && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/40">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg font-headline-md text-headline-md text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-lg font-headline-md text-headline-md flex items-center gap-2 transition-all active:scale-[0.98] ${canSubmit ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container' : 'bg-surface-variant text-outline cursor-not-allowed'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {mode === 'instant' ? 'call' : 'event_available'}
            </span>
            {mode === 'instant' ? 'Start Call' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  )
}
