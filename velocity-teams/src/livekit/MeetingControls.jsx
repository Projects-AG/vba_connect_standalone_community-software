import useMeetingControls from "./useMeetingControls";

function ControlButton({ active, icon, label, onClick, highlighted }) {
  return (
    <div className="flex flex-col items-center group">
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
          highlighted
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : active
            ? "bg-surface-variant text-on-surface-variant hover:bg-outline-variant"
            : "bg-error/10 text-error hover:bg-error/20"
        }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </button>

      <span className="font-label-md text-[10px] mt-1 text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

export default function MeetingControls({
  muted,
  cameraOn,
  sharing,
  chatOpen,
  setChatOpen,
  setMuted,
  setCameraOn,
  setSharing,
  leaveCall,
}) {
  const {
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
  } = useMeetingControls({
    sharing,
    setSharing,
    setMuted,
    setCameraOn,
    leaveCall,
  });

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-dock flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl animate-content-entrance">

        <ControlButton
          active={!muted}
          icon={muted ? "mic_off" : "mic"}
          label="Mute"
          onClick={toggleMic}
        />

        <ControlButton
          active={cameraOn}
          icon={cameraOn ? "videocam" : "videocam_off"}
          label="Camera"
          onClick={toggleCamera}
        />

        <ControlButton
          active={!sharing}
          icon="screen_share"
          label="Share"
          onClick={toggleScreenShare}
          highlighted={sharing}
        />

        <div className="w-px h-8 bg-outline-variant mx-1" />

        <div className="flex flex-col items-center group">
          <button
            onClick={() => setChatOpen((v) => !v)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
              chatOpen
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-surface-variant text-on-surface-variant hover:bg-outline-variant"
            }`}
          >
            <span className="material-symbols-outlined">chat</span>
          </button>

          <span className="font-label-md text-[10px] mt-1 text-on-surface-variant">
            Chat
          </span>
        </div>

        <div className="flex flex-col items-center group">
          <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-container transition-all duration-200 active:scale-95">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </button>

          <span className="font-label-md text-[10px] mt-1 text-primary font-bold">
            Copilot
          </span>
        </div>

        <div className="flex flex-col items-center group">
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center shadow-lg shadow-error/30 hover:bg-error/90 transition-all duration-200 active:scale-95"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              call_end
            </span>
          </button>

          <span className="font-label-md text-[10px] mt-1 text-error font-bold">
            Leave
          </span>
        </div>
      </div>
    </div>
  );
}