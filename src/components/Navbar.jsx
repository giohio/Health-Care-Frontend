import PropTypes from 'prop-types'

function LogoMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 17H5a2 2 0 0 1-2-2c0-1.4.8-2.4 1.8-3.4C5.7 10.8 6 9.7 6 8.5a6 6 0 1 1 12 0c0 1.2.3 2.3 1.2 3.1 1 .9 1.8 2 1.8 3.4a2 2 0 0 1-2 2h-4" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function Navbar({ currentView, setCurrentView, user = {} }) {
  function navClass(view) {
    return `nav-link${currentView === view ? ' nav-link--active' : ''}`
  }

  const initials = user?.initials || user?.full_name?.split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User'
  const firstName = displayName.split(/\s+/)[0]

  return (
    <header className="navbar" role="banner">
      <div className="navbar-left">
        <div className="navbar-logo-icon" aria-hidden="true">
          <LogoMark />
        </div>
        <span className="navbar-brand">HealthAI</span>
        <span className="navbar-sep" aria-hidden="true">|</span>
        <span className="navbar-portal">Patient Portal</span>
      </div>

      {/* Centered nav links */}
      <nav className="nav-links" aria-label="Main navigation">
        <button
          id="nav-dashboard"
          className={navClass('dashboard')}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button
          id="nav-appointments"
          className={navClass('appointments')}
          onClick={() => setCurrentView('appointments')}
        >
          My Appointments
        </button>
        <button
          id="nav-lab-results"
          className={navClass('lab-results')}
          onClick={() => setCurrentView('lab-results')}
        >
          Lab Results
        </button>
        <button
          id="nav-health-record"
          className={navClass('health-record')}
          onClick={() => setCurrentView('health-record')}
        >
          Health Record
        </button>
      </nav>

      <div className="navbar-right">
        <button type="button" className="navbar-bell-btn" aria-label="Notifications">
          <BellIcon />
        </button>
        <span className="navbar-divider" aria-hidden="true" />
        <button
          type="button"
          className="navbar-profile-btn"
          onClick={() => setCurrentView('health-record')}
          aria-label={`Open health record for ${firstName}`}
        >
          <div className="navbar-avatar" aria-hidden="true">{initials}</div>
          <span className="navbar-name">{displayName}</span>
          <span className="navbar-chevron" aria-hidden="true"><ChevronDownIcon /></span>
        </button>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  user: PropTypes.shape({
    initials: PropTypes.string,
    full_name: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
}
