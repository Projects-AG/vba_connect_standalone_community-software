import { useState } from 'react'
import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'
import { posts as initialPosts, currentUser } from '../data/mockData'

export default function Posts() {
  const [posts, setPosts] = useState(initialPosts)
  const [draft, setDraft] = useState('')
  const [liked, setLiked] = useState({})

  const submitPost = () => {
    if (!draft.trim()) return
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        author: currentUser.name,
        role: 'You',
        time: 'Just now',
        avatar: currentUser.avatar,
        body: draft.trim(),
        likes: 0,
        comments: 0,
      },
      ...prev,
    ])
    setDraft('')
  }

  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="bg-surface min-h-screen">
      <TopHeader searchPlaceholder="Search posts, files, or teams..." />
      <div className="flex pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar bg-surface-container-low/50">
          <div className="max-w-[1440px] mx-auto px-margin-desktop py-xl">
            {/* Header & Filters */}
            <div className="flex justify-between items-end mb-lg animate-fluid-entrance">
              <div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface">Team Posts</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                  Centralized hub for Velocity's Design and Engineering updates.
                </p>
              </div>
              <div className="flex gap-sm">
                <button className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover-lift">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
                <button
                  onClick={() => document.getElementById('post-composer')?.focus()}
                  className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover-lift active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Post
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-gutter">
              {/* Feed Column */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-lg">
                {/* Composer */}
                <div className="bg-surface-container-lowest rounded-xl p-lg card-shadow border border-outline-variant/10 animate-fluid-entrance">
                  <div className="flex gap-md">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" src={currentUser.avatar} alt="" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        id="post-composer"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-body-lg resize-none min-h-[40px] p-0 mb-sm"
                        placeholder="Share an update with Velocity Teams..."
                        rows={1}
                      />
                      <div className="flex justify-between items-center pt-sm border-t border-outline-variant/10">
                        <div className="flex gap-xs">
                          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">image</span>
                          </button>
                          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">attach_file</span>
                          </button>
                          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                          </button>
                        </div>
                        <button
                          onClick={submitPost}
                          disabled={!draft.trim()}
                          className={`px-md py-xs font-label-md text-label-md rounded-lg transition-all ${
                            draft.trim() ? 'bg-primary text-on-primary hover-lift' : 'bg-primary/10 text-primary opacity-50 cursor-not-allowed'
                          }`}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts */}
                {posts.map((post) => (
                  <article key={post.id} className="bg-surface-container-lowest rounded-xl p-lg card-shadow hover-lift animate-fluid-entrance border border-outline-variant/10">
                    <header className="flex justify-between items-start mb-md">
                      <div className="flex gap-md">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant/20">
                          <img className="w-full h-full object-cover" src={post.avatar} alt={post.author} />
                        </div>
                        <div>
                          <div className="flex items-center gap-xs">
                            <span className="font-headline-md text-headline-md text-on-surface">{post.author}</span>
                            {post.isAdmin && (
                              <span className="px-2 py-[2px] bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase font-bold rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {post.time} {post.role ? `• ${post.role}` : ''}
                          </span>
                        </div>
                      </div>
                      <button className="material-symbols-outlined text-outline">more_horiz</button>
                    </header>

                    <div className="mb-lg">
                      <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{post.body}</p>
                    </div>

                    {post.attachment && (
                      <div className="rounded-lg overflow-hidden border border-outline-variant/20 mb-lg">
                        <div className="p-md bg-surface-container-low flex justify-between items-center">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary">description</span>
                            <span className="font-label-md text-label-md text-on-surface">{post.attachment.name}</span>
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{post.attachment.size}</span>
                        </div>
                      </div>
                    )}

                    {post.reply && (
                      <div className="pl-md border-l-2 border-primary/20 flex flex-col gap-md mb-lg">
                        <div className="flex gap-sm items-start">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img className="w-full h-full object-cover" src={post.reply.avatar} alt="" />
                          </div>
                          <div className="bg-surface-container px-md py-sm rounded-lg flex-1">
                            <div className="flex justify-between items-center mb-xs">
                              <span className="font-label-md text-label-md text-on-surface">{post.reply.author}</span>
                              <span className="text-[10px] text-on-surface-variant">{post.reply.time}</span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant">{post.reply.body}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <footer className="flex items-center gap-lg pt-md border-t border-outline-variant/10">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-xs font-label-md text-label-md transition-colors ${
                          liked[post.id] ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={liked[post.id] ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          favorite
                        </span>
                        {post.likes + (liked[post.id] ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">forum</span>
                        {post.comments}
                      </button>
                      {post.attachment && (
                        <button className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors ml-auto">
                          <span className="material-symbols-outlined text-[18px]">share</span>
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>

              {/* Sidebar */}
              <div className="hidden lg:col-span-4 lg:flex flex-col gap-lg">
                <section className="bg-surface-container-lowest rounded-xl p-lg card-shadow border border-outline-variant/10 animate-fluid-entrance">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Team Activity</h3>
                  <div className="space-y-md">
                    <div className="flex justify-between items-center">
                      <span className="font-body-md text-body-md text-on-surface-variant">Daily Active Posts</span>
                      <span className="font-label-md text-label-md text-primary">+12%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-md text-body-md text-on-surface-variant">Engagement Rate</span>
                      <span className="font-label-md text-label-md text-on-surface">88%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl p-lg card-shadow border border-outline-variant/10 animate-fluid-entrance">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Trending in Velocity</h3>
                  <div className="flex flex-wrap gap-sm">
                    {['#v2-release', '#animation-tokens', '#design-sync', '#figma-plugin', '#workflow-hacks'].map((tag) => (
                      <span
                        key={tag}
                        className="px-md py-xs bg-surface-container-high rounded-full font-label-md text-label-md text-on-surface-variant cursor-pointer hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl p-lg card-shadow border border-outline-variant/10 animate-fluid-entrance">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Recommended Colleagues</h3>
                  <div className="flex flex-col gap-md">
                    {[
                      { name: 'Maya Patel', role: 'Backend Engineer', avatar: 'https://i.pravatar.cc/150?img=25' },
                      { name: 'Marcus Thorne', role: 'Operations Lead', avatar: 'https://i.pravatar.cc/150?img=15' },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img className="w-full h-full object-cover" src={p.avatar} alt={p.name} />
                          </div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">{p.name}</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">{p.role}</div>
                          </div>
                        </div>
                        <button className="material-symbols-outlined text-primary hover:bg-primary/10 rounded-full p-1 transition-colors">
                          person_add
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
