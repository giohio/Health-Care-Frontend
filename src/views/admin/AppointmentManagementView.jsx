import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const TABS = [
  { key: 'today', label: 'Today', count: 24 },
  { key: 'week', label: 'This Week', count: 87 },
  { key: 'all', label: 'All', count: 342 },
  { key: 'cancelled', label: 'Cancelled', count: 12 },
]

const APPOINTMENTS = [
  {
    id: 'APT-001',
    time: '08:30',
    patient: 'Morning Rounds',
    patientInitials: 'MR',
    patientAvatar: 'from-slate-500 to-gray-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'ward-visit',
    status: 'completed',
    date: '2025-03-19',
  },
  {
    id: 'APT-002',
    time: '10:00',
    patient: 'Jane Doe',
    patientInitials: 'JD',
    patientAvatar: 'from-indigo-500 to-blue-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'consultation',
    status: 'completed',
    date: '2025-03-19',
  },
  {
    id: 'APT-003',
    time: '10:30',
    patient: 'Minh Tran',
    patientInitials: 'MT',
    patientAvatar: 'from-teal-500 to-cyan-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'follow-up',
    status: 'in-progress',
    date: '2025-03-19',
  },
  {
    id: 'APT-004',
    time: '11:00',
    patient: 'Linh Pham',
    patientInitials: 'LP',
    patientAvatar: 'from-rose-500 to-fuchsia-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'first-visit',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-005',
    time: '11:30',
    patient: 'Nam Nguyen',
    patientInitials: 'NN',
    patientAvatar: 'from-slate-500 to-slate-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'chronic-review',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-006',
    time: '12:00',
    patient: 'Lunch Break',
    patientInitials: 'LB',
    patientAvatar: 'from-amber-500 to-orange-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'break',
    status: 'completed',
    date: '2025-03-19',
  },
  {
    id: 'APT-007',
    time: '13:00',
    patient: 'Thu Le',
    patientInitials: 'TL',
    patientAvatar: 'from-emerald-500 to-teal-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'vaccination',
    status: 'completed',
    date: '2025-03-19',
  },
  {
    id: 'APT-008',
    time: '13:30',
    patient: 'Bao Nguyen',
    patientInitials: 'BN',
    patientAvatar: 'from-amber-500 to-orange-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'lab-review',
    status: 'completed',
    date: '2025-03-19',
  },
  {
    id: 'APT-009',
    time: '14:00',
    patient: 'Mai Thi',
    patientInitials: 'MT',
    patientAvatar: 'from-violet-500 to-indigo-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'follow-up',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-010',
    time: '14:30',
    patient: 'Duc Pham',
    patientInitials: 'DP',
    patientAvatar: 'from-sky-500 to-blue-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'chronic-review',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-011',
    time: '15:00',
    patient: 'Tran Van A',
    patientInitials: 'TA',
    patientAvatar: 'from-cyan-500 to-teal-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'general',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-012',
    time: '15:30',
    patient: 'Le Thi B',
    patientInitials: 'LB',
    patientAvatar: 'from-rose-500 to-orange-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'first-visit',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-013',
    time: '16:00',
    patient: 'Pham Van C',
    patientInitials: 'PC',
    patientAvatar: 'from-emerald-500 to-lime-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'follow-up',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-014',
    time: '16:30',
    patient: 'Nguyen Thi D',
    patientInitials: 'ND',
    patientAvatar: 'from-fuchsia-500 to-rose-400',
    doctor: 'Dr. Reid',
    doctorInitials: 'MR',
    doctorAvatar: 'from-indigo-500 to-violet-400',
    type: 'vaccination',
    status: 'scheduled',
    date: '2025-03-19',
  },
  {
    id: 'APT-015',
    time: '17:00',
    patient: 'Bui Van E',
    patientInitials: 'BE',
    patientAvatar: 'from-slate-500 to-gray-400',
    doctor: 'Dr. Chen',
    doctorInitials: 'SC',
    doctorAvatar: 'from-teal-500 to-cyan-400',
    type: 'general',
    status: 'cancelled',
    date: '2025-03-19',
  },
]

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="14" x2="12" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function getTypeBadge(type) {
  const badges = {
    'consultation': 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40',
    'follow-up': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40',
    'first-visit': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40',
    'chronic-review': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40',
    'vaccination': 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40',
    'lab-review': 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900/40',
    'ward-visit': 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/40',
    'break': 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-900/40',
    'general': 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800/50',
  }
  return badges[type] || badges['general']
}

function getTypeLabel(type) {
  const labels = {
    'consultation': 'Consultation',
    'follow-up': 'Follow-up',
    'first-visit': 'First Visit',
    'chronic-review': 'Chronic Review',
    'vaccination': 'Vaccination',
    'lab-review': 'Lab Review',
    'ward-visit': 'Ward Visit',
    'break': 'Break',
    'general': 'General',
  }
  return labels[type] || 'General'
}

function getStatusNode(status) {
  if (status === 'scheduled') {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
        {' '}
        Scheduled
      </div>
    )
  }
  if (status === 'completed') {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        {' '}
        Completed
      </div>
    )
  }
  if (status === 'in-progress') {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
        {' '}
        In Progress
      </div>
    )
  }
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
        {' '}
        Cancelled
      </div>
    )
  }
}

export default function AppointmentManagementView({ navigateTo, user }) {
  const [activeTab, setActiveTab] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAppointments = useMemo(() => {
    let result = APPOINTMENTS

    if (activeTab !== 'all') {
      if (activeTab === 'today') {
        result = result.filter((apt) => apt.date === '2025-03-19')
      } else if (activeTab === 'cancelled') {
        result = result.filter((apt) => apt.status === 'cancelled')
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (apt) =>
          apt.patient.toLowerCase().includes(query) ||
          apt.doctor.toLowerCase().includes(query)
      )
    }

    if (doctorFilter !== 'all') {
      result = result.filter((apt) => apt.doctor === doctorFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter((apt) => apt.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter((apt) => apt.status === statusFilter)
    }

    return result
  }, [activeTab, searchQuery, doctorFilter, typeFilter, statusFilter])

  const itemsPerPage = 15
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const displayedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <>
      <span className="sr-only">{user.name}</span>
      {/* PAGE HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#eeeef5]">
            Appointment Management
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#9898b0]">
            {filteredAppointments.length} appointments
            {activeTab === 'today' && ' today'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo('appointments')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:border-[#353545] dark:hover:bg-[#1c1c25]"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => navigateTo('appointments/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-rose-700 hover:shadow-[0_4px_12px_rgba(244,63,94,0.35)] active:scale-[0.97] dark:bg-rose-600 dark:hover:bg-rose-500"
          >
            <CalendarPlusIcon className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-[#9898b0]">
            Scheduled
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            16
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-[#9898b0]">
            Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            5
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-[#9898b0]">
            In Progress
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              2
            </p>
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse dark:bg-amber-400" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-600 dark:text-[#9898b0]">
            Cancelled
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            1
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setCurrentPage(1)
            }}
            className={`flex-shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-600'
                : 'border border-slate-200 text-slate-700 hover:border-slate-300 dark:border-[#252530] dark:text-[#c8c8e0] dark:hover:border-[#353545]'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                activeTab === tab.key
                  ? 'bg-white/30 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH + FILTERS */}
      <div className="mb-6 flex flex-wrap gap-3">
        <label className="flex-1 min-w-64 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-[#252530] dark:bg-[#111118]">
          <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search patient or doctor name..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
          />
        </label>

        <select
          value={doctorFilter}
          onChange={(e) => {
            setDoctorFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:hover:border-[#353545]"
        >
          <option value="all">All Doctors</option>
          <option value="Dr. Chen">Dr. Chen</option>
          <option value="Dr. Reid">Dr. Reid</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:hover:border-[#353545]"
        >
          <option value="all">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="follow-up">Follow-up</option>
          <option value="first-visit">First Visit</option>
          <option value="chronic-review">Chronic Review</option>
          <option value="vaccination">Vaccination</option>
          <option value="lab-review">Lab Review</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:hover:border-[#353545]"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* APPOINTMENT TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-4 dark:border-[#252530] dark:bg-gradient-to-r dark:from-[#0c0c13] dark:to-[#111118]">
          <p className="col-span-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Time
          </p>
          <p className="col-span-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Patient
          </p>
          <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Doctor
          </p>
          <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Type
          </p>
          <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Status
          </p>
          <p className="col-span-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">
            Actions
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
          {displayedAppointments.map((apt) => (
            <div
              key={apt.id}
              className="grid grid-cols-12 gap-4 border-0 px-5 py-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-[#16161e]"
            >
              {/* TIME */}
              <div className="col-span-1 flex items-center">
                <p className="text-sm font-mono font-medium text-slate-700 dark:text-[#c8c8e0]">
                  {apt.time}
                </p>
              </div>

              {/* PATIENT */}
              <div className="col-span-3 flex items-center gap-2">
                <div
                  className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-semibold text-white ${apt.patientAvatar}`}
                >
                  {apt.patientInitials}
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">
                  {apt.patient}
                </p>
              </div>

              {/* DOCTOR */}
              <div className="col-span-2 flex items-center gap-2">
                <div
                  className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-semibold text-white ${apt.doctorAvatar}`}
                >
                  {apt.doctorInitials}
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">
                  {apt.doctor}
                </p>
              </div>

              {/* TYPE */}
              <div className="col-span-2 flex items-center">
                <span
                  className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-medium ${getTypeBadge(apt.type)}`}
                >
                  {getTypeLabel(apt.type)}
                </span>
              </div>

              {/* STATUS */}
              <div className="col-span-2 flex items-center">
                {getStatusNode(apt.status)}
              </div>

              {/* ACTIONS */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => navigateTo('appointments/' + apt.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 dark:text-[#70708a] dark:hover:bg-[#1c1c25] dark:hover:text-[#9898b0]"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('appointments/' + apt.id + '/edit')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600 dark:text-[#70708a] dark:hover:bg-[#1c1c25] dark:hover:text-[#9898b0]"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                {apt.status === 'scheduled' && (
                  <button
                    type="button"
                    onClick={() => navigateTo('appointments/' + apt.id + '/cancel')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-rose-100 hover:text-rose-500 dark:text-[#70708a] dark:hover:bg-rose-950/30 dark:hover:text-rose-500"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-[#9898b0]">
          Showing {displayedAppointments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of{' '}
          {filteredAppointments.length}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-[#353545] dark:hover:bg-[#1c1c25]"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {Array.from(
            { length: Math.min(3, totalPages) },
            (_, i) => (currentPage <= 2 ? i + 1 : currentPage - 1 + i)
          ).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === page
                  ? 'bg-rose-600 text-white dark:bg-rose-600'
                  : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-[#353545]'
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 3 && currentPage < totalPages - 1 && (
            <span className="text-slate-400 dark:text-[#505060]">...</span>
          )}

          {totalPages > 3 && currentPage <= totalPages - 2 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-[#353545]"
            >
              {totalPages}
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-[#353545] dark:hover:bg-[#1c1c25]"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}

AppointmentManagementView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
