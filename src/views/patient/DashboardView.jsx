import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  TriangleAlert, X, Calendar, FlaskConical, Bot,
  Shield, Zap, Smartphone, Stethoscope,
  History,
} from 'lucide-react'
import { patientApi } from '../../api/patient'
import { appointmentApi } from '../../api/appointment'
import { APPOINTMENT_STATUS, APPT_STATUS_LABEL, APPT_STATUS_COLOR } from '../../constants/enums'
import { EmptyState } from '../../components/shared/EmptyState'
import { SkeletonBlock } from '../../components/shared/LoadingSpinner'

const UPCOMING_STATUSES = new Set([
  APPOINTMENT_STATUS.PENDING_PAYMENT,
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.IN_PROGRESS,
])

function isOverdue(appt) {
  const now = new Date()
  const endDateTime = new Date(`${appt.appointment_date}T${appt.end_time || '23:59:59'}`)
  return new Date(endDateTime.getTime() + 30 * 60 * 1000) < now
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getCountdownLabel(isoDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${isoDate}T00:00:00`)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff > 1) return `In ${diff} days`
  return null
}

function GettingStarted({ setCurrentView, profile, hasAppointment }) {
  const profileHasData = !!(
    profile?.health_background?.blood_type ||
    profile?.health_background?.allergies ||
    profile?.profile?.full_name
  )
  const completedSteps = [profileHasData, hasAppointment, false].filter(Boolean).length

  const steps = [
    {
      n: 1,
      emoji: '📋',
      label: 'Complete your health profile',
      desc: 'Add allergies, blood type, and medical history',
      action: () => setCurrentView('health-record'),
      cta: 'Update',
      done: profileHasData,
    },
    {
      n: 2,
      emoji: '📅',
      label: 'Book your first appointment',
      desc: 'Find a doctor and choose a convenient date',
      action: () => setCurrentView('booking-wizard'),
      cta: 'Book Now',
      done: hasAppointment,
    },
    {
      n: 3,
      emoji: '🤖',
      label: 'Try the AI Symptom Checker',
      desc: 'Describe your symptoms, get instant guidance',
      action: () => setCurrentView('symptom-checker'),
      cta: 'Try It',
      done: false,
    },
  ]
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Getting Started</h2>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">{completedSteps} / 3</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#252535]">
        <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.round((completedSteps / 3) * 100)}%` }} />
      </div>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.n} className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-colors ${s.done ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20' : 'border-slate-200 bg-slate-50 dark:border-[#2e2e40] dark:bg-[#1e1e2e]'}`}>
            <span className="text-2xl leading-none">{s.done ? '✅' : s.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${s.done ? 'text-emerald-700 line-through dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{s.label}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
            {!s.done && (
              <button
                type="button"
                onClick={s.action}
                className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                {s.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

GettingStarted.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  profile: PropTypes.object,
  hasAppointment: PropTypes.bool,
}

const SPECIALTIES = [
  { label: 'General Medicine', icon: '🩺' },
  { label: 'Cardiology', icon: '❤️' },
  { label: 'Neurology', icon: '🧠' },
  { label: 'Dermatology', icon: '✨' },
  { label: 'General Surgery', icon: '🏥' },
  { label: 'Pediatrics', icon: '👶' },
  { label: 'Ophthalmology', icon: '👁️' },
  { label: 'ENT', icon: '👂' },
]

export default function Dashboard({ setCurrentView, user = null, labOrders = [] }) {
  const [allergyDismissed, setAllergyDismissed] = useState(false)
  const [profile, setProfile] = useState(null)
  const [upcomingAppts, setUpcomingAppts] = useState([])
  const [loading, setLoading] = useState(true)

  const activeLabOrdersCount = labOrders.length
  const userName = Reflect.get(user ?? {}, 'name')
  const userEmail = Reflect.get(user ?? {}, 'email')
  const emailPrefix = typeof userEmail === 'string' ? userEmail.split('@')[0] : null

  const firstName =
    profile?.profile?.full_name?.split(/\s+/)[0] ||
    (typeof userName === 'string' ? userName.split(/\s+/)[0] : null) ||
    emailPrefix ||
    'there'

  const allergies = profile?.health_background?.allergies
  let allergyList = []
  if (Array.isArray(allergies)) {
    allergyList = allergies
  } else if (typeof allergies === 'string' && allergies.length > 0) {
    allergyList = [allergies]
  }

  const isNewPatient = !loading && upcomingAppts.length === 0 && activeLabOrdersCount === 0
  const nextAppt = upcomingAppts[0] ?? null

  useEffect(() => {
    if (!user) { setLoading(false); return }  // eslint-disable-line react-hooks/set-state-in-effect
    let cancelled = false
    Promise.all([
      patientApi.getProfile().catch(() => null),
      appointmentApi.getMy().catch(() => []),
    ]).then(([profileData, appts]) => {
      if (cancelled) return
      setProfile(profileData)
      let raw = []
      if (Array.isArray(appts)) raw = appts
      else if (Array.isArray(appts?.items)) raw = appts.items
      else if (Array.isArray(appts?.appointments)) raw = appts.appointments
      raw = raw.map((a) => {
        const s = a.status?.toLowerCase() ?? a.status
        return { ...a, status: s, effectiveStatus: isOverdue(a) ? APPOINTMENT_STATUS.OVERDUE : s }
      })
      const upcoming = raw
        .filter((a) => UPCOMING_STATUSES.has(a.effectiveStatus))
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
        .slice(0, 3)
      setUpcomingAppts(upcoming)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user])

  const doctorInitials = nextAppt?.doctor_name
    ? nextAppt.doctor_name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'DR'

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#041e42] via-[#0a3b7a] to-[#1565c0]" />
        <img
          src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=60"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-10">

          {/* Left column */}
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-semibold tracking-wide text-cyan-300">HealthAI · Est. {new Date().getFullYear()}</span>
            </div>

            <p className="mb-2 text-sm font-medium text-sky-300">
              {getGreeting()}, {firstName} 👋 · {getTodayLabel()}
            </p>

            <h1 className="mb-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              Your health, in{' '}
              <span className="text-cyan-400">expert hands.</span>
            </h1>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-sky-200">
              Book appointments, review lab results, and get instant AI health
              guidance — all in one trusted platform.
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { value: '240+', label: 'Specialists' },
                { value: '98%', label: 'Satisfaction' },
                { value: '24/7', label: 'AI Support' },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-sky-300">{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-px bg-white/15" />}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('booking-wizard')}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0a3b7a] shadow-lg transition-all hover:bg-sky-50 active:scale-95"
              >
                Book Appointment
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('symptom-checker')}
                className="rounded-xl border-2 border-white/40 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10 active:scale-95"
              >
                Try AI Check
              </button>
            </div>
          </div>

          {/* Right column — next appointment frosted card */}
          {!loading && nextAppt && (() => {
            const apptDate = new Date(nextAppt.appointment_date)
            const countdown = getCountdownLabel(nextAppt.appointment_date)
            const color = APPT_STATUS_COLOR[nextAppt.status] || {}
            const label = APPT_STATUS_LABEL[nextAppt.status] || nextAppt.status
            return (
              <div className="w-full shrink-0 sm:w-60">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-sky-300">
                    Next Appointment
                  </p>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md">
                      {doctorInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Dr. {nextAppt.doctor_name ?? 'Doctor'}</p>
                      <p className="text-xs text-sky-300">{nextAppt.specialty_name || 'Consultation'}</p>
                    </div>
                  </div>
                  <div className="mb-3 space-y-1 text-xs text-sky-200">
                    <p>📅 {apptDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p>🕐 {nextAppt.start_time?.slice(0, 5)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {countdown && (
                      <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {countdown}
                      </span>
                    )}
                    <span
                      className="rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: color.bg, color: color.text, borderColor: color.bg }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ══ ALLERGY ALERT ═══════════════════════════════════════════════════ */}
      {!allergyDismissed && allergyList.length > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert" aria-live="polite">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
              <TriangleAlert size={16} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Allergy Alert — review before your next visit</p>
              <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{allergyList.join(', ')}</p>
            </div>
            <button
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40"
              onClick={() => setAllergyDismissed(true)}
              aria-label="Dismiss allergy alert"
              id="dismiss-allergy-btn"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══ LOADING SKELETON ════════════════════════════════════════════════ */}
      {loading && (
        <div className="space-y-3">
          <SkeletonBlock className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* ══ AI CHECKER BANNER ═══════════════════════════════════════════ */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setCurrentView('symptom-checker')}
              className="group w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a237e] to-[#1565c0] p-5 text-left shadow-md transition-all hover:scale-[1.005] hover:shadow-lg active:scale-[0.998]"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                  <Bot size={26} className="text-white" />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300">AI-Powered · Free</p>
                  <h2 className="mt-0.5 text-base font-bold text-white">Having trouble with your health?</h2>
                  <p className="mt-0.5 text-sm text-blue-200">Describe your symptoms and get instant guidance, 24/7.</p>
                </div>
                <span className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1a237e] shadow-sm transition-colors group-hover:bg-sky-50">
                  Start AI Check →
                </span>
              </div>
            </button>
          </div>

          {/* ══ OUR SERVICES ════════════════════════════════════════════════ */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Our Services</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: <Bot size={22} />,
                  iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
                  title: 'AI Symptom Check',
                  desc: 'Instant health guidance',
                  view: 'symptom-checker',
                  hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-500/50',
                },
                {
                  icon: <Calendar size={22} />,
                  iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
                  title: 'Book Appointment',
                  desc: 'Find your doctor',
                  view: 'booking-wizard',
                  hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-500/50',
                },
                {
                  icon: <FlaskConical size={22} />,
                  iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                  title: 'Lab Results',
                  desc: 'Blood tests & imaging',
                  view: 'lab-results',
                  hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/50',
                },
                {
                  icon: <Stethoscope size={22} />,
                  iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
                  title: 'Health Record',
                  desc: 'Your medical history',
                  view: 'health-record',
                  hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/50',
                },
                {
                  icon: <History size={22} />,
                  iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
                  title: 'Triage History',
                  desc: 'Past AI checks',
                  view: 'triage-history',
                  hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-500/50',
                },
              ].map((s) => (
                <button
                  key={s.view}
                  type="button"
                  onClick={() => setCurrentView(s.view)}
                  className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition-all hover:shadow-md dark:border-[#2e2e40] dark:bg-[#1e1e2e] ${s.hoverBorder}`}
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.iconBg}`}>
                    {s.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{s.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{s.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ══ OUR SPECIALTIES ═════════════════════════════════════════════ */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Our Specialties</h2>
              <button
                type="button"
                onClick={() => setCurrentView('booking-wizard')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                See all →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setCurrentView('booking-wizard')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md dark:border-[#2e2e40] dark:bg-[#1e1e2e] dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
                >
                  <span className="text-base leading-none">{sp.icon}</span>
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* ══ WHY HEALTHAI ════════════════════════════════════════════════ */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Why HealthAI?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  icon: <Shield size={22} />,
                  iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                  title: 'Private & Secure',
                  desc: 'Your health data is encrypted end-to-end and never sold or shared.',
                },
                {
                  icon: <Zap size={22} />,
                  iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
                  title: 'AI-Powered Care',
                  desc: 'Smart diagnostics and symptom analysis available around the clock.',
                },
                {
                  icon: <Smartphone size={22} />,
                  iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
                  title: 'Always Available',
                  desc: 'Access your records, results, and doctors anytime, anywhere.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm dark:border-[#2e2e40] dark:bg-[#1e1e2e]"
                >
                  <span className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}>
                    {f.icon}
                  </span>
                  <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{f.title}</p>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ GETTING STARTED (new patients) ═════════════════════════════ */}
          {isNewPatient && <GettingStarted setCurrentView={setCurrentView} profile={profile} hasAppointment={upcomingAppts.length > 0} />}

          {/* ══ UPCOMING APPOINTMENTS (returning patients) ══════════════════ */}
          {!isNewPatient && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Upcoming Appointments</h2>
                <button
                  type="button"
                  onClick={() => setCurrentView('appointments')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all →
                </button>
              </div>

              {upcomingAppts.length === 0 ? (
                <EmptyState
                  iconEmoji="🗓️"
                  title="You're all clear for now"
                  description="No upcoming appointments scheduled"
                  actionLabel="Book an Appointment"
                  onAction={() => setCurrentView('booking-wizard')}
                />
              ) : (
                <div className="space-y-2.5">
                  {upcomingAppts.map((appt) => {
                    const apptDate = new Date(appt.appointment_date)
                    const month = apptDate.toLocaleString('en', { month: 'short' }).toUpperCase()
                    const day = apptDate.getDate()
                    const displayStatus = appt.effectiveStatus || appt.status
                    const color = APPT_STATUS_COLOR[displayStatus] || {}
                    const label = APPT_STATUS_LABEL[displayStatus] || displayStatus
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-[#2e2e40] dark:bg-[#1e1e2e] dark:hover:border-[#3a3a50]"
                      >
                        <div className="flex shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-center dark:border-[#2e2e40] dark:bg-[#252535]">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{month}</span>
                          <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{day}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {appt.doctor_name ? `Dr. ${appt.doctor_name}` : 'Doctor'} · {appt.specialty_name || 'Consultation'}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{appt.start_time?.slice(0, 5)}</p>
                        </div>
                        <span
                          className="shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: color.bg, color: color.text, borderColor: color.bg }}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ BOTTOM CTA BAND ═════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-2xl text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#041e42] via-[#0a3b7a] to-[#1565c0]" />
            <div className="relative px-6 py-10 sm:px-12">
              <h2 className="mb-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                Ready to take control of your health?
              </h2>
              <p className="mx-auto mb-6 max-w-md text-sm text-sky-200">
                Join 50,000+ patients who trust HealthAI for smarter, faster care.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('booking-wizard')}
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#0a3b7a] shadow-lg transition-all hover:bg-sky-50 active:scale-95"
                >
                  Book your first appointment
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('symptom-checker')}
                  className="rounded-xl border-2 border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10 active:scale-95"
                >
                  Try AI Symptom Check
                </button>
              </div>
            </div>
          </div>

          <div className="h-8" />
        </>
      )}

    </div>
  )
}

Dashboard.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  labOrders: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
}
