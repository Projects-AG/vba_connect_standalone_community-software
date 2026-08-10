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

export const chatApi = {
  async listUsers() {
    const res = await fetch(`${API_BASE_URL}/chat/users`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async listConversations() {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async getOrCreateConversation(peerUserId) {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ peerUserId }),
    })
    return parseJson(res)
  },

  async listMessages(conversationId) {
    const res = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      { headers: authHeaders() },
    )
    return parseJson(res)
  },

  async sendMessage(conversationId, body) {
    const res = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ body }),
      },
    )
    return parseJson(res)
  },
}
