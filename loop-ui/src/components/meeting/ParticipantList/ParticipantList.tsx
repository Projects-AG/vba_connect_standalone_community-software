import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getPresenceVariants } from "../../../motion/motion";
import type {
  ComponentUiState,
  MeetingParticipant,
} from "../../../types/meeting";
import { ConnectionQualityBadge } from "../ConnectionQualityBadge/ConnectionQualityBadge";

export interface ParticipantListProps {
  participants: MeetingParticipant[];
  uiState?: ComponentUiState;
  onMuteParticipant?: (participantId: string) => void;
  onPinParticipant?: (participantId: string, pinned: boolean) => void;
  onClose?: () => void;
  className?: string;
  /** Mobile bottom-sheet mode */
  asSheet?: boolean;
}

export function ParticipantList({
  participants,
  uiState = "default",
  onMuteParticipant,
  onPinParticipant,
  onClose,
  className,
  asSheet = false,
}: ParticipantListProps) {
  const reduced = usePrefersReducedMotion();
  const variants = getPresenceVariants(reduced);
  const empty = uiState === "empty" || participants.length === 0;
  const loading = uiState === "loading";
  const error = uiState === "error";

  return (
    <motion.section
      {...variants}
      role="complementary"
      aria-label="Participants"
      data-state={uiState}
      className={cn(
        "flex h-full w-full flex-col border border-outline-variant/20 bg-surface-container-lowest shadow-elevation-1",
        asSheet ? "rounded-t-xl" : "rounded-xl",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-outline-variant/20 px-fv-md py-fv-sm">
        <h2 className="text-headline-md text-on-surface">
          People ({participants.length})
        </h2>
        {onClose ? (
          <button
            type="button"
            className="rounded-full p-fv-xs text-on-surface-variant transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Close participants"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </header>

      {loading ? (
        <p className="p-fv-md text-body-md text-on-surface-variant" role="status">
          Loading participants…
        </p>
      ) : null}

      {error ? (
        <p className="p-fv-md text-body-md text-error" role="alert">
          Could not load participants.
        </p>
      ) : null}

      {empty && !loading && !error ? (
        <p className="p-fv-md text-body-md text-on-surface-variant">No participants yet.</p>
      ) : null}

      {!empty && !loading && !error ? (
        <ScrollArea.Root className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea.Viewport className="custom-scrollbar h-full w-full p-fv-sm">
            <ul className="space-y-fv-xs">
              <AnimatePresence initial={false}>
                {participants.map((p) => (
                  <motion.li
                    key={p.participantId}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={
                      reduced
                        ? { duration: 0.15, ease: "linear" }
                        : { type: "spring", stiffness: 300, damping: 30 }
                    }
                    className="flex items-center gap-fv-sm rounded-lg px-fv-sm py-fv-sm hover:bg-surface-container-low focus-within:bg-surface-container-low"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-label-md text-on-secondary-container">
                      {p.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-md font-semibold text-on-surface">
                        {p.displayName}
                        {p.isLocal ? " (You)" : ""}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {p.isSpeaking ? "Speaking" : p.isMuted ? "Muted" : "In call"}
                      </p>
                    </div>
                    <ConnectionQualityBadge quality={p.connectionQuality} size="sm" />
                    <Icon
                      name={p.isMuted ? "mic_off" : "mic"}
                      size={18}
                      className="text-on-surface-variant"
                    />
                    {!p.isLocal && onMuteParticipant ? (
                      <button
                        type="button"
                        className="rounded-full p-fv-xs text-on-surface-variant hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        aria-label={`Mute ${p.displayName}`}
                        onClick={() => onMuteParticipant(p.participantId)}
                      >
                        <Icon name="voice_over_off" size={18} />
                      </button>
                    ) : null}
                    {onPinParticipant ? (
                      <button
                        type="button"
                        className="rounded-full p-fv-xs text-on-surface-variant hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        aria-pressed={p.isPinned}
                        aria-label={p.isPinned ? "Unpin" : "Pin"}
                        onClick={() =>
                          onPinParticipant(p.participantId, !p.isPinned)
                        }
                      >
                        <Icon name={p.isPinned ? "keep" : "keep_off"} size={18} filled={p.isPinned} />
                      </button>
                    ) : null}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="w-1 bg-transparent">
            <ScrollArea.Thumb className="rounded-full bg-outline-variant" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      ) : null}
    </motion.section>
  );
}
