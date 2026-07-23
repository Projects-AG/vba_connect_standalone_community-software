import { useAuth } from '../auth/AuthContext'

export default function TopHeader({ searchPlaceholder = 'Search for files, people, or gists' }) {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-margin-desktop h-12 bg-surface border-b border-outline-variant/30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="Velocity"
          className="h-14 w-auto object-contain"
        />

        <div className="ml-8 relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline scale-75">
            search
          </span>

          <input
            className="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-1 text-body-sm w-96 focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-highest rounded-full transition-colors duration-200">
          <span className="material-symbols-outlined text-on-surface-variant">help</span>
        </button>
        <button className="p-2 hover:bg-surface-container-highest rounded-full transition-colors duration-200 relative">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="p-2 hover:bg-surface-container-highest rounded-full transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-on-surface-variant">logout</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container">
            <img className="w-full h-full object-cover" src={user?.avatar} alt={user?.name || 'User'} />
          </div>
          <span className="hidden sm:block text-label-md text-on-surface max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  )
}
