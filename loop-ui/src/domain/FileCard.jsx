import { Icon } from "../primitives/Icon";

export function FileCard({ file, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="loop-card-lift flex w-full flex-col rounded-xl border border-loop-outline-variant/20 bg-loop-surface-lowest p-4 text-left shadow-[0px_2px_4px_rgba(0,0,0,0.04)]"
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${file.color}`}
      >
        <Icon name={file.icon} size={28} filled />
      </div>
      <p className="truncate text-sm font-semibold text-loop-on-surface">
        {file.name}
      </p>
      <p className="mt-1 text-xs text-loop-on-surface-variant">{file.edited}</p>
    </button>
  );
}

export function FolderCard({ folder, onClick }) {
  const tones = {
    primary: "bg-loop-primary/10 text-loop-primary",
    secondary: "bg-loop-secondary-container/40 text-loop-secondary",
    error: "bg-loop-error-container text-loop-error",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="loop-card-lift group w-full rounded-xl border border-loop-outline-variant/10 bg-loop-surface-lowest p-6 text-left shadow-[0px_2px_4px_rgba(0,0,0,0.04)]"
    >
      <div className="mb-6 flex items-start justify-between">
        <div className={`rounded-lg p-3 ${tones[folder.tone] || tones.primary}`}>
          <Icon name={folder.icon} size={32} filled />
        </div>
        <Icon
          name="more_vert"
          className="text-loop-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <h3 className="mb-1 text-base font-semibold text-loop-on-surface">
        {folder.name}
      </h3>
      <p className="text-xs text-loop-on-surface-variant">{folder.meta}</p>
    </button>
  );
}
