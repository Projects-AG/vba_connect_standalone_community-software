import { useState } from "react";
import { Button } from "../primitives/Button";
import { Icon } from "../primitives/Icon";
import { ChannelTabs } from "../shell/ChannelTabs";
import { ActivityFeed } from "./ActivityFeed";
import { FileCard } from "./FileCard";
import { FocusCard } from "./FocusCard";
import { AmbientToast, InsightBanner } from "./InsightBanner";
import { PostsView } from "./PostsView";
import { WikiView } from "./WikiView";
import { FilesView } from "./FilesView";

export function DashboardView({
  channel = {
    title: "Product Vision Sync",
    subtitle: "Project Phoenix • Internal Strategy",
  },
  tabs,
  people,
  files,
  activity,
  posts,
  wikiPages,
  folders,
  onJoinMeeting,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [showToast, setShowToast] = useState(true);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-loop-outline-variant/30 px-8 pb-2 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-loop-primary text-white">
              <Icon name="rocket_launch" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-loop-on-surface">
                {channel.title}
              </h1>
              <p className="text-xs text-loop-outline">{channel.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onJoinMeeting}
              icon={<Icon name="video_call" size={18} />}
            >
              Join Meeting
            </Button>
            <button
              type="button"
              className="rounded-lg border border-loop-outline-variant p-2 text-loop-on-surface-variant hover:bg-loop-surface-container"
              aria-label="More options"
            >
              <Icon name="more_horiz" />
            </button>
          </div>
        </div>

        <ChannelTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          onAdd={() => {}}
        />
      </div>

      <div className="loop-scrollbar flex-1 overflow-y-auto bg-loop-surface-low/50">
        {activeTab === "general" ? (
          <div className="mx-auto max-w-6xl space-y-8 p-8">
            <InsightBanner />
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 space-y-5 lg:col-span-8">
                <FocusCard people={people} onJoin={onJoinMeeting} />
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-loop-on-surface">
                      Shared Library
                    </h2>
                    <button
                      type="button"
                      className="text-xs font-semibold tracking-wide text-loop-primary uppercase"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {files.map((file) => (
                      <FileCard key={file.id} file={file} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <ActivityFeed items={activity} />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "posts" ? <PostsView posts={posts} embedded /> : null}
        {activeTab === "files" ? (
          <FilesView files={files} folders={folders} embedded />
        ) : null}
        {activeTab === "wiki" ? <WikiView pages={wikiPages} embedded /> : null}
      </div>

      {showToast ? (
        <AmbientToast
          onConfirm={() => setShowToast(false)}
          onDismiss={() => setShowToast(false)}
        />
      ) : null}
    </div>
  );
}
