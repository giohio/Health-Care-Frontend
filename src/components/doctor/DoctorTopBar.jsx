import PropTypes from 'prop-types'

const VIEW_LABELS = {
  dashboard: 'Doctor Dashboard',
  'patient-queue': 'Patient Queue',
  schedule: 'Schedule',
  emr: 'EMR Workspace',
  'doctor-chat': 'Doctor Chat',
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

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function DoctorTopBar({
  currentView,
  navigateTo,
  setMobileOpen,
  setDark,
  dark,
  selectedPatient,
  user,
}) {
  const currentLabel = VIEW_LABELS[currentView] || 'Doctor Portal'

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-[#1e1e28]/80 dark:bg-[#0c0c13]/85 md:px-6" role="banner">
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
            placeholder="Search patients, charts..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
          />
          <span className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-sm dark:bg-[#111118] dark:text-[#606070] md:inline">CMD+K</span>
        </label>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
          onClick={() => setDark(!dark)}
          aria-label="Toggle theme"
        >
          <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]">{dark ? <MoonIcon /> : <SunIcon />}</span>
        </button>

        <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-[#252530] md:block" aria-hidden="true" />

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('patient-queue')}
          aria-label="Open patient queue"
        >
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ${user.avatar.from} ${user.avatar.to}`}>
            {user.initials}
          </span>
          <span className="hidden text-sm font-medium text-slate-900 dark:text-[#eeeef5] lg:inline">{user.name}</span>
          <span className="hidden h-[14px] w-[14px] text-slate-400 dark:text-[#606070] lg:inline-flex"><ChevronDownIcon /></span>
        </button>
      </div>

      {selectedPatient && (
        <div className="absolute bottom-[-32px] right-6 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          Active Patient: {selectedPatient.name}
        </div>
      )}
    </header>
  )
}

DoctorTopBar.propTypes = {
  currentView: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  setDark: PropTypes.func.isRequired,
  dark: PropTypes.bool.isRequired,
  selectedPatient: PropTypes.shape({
    name: PropTypes.string,
  }),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

DoctorTopBar.defaultProps = {
  selectedPatient: null,
}