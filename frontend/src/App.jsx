import { Routes, Route, Navigate } from 'react-router-dom'
import CallsHub from './pages/CallsHub'
import ActiveCall from './pages/ActiveCall'
import Login from './pages/Login'
import Register from './pages/Register'
import JoinMeeting from './pages/JoinMeeting'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import ComingSoonPage from './pages/ComingSoonPage'
import ProtectedRoute from './auth/ProtectedRoute'

const HOME = '/chat'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to={HOME} replace />} />
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
            <ComingSoonPage
              title="Teams — Coming soon"
              subtitle="Community and channel features are not available yet. Use Chat, Calls, or Calendar."
              icon="groups"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <ComingSoonPage
              title="Posts — Coming soon"
              subtitle="Team posts are not available yet."
              icon="forum"
            />
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
            <ComingSoonPage
              title="Activity — Coming soon"
              subtitle="Activity feed is not available yet."
              icon="notifications_active"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={HOME} replace />} />
    </Routes>
  )
}
