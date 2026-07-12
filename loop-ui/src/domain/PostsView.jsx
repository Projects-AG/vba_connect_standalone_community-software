import { Avatar } from "../primitives/Avatar";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Icon } from "../primitives/Icon";

export function PostsView({ posts = [], embedded = false }) {
  return (
    <div
      className={`loop-entrance mx-auto max-w-3xl space-y-5 ${
        embedded ? "p-8" : "loop-scrollbar h-[calc(100vh-3rem)] overflow-y-auto p-8"
      }`}
    >
      {!embedded ? (
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-loop-on-surface">
            Posts
          </h1>
          <Button icon={<Icon name="edit" size={18} />}>New Post</Button>
        </div>
      ) : null}

      {posts.map((post) => (
        <Card key={post.id} lift>
          <div className="mb-4 flex items-center gap-3">
            <Avatar src={post.src} name={post.author} />
            <div>
              <p className="text-sm font-semibold text-loop-on-surface">
                {post.author}
              </p>
              <p className="text-xs text-loop-outline">{post.time}</p>
            </div>
          </div>
          <h3 className="mb-2 text-base font-semibold text-loop-on-surface">
            {post.title}
          </h3>
          <p className="mb-4 text-sm leading-6 text-loop-on-surface-variant">
            {post.body}
          </p>
          <div className="flex items-center gap-4 text-loop-on-surface-variant">
            <button type="button" className="flex items-center gap-1 text-xs font-semibold">
              <Icon name="thumb_up" size={16} />
              {post.reactions}
            </button>
            <button type="button" className="flex items-center gap-1 text-xs font-semibold">
              <Icon name="chat_bubble" size={16} />
              {post.comments}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
