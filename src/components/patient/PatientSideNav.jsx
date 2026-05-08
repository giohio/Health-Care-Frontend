import PropTypes from 'prop-types'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { key: 'symptom-checker', label: 'AI Checker', icon: SparkleIcon },
  {
    key: 'appointments',
    label: 'My Appointments',
    icon: CalendarIcon,
    isActive: (view) => view === 'appointments' || view === 'reschedule' || view === 'reschedule-confirmed',
    badge: (unreadCount) => unreadCount,
  },
  {
    key: 'lab-results',
    label: 'Lab Results',
    icon: FlaskIcon,
    isActive: (view) => view === 'lab-results' || view === 'lab-detail',
    badge: (unreadCount) => unreadCount,
    badgeTone: 'amber',
  },
  { key: 'payment-history', label: 'Payment History', icon: ReceiptIcon },
  { key: 'health-record', label: 'Health Record', icon: RecordIcon },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: BellIcon,
    badge: (unreadCount) => unreadCount,
    badgeTone: 'indigo',
  },
]

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.8L12 4l9 6.8" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
      <path d="M5.5 14.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}

function RecordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-3-2V5a2 2 0 0 1 2-2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
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

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="17" y1="7" x2="19.1" y2="4.9" />
      <line x1="4.9" y1="19.1" x2="7" y2="17" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z" />
    </svg>
  )
}

function getIsActive(item, currentView) {
  if (item.isActive) return item.isActive(currentView)
  return item.key === currentView
}

function getBadgeValue(item, unreadCount) {
  if (!item.badge) return 0
  return item.badge(unreadCount)
}

function NavItem({ item, expanded, currentView, navigateTo, unreadCount, onAfterClick }) {
  const isActive = getIsActive(item, currentView)
  const badgeValue = getBadgeValue(item, unreadCount)
  const isNotificationsItem = item.key === 'notifications'
  const Icon = item.icon

  return (
    <button
      type="button"
      className={`group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left transition-all duration-200 ${
        isActive
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'
      }`}
      onClick={() => {
        navigateTo(item.key)
        if (onAfterClick) onAfterClick()
      }}
    >
      {isActive && <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r bg-indigo-600 dark:bg-indigo-500" aria-hidden="true" />}

      <span className={`inline-flex h-[18px] w-[18px] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-[#505060] dark:group-hover:text-[#9898b0]'}`}>
        <Icon />
      </span>

      {expanded && <span className="truncate text-sm">{item.label}</span>}

      {expanded && badgeValue > 0 && (
        isNotificationsItem ? (
          <span className="ml-auto min-w-[18px] rounded-md border border-indigo-200 bg-indigo-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300">
            {badgeValue}
          </span>
        ) : (
          <span className="ml-auto rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]">
            {badgeValue}
          </span>
        )
      )}

      {!expanded && badgeValue > 0 && (
        isNotificationsItem ? (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden="true" />
        ) : (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
        )
      )}

      {!expanded && (
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
          {item.label}
        </span>
      )}
    </button>
  )
}

NavItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    isActive: PropTypes.func,
    badge: PropTypes.func,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  unreadCount: PropTypes.number.isRequired,
  onAfterClick: PropTypes.func,
}

NavItem.defaultProps = {
  onAfterClick: null,
}

function ThemeToggle({ dark, setDark, expanded }) {
  return (
    <button
      type="button"
      className={`group relative flex ${expanded ? 'w-full justify-between px-3' : 'mx-auto w-10 justify-center'} items-center rounded-xl py-2 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#16161e]`}
      onClick={() => {
        setDark(!dark)
        localStorage.setItem('healthai-theme', !dark ? 'dark' : 'light')
      }}
    >
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex h-[18px] w-[18px] text-slate-400 dark:text-[#606070]">{dark ? <MoonIcon /> : <SunIcon />}</span>
        {expanded && <span className="text-sm text-slate-600 dark:text-[#9898b0]">Appearance</span>}
      </span>

      {expanded && (
        <span className={`inline-flex h-5 w-9 items-center rounded-full border ${dark ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-slate-200 dark:border-[#353545] dark:bg-[#252530]'}`}>
          <span className={`h-3.5 w-3.5 rounded-full bg-white transition-all duration-300 ${dark ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
        </span>
      )}

      {!expanded && (
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
          Toggle Dark Mode
        </span>
      )}
    </button>
  )
}

ThemeToggle.propTypes = {
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
}

function SignOutButton({ expanded, onLogout }) {
  return (
    <button
      type="button"
      className="group relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-slate-500 transition-all duration-150 hover:bg-rose-50 hover:text-rose-600 dark:text-[#70708a] dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
      onClick={onLogout}
    >
      <span className="inline-flex h-[18px] w-[18px]"><LogOutIcon /></span>
      {expanded && <span className="text-[13px]">Sign Out</span>}

      {!expanded && (
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
          Sign Out
        </span>
      )}
    </button>
  )
}

SignOutButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
}

function DrawerContent({ navigateTo, currentView, unreadCount, setMobileOpen, dark, setDark, onLogout, user }) {
  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5 dark:border-[#1c1c25]">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white ${user.avatar.from} ${user.avatar.to}`}>
            {user.initials}
          </span>
          <span className={`text-[15px] font-bold ${dark ? 'bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent' : 'text-slate-900'}`}>HealthAI</span>
        </div>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-[#9898b0] dark:hover:bg-[#16161e]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <span className="inline-flex h-4 w-4"><CloseIcon /></span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Navigation</p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              expanded
              currentView={currentView}
              navigateTo={navigateTo}
              unreadCount={unreadCount}
              onAfterClick={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 p-2 dark:border-[#1c1c25]">
        <SignOutButton expanded onLogout={onLogout} />
        <ThemeToggle dark={dark} setDark={setDark} expanded />
        <div className="px-1 pb-2 pt-1">
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
            onClick={() => {
              navigateTo('booking-wizard')
              setMobileOpen(false)
            }}
          >
            <span className="inline-flex h-4 w-4"><PlusIcon /></span>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </>
  )
}

DrawerContent.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  unreadCount: PropTypes.number.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default function PatientSideNav({
  expanded,
  setExpanded,
  mobileOpen,
  setMobileOpen,
  currentView,
  navigateTo,
  unreadCount,
  dark,
  setDark,
  onLogout,
  user,
}) {
  return (
    <>
      <aside className={`sticky top-0 z-40 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 dark:border-[#1e1e28] dark:bg-[#0c0c13] md:flex md:flex-col ${expanded ? 'w-56' : 'w-16'}`}>
        <div className="relative flex h-14 items-center border-b border-slate-100 dark:border-[#1c1c25]">
          <div className={`flex w-full items-center ${expanded ? 'justify-start px-5' : 'justify-center px-2'}`}>
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white ${user.avatar.from} ${user.avatar.to}`}>
              {user.initials}
            </span>
            {expanded && (
              <span className={`ml-2.5 text-[15px] font-bold ${dark ? 'bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent' : 'text-slate-900'}`}>HealthAI</span>
            )}
          </div>

          <button
            type="button"
            className="absolute -right-3 top-[52px] inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#606070] dark:hover:bg-[#16161e]"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="inline-flex h-3 w-3">{expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {expanded && <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Navigation</p>}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                expanded={expanded}
                currentView={currentView}
                navigateTo={navigateTo}
                unreadCount={unreadCount}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-[#1c1c25]">
          <SignOutButton expanded={expanded} onLogout={onLogout} />
          <ThemeToggle dark={dark} setDark={setDark} expanded={expanded} />

          <div className="px-1 pb-2 pt-1">
            {expanded ? (
              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                onClick={() => navigateTo('booking-wizard')}
              >
                <span className="inline-flex h-4 w-4"><PlusIcon /></span>
                <span>Book Appointment</span>
              </button>
            ) : (
              <button
                type="button"
                className="group relative mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                onClick={() => navigateTo('booking-wizard')}
                aria-label="Book Appointment"
              >
                <span className="inline-flex h-4 w-4"><PlusIcon /></span>
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
                  Book Appointment
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 dark:bg-black/60 md:hidden ${mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      <aside className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[90vw] flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-[#0c0c13] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!mobileOpen}>
        <DrawerContent
          navigateTo={navigateTo}
          currentView={currentView}
          unreadCount={unreadCount}
          setMobileOpen={setMobileOpen}
          dark={dark}
          setDark={setDark}
          onLogout={onLogout}
          user={user}
        />
      </aside>
    </>
  )
}

PatientSideNav.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  unreadCount: PropTypes.number.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}