import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useParticipants } from "@livekit/components-react";
import NavRail from '../components/NavRail'
import LiveVideoGrid from "../livekit/LiveVideoGrid";
import useMeetingControls from "../livekit/useMeetingControls";
import MeetingControls from "../livekit/MeetingControls";
import { contacts as allContacts } from '../data/mockData'
import {
  LiveKitRoom,
  useRoomContext,
} from "@livekit/components-react";


const tileImgs = {
  c1: 'https://i.pravatar.cc/400?img=5',
  c3: 'https://i.pravatar.cc/400?img=32',
  c4: 'https://i.pravatar.cc/400?img=51',
}

function useElapsedTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}


function ParticipantsDebugger() {
  const participants = useParticipants();

  useEffect(() => {
    console.log("Participants");
    console.log(participants);
  }, [participants]);

  return null;
}

export default function ActiveCall() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const timer = useElapsedTimer()



  const meeting = state?.meeting;
  const token = state?.token;
  if (!meeting || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="bg-surface-container rounded-2xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-2">
            Invalid Meeting
          </h2>

          <p className="text-on-surface-variant mb-6">
            This meeting link is invalid or has expired.
          </p>

          <button
            onClick={() => navigate("/calls")}
            className="bg-primary text-white px-6 py-3 rounded-xl"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  const participant = state?.participant;

  useEffect(() => {
    console.log("Location State");
    console.log(state);

    console.log("Meeting");
    console.log(meeting);

    console.log("Token");
    console.log(token);

    console.log("Participant");
    console.log(participant);
  }, []);

  useEffect(() => {
    if (token) {
      console.log("LiveKit Token");
      console.log(token);
    }
  }, [token]);

  const participants = allContacts.filter((c) =>
    meeting.participants?.includes(c.name)
  );

  const [muted, setMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, from: 'Elena Rodriguez', mine: false, time: '10:41 AM', text: 'Has anyone checked the latest Figma file for the Q4 deck?' },
    { id: 2, from: 'You', mine: true, time: '10:42 AM', text: 'Yes, I just reviewed it. Looks great!' },
  ])
  const [draft, setDraft] = useState('')

  const sendMessage = () => {
    if (!draft.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'You', mine: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: draft.trim() },
    ])
    setDraft('')
  }

  const leaveCall = () => navigate('/calls')

  // const {
  //   toggleMic,
  //   toggleCamera,
  //   toggleScreenShare,
  //   endCall,
  // } = useMeetingControls({
  //   sharing,
  //   setSharing,
  //   setMuted,
  //   setCameraOn,
  //   leaveCall,
  // });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NavRail />
      <main className="ml-20 flex-1 flex flex-col bg-surface overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex justify-between items-center px-8 h-16 w-full bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">
              {meeting.meetingTitle}
            </h1>
            <div className="flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-error rounded-full" />
              <span className="font-label-md text-label-md">{timer}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((p) => (
                <div key={p.id} className="w-8 h-8 rounded-full border-2 border-surface overflow-hidden">
                  <img className="w-full h-full object-cover" src={p.avatar} alt={p.name} />
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container border-2 border-surface flex items-center justify-center text-[10px] font-bold">
                  +{participants.length - 3}
                </div>
              )}
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Video & Chat Content Area */}
        <div className="flex-1 flex px-8 pb-32 pt-4 gap-6 overflow-hidden">
          {token && (
            <LiveKitRoom
              serverUrl={import.meta.env.VITE_LIVEKIT_URL}
              token={token}
              connect
              video
              audio
              className="flex-1"
            >

              <ParticipantsDebugger />
              <LiveVideoGrid cameraOn={cameraOn} />
              {/* <LiveVideoGrid cameraOn={cameraOn} /> */}

              {/* Right Sidebar: Chat */}
              {chatOpen && (
                <aside className="w-80 bg-surface-container-lowest rounded-2xl flex flex-col shadow-xl ring-1 ring-outline-variant/10 animate-content-entrance">
                  {/* <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                    <h2 className="font-headline-md text-headline-md font-bold">In-call Chat</h2>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                  </div> */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {messages.map((m) =>
                      m.mine ? (
                        <div key={m.id} className="space-y-1 flex flex-col items-end">
                          <div className="flex justify-between items-baseline w-full">
                            <span className="text-[10px] text-outline">{m.time}</span>
                            <span className="font-label-md text-label-md text-primary font-bold">You</span>
                          </div>
                          <div className="bg-primary-container text-white p-3 rounded-xl rounded-tr-none font-body-md text-body-md max-w-[85%]">
                            {m.text}
                          </div>
                        </div>
                      ) : (
                        <div key={m.id} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-label-md text-label-md text-on-surface-variant font-bold">{m.from}</span>
                            <span className="text-[10px] text-outline">{m.time}</span>
                          </div>
                          <div className="bg-surface-container text-on-surface p-3 rounded-xl rounded-tl-none font-body-md text-body-md max-w-[85%]">
                            {m.text}
                          </div>
                        </div>
                      )
                    )}

                    {/* AI Copilot Suggestion */}
                    {/* <div className="bg-surface-container-low border border-primary/20 rounded-xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="font-label-md text-label-md font-bold">AI Copilot</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Elena mentioned a Figma link. Would you like me to find the most recent 'Q4 Roadmap' link in your shared drive?
                      </p>
                      <button className="w-full py-2 bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-primary-container/5 transition-colors">
                        Search Links
                      </button>
                    </div> */}
                  </div>
                  <div className="p-4 border-t border-outline-variant">
                    <div className="relative">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="w-full bg-surface-container border-none rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-body-md"
                        placeholder="Type a message..."
                        type="text"
                      />
                      <button
                        onClick={sendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                </aside>
              )}
              <MeetingControls
                muted={muted}
                cameraOn={cameraOn}
                sharing={sharing}
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                setMuted={setMuted}
                setCameraOn={setCameraOn}
                setSharing={setSharing}
                leaveCall={leaveCall}
              />
            </LiveKitRoom>
          )}
        </div>

      </main>
    </div>
  )
}

function ControlButton({ active, icon, label, onClick, highlighted }) {
  return (
    <div className="flex flex-col items-center group">
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${highlighted
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : active
            ? 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant'
            : 'bg-error/10 text-error hover:bg-error/20'
          }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </button>
      <span className="font-label-md text-[10px] mt-1 text-on-surface-variant">{label}</span>
    </div>
  )
}

function VideoTile({ person, speaking }) {
  const img = person.avatar
  const useAvatar = person.initials || person.status === 'offline'

  if (useAvatar) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center shadow-lg ring-1 ring-outline-variant/10">
        <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="text-headline-xl font-headline-xl text-on-secondary-container">
            {person.initials || person.name?.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-on-background/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10">
          <span className="material-symbols-outlined text-[16px]">mic_off</span>
          <span className="font-label-md text-label-md">{person.name}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-on-background shadow-lg ring-1 ${speaking ? 'ring-2 ring-primary' : 'ring-outline-variant/10'
        }`}
    >
      <img className="w-full h-full object-cover" src={img} alt={person.name} />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-on-background/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10">
        <span className="material-symbols-outlined text-[16px]">mic</span>
        <span className="font-label-md text-label-md">{person.name}</span>
      </div>
      {speaking && (
        <div className="absolute top-3 right-3 bg-primary text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Speaking</div>
      )}
    </div>
  )
}

