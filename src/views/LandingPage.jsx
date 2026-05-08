import PropTypes from 'prop-types'

// ── Icon components ────────────────────────────────────────────────────────────
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2a2.5 2.5 0 0 1 5 0c1.5 0 3 1 3.5 2.5 1.5.5 2.5 2 2.5 3.5a3.5 3.5 0 0 1-1.5 2.9V12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-1.1A3.5 3.5 0 0 1 5.5 8c0-1.5 1-3 2.5-3.5C8.5 3 10 2 9.5 2z" />
      <line x1="12" y1="14" x2="12" y2="22" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3v6a4 4 0 0 0 8 0V3" />
      <path d="M8 15v1a6 6 0 0 0 12 0v-2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12.5 11.2 14.7 15.5 10.4" />
    </svg>
  )
}

const FEATURES = [
  { Icon: CalendarIcon, title: 'Smart Scheduling', desc: 'Choose doctor, specialty, and time in just a few steps from any device.' },
  { Icon: BrainIcon, title: 'AI Analysis', desc: 'AI analyzes symptoms and recommends the right specialty for your needs.' },
  { Icon: ChartIcon, title: 'Health Tracking', desc: 'Store and track health records and lab results over time in one place.' },
  { Icon: BellIcon, title: 'Real-time Alerts', desc: 'Get notified instantly when your appointment or test results are updated.' },
  { Icon: LockIcon, title: 'Total Security', desc: 'Medical data is encrypted and protected under international standards.' },
  { Icon: StethoscopeIcon, title: 'Specialist Doctors', desc: 'Connect with a trusted network of specialist doctors nationwide.' },
]

const STATS = [
  { num: '10,000+', label: 'Patients Served' },
  { num: '200+', label: 'Specialist Doctors' },
  { num: '15+', label: 'Specialties' },
  { num: '98%', label: 'Satisfaction Rate' },
]

const STEPS = [
  { n: '1', title: 'Create an Account', desc: 'Register for free in 2 minutes with your email address.' },
  { n: '2', title: 'Choose a Doctor', desc: 'Find the right doctor, view availability, and book online.' },
  { n: '3', title: 'Visit and Track', desc: 'Attend your appointment and monitor results in the app.' },
]

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="lp-page">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header>
        <nav className="lp-nav" aria-label="Top navigation">
        <a className="lp-logo" href="#hero" aria-label="HealthAI home">
          <span className="lp-logo-mark" aria-hidden="true">H</span>{' '}
          HealthAI
        </a>

        <nav className="lp-nav-links" aria-label="Main navigation">
          <a className="lp-nav-link" href="#features">Features</a>
          <a className="lp-nav-link" href="#how">How it works</a>
          <a className="lp-nav-link" href="#footer">About us</a>
        </nav>

        <div className="lp-nav-actions">
          <button type="button" className="lp-btn-ghost lp-btn-sm" onClick={onLogin}>Sign In</button>
          <button type="button" className="lp-btn-primary lp-btn-sm" onClick={onSignup}>Sign Up</button>
        </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section id="hero" className="lp-hero-outer">
        <div className="lp-hero">
          {/* Left */}
          <div className="lp-hero-text">
            <span className="lp-eyebrow">Smart Healthcare Platform</span>

            <h1>
              Smarter healthcare<br />
              with <span>AI</span>
            </h1>

            <p className="lp-hero-sub">
              Book appointments easily, monitor your health continuously, and receive AI-powered analysis from top specialists.
            </p>

            <div className="lp-cta-row">
              <button type="button" className="lp-btn-primary lp-btn-hero" onClick={onSignup}>
                Sign Up Free
              </button>
              <button type="button" className="lp-btn-ghost lp-btn-hero" onClick={onLogin}>
                <PlayIcon />
                Watch demo
              </button>
            </div>

            <div className="lp-trust">
              <span className="lp-trust-item"><CheckCircleIcon /> Free to register</span>
              <span className="lp-trust-item"><CheckCircleIcon /> No credit card needed</span>
              <span className="lp-trust-item"><CheckCircleIcon /> Cancel anytime</span>
            </div>
          </div>

          {/* Right — decorative mockup */}
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-mockup-wrap">
              <div className="lp-mockup">
                {/* Mockup header */}
                <div className="lp-mk-header">
                  <div className="lp-mk-avatar">N</div>
                  <div className="lp-mk-greeting">
                    <div className="lp-mk-name">Hello, Nguyen Van A</div>
                    <div className="lp-mk-sub">Patient</div>
                  </div>
                  <div className="lp-mk-bell">
                    <BellIcon />
                  </div>
                </div>

                {/* Upcoming appointment */}
                <div className="lp-mk-section">
                  <div className="lp-mk-section-label">
                    <CalendarIcon />
                    Upcoming Appointment
                  </div>
                  <div className="lp-mk-card">
                    <div className="lp-mk-card-top">
                      <div>
                        <div className="lp-mk-card-title">Cardiology &nbsp;·&nbsp; Dr. Nguyen Van B</div>
                        <div className="lp-mk-card-sub">Wed, 02/04/2025 &nbsp;·&nbsp; 09:00</div>
                      </div>
                      <span className="lp-mk-badge lp-mk-badge--confirmed">Confirmed</span>
                    </div>
                  </div>
                </div>

                {/* AI result */}
                <div className="lp-mk-section">
                  <div className="lp-mk-section-label">
                    <BrainIcon />
                    Latest AI Analysis
                  </div>
                  <div className="lp-mk-card">
                    <div className="lp-mk-card-top">
                      <div>
                        <div className="lp-mk-card-title">CBC Result — Normal</div>
                        <div className="lp-mk-card-sub">Updated 3 days ago</div>
                      </div>
                      <span className="lp-mk-dot" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="lp-stats" aria-label="Platform statistics">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat">
            <div className="lp-stat-num">{s.num}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="lp-section">
        <div className="lp-section-header">
          <h2>Why choose HealthAI?</h2>
          <p>Modern technology serving your health needs</p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">
                <f.Icon />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how" className="lp-section lp-steps-section">
        <div className="lp-section-header">
          <h2>Just 3 simple steps</h2>
          <p>Get started in minutes, not hours</p>
        </div>

        <ul className="lp-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="lp-step">
              <div className="lp-step-num" aria-label={`Step ${s.n}`}>{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────────────────── */}
      <div className="lp-cta-banner">
        <h2>Ready to get started?</h2>
        <p>Join over 10,000 patients who trust HealthAI for their care</p>
        <div className="lp-cta-row lp-cta-row--center">
          <button type="button" className="lp-btn-primary lp-btn-hero" onClick={onSignup}>Sign Up Now</button>
          <button type="button" className="lp-btn-ghost lp-btn-hero" onClick={onLogin}>Contact us</button>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer id="footer" className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <a className="lp-logo" href="#hero" aria-label="HealthAI home">
              <span className="lp-logo-mark" aria-hidden="true">H</span>{' '}
              HealthAI
            </a>
            <p className="lp-footer-tagline">Smart healthcare for everyone.</p>
          </div>

          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Product</div>
              <a className="lp-footer-link" href="#features">Features</a>
              <a className="lp-footer-link" href="#how">How it works</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Support</div>
              <a className="lp-footer-link" href="#footer">Help Center</a>
              <a className="lp-footer-link" href="#footer">Contact</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Company</div>
              <a className="lp-footer-link" href="#footer">About Us</a>
              <a className="lp-footer-link" href="#footer">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="lp-footer-copy">
          &copy; {new Date().getFullYear()} HealthAI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

LandingPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onSignup: PropTypes.func.isRequired,
}
