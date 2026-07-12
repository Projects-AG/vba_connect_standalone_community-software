import { useState } from "react";
import { IntegratedMeetingApp } from "./integration/IntegratedMeetingApp";
import { LoopDemo } from "./demo/LoopDemo";

/**
 * Default: backend-wired video meeting.
 * Optional: Checkpoint 1 design demo (mock only).
 */
export default function App() {
  const [mode, setMode] = useState("integrated");

  if (mode === "design") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMode("integrated")}
          className="fixed right-4 top-14 z-[60] rounded-lg bg-inverse-surface px-3 py-1.5 text-label-md text-inverse-on-surface"
        >
          Back to integrated video
        </button>
        <LoopDemo />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMode("design")}
        className="fixed right-4 top-4 z-[60] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface-variant shadow-elevation-1"
      >
        Design demo
      </button>
      <IntegratedMeetingApp />
    </div>
  );
}
