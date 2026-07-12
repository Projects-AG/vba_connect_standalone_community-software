import { useState } from "react";
import { Avatar } from "../primitives/Avatar";
import { Icon } from "../primitives/Icon";
import { Input } from "../primitives/Input";

export function ChatView({
  conversations = [],
  messages = [],
  activeId,
  onSelect,
}) {
  const [selected, setSelected] = useState(activeId || conversations[0]?.id);
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState(messages);
  const active = conversations.find((c) => c.id === selected) || conversations[0];

  const send = () => {
    const value = draft.trim();
    if (!value) return;
    setThread((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        from: "You",
        self: true,
        text: value,
        time: "Now",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      <section className="flex w-full max-w-sm flex-col border-r border-loop-outline-variant/20 bg-loop-surface-lowest md:w-96">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-loop-on-surface">Messages</h2>
          <Icon name="edit_square" className="cursor-pointer text-loop-primary" />
        </div>
        <div className="px-4 pb-4">
          <Input icon="search" placeholder="Search conversations..." />
        </div>
        <div className="loop-scrollbar flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const activeConvo = convo.id === selected;
            return (
              <button
                key={convo.id}
                type="button"
                onClick={() => {
                  setSelected(convo.id);
                  onSelect?.(convo.id);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeConvo
                    ? "bg-loop-primary/5"
                    : "hover:bg-loop-surface-low"
                }`}
              >
                <Avatar src={convo.src} name={convo.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-loop-on-surface">
                      {convo.name}
                    </p>
                    <span className="shrink-0 text-[11px] text-loop-outline">
                      {convo.time}
                    </span>
                  </div>
                  <p className="truncate text-xs text-loop-on-surface-variant">
                    {convo.preview}
                  </p>
                </div>
                {convo.unread ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-loop-primary px-1 text-[10px] font-bold text-white">
                    {convo.unread}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex min-w-0 flex-1 flex-col bg-loop-surface">
        <div className="flex items-center justify-between border-b border-loop-outline-variant/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar src={active?.src} name={active?.name} />
            <div>
              <h3 className="text-base font-semibold text-loop-on-surface">
                {active?.name}
              </h3>
              <p className="text-xs text-loop-outline">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-loop-on-surface-variant">
            <button type="button" className="rounded-full p-2 hover:bg-loop-surface-high">
              <Icon name="videocam" />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-loop-surface-high">
              <Icon name="call" />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-loop-surface-high">
              <Icon name="more_vert" />
            </button>
          </div>
        </div>

        <div className="loop-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
          {thread.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.self ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  message.self
                    ? "rounded-br-md bg-loop-primary text-white"
                    : "rounded-bl-md bg-loop-surface-low text-loop-on-surface"
                }`}
              >
                <p>{message.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    message.self ? "text-white/70" : "text-loop-outline"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-loop-outline-variant/20 p-4">
          <div className="flex items-center gap-2 rounded-xl bg-loop-surface-low px-3 py-2">
            <button type="button" className="text-loop-outline">
              <Icon name="attach_file" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={send}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-loop-primary text-white"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
