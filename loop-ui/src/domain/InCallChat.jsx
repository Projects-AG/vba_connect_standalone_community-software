import { useState } from "react";
import { Button } from "../primitives/Button";
import { Icon } from "../primitives/Icon";

export function InCallChat({
  messages = [],
  onSend,
  onClose,
  title = "In-call Chat",
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const value = draft.trim();
    if (!value) return;
    onSend?.(value);
    setDraft("");
  };

  return (
    <aside className="flex h-full w-full max-w-sm flex-col rounded-2xl border border-loop-outline-variant/20 bg-loop-surface-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-loop-outline-variant/20 px-4 py-3">
        <h3 className="text-base font-semibold text-loop-on-surface">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-loop-on-surface-variant hover:bg-loop-surface-high"
          aria-label="Close chat"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="loop-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.self ? "items-end" : "items-start"}`}
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-loop-outline">
              <span className="font-semibold text-loop-on-surface-variant">
                {message.from}
              </span>
              <span>{message.time}</span>
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                message.self
                  ? "rounded-br-md bg-loop-primary text-white"
                  : "rounded-bl-md bg-loop-surface-low text-loop-on-surface"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-loop-primary/10 bg-loop-primary/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-loop-primary">
            <Icon name="auto_awesome" size={18} />
            <span className="text-xs font-semibold">LOOP Copilot</span>
          </div>
          <p className="mb-3 text-xs text-loop-on-surface-variant">
            Someone mentioned a Figma link. Want me to find it in recent
            messages?
          </p>
          <Button size="sm" variant="secondary" className="bg-white">
            Search Links
          </Button>
        </div>
      </div>

      <div className="border-t border-loop-outline-variant/20 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-loop-surface-low px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-loop-outline"
          />
          <button
            type="button"
            onClick={submit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-loop-primary text-white"
            aria-label="Send"
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
