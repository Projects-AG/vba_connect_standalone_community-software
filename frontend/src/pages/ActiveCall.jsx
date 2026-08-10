import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react'
import { RoomEvent } from 'livekit-client'
import NavRail from '../components/NavRail'
import LiveVideoGrid from '../livekit/LiveVideoGrid'
import MeetingControls from '../livekit/MeetingControls'
import { avatarDataUri } from '../utils/avatar'
import { useAuth } from '../auth/AuthContext'
import { meetingApi } from '../services/meetingApi'
import { callsApi } from '../services/callsApi'
import { chatApi } from '../services/chatApi'

function useElapsedTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatMsgTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ParticipantsDebugger() {
  const participants = useParticipants()
  useEffect(() => {
    console.log('Participants', participants)
  }, [participants])
  return null
}

/** For 1:1 calls — when the peer leaves the LiveKit room, end for this user too. */
function PeerCallEndWatcher({ enabled, callLogId, onPeerLeft }) {
  const room = useRoomContext()
  const seenRemoteRef = useRef(false)
  const pendingRef = useRef(null)

  useEffect(() => {
    if (!enabled || !room) return undefined

    const clearPending = () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current)
        pendingRef.current = null
      }
    }

    const markRemote = () => {
      if (room.remoteParticipants.size > 0) {
        seenRemoteRef.current = true
        clearPending()
      }
    }

    const onDisconnected = () => {
      if (!seenRemoteRef.current) return
      if (room.remoteParticipants.size > 0) return

      clearPending()
      pendingRef.current = setTimeout(async () => {
        pendingRef.current = null
        if (room.remoteParticipants.size > 0) return

        // Prefer server call status; if peer closed tab without API, end it here
        if (callLogId) {
          try {
            const res = await callsApi.getCall(callLogId)
            const status = res.data?.status
            if (status === 'ended' || status === 'missed' || status === 'cancelled') {
              onPeerLeft('Call ended')
              return
            }
            if (status === 'answered') {
              try {
                await callsApi.endCall(callLogId)
              } catch {
                /* ignore */
              }
              onPeerLeft('Call ended')
            }
          } catch {
            onPeerLeft('Call ended')
          }
          return
        }
        onPeerLeft('Call ended')
      }, 1200)
    }

    markRemote()
    room.on(RoomEvent.ParticipantConnected, markRemote)
    room.on(RoomEvent.ParticipantDisconnected, onDisconnected)
    return () => {
      clearPending()
      room.off(RoomEvent.ParticipantConnected, markRemote)
      room.off(RoomEvent.ParticipantDisconnected, onDisconnected)
    }
  }, [enabled, room, callLogId, onPeerLeft])

  return null
}

export default function ActiveCall() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const timer = useElapsedTimer()
  const { user } = useAuth()
  const bottomRef = useRef(null)
  const localHangupRef = useRef(false)
  const remoteEndHandledRef = useRef(false)

  const [meeting, setMeeting] = useState(state || {})
  const [token, setToken] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [shareToast, setShareToast] = useState('')

  const audioOnly = meeting.callMode === 'audio' || state?.callMode === 'audio'
  const callLogId = meeting.callLogId || state?.callLogId
  const peerUserId = meeting.peerUserId || state?.peerUserId
  const returnConversationId =
    meeting.conversationId || state?.conversationId || null

  const [conversationId, setConversationId] = useState(returnConversationId)
  const [callPhase, setCallPhase] = useState(() => {
    // Caller waits until peer answers before LiveKit connect
    if (callLogId && (state?.isCaller || state?.awaitAnswer)) return 'ringing'
    return 'connecting'
  })
  const [ringStatus, setRingStatus] = useState('')
  const [ringSeconds, setRingSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(() => !(state?.callMode === 'audio'))
  const [sharing, setSharing] = useState(false)
  // Chat panel closed by default (1:1 audio/video and meetings)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')

  const exitAfterCall = useCallback(() => {
    if (conversationId) {
      navigate('/chat', { state: { conversationId }, replace: true })
      return
    }
    navigate('/calls', { replace: true })
  }, [conversationId, navigate])

  const handleRemoteCallEnded = useCallback(
    (message = 'Call ended') => {
      if (localHangupRef.current || remoteEndHandledRef.current) return
      remoteEndHandledRef.current = true
      setToken(null)
      setCallPhase('ended')
      setRingStatus(message)
      setTimeout(() => exitAfterCall(), 1600)
    },
    [exitAfterCall],
  )

  useEffect(() => {
    if (state?.meetingId) {
      setMeeting((prev) => ({
        ...prev,
        ...state,
      }))
      if (state.conversationId) setConversationId(state.conversationId)
      return
    }
    const params = new URLSearchParams(window.location.search)
    const meetingId = params.get('meetingId')
    if (!meetingId) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await meetingApi.getMeeting(meetingId)
        if (!cancelled) {
          setMeeting((prev) => ({
            ...prev,
            ...res.data,
            callMode: prev.callMode || state?.callMode,
            callLogId: prev.callLogId || state?.callLogId,
            conversationId: prev.conversationId || state?.conversationId,
            peerUserId: prev.peerUserId || state?.peerUserId,
            peerName: prev.peerName || state?.peerName,
          }))
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Meeting not found')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [state])

  // Elapsed time while waiting for answer
  useEffect(() => {
    if (callPhase !== 'ringing') return undefined
    setRingSeconds(0)
    const id = setInterval(() => setRingSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [callPhase])

  // Poll call status: wait for answer while ringing; end for both when peer hangs up
  useEffect(() => {
    if (!callLogId) return undefined
    if (
      callPhase !== 'ringing' &&
      callPhase !== 'connecting' &&
      callPhase !== 'in-call'
    ) {
      return undefined
    }

    let cancelled = false

    const check = async () => {
      if (localHangupRef.current || remoteEndHandledRef.current) return
      try {
        const res = await callsApi.getCall(callLogId)
        const status = res.data?.status
        if (cancelled || localHangupRef.current) return

        if (callPhase === 'ringing') {
          if (status === 'answered') {
            setCallPhase('connecting')
            setRingStatus('')
            return
          }
          if (status === 'missed' || status === 'cancelled' || status === 'ended') {
            handleRemoteCallEnded(status === 'missed' ? 'No answer' : 'Call ended')
          }
          return
        }

        // Active / connecting 1:1 — if peer ended the call, leave too
        if (status === 'ended' || status === 'missed' || status === 'cancelled') {
          handleRemoteCallEnded('Call ended')
        }
      } catch {
        /* keep current UI */
      }
    }

    check()
    const id = setInterval(check, 1500)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [callPhase, callLogId, handleRemoteCallEnded])

  // Connect LiveKit only after answered (or for meet-now / callee)
  useEffect(() => {
    if (callPhase !== 'connecting') return
    if (!meeting.meetingId || !user?.id || token) return

    let cancelled = false
    async function joinMeeting() {
      try {
        const response = await meetingApi.connectMeeting(meeting.meetingId)
        if (cancelled) return
        setToken(response.token)
        if (response.meeting) {
          setMeeting((prev) => ({
            ...prev,
            ...response.meeting,
            callMode: prev.callMode,
            callLogId: prev.callLogId,
            conversationId: prev.conversationId,
            peerUserId: prev.peerUserId,
            peerName: prev.peerName,
            isCaller: prev.isCaller,
          }))
        }
        setCallPhase('in-call')
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoadError(err.message || 'Unable to join meeting')
      }
    }

    joinMeeting()
    return () => {
      cancelled = true
    }
  }, [callPhase, meeting.meetingId, user?.id, token])

  // Ensure a 1:1 conversation exists for in-call chat
  useEffect(() => {
    if (conversationId || !peerUserId || !user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await chatApi.getOrCreateConversation(peerUserId)
        if (!cancelled && res.data?.id) {
          setConversationId(res.data.id)
        }
      } catch (err) {
        if (!cancelled) setChatError(err.message || 'Unable to open chat')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationId, peerUserId, user?.id])

  const loadChatMessages = useCallback(
    async ({ silent } = {}) => {
      if (!conversationId) return
      try {
        const res = await chatApi.listMessages(conversationId)
        setMessages(res.data || [])
        setChatError('')
      } catch (err) {
        if (!silent) setChatError(err.message || 'Unable to load chat')
      }
    },
    [conversationId],
  )

  useEffect(() => {
    if (!conversationId || !chatOpen) return
    loadChatMessages()
    const id = setInterval(() => loadChatMessages({ silent: true }), 3000)
    return () => clearInterval(id)
  }, [conversationId, chatOpen, loadChatMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen])

  const sendMessage = async () => {
    const body = draft.trim()
    if (!body || !conversationId || sending) return
    setSending(true)
    try {
      const res = await chatApi.sendMessage(conversationId, body)
      setDraft('')
      setMessages((prev) => [...prev, res.data])
    } catch (err) {
      setChatError(err.message || 'Unable to send')
    } finally {
      setSending(false)
    }
  }

  const cancelOutgoing = async () => {
    localHangupRef.current = true
    if (callLogId) {
      try {
        await callsApi.endCall(callLogId)
      } catch {
        /* ignore */
      }
    }
    exitAfterCall()
  }

  const leaveCall = async () => {
    localHangupRef.current = true
    if (callLogId) {
      try {
        await callsApi.endCall(callLogId)
      } catch {
        /* ignore */
      }
    }
    exitAfterCall()
  }

  const copyInviteLink = async () => {
    if (!meeting.meetingId) return
    const path = meeting.meetingLink || `/join/${meeting.meetingId}`
    const shareUrl = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareToast('Invite link copied')
    } catch {
      setShareToast(shareUrl)
    }
    setTimeout(() => setShareToast(''), 4000)
  }

  const peerLabel = meeting.peerName || 'Chat'
  const isRinging = callPhase === 'ringing' || callPhase === 'ended'
  const showLive = callPhase === 'in-call' && token

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NavRail />
      <main className="ml-20 flex-1 flex flex-col bg-surface overflow-hidden">
        {loadError && (
          <div className="mx-8 mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {loadError}
          </div>
        )}

        <header className="flex justify-between items-center px-8 h-16 w-full bg-surface/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight truncate">
              {isRinging
                ? meeting.peerName || 'Calling…'
                : meeting.meetingTitle || meeting.title || 'Active call'}
            </h1>
            {!isRinging && callPhase === 'in-call' && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full animate-pulse flex-shrink-0">
                <div className="w-2 h-2 bg-error rounded-full" />
                <span className="font-label-md text-label-md">{timer}</span>
              </div>
            )}
            {callPhase === 'connecting' && (
              <span className="text-body-sm text-on-surface-variant">Connecting…</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {showLive && meeting.meetingId && !audioOnly && (
              <button
                type="button"
                onClick={copyInviteLink}
                title="Copy invite link"
                className="flex items-center gap-1.5 px-3 h-10 rounded-full border border-outline-variant/40 hover:bg-surface-variant transition-colors text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">link</span>
                <span className="hidden sm:inline font-label-md text-label-md">Share</span>
              </button>
            )}
          </div>
        </header>

        {isRinging && (
          <div className="loop-calling-screen flex-1 flex flex-col items-center justify-center gap-8 px-6 pb-16 relative overflow-hidden">
            <div className="loop-calling-glow" aria-hidden />
            <div className="loop-ringing-stage animate-content-entrance">
              <div className="loop-ringing-ring" />
              <div className="loop-ringing-ring loop-ringing-ring--delay" />
              <div className="loop-ringing-ring loop-ringing-ring--delay2" />
              <div className="loop-ringing-avatar">
                <img
                  src={avatarDataUri(meeting.peerName || 'User', peerUserId || meeting.meetingId || 'peer')}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="loop-ringing-media-badge" aria-hidden>
                  <span className="material-symbols-outlined filled text-[18px]">
                    {audioOnly ? 'call' : 'videocam'}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-center space-y-3 relative z-[1] animate-content-entrance">
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                {meeting.peerName || 'Contact'}
              </h2>
              {callPhase === 'ended' ? (
                <p className="text-body-md text-on-surface-variant">{ringStatus || 'Call ended'}</p>
              ) : (
                <>
                  <p className="loop-calling-status text-body-md text-on-surface-variant flex items-center justify-center gap-1.5">
                    <span className="loop-calling-status-label">
                      {audioOnly ? 'Calling' : 'Video calling'}
                    </span>
                    <span className="loop-ringing-dots" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                  </p>
                  <p className="font-label-md text-label-md text-outline tabular-nums">
                    {String(Math.floor(ringSeconds / 60)).padStart(2, '0')}:
                    {String(ringSeconds % 60).padStart(2, '0')}
                  </p>
                </>
              )}
            </div>
            {callPhase === 'ringing' && (
              <button
                type="button"
                onClick={cancelOutgoing}
                className="mt-2 flex flex-col items-center gap-2 relative z-[1] group"
              >
                <span className="loop-calling-cancel w-16 h-16 rounded-full bg-error text-white flex items-center justify-center shadow-lg shadow-error/30 transition-transform duration-200 group-active:scale-95">
                  <span className="material-symbols-outlined text-[30px]">call_end</span>
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">Cancel</span>
              </button>
            )}
          </div>
        )}

        {!isRinging && (
        <div className="flex-1 flex px-6 pb-28 pt-4 gap-4 overflow-hidden min-h-0">
          {callPhase === 'connecting' && !token && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-body-md text-on-surface-variant">Connecting…</p>
            </div>
          )}

          {token && (
            <LiveKitRoom
              serverUrl={import.meta.env.VITE_LIVEKIT_URL}
              token={token}
              connect
              video={!audioOnly}
              audio
              className="flex-1 min-w-0 flex flex-col"
            >
              <ParticipantsDebugger />
              {callLogId && (
                <PeerCallEndWatcher
                  enabled
                  callLogId={callLogId}
                  onPeerLeft={handleRemoteCallEnded}
                />
              )}
              {audioOnly ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface-container-low">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-secondary-container">
                    <img
                      src={avatarDataUri(
                        meeting.peerName || meeting.meetingTitle || 'Call',
                        meeting.meetingId || 'audio',
                      )}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-headline-lg text-headline-lg text-on-surface">
                    {meeting.peerName || meeting.meetingTitle || 'Audio call'}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">Audio call in progress</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0">
                  <LiveVideoGrid cameraOn={cameraOn} />
                </div>
              )}

              <MeetingControls
                muted={muted}
                cameraOn={cameraOn}
                sharing={sharing}
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                setMuted={setMuted}
                setCameraOn={setCameraOn}
                setSharing={setSharing}
                leaveCall={leaveCall}
                audioOnly={audioOnly}
              />
            </LiveKitRoom>
          )}

          {/* Right chat panel — real 1:1 thread */}
          {chatOpen && (
            <aside className="w-80 max-w-[40%] flex-shrink-0 bg-surface-container-lowest rounded-2xl flex flex-col shadow-xl ring-1 ring-outline-variant/15 overflow-hidden animate-content-entrance">
              <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface truncate">
                    Chat
                  </h2>
                  <p className="text-body-sm text-on-surface-variant truncate">{peerLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
                  aria-label="Close chat"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    close
                  </span>
                </button>
              </div>

              {!conversationId && !peerUserId && (
                <div className="flex-1 flex items-center justify-center p-4 text-center text-body-sm text-on-surface-variant">
                  In-call chat is available for 1:1 calls.
                </div>
              )}

              {!conversationId && peerUserId && (
                <div className="flex-1 flex items-center justify-center p-4 text-body-sm text-on-surface-variant">
                  Opening chat…
                </div>
              )}

              {conversationId && (
                <>
                  {chatError && (
                    <div className="mx-3 mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      {chatError}
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {messages.length === 0 && (
                      <p className="text-body-sm text-on-surface-variant text-center py-6">
                        No messages yet. Say hello.
                      </p>
                    )}
                    {messages.map((m) => {
                      const mine = m.senderId === user?.id
                      return mine ? (
                        <div key={m.id} className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] text-outline">{formatMsgTime(m.createdAt)}</span>
                          <div className="bg-primary text-on-primary px-3 py-2 rounded-2xl rounded-tr-md text-body-md max-w-[85%]">
                            {m.body}
                          </div>
                        </div>
                      ) : (
                        <div key={m.id} className="flex flex-col items-start gap-0.5">
                          <span className="text-[10px] text-outline">{formatMsgTime(m.createdAt)}</span>
                          <div className="bg-surface-container text-on-surface px-3 py-2 rounded-2xl rounded-tl-md text-body-md max-w-[85%]">
                            {m.body}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>
                  <div className="p-3 border-t border-outline-variant/30">
                    <div className="relative">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        className="w-full bg-surface-container border-none rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-primary/20 text-body-md"
                        placeholder="Type a message…"
                        type="text"
                        disabled={sending}
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={sending || !draft.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </aside>
          )}
        </div>
        )}
      </main>

      {shareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl text-body-md max-w-[90vw] truncate">
          {shareToast}
        </div>
      )}
    </div>
  )
}
