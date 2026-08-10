import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import LoopBrand from './LoopBrand'
import { avatarDataUri } from '../utils/avatar'

/**
 * Optional search props (Chat-style):
 * - searchValue / onSearchChange — controlled query
 * - suggestions — [{ id, title, subtitle?, avatarSeed? }]
 * - onSelectSuggestion(item)
 */
export default function TopHeader({
  searchPlaceholder = 'Search for files, people, or gists',
  searchValue,
  onSearchChange,
  suggestions = [],
  onSelectSuggestion,
}) {
  const { user, logout } = useAuth()
  const [localQuery, setLocalQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapRef = useRef(null)

  const controlled = typeof onSearchChange === 'function'
  const query = controlled ? searchValue ?? '' : localQuery
  const setQuery = (next) => {
    if (controlled) onSearchChange(next)
    else setLocalQuery(next)
  }

  const showSuggestions = controlled && query.trim().length > 0 && open

  useEffect(() => {
    setActiveIndex(0)
  }, [query, suggestions])

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (item) => {
    onSelectSuggestion?.(item)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = suggestions[activeIndex]
      if (item) pick(item)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-margin-desktop h-12 bg-surface/90 border-b border-outline-variant/30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <LoopBrand variant="header" />

        <div className="ml-6 relative hidden md:block w-[min(28rem,42vw)]" ref={wrapRef}>
          <div
            className={`loop-top-search flex items-center gap-2 h-9 px-3 rounded-full transition-[background,box-shadow] duration-200 ${
              open || query
                ? 'bg-white shadow-[0_0_0_1px_rgba(50,57,163,0.18),0_4px_14px_rgba(11,22,56,0.06)]'
                : 'bg-surface-container-high/80 hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-outline text-[18px] flex-shrink-0">
              search
            </span>
            <input
              className="loop-top-search__input flex-1 min-w-0 bg-transparent border-0 outline-none shadow-none ring-0 focus:ring-0 focus:outline-none text-[13px] text-on-surface placeholder:text-outline/80"
              placeholder={searchPlaceholder}
              type="text"
              role="searchbox"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setOpen(false)
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full text-outline hover:bg-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ) : null}
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-outline-variant/25 shadow-[0_12px_32px_rgba(11,22,56,0.12)] overflow-hidden z-[60] max-h-80 overflow-y-auto custom-scrollbar">
              {suggestions.length === 0 ? (
                <p className="px-4 py-3.5 text-body-sm text-on-surface-variant">No results</p>
              ) : (
                suggestions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(item)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                      index === activeIndex
                        ? 'bg-primary/8'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <img
                      src={avatarDataUri(item.title, item.avatarSeed || item.id)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-md text-on-surface truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-body-sm text-on-surface-variant truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-outline flex-shrink-0">
                      chat
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
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
        <Link
          to="/profile"
          title="View profile"
          className="flex items-center gap-2 ml-2 rounded-full pr-2 hover:bg-surface-container-highest transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container">
            <img className="w-full h-full object-cover" src={user?.avatar} alt={user?.name || 'User'} />
          </div>
          <span className="hidden sm:block text-label-md text-on-surface max-w-[120px] truncate">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  )
}
