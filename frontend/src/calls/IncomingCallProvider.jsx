import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { callsApi } from '../services/callsApi'
import { chatApi } from '../services/chatApi'
import { avatarDataUri } from '../utils/avatar'

const IncomingCallContext = createContext(null)

const POLL_MS = 2000

function playRingTone(audioCtxRef) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return () => {}
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    let stopped = false
    const beep = () => {
      if (stopped) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.value = 0.08
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    }

    beep()
    const id = setInterval(beep, 1500)
    return () => {
      stopped = true
      clearInterval(id)
    }
  } catch {
    return () => {}
  }
}

function notifyBrowser(call) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
    return
  }
  if (Notification.permission !== 'granted') return
  const isVideo = call.mediaType === 'video' || call.callMode === 'video'
  try {
    const n = new Notification(isVideo ? 'Incoming video call' : 'Incoming call', {
      body: `${call.peerName || 'Someone'} is calling…`,
      tag: `call-${call.id}`,
      renotify: true,
    })
    setTimeout(() => n.close(), 8000)
  } catch {
    /* ignore */
  }
}

export function IncomingCallProvider({ children }) {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [incoming, setIncoming] = useState(null)
  const [busy, setBusy] = useState(false)
  const seenIdsRef = useRef(new Set())
  const audioCtxRef = useRef(null)
  const stopRingRef = useRef(null)

  const clearIncoming = useCallback(() => {
    setIncoming(null)
    if (stopRingRef.current) {
      stopRingRef.current()
      stopRingRef.current = null
    }
  }, [])

  const poll = useCallback(async () => {
    if (!token || !user) return
    // Don't interrupt an active call screen with another overlay for same session
    if (location.pathname === '/calls/active') return

    try {
      const res = await callsApi.listIncoming()
      const list = res.data || []
      const next = list[0] || null

      if (!next) {
        clearIncoming()
        return
      }

      setIncoming((prev) => {
        if (prev?.id === next.id) return prev
        return next
      })

      if (!seenIdsRef.current.has(next.id)) {
        seenIdsRef.current.add(next.id)
        notifyBrowser(next)
        if (stopRingRef.current) stopRingRef.current()
        stopRingRef.current = playRingTone(audioCtxRef)
      }
    } catch {
      /* silent — other tabs keep working */
    }
  }, [token, user, location.pathname, clearIncoming])

  useEffect(() => {
    if (!token || !user) {
      clearIncoming()
      return undefined
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [token, user, poll, clearIncoming])

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [token])

  const answer = useCallback(async () => {
    if (!incoming || busy) return
    setBusy(true)
    try {
      const res = await callsApi.answerCall(incoming.id)
      const mode =
        res.data?.callMode ||
        res.data?.mediaType ||
        incoming.callMode ||
        incoming.mediaType ||
        'audio'
      let conversationId = null
      const peerId = incoming.peerUserId || res.data?.peerUserId
      if (peerId) {
        try {
          const conv = await chatApi.getOrCreateConversation(peerId)
          conversationId = conv.data?.id || null
        } catch {
          /* ignore */
        }
      }
      clearIncoming()
      navigate('/calls/active', {
        state: {
          meetingId: res.data?.meetingId || incoming.meetingId,
          roomName: res.data?.roomName || incoming.roomName,
          meetingTitle: `Call with ${incoming.peerName}`,
          callType: '1:1',
          callMode: mode === 'video' ? 'video' : 'audio',
          callLogId: incoming.id,
          peerName: incoming.peerName,
          peerUserId: peerId,
          conversationId,
          isCaller: false,
          awaitAnswer: false,
          participants: [],
        },
      })
    } catch (err) {
      clearIncoming()
      console.error(err)
    } finally {
      setBusy(false)
    }
  }, [incoming, busy, navigate, clearIncoming])

  const decline = useCallback(async () => {
    if (!incoming || busy) return
    setBusy(true)
    try {
      await callsApi.endCall(incoming.id)
    } catch {
      /* ignore */
    } finally {
      clearIncoming()
      setBusy(false)
    }
  }, [incoming, busy, clearIncoming])

  const isVideoIncoming =
    incoming?.mediaType === 'video' || incoming?.callMode === 'video'

  return (
    <IncomingCallContext.Provider value={{ incoming, answer, decline }}>
      {children}
      {incoming && location.pathname !== '/calls/active' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl ring-1 ring-outline-variant/20 p-8 text-center animate-content-entrance">
            <p className="text-body-sm text-on-surface-variant mb-4">
              {isVideoIncoming ? 'Incoming video call' : 'Incoming call'}
            </p>
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-secondary-container mb-4">
              <img
                src={avatarDataUri(incoming.peerName, incoming.peerUserId)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              {incoming.peerName}
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-8">is calling…</p>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                disabled={busy}
                onClick={decline}
                className="flex flex-col items-center gap-2 disabled:opacity-60"
              >
                <span className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[28px]">call_end</span>
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">Decline</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={answer}
                className="flex flex-col items-center gap-2 disabled:opacity-60"
              >
                <span className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-[28px]">
                    {isVideoIncoming ? 'videocam' : 'call'}
                  </span>
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">Answer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </IncomingCallContext.Provider>
  )
}

export function useIncomingCall() {
  return useContext(IncomingCallContext)
}
