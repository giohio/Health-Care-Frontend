import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'in-room', label: 'In Room' },
  { key: 'completed', label: 'Completed' },
]

const PATIENTS = [
  {
    id: 'PT-2024-0142',
    queueNo: 1,
    name: 'Jane Doe',
    gender: 'F',
    age: 36,
    appointmentType: 'General Consultation',
    time: '10:00 AM',
    complaint: 'Persistent headache and mild fever for 2 days',
    severeAllergy: true,
    allergies: ['Penicillin (Severe)', 'Seafood (Severe)'],
    status: 'waiting',
    avatar: { from: 'from-indigo-400', to: 'to-violet-500' },
  },
  {
    id: 'PT-2024-0098',
    queueNo: 2,
    name: 'Minh Tran',
    gender: 'M',
    age: 45,
    appointmentType: 'Follow-up',
    time: '10:30 AM',
    complaint: 'Post-surgery wound check',
    severeAllergy: false,
    allergies: [],
    status: 'in-room',
    avatar: { from: 'from-teal-400', to: 'to-indigo-500' },
  },
  {
    id: 'PT-2024-0201',
    queueNo: 3,
    name: 'Linh Pham',
    gender: 'F',
    age: 28,
    appointmentType: 'First Visit',
    time: '11:00 AM',
    complaint: 'Irregular menstrual cycle, fatigue',
    severeAllergy: false,
    allergies: [],
    status: 'waiting',
    avatar: { from: 'from-cyan-400', to: 'to-sky-500' },
  },
  {
    id: 'PT-2024-0055',
    queueNo: 4,
    name: 'Nam Nguyen',
    gender: 'M',
    age: 62,
    appointmentType: 'Chronic Review',
    time: '11:30 AM',
    complaint: 'Diabetes and hypertension management',
    severeAllergy: false,
    allergies: ['Sulfa drugs (Moderate)'],
    status: 'waiting',
    avatar: { from: 'from-emerald-400', to: 'to-teal-500' },
  },
  {
    id: 'PT-2024-0310',
    queueNo: 5,
    name: 'Thu Le',
    gender: 'F',
    age: 19,
    appointmentType: 'Vaccination',
    time: '2:00 PM',
    complaint: '',
    severeAllergy: false,
    allergies: [],
    status: 'completed',
    avatar: { from: 'from-fuchsia-400', to: 'to-indigo-500' },
  },
  {
    id: 'PT-2024-0187',
    queueNo: 6,
    name: 'Bao Nguyen',
    gender: 'M',
    age: 38,
    appointmentType: 'Lab Result Review',
    time: '2:30 PM',
    complaint: 'Discuss recent blood panel results',
    severeAllergy: false,
    allergies: [],
    status: 'completed',
    avatar: { from: 'from-orange-400', to: 'to-rose-500' },
  },
  {
    id: 'PT-2024-0094',
    queueNo: 7,
    name: 'Mai Thi',
    gender: 'F',
    age: 52,
    appointmentType: 'Follow-up',
    time: '3:00 PM',
    complaint: 'Thyroid medication adjustment',
    severeAllergy: false,
    allergies: [],
    status: 'completed',
    avatar: { from: 'from-pink-400', to: 'to-rose-500' },
  },
  {
    id: 'PT-2024-0033',
    queueNo: 8,
    name: 'Duc Pham',
    gender: 'M',
    age: 71,
    appointmentType: 'Chronic Review',
    time: '3:30 PM',
    complaint: 'Heart condition monitoring',
    severeAllergy: true,
    allergies: ['Aspirin (Severe)', 'Beta-blockers (Moderate)'],
    status: 'completed',
    avatar: { from: 'from-indigo-500', to: 'to-slate-500' },
  },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-3z" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MessageSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getStatusLabel(status) {
  if (status === 'waiting') return 'Waiting'
  if (status === 'in-room') return 'In Room'
  return 'Completed'
}

function getStatusBadgeClasses(status) {
  if (status === 'waiting') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }
  if (status === 'in-room') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400'
  }
  return 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function getStatusDotClasses(status) {
  if (status === 'waiting') return 'bg-amber-400 animate-pulse'
  if (status === 'in-room') return 'bg-emerald-500 animate-pulse'
  return 'bg-slate-400 dark:bg-[#606070]'
}

export default function PatientQueueView({ navigateTo, setSelectedPatient, user, bookings, updateBookingStatus }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const clinicianName = user?.name || 'Doctor'

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return PATIENTS.filter((patient) => {
      const matchesFilter = filter === 'all' ? true : patient.status === filter
      const matchesSearch = query.length === 0
        ? true
        : patient.name.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, searchQuery])

  const queueBookings = useMemo(() => (
    bookings
      .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
      .sort((a, b) => b.createdAt - a.createdAt)
  ), [bookings])

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Patient Queue</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Wednesday, March 19 · 8 patients · {clinicianName}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]">8 Scheduled</span>
          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">2 Waiting</span>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-slate-600 transition-all duration-150 hover:border-slate-300 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:hover:border-[#353545] dark:focus-within:border-indigo-600 dark:focus-within:ring-indigo-950/50">
          <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]" aria-hidden="true"><SearchIcon /></span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name or ID..."
            className="w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => {
            const isActive = filter === item.key

            return (
              <button
                key={item.key}
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                    : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                }`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {queueBookings.length > 0 && (
        <div className="mb-5 space-y-3">
          {queueBookings.map((booking) => (
            <article key={booking.id} className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111118] ${
              booking.status === 'pending'
                ? 'border-amber-200 dark:border-amber-900/50'
                : 'border-slate-200 dark:border-[#252530]'
            }`}>
              {booking.status === 'pending' && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <span>New booking request · Awaiting confirmation</span>
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{booking.patientName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">
                    {booking.specialtyLabel} · {booking.doctorName} · {booking.dayLabel}, {booking.dateLabel} · {booking.timeLabel}
                  </p>
                </div>

                {booking.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                    Confirmed
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredPatients.map((patient) => (
          <article key={patient.id} className="card-hover flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
            <div className="relative shrink-0">
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${patient.avatar.from} ${patient.avatar.to}`}>
                {getInitials(patient.name)}
              </span>
              <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-[10px] font-bold text-slate-600 dark:border-[#111118] dark:bg-[#111118] dark:text-[#9898b0]">
                {patient.queueNo}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.name}</p>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                  {patient.age} · {patient.gender}
                </span>
                {patient.severeAllergy && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="inline-flex h-3 w-3"><ShieldAlertIcon /></span>
                    <span>Allergy</span>
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500 dark:text-[#70708a]">{patient.appointmentType}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-600 dark:text-[#9898b0]">{patient.time}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 dark:text-[#606070]">ID: {patient.id}</span>
              </div>

              {patient.complaint && (
                <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs italic text-slate-600 dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#9898b0]">
                  <span className="mr-1.5 inline-flex h-3 w-3 text-slate-400 align-[-2px] dark:text-[#606070]"><MessageSquareIcon /></span>
                  {patient.complaint}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${getStatusBadgeClasses(patient.status)}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(patient.status)}`} aria-hidden="true" />
                {getStatusLabel(patient.status)}
              </span>

              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                onClick={() => {
                  setSelectedPatient(patient)
                  navigateTo('emr')
                }}
              >
                Open EMR
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">No patients match this filter.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">Try a different search keyword or filter.</p>
        </div>
      )}
    </div>
  )
}

PatientQueueView.propTypes = {
  bookings: PropTypes.arrayOf(PropTypes.shape({
    createdAt: PropTypes.number,
    dateLabel: PropTypes.string,
    dayLabel: PropTypes.string,
    doctorName: PropTypes.string,
    id: PropTypes.string,
    patientName: PropTypes.string,
    specialtyLabel: PropTypes.string,
    status: PropTypes.string,
    timeLabel: PropTypes.string,
  })),
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  updateBookingStatus: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

PatientQueueView.defaultProps = {
  bookings: [],
  user: null,
}
