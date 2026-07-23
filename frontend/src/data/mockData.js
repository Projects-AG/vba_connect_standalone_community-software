// Central mock data. Replace with real API calls when wiring up a backend.
import { avatarDataUri } from '../utils/avatar.js'

export const currentUser = {
  name: 'You',
  avatar: avatarDataUri('You', 'user-12'),
}

export const contacts = [
  { id: 'c1', name: 'Sarah Jenkins', role: 'Product Design', avatar: avatarDataUri('Sarah Jenkins', 'c1'), status: 'online' },
  { id: 'c2', name: 'Marcus Bell', role: 'Engineering', avatar: avatarDataUri('Marcus Bell', 'c2'), status: 'away', initials: 'MB' },
  { id: 'c3', name: 'Elena Rodriguez', role: 'Frontend Lead', avatar: avatarDataUri('Elena Rodriguez', 'c3'), status: 'online' },
  { id: 'c4', name: 'Jordan Smith', role: 'Executive', avatar: avatarDataUri('Jordan Smith', 'c4'), status: 'online' },
  { id: 'c5', name: 'Kelly Lin', role: 'Operations', avatar: avatarDataUri('Kelly Lin', 'c5'), status: 'offline', initials: 'KL' },
  { id: 'c6', name: 'David Moore', role: 'Backend Engineer', avatar: avatarDataUri('David Moore', 'c6'), status: 'online' },
  { id: 'c7', name: 'Maya Patel', role: 'Backend Engineer', avatar: avatarDataUri('Maya Patel', 'c7'), status: 'online' },
  { id: 'c8', name: 'Marcus Thorne', role: 'Operations Lead', avatar: avatarDataUri('Marcus Thorne', 'c8'), status: 'away' },
]

export const teams = [
  { id: 't1', name: 'Product Vision Sync', tag: 'Project Phoenix • Internal Strategy', icon: 'rocket_launch', members: 11 },
  { id: 't2', name: 'Design Systems Guild', tag: 'Weekly Alignment: Q4 Roadmap', icon: 'palette', members: 8 },
  { id: 't3', name: 'Growth & Marketing', tag: 'Campaign Ops', icon: 'trending_up', members: 6 },
]

export const recentCalls = [
  { id: 'rc1', name: 'Weekly Alignment: Q4 Roadmap', type: 'group', time: 'Today, 10:30 AM', duration: '42m', participants: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'rc2', name: 'Sarah Jenkins', type: '1:1', time: 'Yesterday, 4:15 PM', duration: '18m', participants: ['c1'] },
  { id: 'rc3', name: 'Design Systems Guild', type: 'group', time: 'Mon, 2:00 PM', duration: '1h 05m', participants: ['c3', 'c6', 'c7'] },
]

export const posts = [
  {
    id: 'p1',
    author: 'Alex Rivera',
    isAdmin: true,
    role: 'Product Design',
    time: '2 hours ago',
    avatar: avatarDataUri('Alex Rivera', 'p1'),
    body: "Thrilled to share the finalized Q3 Velocity Design System specs! We've focused on fluid continuity and Apple-inspired motion tokens. Take a look at the interactive prototypes below. \u{1F680}",
    attachment: { name: 'Velocity_DS_v2.0_Specs.pdf', size: '4.2 MB' },
    likes: 24,
    comments: 8,
  },
  {
    id: 'p2',
    author: 'Elena Chen',
    role: 'Engineering',
    time: '5 hours ago',
    avatar: avatarDataUri('Elena Chen', 'p2'),
    body: 'Just pushed the new cubic-bezier(0.4, 0, 0.2, 1) transition curves to the main repo. Everything should feel about 20% "snappier" now. Let me know if you spot any jitter on Safari!',
    reply: { author: 'James Wilson', avatar: avatarDataUri('James Wilson', 'p2-reply'), time: '4h ago', body: "Testing it now on the iPad Pro. It's incredibly fluid. Night and day difference." },
    likes: 12,
    comments: 3,
  },
]

export const files = [
  { id: 'f1', name: 'Marketing Assets', type: 'folder', modified: 'Oct 14, 2024', author: 'Elena R.', size: '12 items' },
  { id: 'f2', name: 'User_Research_v2.pdf', type: 'pdf', modified: '2h ago', author: 'David M.', size: '4.2 MB' },
  { id: 'f3', name: 'Sprint_Brief.docx', type: 'doc', modified: '5h ago', author: 'Maya P.', size: '1.1 MB' },
]
