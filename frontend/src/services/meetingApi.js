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

  async listMeetings() {
    const res = await fetch(`${API_BASE_URL}/meeting`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async getMeeting(meetingId) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async getMeetingInsights(meetingId) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}/insights`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async downloadRecording(recordingId) {
    const res = await fetch(`${API_BASE_URL}/video/recording/download/${encodeURIComponent(recordingId)}`, {
      headers: authHeaders(),
    })
    const blob = await res.blob()
    if (!res.ok) {
      const text = await blob.text().catch(() => '')
      throw new Error(text || `Download failed (${res.status})`)
    }
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'recording.mp4'
    anchor.click()
    URL.revokeObjectURL(url)
    return true
  },

  async generateToken(meetingId) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}/token`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })
    return parseJson(res)
  },

  async connectMeeting(meetingId) {
    const res = await fetch(`${API_BASE_URL}/meeting/${meetingId}/connect`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })
    return parseJson(res)
  },

  async startRecording(roomName) {
    const res = await fetch(`${API_BASE_URL}/video/recording/start`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ roomName }),
    })
    return parseJson(res)
  },

  async stopRecording(egressId) {
    const res = await fetch(`${API_BASE_URL}/video/recording/stop`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ egressId }),
    })
    return parseJson(res)
  },

  async getRecording(egressId) {
    const res = await fetch(`${API_BASE_URL}/video/recording/${encodeURIComponent(egressId)}`, {
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async generatePlaybackToken(recordingId) {
    const res = await fetch(`${API_BASE_URL}/video/recording/${encodeURIComponent(recordingId)}/playback-token`, {
      method: 'POST',
      headers: authHeaders(),
    })
    return parseJson(res)
  },

  async exportMeeting(meetingId, format, sections) {
    const params = new URLSearchParams({ format, ...sections })
    const res = await fetch(`${API_BASE_URL}/meeting/${encodeURIComponent(meetingId)}/export?${params}`, {
      headers: authHeaders(),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Export failed (${res.status})`)
    }
    return res
  },

  async updateActionItemStatus(meetingId, originKey, status) {
    const res = await fetch(
      `${API_BASE_URL}/meeting/${encodeURIComponent(meetingId)}/action-items/${encodeURIComponent(originKey)}`,
      {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      },
    )
    return parseJson(res)
  },
}
