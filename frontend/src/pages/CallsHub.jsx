import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { chatApi } from '../services/chatApi'
import { callsApi } from '../services/callsApi'
import { avatarDataUri } from '../utils/avatar'

function statusIcon(item) {
  if (item.mediaType === 'video' || item.callMode === 'video') {
    if (item.status === 'missed') return 'videocam_off'
    return 'videocam'
  }
  if (item.status === 'missed') return 'call_missed'
  if (item.direction === 'outgoing') return 'call_made'
  return 'call_received'
}

function statusLabel(item) {
  const video = item.mediaType === 'video' || item.callMode === 'video'
  if (item.status === 'missed') return video ? 'Missed video' : 'Missed'
  if (item.status === 'ringing') return item.direction === 'outgoing' ? 'Calling…' : 'Incoming'
  if (item.status === 'cancelled') return 'Cancelled'
  if (item.status === 'answered' || item.status === 'ended') {
    if (item.durationSeconds > 0) {
      const m = Math.floor(item.durationSeconds / 60)
      const s = item.durationSeconds % 60
      return `${video ? 'Video · ' : ''}${m}m ${String(s).padStart(2, '0')}s`
    }
    return video
      ? item.direction === 'outgoing'
        ? 'Outgoing video'
        : 'Incoming video'
      : item.direction === 'outgoing'
        ? 'Outgoing'
        : 'Incoming'
  }
  return item.status
}

function formatWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `Today, ${time}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

export default function CallsHub() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [history, setHistory] = useState([])
  const [incoming, setIncoming] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setError('')
    try {
      const [usersRes, historyRes, incomingRes] = await Promise.all([
        chatApi.listUsers(),
        callsApi.listHistory(),
        callsApi.listIncoming(),
      ])
      setUsers(usersRes.data || [])
      setHistory(historyRes.data || [])
      setIncoming(incomingRes.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load calls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 4000)
    return () => clearInterval(id)
  }, [load])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    )
  }, [users, query])

  const goToCall = (call) => {
    const mode = call.callMode || call.mediaType || 'audio'
    navigate('/calls/active', {
      state: {
        meetingId: call.meetingId,
        roomName: call.roomName,
        meetingTitle: call.meetingTitle || `Call with ${call.peerName}`,
        callType: '1:1',
        callMode: mode === 'video' ? 'video' : 'audio',
        callLogId: call.id,
        peerName: call.peerName,
        peerUserId: call.peerUserId,
        conversationId: call.conversationId || null,
        isCaller: call.isCaller !== false && !call.fromAnswer,
        awaitAnswer: call.awaitAnswer === true,
        participants: [],
      },
    })
  }

  const placeCall = async (peerUserId, mediaType = 'audio') => {
    if (starting || !peerUserId) return
    setStarting(true)
    try {
      let conversationId = null
      try {
        const conv = await chatApi.getOrCreateConversation(peerUserId)
        conversationId = conv.data?.id || null
      } catch {
        /* chat optional */
      }
      const res = await callsApi.startCall(peerUserId, mediaType)
      if (!res.success) {
        showToast(res.message || 'Unable to start call')
        return
      }
      goToCall({ ...res.data, conversationId, isCaller: true, awaitAnswer: true })
    } catch (err) {
      showToast(err.message || 'Unable to start call')
    } finally {
      setStarting(false)
    }
  }

  const answerIncoming = async (call) => {
    if (starting) return
    setStarting(true)
    try {
      let conversationId = null
      if (call.peerUserId) {
        try {
          const conv = await chatApi.getOrCreateConversation(call.peerUserId)
          conversationId = conv.data?.id || null
        } catch {
          /* ignore */
        }
      }
      const res = await callsApi.answerCall(call.id)
      if (!res.success) {
        showToast(res.message || 'Unable to answer')
        return
      }
      goToCall({
        ...res.data,
        meetingTitle: `Call with ${call.peerName}`,
        peerName: call.peerName,
        peerUserId: call.peerUserId || res.data?.peerUserId,
        conversationId,
        isCaller: false,
        fromAnswer: true,
        awaitAnswer: false,
      })
    } catch (err) {
      showToast(err.message || 'Unable to answer')
    } finally {
      setStarting(false)
    }
  }

  const callback = (item) => {
    if (!item.peerUserId) return
    const mode = item.mediaType === 'video' || item.callMode === 'video' ? 'video' : 'audio'
    placeCall(item.peerUserId, mode)
  }

  return (
    <div className="bg-surface">
      <TopHeader searchPlaceholder="Search people" />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-between items-center px-8 h-16 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">
              Calls
            </h1>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
              )}

              {/* Incoming ringing */}
              {incoming.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Incoming</h3>
                  {incoming.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={avatarDataUri(c.peerName, c.peerUserId)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-headline-md text-headline-md text-on-surface truncate">
                            {c.peerName}
                          </p>
                          <p className="text-body-sm text-on-surface-variant">Incoming call…</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={starting}
                        onClick={() => answerIncoming(c)}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md disabled:opacity-60"
                      >
                        Answer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search people */}
              <div className="space-y-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">People</h3>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {loading && (
                  <p className="text-body-sm text-on-surface-variant">Loading…</p>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant">No people found.</p>
                )}
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0">
                          <img
                            src={avatarDataUri(u.name, u.id)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-label-md text-on-surface truncate">{u.name}</p>
                          <p className="text-body-sm text-on-surface-variant truncate">{u.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={starting}
                        onClick={() => placeCall(u.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant text-primary hover:bg-primary/5 font-label-md disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              <div className="space-y-4 pb-8">
                <h3 className="font-headline-md text-headline-md text-on-surface">History</h3>
                {!loading && history.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant">No calls yet.</p>
                )}
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[22px] flex-shrink-0 ${
                            item.status === 'missed' ? 'text-error' : 'text-on-surface-variant'
                          }`}
                        >
                          {statusIcon(item)}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-label-md truncate ${
                              item.status === 'missed' ? 'text-error' : 'text-on-surface'
                            }`}
                          >
                            {item.peerName}
                          </p>
                          <p className="text-body-sm text-on-surface-variant truncate">
                            {statusLabel(item)}
                            {item.startedAt ? ` • ${formatWhen(item.startedAt)}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={starting || !item.peerUserId}
                        onClick={() => callback(item)}
                        className="px-3 py-2 rounded-lg border border-outline-variant text-primary hover:bg-primary/5 font-label-md disabled:opacity-60"
                        title="Call back"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl text-body-md max-w-[90vw] truncate">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
