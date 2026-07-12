import { Card } from "../primitives/Card";
import { Icon } from "../primitives/Icon";

export function WikiView({
  pages = [],
  embedded = false,
  activeTitle = "Security Audit Checklist",
  content,
}) {
  const body =
    content ||
    `## Overview

Use this checklist before any production launch in LOOP.

1. Confirm API key rotation for each tenant
2. Validate LiveKit room token TTL
3. Review CORS allowlist for customer origins
4. Ensure notification persistence is healthy

## Notes

Project Phoenix targets **Nov 15**. Keep the Figma prototype linked from the Files tab.`;

  return (
    <div
      className={`loop-entrance ${
        embedded
          ? "grid gap-5 p-8 lg:grid-cols-12"
          : "loop-scrollbar grid h-[calc(100vh-3rem)] gap-5 overflow-y-auto p-8 lg:grid-cols-12"
      }`}
    >
      <aside className="space-y-2 lg:col-span-4">
        <h2 className="mb-4 text-xl font-semibold text-loop-on-surface">Wiki</h2>
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-loop-outline-variant/20 bg-loop-surface-lowest px-4 py-3 text-left transition-colors hover:bg-loop-surface-low"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-loop-primary/10 text-loop-primary">
              <Icon name={page.icon} />
            </div>
            <div>
              <p className="text-sm font-semibold text-loop-on-surface">
                {page.title}
              </p>
              <p className="text-xs text-loop-outline">{page.meta}</p>
            </div>
          </button>
        ))}
      </aside>

      <Card className="lg:col-span-8" padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-loop-primary text-white">
            <Icon name="verified_user" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-loop-on-surface">
            {activeTitle}
          </h1>
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-6 text-loop-on-surface-variant">
          {body}
        </div>
      </Card>
    </div>
  );
}
