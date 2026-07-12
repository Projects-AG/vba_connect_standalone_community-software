import { useState } from "react";
import { AvatarStack } from "../primitives/Avatar";
import { Icon } from "../primitives/Icon";
import { AiSummaryCard, ParticipantTile } from "./ParticipantTile";
import { CallControlBar } from "./CallControlBar";
import { InCallChat } from "./InCallChat";

export function CallsView({
  title = "Weekly Alignment: Q4 Roadmap",
  duration = "00:42:15",
  participants = [],
  people = [],
  messages = [],
  onLeave,
}) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [localMessages, setLocalMessages] = useState(messages);

  const handleAction = (id) => {
    if (id === "mute") setMuted((v) => !v);
    if (id === "camera") setCameraOff((v) => !v);
    if (id === "leave") onLeave?.();
    if (id === "copilot") setChatOpen(true);
  };

  return (
    <div className="relative flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <header className="flex h-16 items-center justify-between px-8">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-black tracking-tight text-loop-on-surface">
            {title}
          </h1>
          <div className="flex items-center gap-2 rounded-full bg-loop-error-container px-3 py-1 text-loop-on-error-container">
            <span className="h-2 w-2 animate-pulse rounded-full bg-loop-error" />
            <span className="text-xs font-semibold tracking-wide">{duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AvatarStack people={people} max={3} />
          <button
            type="button"
            onClick={() => setChatOpen((v) => !v)}
            className="rounded-full p-2 hover:bg-loop-surface-high"
            aria-label="Toggle chat"
          >
            <Icon name="chat" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-loop-surface-high"
            aria-label="More"
          >
            <Icon name="more_vert" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden px-8 pb-32 pt-2">
        <div className="loop-entrance grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {participants.slice(0, 3).map((p) => (
            <ParticipantTile key={p.id} {...p} />
          ))}
          <AiSummaryCard />
          {participants.slice(3).map((p) => (
            <ParticipantTile key={p.id} {...p} />
          ))}
        </div>

        {chatOpen ? (
          <InCallChat
            messages={localMessages}
            onClose={() => setChatOpen(false)}
            onSend={(text) =>
              setLocalMessages((prev) => [
                ...prev,
                {
                  id: `local-${Date.now()}`,
                  from: "You",
                  self: true,
                  text,
                  time: "Now",
                },
              ])
            }
          />
        ) : null}
      </div>

      <CallControlBar
        muted={muted}
        cameraOff={cameraOff}
        onAction={handleAction}
      />
    </div>
  );
}
