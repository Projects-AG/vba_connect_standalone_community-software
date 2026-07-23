import { getAccessToken } from './authApi'

// Empty VITE_API_URL => same-origin requests (nginx proxies to backend)
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

export const meetingApi = {
  async createMeeting(data) {
    const res = await fetch(`${API_BASE_URL}/meeting/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return parseJson(res)
  },

  async getMeeting(meetingId) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async generateToken(meetingId, participant) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}/token`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        ...(participant ? { participant } : {}),
      }),
    })
    return parseJson(res)
  },
}
