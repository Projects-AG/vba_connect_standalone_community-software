import { getAccessToken } from './authApi'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function authHeaders(extra = {}) {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.message || data.error || `Request failed (${res.status})`
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }
  return data
}

export const callsApi = {
  async listHistory() {
    const res = await fetch(`${API_BASE_URL}/call-logs/history`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async listIncoming() {
    const res = await fetch(`${API_BASE_URL}/call-logs/incoming`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async getCall(callId) {
    const res = await fetch(`${API_BASE_URL}/call-logs/${callId}`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async startCall(peerUserId, mediaType = 'audio') {
    const res = await fetch(`${API_BASE_URL}/call-logs/start`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ peerUserId, mediaType }),
    })
    return parseJson(res)
  },

  async answerCall(callId) {
    const res = await fetch(`${API_BASE_URL}/call-logs/${callId}/answer`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })
    return parseJson(res)
  },

  async endCall(callId) {
    const res = await fetch(`${API_BASE_URL}/call-logs/${callId}/end`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })
    return parseJson(res)
  },
}
