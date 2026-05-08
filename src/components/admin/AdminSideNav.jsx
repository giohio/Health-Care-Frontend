import PropTypes from 'prop-types'
import { useAdminSettings } from '../../context/AdminSettingsContext'

const ACCENT_STYLES = {
  rose: {
    solid: 'bg-rose-600 dark:bg-rose-600',
    solidHover: 'hover:bg-rose-700 dark:hover:bg-rose-500',
    active: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    activeIcon: 'text-rose-600 dark:text-rose-400',
    activeBar: 'bg-rose-600 dark:bg-rose-500',
    badge: 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/50 dark:bg-rose-950/60 dark:text-rose-400',
    titleGradient: 'bg-gradient-to-r from-white to-rose-300',
    toggleOn: 'border-rose-600 bg-rose-600 dark:border-rose-500 dark:bg-rose-500',
  },
  indigo: {
    solid: 'bg-indigo-600 dark:bg-indigo-600',
    solidHover: 'hover:bg-indigo-700 dark:hover:bg-indigo-500',
    active: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    activeIcon: 'text-indigo-600 dark:text-indigo-400',
    activeBar: 'bg-indigo-600 dark:bg-indigo-500',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400',
    titleGradient: 'bg-gradient-to-r from-white to-indigo-300',
    toggleOn: 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500',
  },
  teal: {
    solid: 'bg-teal-600 dark:bg-teal-600',
    solidHover: 'hover:bg-teal-700 dark:hover:bg-teal-500',
    active: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    activeIcon: 'text-teal-600 dark:text-teal-400',
    activeBar: 'bg-teal-600 dark:bg-teal-500',
    badge: 'border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-800/50 dark:bg-teal-950/60 dark:text-teal-400',
    titleGradient: 'bg-gradient-to-r from-white to-teal-300',
    toggleOn: 'border-teal-600 bg-teal-600 dark:border-teal-500 dark:bg-teal-500',
  },
  violet: {
    solid: 'bg-violet-600 dark:bg-violet-600',
    solidHover: 'hover:bg-violet-700 dark:hover:bg-violet-500',
    active: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    activeIcon: 'text-violet-600 dark:text-violet-400',
    activeBar: 'bg-violet-600 dark:bg-violet-500',
    badge: 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-800/50 dark:bg-violet-950/60 dark:text-violet-400',
    titleGradient: 'bg-gradient-to-r from-white to-violet-300',
    toggleOn: 'border-violet-600 bg-violet-600 dark:border-violet-500 dark:bg-violet-500',
  },
  amber: {
    solid: 'bg-amber-600 dark:bg-amber-600',
    solidHover: 'hover:bg-amber-700 dark:hover:bg-amber-500',
    active: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    activeIcon: 'text-amber-600 dark:text-amber-400',
    activeBar: 'bg-amber-600 dark:bg-amber-500',
    badge: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-400',
    titleGradient: 'bg-gradient-to-r from-white to-amber-300',
    toggleOn: 'border-amber-600 bg-amber-600 dark:border-amber-500 dark:bg-amber-500',
  },
}

function getAccentStyles(accentColor) {
  return ACCENT_STYLES[accentColor] || ACCENT_STYLES.rose
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { key: 'users', label: 'User Management', icon: UsersIcon },
  { key: 'appointments', label: 'Appointments', icon: CalendarDaysIcon },
  { key: 'payment-history', label: 'Payment History', icon: ReceiptIcon },
  { key: 'reports', label: 'Reports', icon: BarChart3Icon },
  { key: 'settings', label: 'System Settings', icon: Settings2Icon },
]

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3.5V12c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6.5L12 3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="12" width="7" height="9" rx="1" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  )
}

function CalendarDaysIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function BarChart3Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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

function Settings2Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
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

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
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

function AdminBadge({ accent }) {
  return (
    <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${accent.badge}`}>
      Admin
    </span>
  )
}

AdminBadge.propTypes = {
  accent: PropTypes.shape({
    badge: PropTypes.string.isRequired,
  }).isRequired,
}

function NavItem({ item, expanded, currentView, navigateTo, onAfterClick, accent }) {
  const isActive = currentView === item.key
  const Icon = item.icon

  return (
    <button
      type="button"
      className={`group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left transition-all duration-200 ${
        isActive
          ? accent.active
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'
      }`}
      onClick={() => {
        navigateTo(item.key)
        if (onAfterClick) onAfterClick()
      }}
    >
      {isActive && <span className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r ${accent.activeBar}`} aria-hidden="true" />}

      <span className={`inline-flex h-[18px] w-[18px] ${isActive ? accent.activeIcon : 'text-slate-400 group-hover:text-slate-600 dark:text-[#505060] dark:group-hover:text-[#9898b0]'}`}>
        <Icon />
      </span>

      {expanded && <span className="truncate text-sm">{item.label}</span>}

      {expanded && item.badge && item.badgeTone === 'neutral' && (
        <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
          {item.badge}
        </span>
      )}

      {expanded && item.badge && item.badgeTone === 'rose' && (
        <span className={`ml-auto rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${accent.badge}`}>
          {item.badge}
        </span>
      )}

      {!expanded && item.badge && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" aria-hidden="true" />
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
    badge: PropTypes.string,
    badgeTone: PropTypes.oneOf(['neutral', 'rose']),
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  onAfterClick: PropTypes.func,
  accent: PropTypes.shape({
    active: PropTypes.string.isRequired,
    activeIcon: PropTypes.string.isRequired,
    activeBar: PropTypes.string.isRequired,
    badge: PropTypes.string.isRequired,
  }).isRequired,
}

NavItem.defaultProps = {
  onAfterClick: null,
}

function ThemeToggle({ dark, setDark, expanded, accent }) {
  return (
    <button
      type="button"
      className={`group relative flex ${expanded ? 'w-full justify-between px-3' : 'mx-auto w-10 justify-center'} items-center rounded-xl py-2 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#16161e]`}
      onClick={() => setDark(!dark)}
    >
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex h-[18px] w-[18px] text-slate-400 dark:text-[#606070]">{dark ? <MoonIcon /> : <SunIcon />}</span>
        {expanded && <span className="text-sm text-slate-600 dark:text-[#9898b0]">Appearance</span>}
      </span>

      {expanded && (
        <span className={`inline-flex h-5 w-9 items-center rounded-full border ${dark ? accent.toggleOn : 'border-slate-300 bg-slate-200 dark:border-[#353545] dark:bg-[#252530]'}`}>
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
  accent: PropTypes.shape({
    toggleOn: PropTypes.string.isRequired,
  }).isRequired,
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

function AddUserButton({ expanded, navigateTo, accent }) {
  return (
    <div className="px-1 pb-1 pt-1">
      {expanded ? (
        <button
          type="button"
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px active:scale-[0.97] ${accent.solid} ${accent.solidHover} hover:shadow-[0_4px_12px_rgba(15,23,42,0.25)]`}
          onClick={() => navigateTo('users')}
        >
          <span className="inline-flex h-4 w-4"><UserPlusIcon /></span>
          <span>Add User</span>
        </button>
      ) : (
        <button
          type="button"
          className={`group relative mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-150 hover:-translate-y-px ${accent.solid} ${accent.solidHover} hover:shadow-[0_6px_14px_rgba(15,23,42,0.25)]`}
          onClick={() => navigateTo('users')}
          aria-label="Add user"
        >
          <span className="inline-flex h-4 w-4"><UserPlusIcon /></span>
          <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
            Add User
          </span>
        </button>
      )}
    </div>
  )
}

AddUserButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  navigateTo: PropTypes.func.isRequired,
  accent: PropTypes.shape({
    solid: PropTypes.string.isRequired,
    solidHover: PropTypes.string.isRequired,
  }).isRequired,
}

function ProfileBlock({ expanded, user }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 dark:border-[#252530] dark:bg-[#111118] ${expanded ? '' : 'justify-center'}`}>
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-white ${user.avatar.from} ${user.avatar.to}`}>
        {user.initials}
      </span>

      {expanded && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{user.name}</span>
          <span className="mt-1 inline-flex rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">Super Admin</span>
        </span>
      )}
    </div>
  )
}

ProfileBlock.propTypes = {
  expanded: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

function DrawerContent({ navigateTo, currentView, setMobileOpen, dark, setDark, onLogout, user, accent }) {
  const titleClass = dark
    ? `${accent.titleGradient} bg-clip-text text-transparent`
    : 'text-slate-900'

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5 dark:border-[#1c1c25]">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-white ${accent.solid}`}>
            <span className="inline-flex h-4 w-4"><ShieldCheckIcon /></span>
          </span>
          <span className={`text-[15px] font-bold ${titleClass}`}>HealthAI</span>
          <AdminBadge accent={accent} />
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
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Management</p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              expanded
              currentView={currentView}
              navigateTo={navigateTo}
              accent={accent}
              onAfterClick={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 p-2 dark:border-[#1c1c25]">
        <SignOutButton expanded onLogout={onLogout} />
        <ThemeToggle dark={dark} setDark={setDark} expanded accent={accent} />
        <AddUserButton expanded navigateTo={(view) => { navigateTo(view); setMobileOpen(false) }} accent={accent} />
        <ProfileBlock expanded user={user} />
      </div>
    </>
  )
}

DrawerContent.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  accent: PropTypes.shape({
    solid: PropTypes.string.isRequired,
    titleGradient: PropTypes.string.isRequired,
    active: PropTypes.string.isRequired,
    activeIcon: PropTypes.string.isRequired,
    activeBar: PropTypes.string.isRequired,
    badge: PropTypes.string.isRequired,
    toggleOn: PropTypes.string.isRequired,
    solidHover: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default function AdminSideNav({
  expanded,
  setExpanded,
  mobileOpen,
  setMobileOpen,
  currentView,
  navigateTo,
  dark,
  setDark,
  user,
  onLogout,
}) {
  const { accentColor, setSidebarSize } = useAdminSettings()
  const accent = getAccentStyles(accentColor)
  const titleClass = dark
    ? `${accent.titleGradient} bg-clip-text text-transparent`
    : 'text-slate-900'

  return (
    <>
      <aside className={`sticky top-0 z-40 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 dark:border-[#1e1e28] dark:bg-[#0c0c13] md:flex md:flex-col ${expanded ? 'w-56' : 'w-16'}`}>
        <div className="relative flex h-14 items-center border-b border-slate-100 dark:border-[#1c1c25]">
          <div className={`flex w-full items-center ${expanded ? 'justify-start px-4' : 'justify-center px-2'}`}>
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-white ${accent.solid}`}>
              <span className="inline-flex h-4 w-4"><ShieldCheckIcon /></span>
            </span>
            {expanded && (
              <span className="ml-2.5 flex items-center">
                <span className={`text-[15px] font-bold ${titleClass}`}>HealthAI</span>
                <span className="ml-2"><AdminBadge accent={accent} /></span>
              </span>
            )}
          </div>

          <button
            type="button"
            className="absolute -right-3 top-[52px] inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#606070] dark:hover:bg-[#16161e]"
            onClick={() => {
              const nextExpanded = !expanded
              setExpanded(nextExpanded)
              setSidebarSize(nextExpanded ? 'expanded' : 'collapsed')
            }}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="inline-flex h-3 w-3">{expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {expanded && <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Management</p>}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                expanded={expanded}
                currentView={currentView}
                navigateTo={navigateTo}
                accent={accent}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 p-2 dark:border-[#1c1c25]">
          <SignOutButton expanded={expanded} onLogout={onLogout} />
          <ThemeToggle dark={dark} setDark={setDark} expanded={expanded} accent={accent} />
          <AddUserButton expanded={expanded} navigateTo={navigateTo} accent={accent} />
          <div className="pt-1">
            <ProfileBlock expanded={expanded} user={user} />
          </div>
        </div>
      </aside>

      <button
        type="button"
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 dark:bg-black/60 md:hidden ${mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Close navigation"
        aria-hidden={!mobileOpen}
      />

      <aside className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[90vw] flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-[#0c0c13] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!mobileOpen}>
        <DrawerContent
          navigateTo={navigateTo}
          currentView={currentView}
          setMobileOpen={setMobileOpen}
          dark={dark}
          setDark={setDark}
          onLogout={onLogout}
          accent={accent}
          user={user}
        />
      </aside>
    </>
  )
}

AdminSideNav.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
}
