import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import CallsHub from './pages/CallsHub'
import ActiveCall from './pages/ActiveCall'
import StubView from './pages/StubView'
import Login from './pages/Login'
import Register from './pages/Register'
import JoinMeeting from './pages/JoinMeeting'
import ProtectedRoute from './auth/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to="/teams" replace />} />
      <Route
        path="/join/:meetingId"
        element={
          <ProtectedRoute>
            <JoinMeeting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <Posts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <CallsHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls/active"
        element={
          <ProtectedRoute>
            <ActiveCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <StubView icon="notifications_active" title="Recent Activity" subtitle="Stay updated on all team movements." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <StubView icon="chat_bubble" title="Chat Workspace" subtitle="Your direct messages and group chats will appear here." />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <StubView icon="calendar_month" title="Calendar" subtitle="Schedule and sync your meetings here." />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/teams" replace />} />
    </Routes>
  )
}
