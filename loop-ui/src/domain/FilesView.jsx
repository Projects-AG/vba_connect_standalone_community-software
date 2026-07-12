import { Button } from "../primitives/Button";
import { Icon } from "../primitives/Icon";
import { FileCard, FolderCard } from "./FileCard";

export function FilesView({
  files = [],
  folders = [],
  embedded = false,
  onUpload,
}) {
  return (
    <div
      className={`loop-entrance ${
        embedded ? "p-8" : "loop-scrollbar h-[calc(100vh-3rem)] overflow-y-auto p-8"
      }`}
    >
      <div className="mx-auto max-w-[1300px]">
        {!embedded ? (
          <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-loop-on-surface">
                Files
              </h1>
              <p className="text-sm text-loop-on-surface-variant">
                Manage and organize your team's collective knowledge.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={<Icon name="filter_list" size={18} />}>
                Filter
              </Button>
              <Button onClick={onUpload} icon={<Icon name="upload" size={18} />}>
                Upload
              </Button>
            </div>
          </section>
        ) : (
          <h2 className="mb-6 text-xl font-semibold text-loop-on-surface">Files</h2>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-loop-on-surface">
            Pinned Folders
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-base font-semibold text-loop-on-surface">
            Recent Files
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
