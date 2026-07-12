import { useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getPresenceVariants } from "../../../motion/motion";
import type { ChatMessage, ComponentUiState } from "../../../types/meeting";

export interface ChatPanelProps {
  messages: ChatMessage[];
  uiState?: ComponentUiState;
  disabled?: boolean;
  onSend: (body: string) => void;
  onClose?: () => void;
  className?: string;
  asSheet?: boolean;
  title?: string;
}

export function ChatPanel({
  messages,
  uiState = "default",
  disabled = false,
  onSend,
  onClose,
  className,
  asSheet = false,
  title = "In-call Chat",
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const reduced = usePrefersReducedMotion();
  const variants = getPresenceVariants(reduced);
  const empty = uiState === "empty" || messages.length === 0;
  const loading = uiState === "loading";
  const error = uiState === "error";
  const isDisabled = disabled || uiState === "disabled";

  const submit = () => {
    const value = draft.trim();
    if (!value || isDisabled) return;
    onSend(value);
    setDraft("");
  };

  return (
    <motion.section
      {...variants}
      role="complementary"
      aria-label={title}
      data-state={uiState}
      className={cn(
        "flex h-full w-full max-w-sm flex-col border border-outline-variant/20 bg-surface-container-lowest shadow-elevation-1",
        asSheet ? "rounded-t-xl" : "rounded-xl",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-outline-variant/20 px-fv-md py-fv-sm">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        {onClose ? (
          <button
            type="button"
            className="rounded-full p-fv-xs text-on-surface-variant hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Close chat"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </header>

      <ScrollArea.Root className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea.Viewport className="custom-scrollbar h-full w-full space-y-fv-sm p-fv-md">
          {loading ? (
            <p className="text-body-md text-on-surface-variant" role="status">
              Loading messages…
            </p>
          ) : null}
          {error ? (
            <p className="text-body-md text-error" role="alert">
              Chat unavailable.
            </p>
          ) : null}
          {empty && !loading && !error ? (
            <p className="text-body-md text-on-surface-variant">No messages yet.</p>
          ) : null}
          {!empty &&
            messages.map((m) => (
              <div
                key={m.messageId}
                className={cn("flex flex-col", m.isLocal ? "items-end" : "items-start")}
              >
                <div className="mb-fv-xs flex gap-fv-xs text-body-sm text-outline">
                  <span className="font-semibold text-on-surface-variant">
                    {m.displayName}
                  </span>
                  <time dateTime={m.sentAt}>
                    {new Date(m.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-fv-sm py-fv-sm text-body-md",
                    m.isLocal
                      ? "rounded-br-sm bg-primary text-on-primary"
                      : "rounded-bl-sm bg-surface-container-low text-on-surface",
                  )}
                >
                  {m.body}
                </div>
              </div>
            ))}
        </ScrollArea.Viewport>
      </ScrollArea.Root>

      <div className="border-t border-outline-variant/20 p-fv-sm">
        <div className="flex items-center gap-fv-sm rounded-xl bg-surface-container-low px-fv-sm py-fv-sm">
          <label className="sr-only" htmlFor="loop-chat-input">
            Message
          </label>
          <input
            id="loop-chat-input"
            value={draft}
            disabled={isDisabled}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={isDisabled || !draft.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            aria-label="Send message"
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
