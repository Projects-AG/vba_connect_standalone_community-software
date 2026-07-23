import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const items = [
  { to: '/activity', icon: 'notifications', label: 'Activity' },
  { to: '/chat', icon: 'chat', label: 'Chat' },
  { to: '/teams', icon: 'groups', label: 'Teams' },
  { to: '/calendar', icon: 'calendar_today', label: 'Calendar' },
  { to: '/calls', icon: 'call', label: 'Calls' },
]

export default function NavRail({ withTopOffset = false }) {
  const { user } = useAuth()

  return (
    <nav
      className={`fixed left-0 z-40 border-r border-outline-variant bg-surface-container-low flex flex-col items-center py-4 w-20 ${
        withTopOffset ? 'top-12 bottom-0' : 'top-0 h-full'
      }`}
    >
      {!withTopOffset && (
        <div className="mb-8">
          <span className="text-headline-md font-headline-md font-bold text-primary">V</span>
        </div>
      )}
      <div className="flex flex-col gap-4 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 active:scale-90 ${
                isActive
                  ? "bg-primary-container text-on-primary-container after:absolute after:left-0 after:w-1 after:h-6 after:bg-primary after:rounded-r-full"
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            )}
          </NavLink>
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-auto">
        <button className="flex items-center justify-center w-12 h-12 rounded-xl text-on-surface-variant hover:bg-surface-variant transition-all duration-300 active:scale-90">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="flex items-center justify-center w-12 h-12 rounded-xl text-on-surface-variant hover:bg-surface-variant transition-all duration-300 active:scale-90">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant" title={user?.name}>
          <img className="w-full h-full object-cover" src={user?.avatar} alt={user?.name || 'User'} />
        </div>
      </div>
    </nav>
  )
}
