import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import NewMeetingModal from '../components/NewMeetingModal'
import { contacts, teams, recentCalls } from '../data/mockData'
import { meetingApi } from "../services/meetingApi";

export default function CallsHub() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [scheduled, setScheduled] = useState([])
  const [toast, setToast] = useState(null)

  // const startInstant = (meeting) => {
  //   setModalOpen(false)
  //   navigate('/calls/active', { state: meeting })
  // }
  const startInstant = (meeting) => {

    setModalOpen(false);

    navigate("/calls/active", {

      state: {

        ...meeting,

        meetingId: meeting.meetingId,

        roomName: meeting.roomName,

        meetingLink: meeting.meetingLink,

      },

    });

  };

  // const scheduleMeeting = (meeting) => {
  //   setModalOpen(false)
  //   setScheduled((prev) => [{ ...meeting, id: `sched-${Date.now()}` }, ...prev])
  //   setToast(`"${meeting.title}" scheduled for ${meeting.date} at ${meeting.time}`)
  //   setTimeout(() => setToast(null), 4000)
  // }
  const scheduleMeeting = (meeting) => {

    setModalOpen(false);

    setScheduled((prev) => [

      {

        ...meeting,

        id: meeting.meetingId,

      },

      ...prev,

    ]);

    setToast("Meeting Scheduled Successfully");

    setTimeout(() => {

      setToast(null);

    }, 4000);

  };

  const quickCall1to1 = (contact) => {
    navigate('/calls/active', { state: { title: contact.name, callType: '1:1', participants: [contact] } })
  }

  const quickCallGroup = (team) => {
    navigate('/calls/active', { state: { title: team.name, callType: 'group', participants: contacts.slice(0, team.members > 4 ? 5 : team.members) } })
  }

  return (
    <div className="bg-surface">
      <TopHeader searchPlaceholder="Search people, teams, or past calls" />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex justify-between items-center px-8 h-16 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">Calls</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-headline-md shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Meeting
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto px-8 py-8 space-y-10">
              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-4 animate-content-entrance">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-4 p-6 bg-primary-container/10 border border-primary/20 rounded-2xl hover-lift text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">Meet Now</p>
                    <p className="text-body-sm text-on-surface-variant">Start an instant 1:1 or group call</p>
                  </div>
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-4 p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover-lift text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">Schedule Meeting</p>
                    <p className="text-body-sm text-on-surface-variant">Plan ahead and invite your team</p>
                  </div>
                </button>
              </div>

              {/* Scheduled meetings */}
              {scheduled.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Scheduled Meetings</h3>
                  <div className="space-y-3">
                    {scheduled.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl card-lift">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                            <span className="material-symbols-outlined text-[20px]">event_available</span>
                          </div>
                          <div>
                            <p className="font-headline-md text-headline-md text-on-surface">{m.title}</p>
                            <p className="text-body-sm text-on-surface-variant">{m.date} • {m.time} • {m.callType === '1:1' ? 'One-to-one' : `Group (${m.participants.length})`}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/calls/active', { state: m })}
                          className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-primary/5 transition-colors"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* One-to-one contacts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-on-surface">One-to-One</h3>
                  <span className="text-body-sm text-on-surface-variant">Tap to call instantly</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {contacts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => quickCall1to1(c)}
                      className="group flex flex-col items-center gap-2 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl card-lift"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
                        {c.initials ? (
                          <span className="text-headline-md font-headline-md text-on-surface-variant">{c.initials}</span>
                        ) : (
                          <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${c.status === 'online' ? 'bg-green-500' : c.status === 'away' ? 'bg-yellow-500' : 'bg-outline-variant'
                            }`}
                        />
                      </div>
                      <p className="text-body-sm text-on-surface text-center leading-tight">{c.name}</p>
                      <span className="material-symbols-outlined text-primary text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">call</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group / team calls */}
              <div className="space-y-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">Group Calls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => quickCallGroup(t)}
                      className="flex items-center gap-4 p-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl card-lift text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                        <span className="material-symbols-outlined">{t.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline-md text-headline-md text-on-surface truncate">{t.name}</p>
                        <p className="text-body-sm text-on-surface-variant truncate">{t.members} members</p>
                      </div>
                      <span className="material-symbols-outlined text-primary">call</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent calls */}
              <div className="space-y-4 pb-8">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent</h3>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
                  {recentCalls.map((rc, i) => (
                    <div
                      key={rc.id}
                      className={`flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors ${i !== recentCalls.length - 1 ? 'border-b border-outline-variant/20' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          {rc.type === '1:1' ? 'call' : 'groups'}
                        </span>
                        <div>
                          <p className="text-body-md text-on-surface">{rc.name}</p>
                          <p className="text-body-sm text-outline">{rc.time} • {rc.duration}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/calls/active', { state: { title: rc.name, callType: rc.type, participants: [] } })}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">call</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <NewMeetingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onStartInstant={startInstant}
          onSchedule={scheduleMeeting}
        />

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl text-body-md animate-content-entrance">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
