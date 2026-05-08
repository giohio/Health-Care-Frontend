import PropTypes from 'prop-types'

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="12" width="7" height="9" rx="1" />
    </svg>
  )
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h7" />
      <circle cx="17" cy="12" r="3" />
      <path d="M17 15v3" />
    </svg>
  )
}

function ScheduleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="9" cy="15" r="1" />
      <circle cx="13" cy="15" r="1" />
      <circle cx="17" cy="15" r="1" />
    </svg>
  )
}

function EMRIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M12 9v8" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 1 1 18-5z" />
    </svg>
  )
}

function LabReviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  )
}

function TriageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M20 3v18" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'doctor-dashboard', label: 'Dashboard', Icon: HomeIcon },
  { key: 'dashboard', label: 'Clinical Board', Icon: DashboardIcon },
  { key: 'schedule', label: 'Schedule', Icon: ScheduleIcon },
  { key: 'emr', label: 'EMR Workspace', Icon: EMRIcon },
  { key: 'lab-review', label: 'Lab Review', Icon: LabReviewIcon },
  { key: 'doctor-chat', label: 'Clinical Assistant', Icon: ChatIcon },
  { key: 'profile', label: 'Settings', Icon: ProfileIcon },
]

function Brand({ expanded }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
        <span className="text-sm font-bold text-white">H</span>
      </div>
      {expanded && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-[#f5f7ff]">HealthAI</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-[#6f7a90]">Doctor Portal</p>
        </div>
      )}
    </div>
  )
}

Brand.propTypes = {
  expanded: PropTypes.bool.isRequired,
}

function NavButton({ active, expanded, item, onClick }) {
  const iconTone = active
    ? 'text-white'
    : 'text-slate-500 group-hover:text-slate-800 dark:text-[#7f89a0] dark:group-hover:text-[#d8deff]'

  const labelTone = active
    ? 'text-white'
    : 'text-slate-700 group-hover:text-slate-900 dark:text-[#c6d0ea] dark:group-hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center overflow-hidden rounded-xl transition-all duration-200',
        expanded ? 'h-11 gap-3 px-3' : 'h-11 justify-center',
        active
          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-md shadow-cyan-600/25'
          : 'hover:bg-slate-100 dark:hover:bg-[#101524]',
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
      aria-label={expanded ? undefined : item.label}
      title={expanded ? undefined : item.label}
    >
      <span className={`inline-flex h-5 w-5 items-center justify-center ${iconTone}`}>
        <item.Icon />
      </span>
      {expanded && <span className={`truncate text-sm font-medium ${labelTone}`}>{item.label}</span>}
    </button>
  )
}

NavButton.propTypes = {
  active: PropTypes.bool.isRequired,
  expanded: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    Icon: PropTypes.elementType.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
}

function UserCard({ expanded, mobileOpen, user, onLogout }) {
  const isExpanded = expanded || mobileOpen
  return (
    <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-[#1a2336] dark:bg-[#0f1524]/70">
      <button
        type="button"
        className={[
          'flex w-full items-center rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white dark:hover:bg-[#151f33]',
          isExpanded ? 'gap-2.5' : 'justify-center',
        ].join(' ')}
        onClick={onLogout}
        aria-label={isExpanded ? undefined : 'Sign out'}
        title={isExpanded ? undefined : 'Sign out'}
      >
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-white ${user.avatar.from} ${user.avatar.to}`}>
          {user.initials}
        </span>
        {isExpanded && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900 dark:text-[#f5f7ff]">{user.name}</span>
            <span className="block truncate text-xs text-slate-500 dark:text-[#7f89a0]">{user.email}</span>
          </span>
        )}
      </button>

      <button
        type="button"
        className={[
          'mt-1.5 flex w-full items-center rounded-xl px-2 py-2 text-left text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10',
          isExpanded ? 'gap-2.5' : 'justify-center',
        ].join(' ')}
        onClick={onLogout}
        aria-label={isExpanded ? undefined : 'Sign out'}
        title={isExpanded ? undefined : 'Sign out'}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          <LogoutIcon />
        </span>
        {isExpanded && <span className="text-sm font-medium">Sign Out</span>}
      </button>
    </div>
  )
}

UserCard.propTypes = {
  expanded: PropTypes.bool.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
}

export default function DoctorSideNav({
  currentView,
  navigateTo,
  expanded,
  setExpanded,
  mobileOpen,
  setMobileOpen,
  user,
  onLogout,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 dark:border-[#1a2336] dark:bg-[#070b14]/95 dark:shadow-black/30 md:static md:z-auto md:shadow-none',
          expanded ? 'md:w-[260px]' : 'md:w-[88px]',
          mobileOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <Brand expanded={expanded || mobileOpen} />

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#6f7a90] dark:hover:bg-[#0f1524] dark:hover:text-[#d8deff] md:inline-flex"
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
            >
              <span className="inline-flex h-4 w-4">{expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}</span>
            </button>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#6f7a90] dark:hover:bg-[#0f1524] dark:hover:text-[#d8deff] md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <span className="inline-flex h-4 w-4"><CloseIcon /></span>
            </button>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5" aria-label="Doctor navigation">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={currentView === item.key}
              expanded={expanded || mobileOpen}
              onClick={() => {
                navigateTo(item.key)
                setMobileOpen(false)
              }}
            />
          ))}
        </nav>

        <UserCard expanded={expanded} mobileOpen={mobileOpen} user={user} onLogout={onLogout} />
      </aside>
    </>
  )
}

DoctorSideNav.propTypes = {
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
}