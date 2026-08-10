import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { useAuth } from '../auth/AuthContext'
import { chatApi } from '../services/chatApi'
import { meetingApi } from '../services/meetingApi'
import { avatarDataUri } from '../utils/avatar'

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatListTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) return formatTime(value)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [newOpen, setNewOpen] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [startingCall, setStartingCall] = useState(false)
  const bottomRef = useRef(null)

  const active = conversations.find((c) => c.id === activeId) || null

  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.listConversations()
      setConversations(res.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load chats')
    } finally {
      setLoadingList(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId, { silent } = {}) => {
    if (!conversationId) return
    if (!silent) setLoadingMessages(true)
    try {
      const res = await chatApi.listMessages(conversationId)
      setMessages(res.data || [])
    } catch (err) {
      if (!silent) setError(err.message || 'Unable to load messages')
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    loadMessages(activeId)
    const id = setInterval(() => {
      loadMessages(activeId, { silent: true })
      loadConversations()
    }, 4000)
    return () => clearInterval(id)
  }, [activeId, loadMessages, loadConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openNewChat = async () => {
    setNewOpen(true)
    setUserQuery('')
    try {
      const res = await chatApi.listUsers()
      setUsers(res.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load users')
    }
  }

  const startConversation = async (peerUserId) => {
    try {
      const res = await chatApi.getOrCreateConversation(peerUserId)
      const conv = res.data
      setNewOpen(false)
      await loadConversations()
      setActiveId(conv.id)
    } catch (err) {
      setError(err.message || 'Unable to start chat')
    }
  }

  const send = async () => {
    const body = draft.trim()
    if (!body || !activeId || sending) return
    setSending(true)
    setError('')
    try {
      const res = await chatApi.sendMessage(activeId, body)
      setDraft('')
      setMessages((prev) => [...prev, res.data])
      await loadConversations()
    } catch (err) {
      setError(err.message || 'Unable to send')
    } finally {
      setSending(false)
    }
  }

  const startVideoCall = async () => {
    if (!active?.peer || startingCall) return
    setStartingCall(true)
    setError('')
    try {
      const hostName = user?.name || 'Host'
      const peerName = active.peer.name
      const response = await meetingApi.createMeeting({
        roomName: crypto.randomUUID(),
        meetingTitle: `Call with ${peerName}`,
        meetingType: 'instant',
        callType: '1:1',
        meetingDate: '',
        meetingTime: '',
        host: hostName,
        participants: [hostName, peerName],
      })
      if (!response.success) {
        throw new Error(response.message || 'Unable to start call')
      }
      const meeting = response.data
      const path = meeting.meetingLink || `/join/${meeting.meetingId}`
      try {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      } catch {
        /* ignore */
      }
      navigate('/calls/active', {
        state: {
          ...meeting,
          meetingId: meeting.meetingId,
          roomName: meeting.roomName,
          meetingLink: meeting.meetingLink,
        },
      })
    } catch (err) {
      setError(err.message || 'Unable to start call')
    } finally {
      setStartingCall(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = userQuery.trim().toLowerCase()
    if (!q) return true
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader searchPlaceholder="Search chats" />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex overflow-hidden">
          {/* Conversation list */}
          <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-outline-variant/30">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Chat</h1>
              <button
                type="button"
                onClick={openNewChat}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-primary transition-colors"
                title="New chat"
              >
                <span className="material-symbols-outlined text-[22px]">edit_square</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingList && (
                <p className="px-4 py-6 text-body-sm text-on-surface-variant">Loading…</p>
              )}
              {!loadingList && conversations.length === 0 && (
                <p className="px-4 py-6 text-body-sm text-on-surface-variant">
                  No chats yet. Start a new conversation.
                </p>
              )}
              {conversations.map((c) => {
                const selected = c.id === activeId
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-outline-variant/15 ${
                      selected
                        ? 'bg-primary/10'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <img
                      src={avatarDataUri(c.peer?.name, c.peer?.id)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-label-md text-label-md text-on-surface truncate">
                          {c.peer?.name || 'Unknown'}
                        </p>
                        <span className="text-[10px] text-outline flex-shrink-0">
                          {formatListTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant truncate">
                        {c.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Thread */}
          <section className="flex-1 flex flex-col bg-surface min-w-0">
            {!active && (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl text-outline/40 mb-3">chat</span>
                <p className="font-headline-md text-headline-md text-on-surface">Select a chat</p>
                <p className="text-body-sm mt-1">Or start a new conversation</p>
              </div>
            )}

            {active && (
              <>
                <header className="flex items-center justify-between gap-3 px-6 h-14 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={avatarDataUri(active.peer?.name, active.peer?.id)}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-headline-md text-headline-md text-on-surface truncate">
                        {active.peer?.name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant truncate">
                        {active.peer?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startVideoCall}
                    disabled={startingCall}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-60"
                    title="Start video call"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">videocam</span>
                    <span className="hidden sm:inline font-label-md text-label-md">
                      {startingCall ? 'Starting…' : 'Call'}
                    </span>
                  </button>
                </header>

                {error && (
                  <div className="mx-6 mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
                  {loadingMessages && messages.length === 0 && (
                    <p className="text-body-sm text-on-surface-variant">Loading messages…</p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === user?.id
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            mine
                              ? 'bg-primary text-on-primary rounded-br-md'
                              : 'bg-surface-container-high text-on-surface rounded-bl-md'
                          }`}
                        >
                          <p className="text-body-md whitespace-pre-wrap break-words">{m.body}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              mine ? 'text-on-primary/70' : 'text-outline'
                            }`}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-lowest">
                  <div className="flex items-end gap-2">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                      placeholder="Type a message"
                      className="flex-1 rounded-xl bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={sending || !draft.trim()}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50 hover:bg-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {newOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/20 modal-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">New chat</h2>
              <button
                type="button"
                onClick={() => setNewOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-5 pt-4">
              <input
                type="search"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search people"
                className="w-full rounded-xl bg-surface-container-low border-none px-4 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar p-3">
              {filteredUsers.length === 0 && (
                <p className="px-2 py-4 text-body-sm text-on-surface-variant">
                  No users found. Ask teammates to register first.
                </p>
              )}
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startConversation(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-left"
                >
                  <img
                    src={avatarDataUri(u.name, u.id)}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="text-body-md text-on-surface truncate">{u.name}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
