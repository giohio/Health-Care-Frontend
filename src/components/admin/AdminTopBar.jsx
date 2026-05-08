import PropTypes from 'prop-types'
import { useAdminSettings } from '../../context/AdminSettingsContext'

const ACCENT_BADGE = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
}

function getBadgeClass(accentColor) {
  return ACCENT_BADGE[accentColor] || ACCENT_BADGE.rose
}

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  users: 'User Management',
  appointments: 'Appointment Management',
  'payment-history': 'Payment History',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 17H5a2 2 0 0 1-2-2c0-1.3.8-2.3 1.8-3.3C5.7 10.9 6 9.8 6 8.6a6 6 0 1 1 12 0c0 1.2.3 2.3 1.2 3.1 1 .9 1.8 2 1.8 3.3a2 2 0 0 1-2 2h-4" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function AdminTopBar({ currentView, navigateTo, setMobileOpen, user }) {
  const { accentColor } = useAdminSettings()
  const badgeClass = getBadgeClass(accentColor)
  const currentLabel = VIEW_LABELS[currentView] || 'Admin Portal'
  return (
    <header className="app-root sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-[#1e1e28]/80 dark:bg-[#0c0c13]/85 md:px-6" role="banner">
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#606070] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5] md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <span className="inline-flex h-[18px] w-[18px]"><MenuIcon /></span>
        </button>

        <div className="hidden items-center text-sm md:inline-flex">
          <span className="text-slate-400 dark:text-[#606070]">HealthAI</span>
          <span className="mx-2 text-slate-300 dark:text-[#404050]">/</span>
          <span className="font-medium text-slate-900 dark:text-[#eeeef5]">{currentLabel}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <label className="flex h-9 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-slate-600 transition-all duration-150 hover:border-slate-300 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:hover:border-[#353545]">
          <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]" aria-hidden="true"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search users, appointments, doctors..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
          />
          <span className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-sm dark:bg-[#111118] dark:text-[#606070] md:inline">CMD+K</span>
        </label>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('reports')}
          aria-label="Open notifications"
        >
          <span className="inline-flex h-[18px] w-[18px] text-slate-500 dark:text-[#70708a]">
            <BellIcon />
          </span>
        </button>

        <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-[#252530] md:block" aria-hidden="true" />

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('settings')}
          aria-label="Open admin settings"
        >
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ${user.avatar.from} ${user.avatar.to}`}>
            {user.initials}
          </span>
          <span className="hidden items-center gap-2 lg:inline-flex">
            <span className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{user.name}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${badgeClass}`}>Admin</span>
          </span>
          <span className="hidden h-[14px] w-[14px] text-slate-400 dark:text-[#606070] lg:inline-flex"><ChevronDownIcon /></span>
        </button>
      </div>
    </header>
  )
}

AdminTopBar.propTypes = {
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}
