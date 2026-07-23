import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { contacts, files } from '../data/mockData'

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'posts', label: 'Posts' },
  { id: 'files', label: 'Files' },
  { id: 'wiki', label: 'Wiki' },
]

export default function Dashboard() {
  const [active, setActive] = useState('general')
  const [toastVisible, setToastVisible] = useState(true)
  const navigate = useNavigate()

  return (
    <div className="bg-surface">
      <TopHeader />
      <div className="flex h-screen pt-12">
      <NavRail withTopOffset />
      <main className="ml-20 flex-1 flex flex-col overflow-hidden">
        {/* Channel Header & Tabs */}
        <div className="px-8 pt-6 pb-2 border-b border-outline-variant/30 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-headline-xl">rocket_launch</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Product Vision Sync</h1>
                <p className="text-body-sm text-outline">Project Phoenix • Internal Strategy</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/calls/active', { state: { title: 'Product Vision Sync', callType: 'group', participants: [] } })}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-headline-md hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined scale-90">video_call</span>
                Join Meeting
              </button>
              <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex items-center gap-8 mt-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`pb-3 font-headline-md transition-colors relative ${
                  active === t.id ? 'text-primary' : 'text-outline hover:text-on-surface'
                }`}
              >
                {t.label}
                {active === t.id && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
            <button className="ml-auto pb-3 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined scale-75">add</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-low/50">
          {active === 'general' && <GeneralTab navigate={navigate} />}
          {active === 'posts' && <PostsPlaceholder navigate={navigate} />}
          {active === 'files' && <FilesTab />}
          {active === 'wiki' && <WikiTab />}
        </div>
      </main>

      {/* Contextual FAB */}
      <button
        onClick={() => navigate('/chat')}
        className="fixed right-margin-desktop bottom-margin-desktop w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined">chat</span>
      </button>

      {/* Bottom Toast (AI Ambient Insight) */}
      {toastVisible && (
        <div className="fixed bottom-margin-desktop left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-content-entrance">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary-fixed-dim">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div className="flex-1">
            <p className="text-body-md font-bold">Ambient Insight</p>
            <p className="text-body-sm opacity-80">You have a focus block starting in 2 hours. Mute notifications?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setToastVisible(false)} className="px-4 py-2 bg-primary rounded-lg text-on-primary text-label-md font-label-md">
              Yes
            </button>
            <button onClick={() => setToastVisible(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg text-label-md font-label-md">
              Maybe later
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function GeneralTab({ navigate }) {
  return (
    <div className="tab-content p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* AI Dashboard Brief */}
        <div className="bg-primary/5 border border-primary-container/20 rounded-2xl p-6 flex gap-6 items-center shadow-sm">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-headline-xl">auto_awesome</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-md text-on-surface">Ambient Workspace Insights</h3>
            <p className="text-body-md text-on-surface-variant">
              The Q4 roadmap is 85% aligned. Maya uploaded the latest Figma prototype which addresses mobile friction. 3 tasks need your review.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-on-primary-fixed-variant text-on-primary rounded-xl font-headline-md hover:bg-primary transition-all">
            Review Sync
          </button>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Left content */}
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 card-lift">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-label-md font-label-md">
                    TODAY'S FOCUS
                  </div>
                  <span className="text-body-sm text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-body-sm">schedule</span>
                    Starts in 12 mins
                  </span>
                </div>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mb-2">Q4 Product Vision Sync</h2>
              <p className="text-body-md text-outline mb-6">
                Discussing the roadmap for Ambient Workspace features and AI integration layers for the next fiscal quarter.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img className="w-full h-full object-cover" src={contacts[0].avatar} alt="" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img className="w-full h-full object-cover" src={contacts[2].avatar} alt="" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                    +8
                  </div>
                  <span className="pl-4 text-body-sm text-outline self-center">11 participants attending</span>
                </div>
                <button
                  onClick={() => navigate('/calls/active', { state: { title: 'Q4 Product Vision Sync', callType: 'group', participants: [] } })}
                  className="text-primary font-headline-md hover:underline decoration-2 underline-offset-4"
                >
                  Reschedule
                </button>
              </div>
            </div>

            {/* Shared Library */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-on-surface">Shared Library</h3>
                <button className="text-primary text-label-md font-label-md uppercase tracking-wider">View All</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <LibraryCard icon="description" iconBg="bg-red-50" iconColor="text-red-500" name="Q4_Roadmap.pdf" meta="Edited 2h ago" />
                <LibraryCard icon="article" iconBg="bg-blue-50" iconColor="text-blue-500" name="Sprint_Brief.docx" meta="Edited 5h ago" />
                <LibraryCard icon="table_chart" iconBg="bg-green-50" iconColor="text-green-500" name="Budget_2024.xls" meta="Yesterday" />
                <LibraryCard icon="slideshow" iconBg="bg-purple-50" iconColor="text-purple-500" name="Brand_Deck.pptx" meta="Oct 12" />
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-surface-container rounded-2xl p-6 h-full border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-on-surface">Recent Activity</h3>
                <span className="flex items-center gap-1.5 text-label-md text-primary font-label-md">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
              </div>
              <div className="space-y-4">
                <ActivityItem
                  avatar={contacts[0].avatar}
                  text={<><span className="font-bold">Sarah</span> updated the <span className="text-primary font-bold">Q4 specs</span></>}
                  quote='"Revised the mobile responsiveness requirements for the dashboard."'
                  time="12m ago"
                />
                <ActivityItem
                  icon="auto_awesome"
                  text={<><span className="font-bold">AI Assistant</span> summarized <span className="text-primary font-bold">Design Sync</span></>}
                  quote="3 key takeaways generated from the morning huddle."
                  time="1h ago"
                />
                <ActivityItem
                  avatar={contacts[5].avatar}
                  text={<><span className="font-bold">David</span> shared <span className="text-primary font-bold">API Documentation</span></>}
                  quote="New endpoints for workspace ambient triggers."
                  time="3h ago"
                />
              </div>
              <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 border border-outline-variant/30 rounded-xl text-on-surface-variant font-headline-md hover:bg-surface-container-high transition-colors">
                View All Activity
                <span className="material-symbols-outlined scale-75">history</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LibraryCard({ icon, iconBg, iconColor, name, meta }) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 card-lift flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-headline-md text-on-surface truncate">{name}</p>
        <p className="text-body-sm text-outline">{meta}</p>
      </div>
    </div>
  )
}

function ActivityItem({ avatar, icon, text, quote, time }) {
  return (
    <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm flex gap-4">
      <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center">
        {avatar ? (
          <img className="w-full h-full object-cover" src={avatar} alt="" />
        ) : (
          <span className="material-symbols-outlined text-primary scale-75">{icon}</span>
        )}
      </div>
      <div>
        <p className="text-body-md text-on-surface">{text}</p>
        {quote && <p className="text-body-sm text-outline mt-1 italic">{quote}</p>}
        <p className="text-body-sm text-outline mt-2">{time}</p>
      </div>
    </div>
  )
}

function PostsPlaceholder({ navigate }) {
  return (
    <div className="tab-content p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-outline text-6xl opacity-20">forum</span>
          <h2 className="font-headline-xl text-on-surface mt-4">Start a Conversation</h2>
          <p className="text-body-lg text-outline">Post updates, ask questions, or start a thread for the team.</p>
          <button
            onClick={() => navigate('/posts')}
            className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-xl font-headline-md shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            New Post
          </button>
        </div>
      </div>
    </div>
  )
}

function FilesTab() {
  return (
    <div className="tab-content p-8">
      <div className="max-w-6xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-surface-container-low text-on-surface rounded-lg font-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined scale-75">upload</span>
              Upload
            </button>
            <button className="px-4 py-2 border border-outline-variant rounded-lg font-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined scale-75">add</span>
              New
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 text-primary bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-label-md text-outline uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Modified</th>
              <th className="px-6 py-3 font-semibold">Author</th>
              <th className="px-6 py-3 font-semibold">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {files.map((f) => (
              <tr key={f.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    {f.type === 'folder' ? 'folder' : f.type === 'pdf' ? 'picture_as_pdf' : f.type === 'sheet' ? 'table_chart' : 'article'}
                  </span>
                  <span className="font-headline-md">{f.name}</span>
                </td>
                <td className="px-6 py-4 text-body-md text-outline">{f.modified}</td>
                <td className="px-6 py-4 text-body-md text-outline">{f.author}</td>
                <td className="px-6 py-4 text-body-md text-outline">{f.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WikiTab() {
  return (
    <div className="tab-content p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-headline-xl font-bold mb-6">Team Knowledge Base</h1>
        <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
          Welcome to the Product Vision Wiki. Here you'll find our core principles, architectural diagrams, and historical context for
          Project Phoenix. This space is collaboratively maintained.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="p-6 border border-outline-variant/30 rounded-2xl hover:border-primary transition-all group cursor-pointer">
            <h3 className="font-headline-lg mb-2 group-hover:text-primary transition-colors">Onboarding Guide</h3>
            <p className="text-body-sm text-outline">Get up to speed with our tech stack and team rituals in under 30 minutes.</p>
          </div>
          <div className="p-6 border border-outline-variant/30 rounded-2xl hover:border-primary transition-all group cursor-pointer">
            <h3 className="font-headline-lg mb-2 group-hover:text-primary transition-colors">Design Tokens</h3>
            <p className="text-body-sm text-outline">Reference our visual language, spacing models, and typography hierarchy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
