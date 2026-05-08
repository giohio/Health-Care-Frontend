import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { notificationApi } from '../../api/notification'

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  appointments: 'My Appointments',
  'payment-history': 'Payment History',
  'lab-results': 'Lab Results',
  'lab-detail': 'Lab Results',
  'health-record': 'Health Record',
  notifications: 'Notifications',
  'booking-wizard': 'Book Appointment',
  'symptom-checker': 'Symptom Checker',
  reschedule: 'Reschedule',
  'reschedule-confirmed': 'Appointment Details',
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

export default function PatientTopBar(props) {
  const {
    setMobileOpen,
    currentView,
    unreadCount,
    setUnreadCount,
    navigateTo,
    user,
  } = props

  const currentLabel = VIEW_LABELS[currentView] || 'HealthAI Portal'
  const avatarFrom = user?.avatar?.from ?? 'from-indigo-500'
  const avatarTo = user?.avatar?.to ?? 'to-violet-600'
  const initials = user?.initials ?? (user?.email?.[0]?.toUpperCase() ?? 'U')
  const displayName = user?.name ?? user?.email ?? 'User'

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await notificationApi.getUnreadCount()
        const count = res?.count ?? res?.unread_count ?? 0
        setUnreadCount(count)
      } catch {
        return
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [setUnreadCount])

  return (
    <header className="app-root sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-[#1e1e28]/80 dark:bg-[#0c0c13]/85 md:px-6" role="banner">
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#606070] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5] md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <span className="inline-flex h-[18px] w-[18px]">
            <MenuIcon />
          </span>
        </button>

        <div className="hidden items-center text-sm md:inline-flex">
          <span className="text-slate-400 dark:text-[#606070]">HealthAI</span>
          <span className="mx-2 text-slate-300 dark:text-[#404050]">/</span>
          <span className="font-medium text-slate-900 dark:text-[#eeeef5]">{currentLabel}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <label className="flex h-9 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-slate-600 transition-all duration-150 hover:border-slate-300 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:hover:border-[#353545]">
          <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search records, appointments..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
          />
          <span className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-sm dark:bg-[#111118] dark:text-[#606070] md:inline">CMD+K</span>
        </label>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('notifications')}
          aria-label="Open notifications"
        >
          <span
            className={`inline-flex h-[18px] w-[18px] ${
              currentView === 'notifications'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-[#70708a]'
            }`}
          >
            <BellIcon />
          </span>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm dark:bg-indigo-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-[#252530] md:block" aria-hidden="true" />

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('health-record')}
          aria-label="Open health record"
        >
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ${avatarFrom} ${avatarTo}`}>
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-slate-900 dark:text-[#eeeef5] lg:inline">{displayName}</span>
          <span className="hidden h-[14px] w-[14px] text-slate-400 dark:text-[#606070] lg:inline-flex">
            <ChevronDownIcon />
          </span>
        </button>
      </div>
    </header>
  )
}

PatientTopBar.propTypes = {
  setMobileOpen: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  unreadCount: PropTypes.number.isRequired,
  setUnreadCount: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    initials: PropTypes.string,
    avatar: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
    }),
  }),
}

PatientTopBar.defaultProps = {
  user: null,
}