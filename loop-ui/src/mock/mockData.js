export const loopUser = {
  name: "Maya Chen",
  src: "https://i.pravatar.cc/100?img=5",
};

export const loopPeople = [
  { id: "1", name: "Sarah Jenkins", src: "https://i.pravatar.cc/100?img=1" },
  { id: "2", name: "Marcus Bell", src: "https://i.pravatar.cc/100?img=12" },
  { id: "3", name: "Elena Rodriguez", src: "https://i.pravatar.cc/100?img=9" },
  { id: "4", name: "Jordan Smith", src: "https://i.pravatar.cc/100?img=15" },
  { id: "5", name: "Kelly Lin", src: "https://i.pravatar.cc/100?img=20" },
  { id: "6", name: "Alex Park", src: "https://i.pravatar.cc/100?img=33" },
];

export const loopFiles = [
  {
    id: "f1",
    name: "Q4_Roadmap.pdf",
    type: "pdf",
    edited: "Edited 2h ago",
    color: "text-red-500 bg-red-50",
    icon: "picture_as_pdf",
  },
  {
    id: "f2",
    name: "Sprint_Brief.docx",
    type: "doc",
    edited: "Edited 5h ago",
    color: "text-blue-600 bg-blue-50",
    icon: "description",
  },
  {
    id: "f3",
    name: "Budget_2024.xls",
    type: "xls",
    edited: "Edited 1d ago",
    color: "text-green-600 bg-green-50",
    icon: "table_chart",
  },
  {
    id: "f4",
    name: "Brand_Deck.pptx",
    type: "ppt",
    edited: "Edited 3d ago",
    color: "text-loop-primary bg-loop-primary/10",
    icon: "slideshow",
  },
];

export const loopFolders = [
  { id: "fd1", name: "Roadmaps", meta: "24 Items • Last updated 2h ago", icon: "folder", tone: "primary" },
  { id: "fd2", name: "Briefs", meta: "12 Items • Last updated 5h ago", icon: "description", tone: "secondary" },
  { id: "fd3", name: "Budgets", meta: "8 Items • Last updated 1d ago", icon: "account_balance_wallet", tone: "error" },
  { id: "fd4", name: "Design", meta: "31 Items • Last updated 4h ago", icon: "palette", tone: "primary" },
];

export const loopActivity = [
  {
    id: "a1",
    name: "Sarah Jenkins",
    action: "updated the Q4 specs",
    detail: "Aligned mobile friction notes with Figma prototype.",
    time: "12m ago",
    src: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: "a2",
    name: "AI Assistant",
    action: "summarized standup",
    detail: "3 blockers flagged for Project Phoenix.",
    time: "28m ago",
    ai: true,
  },
  {
    id: "a3",
    name: "Marcus Bell",
    action: "shared Budget_2024.xls",
    detail: "Requested review before Friday sync.",
    time: "1h ago",
    src: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "a4",
    name: "Elena Rodriguez",
    action: "commented on Wiki",
    detail: "Added launch checklist under Security Audit.",
    time: "2h ago",
    src: "https://i.pravatar.cc/100?img=9",
  },
];

export const loopConversations = [
  {
    id: "c1",
    name: "Product Vision",
    preview: "Maya: Let's lock the Nov 15 date",
    time: "10:42 AM",
    unread: 2,
    src: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: "c2",
    name: "Elena Rodriguez",
    preview: "Sharing the Figma link now",
    time: "10:41 AM",
    src: "https://i.pravatar.cc/100?img=9",
  },
  {
    id: "c3",
    name: "Engineering",
    preview: "Jordan: Deploy window looks good",
    time: "Yesterday",
    src: "https://i.pravatar.cc/100?img=15",
  },
];

export const loopMessages = [
  {
    id: "m1",
    from: "Elena Rodriguez",
    self: false,
    text: "Can someone drop the Figma link from yesterday's review?",
    time: "10:41 AM",
  },
  {
    id: "m2",
    from: "You",
    self: true,
    text: "On it — checking the design channel.",
    time: "10:42 AM",
  },
];

export const loopParticipants = [
  {
    id: "p1",
    name: "Sarah Jenkins",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
    muted: false,
    speaking: false,
  },
  {
    id: "p2",
    name: "Marcus Bell",
    initials: "MB",
    muted: true,
    speaking: false,
  },
  {
    id: "p3",
    name: "Elena Rodriguez",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    muted: false,
    speaking: false,
  },
  {
    id: "p4",
    name: "Jordan Smith",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop",
    muted: false,
    speaking: true,
  },
  {
    id: "p5",
    name: "Kelly Lin",
    initials: "KL",
    muted: true,
    speaking: false,
  },
];

export const loopCalendarEvents = {
  8: [{ title: "Strategy Sync", time: "10:00 AM", tone: "primary" }],
  11: [{ title: "Product Launch", time: "2:00 PM", tone: "secondary" }],
  15: [{ title: "Design Review", time: "11:30 AM", tone: "primary" }],
  22: [{ title: "All Hands", time: "4:00 PM", tone: "secondary" }],
};

export const loopPosts = [
  {
    id: "post1",
    author: "Maya Chen",
    src: "https://i.pravatar.cc/100?img=5",
    time: "2h ago",
    title: "Q4 Vision Alignment",
    body: "We're locking Nov 15 for launch pending the security audit. Please review the shared roadmap and drop blockers in thread.",
    reactions: 12,
    comments: 4,
  },
  {
    id: "post2",
    author: "Jordan Smith",
    src: "https://i.pravatar.cc/100?img=15",
    time: "Yesterday",
    title: "Mobile friction findings",
    body: "Figma prototype addresses the top 3 friction points from usability testing. Walkthrough Thursday.",
    reactions: 8,
    comments: 6,
  },
];

export const loopWikiPages = [
  { id: "w1", title: "Getting Started", meta: "Updated 1d ago", icon: "menu_book" },
  { id: "w2", title: "Security Audit Checklist", meta: "Updated 3h ago", icon: "verified_user" },
  { id: "w3", title: "Launch Runbook", meta: "Updated 5h ago", icon: "rocket_launch" },
  { id: "w4", title: "Brand Guidelines", meta: "Updated 2d ago", icon: "palette" },
];

export const loopChannelTabs = [
  { id: "general", label: "General" },
  { id: "posts", label: "Posts" },
  { id: "files", label: "Files" },
  { id: "wiki", label: "Wiki" },
];
