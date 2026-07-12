import { useState } from "react";
import { WorkspaceShell } from "../shell/WorkspaceShell";
import { DashboardView } from "../domain/DashboardView";
import { CallsView } from "../domain/CallsView";
import { ChatView } from "../domain/ChatView";
import { CalendarView } from "../domain/CalendarView";
import { FilesView } from "../domain/FilesView";
import { ActivityFeed } from "../domain/ActivityFeed";
import {
  loopActivity,
  loopCalendarEvents,
  loopChannelTabs,
  loopConversations,
  loopFiles,
  loopFolders,
  loopMessages,
  loopParticipants,
  loopPeople,
  loopPosts,
  loopUser,
  loopWikiPages,
} from "../mock/mockData";

/**
 * Presentational LOOP workspace demo.
 * Uses mock data only — no API calls (ready for Core/Framework SDK later).
 */
export function LoopDemo({ initialNav = "teams" }) {
  const [activeNav, setActiveNav] = useState(initialNav);

  return (
    <WorkspaceShell
      brand="LOOP"
      activeNav={activeNav}
      onNavigate={setActiveNav}
      user={loopUser}
      notificationDot
    >
      {activeNav === "teams" ? (
        <DashboardView
          tabs={loopChannelTabs}
          people={loopPeople}
          files={loopFiles}
          activity={loopActivity}
          posts={loopPosts}
          wikiPages={loopWikiPages}
          folders={loopFolders}
          onJoinMeeting={() => setActiveNav("calls")}
        />
      ) : null}

      {activeNav === "calls" ? (
        <CallsView
          participants={loopParticipants}
          people={loopPeople}
          messages={loopMessages}
          onLeave={() => setActiveNav("teams")}
        />
      ) : null}

      {activeNav === "chat" ? (
        <ChatView
          conversations={loopConversations}
          messages={loopMessages}
        />
      ) : null}

      {activeNav === "calendar" ? (
        <CalendarView events={loopCalendarEvents} />
      ) : null}

      {activeNav === "files" ? (
        <FilesView files={loopFiles} folders={loopFolders} />
      ) : null}

      {activeNav === "activity" ? (
        <div className="loop-scrollbar h-[calc(100vh-3rem)] overflow-y-auto p-8">
          <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-loop-on-surface">
              Activity
            </h1>
            <ActivityFeed items={loopActivity} />
          </div>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}
