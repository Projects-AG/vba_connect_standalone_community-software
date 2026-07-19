import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import CallsHub from './pages/CallsHub'
import ActiveCall from './pages/ActiveCall'
import StubView from './pages/StubView'
import JoinMeeting from "./pages/JoinMeeting";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teams" replace />} />
      <Route path="/teams" element={<Dashboard />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/calls" element={<CallsHub />} />
      <Route path="/calls/active" element={<ActiveCall />} />
      <Route
        path="/join/:meetingId"
        element={<JoinMeeting />}
      />
      <Route
        path="/activity"
        element={<StubView icon="notifications_active" title="Recent Activity" subtitle="Stay updated on all team movements." />}
      />
      <Route
        path="/chat"
        element={<StubView icon="chat_bubble" title="Chat Workspace" subtitle="Your direct messages and group chats will appear here." />}
      />
      <Route
        path="/calendar"
        element={<StubView icon="calendar_month" title="Calendar" subtitle="Schedule and sync your meetings here." />}
      />
      <Route path="*" element={<Navigate to="/teams" replace />} />
    </Routes>
  )
}
