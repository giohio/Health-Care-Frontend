import { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { appointmentApi } from '../../api/appointment'
import DatePickerInput from '../../components/shared/DatePickerInput'
import { APPOINTMENT_STATUS } from '../../constants/enums'
import { getTriageSessionSummary } from '../../api/ai'
import {
  IconSearch, IconMessageSquare, IconFlask, IconCalendar, IconUsers,
  IconCheckCircle, IconShieldAlert, IconClock,
} from '../../icons'

const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Pediatrics',
  'General Surgery', 'Dermatology', 'ENT', 'Ophthalmology',
]

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in-room', label: 'In Room' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getStatusLabel(status) {
  const map = { waiting: 'Waiting', 'pending-payment': 'Awaiting Payment', confirmed: 'Confirmed', 'in-room': 'In Room', overdue: 'Overdue', completed: 'Completed', declined: 'Declined' }
  return map[status] || 'Unknown'
}

function getStatusDotClasses(status) {
  const map = { waiting: 'bg-amber-400 animate-pulse', 'pending-payment': 'bg-slate-400', confirmed: 'bg-blue-400', 'in-room': 'bg-emerald-500 animate-pulse', overdue: 'bg-rose-400 animate-pulse', completed: 'bg-slate-400 dark:bg-[#606070]', declined: 'bg-rose-400' }
  return map[status] || 'bg-slate-400'
}

function getAccentColor(status) {
  const map = { waiting: 'bg-amber-400', 'pending-payment': 'bg-slate-400', confirmed: 'bg-blue-500', 'in-room': 'bg-emerald-500', overdue: 'bg-rose-500', completed: 'bg-slate-400 dark:bg-[#606070]', declined: 'bg-rose-400' }
  return map[status] || 'bg-slate-400'
}

function getAvatarGradient(status) {
  const map = {
    waiting: 'from-amber-400 to-orange-400',
    'pending-payment': 'from-slate-300 to-slate-400',
    confirmed: 'from-blue-400 to-indigo-500',
    'in-room': 'from-emerald-400 to-teal-500',
    overdue: 'from-rose-400 to-red-500',
    completed: 'from-slate-300 to-slate-400',
    declined: 'from-rose-300 to-rose-400',
  }
  return map[status] || 'from-indigo-400 to-violet-500'
}

function formatApptTime(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return null }
}

function getPatientDisplayName(patient) {
  const name = patient.patient_name ?? patient.full_name ?? patient.name ?? patient.patient?.full_name ?? patient.profile?.full_name
  if (name) return name
  const id = patient.patient_id || patient.id
  return id ? `Patient ${String(id).slice(0, 8)}` : 'Patient'
}

function LabReadinessBadge({ lr }) {
  if (!lr || (lr.total_orders ?? 0) === 0) return null
  if (lr.all_ready) {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
        <span className="inline-flex h-3 w-3"><IconCheckCircle /></span>{' '}
        Labs Ready
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
      <span className="inline-flex h-3 w-3"><IconFlask /></span>{' '}
      {lr.completed_results ?? 0}/{lr.total_orders} Ready
    </span>
  )
}

LabReadinessBadge.propTypes = {
  lr: PropTypes.shape({
    total_orders: PropTypes.number,
    all_ready: PropTypes.bool,
    completed_results: PropTypes.number,
  }),
}

LabReadinessBadge.defaultProps = {
  lr: null,
}

function timeToMinutes(t) {
  const [h, m] = String(t || '0:0').split(':').map(Number)
  return h * 60 + m
}

function StatCard({ label, value, gradientFrom, gradientTo, icon, glowColor }) {
  return (
    <div className={`group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-white/60 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-white/5`}
      style={{ background: `linear-gradient(135deg, ${gradientFrom}18 0%, ${gradientTo}0a 100%)`, borderColor: `${gradientFrom}30` }}
    >
      {/* Glow */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60" style={{ backgroundColor: glowColor }} aria-hidden="true" />
      {/* Icon */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        <span className="inline-flex h-5 w-5 text-white">{icon}</span>
      </div>
      <div className="relative">
        <p className="text-[28px] font-black leading-none tracking-tight text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#70708a]">{label}</p>
      </div>
    </div>
  )
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  gradientFrom: PropTypes.string.isRequired,
  gradientTo: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  glowColor: PropTypes.string,
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/50 px-5 py-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]/50 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex items-center gap-4 sm:min-w-0 sm:flex-1">
        <div className="h-12 w-12 shrink-0 rounded-[14px] bg-slate-200 dark:bg-[#252530] animate-pulse" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-4 w-40 rounded-md bg-slate-200 dark:bg-[#252530] animate-pulse" />
          <div className="h-3 w-60 rounded-md bg-slate-100 dark:bg-[#1c1c25] animate-pulse" />
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between sm:justify-end">
        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-[#252530] animate-pulse" />
      </div>
    </div>
  )
}

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 dark:border-[#252530] dark:bg-[#0d0d14]">
      <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-[#16161e]">
        <span className="inline-flex h-6 w-6 text-slate-400 dark:text-[#505060]"><IconUsers /></span>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-[#c8c8e0]">
        {filter === 'all' ? 'No patients scheduled today' : `No ${filter} patients found`}
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-[#70708a]">
        {filter === 'all' ? 'Select a different date or wait for new bookings.' : 'Try a different filter or search keyword.'}
      </p>
    </div>
  )
}

EmptyState.propTypes = {
  filter: PropTypes.string.isRequired,
}

export default function PatientQueueView({ navigateTo, setSelectedPatient, user, onOpenTriageSession, embedded }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })
  const [isAllTime, setIsAllTime] = useState(false)
  // Decline modal
  const [declineModal, setDeclineModal] = useState(null)
  const [declineReason, setDeclineReason] = useState('')
  const [declineRedirect, setDeclineRedirect] = useState('')
  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null)
  const [summaryModal, setSummaryModal] = useState(null)
  // Adjust modal
  const [adjustModal, setAdjustModal] = useState(null)
  const [adjustDuration, setAdjustDuration] = useState('')
  const [adjustFee, setAdjustFee] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState(null)
  const clinicianName = user?.full_name ?? user?.name ?? 'Doctor'

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const q = isAllTime ? {} : (selectedDate ? { date_from: selectedDate, date_to: selectedDate } : {})
      const raw = await appointmentApi.getByDoctor(user.id, q)
      const seen = new Set()
      const deduped = (Array.isArray(raw) ? raw : []).filter((a) => {
        if (a.id == null) return true
        if (seen.has(a.id)) return false
        seen.add(a.id)
        return true
      })
      setAppointments(deduped)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedDate, isAllTime])

  useEffect(() => { load() }, [load])

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return appointments.filter((p) => {
      let pStatus = 'waiting'
      if (p.status === APPOINTMENT_STATUS.PENDING_PAYMENT) pStatus = 'pending-payment'
      else if (p.status === APPOINTMENT_STATUS.IN_PROGRESS) pStatus = 'in-room'
      else if (p.status === APPOINTMENT_STATUS.COMPLETED) pStatus = 'completed'
      else if (p.status === APPOINTMENT_STATUS.CONFIRMED) pStatus = 'confirmed'
      else if (p.status === APPOINTMENT_STATUS.OVERDUE) pStatus = 'overdue'
      else if (p.status === APPOINTMENT_STATUS.DECLINED || p.status === APPOINTMENT_STATUS.CANCELLED) pStatus = 'declined'
      const matchesFilter = filter === 'all' || pStatus === filter
      const name = (p.patient_name ?? p.name ?? '').toLowerCase()
      return matchesFilter && (query === '' || name.includes(query))
    })
  }, [filter, searchQuery, appointments])

  const stats = useMemo(() => {
    const waiting = appointments.filter((a) => a.status === APPOINTMENT_STATUS.PENDING || a.status === APPOINTMENT_STATUS.WAITING).length
    const inRoom = appointments.filter((a) => a.status === APPOINTMENT_STATUS.IN_PROGRESS).length
    const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length
    const overdue = appointments.filter((a) => a.status === APPOINTMENT_STATUS.OVERDUE).length
    return { total: appointments.length, waiting, inRoom, completed, overdue }
  }, [appointments])

  async function handleConfirm(id) {
    if (actionLoading) return
    setActionLoading(id)
    setActionError(null)
    setActionSuccess(null)
    const appt = appointments.find((a) => a.id === id)
    console.warn('[handleConfirm] appointment_id:', id, '| appt.doctor_id:', appt?.doctor_id, '| user.id:', user?.id, '| match:', appt?.doctor_id === user?.id)
    try {
      const res = await appointmentApi.confirm(id)
      const updated = res?.data ?? res
      // Force status to CONFIRMED — don't rely on response shape
      setAppointments((prev) => prev.map((a) =>
        a.id === id
          ? { ...a, ...(updated && typeof updated === 'object' ? updated : {}), status: APPOINTMENT_STATUS.CONFIRMED }
          : a
      ))
    } catch (e) {
      console.error('[handleConfirm] error:', e)
      if (e?.status === 403 || e?.message?.toLowerCase().includes('only assigned doctor')) {
        // Appointment belongs to a different doctor or is already confirmed — reload to get fresh data
        setActionError('This appointment cannot be confirmed by your account. The queue will reload with the latest data.')
        load()
      } else {
        setActionError(e?.message || 'Confirm failed. Please try again.')
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDecline(id) {
    if (actionLoading) return
    setActionLoading(id)
    setActionError(null)
    setActionSuccess(null)
    try {
      const res = await appointmentApi.decline(id, declineReason || undefined, declineRedirect || undefined)
      const updated = res?.data ?? res
      setAppointments((prev) => prev.map((a) =>
        a.id === id
          ? { ...a, ...(updated && typeof updated === 'object' ? updated : {}), status: APPOINTMENT_STATUS.DECLINED }
          : a
      ))
      setDeclineModal(null)
      setDeclineReason('')
      setDeclineRedirect('')
      setActionSuccess(
        updated?.redirect_department
          ? `Appointment declined. Patient referred to ${updated.redirect_department}.`
          : 'Appointment declined.'
      )
    } catch (e) {
      console.error('[handleDecline] error:', e)
      if (e?.message?.toLowerCase().includes('cannot be declined from current status')) {
        setDeclineModal(null)
        setActionError('This appointment is no longer in a state that can be declined. The list will reload.')
        load()
      } else {
        setActionError(e?.message || 'Decline failed. Please try again.')
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAdjust() {
    const dur = Number.parseInt(adjustDuration, 10)
    if (!dur || dur < 5) { setAdjustError('Duration must be at least 5 minutes.'); return }
    setAdjusting(true)
    setAdjustError(null)
    const body = { duration_minutes: dur }
    const fee = Number.parseInt(adjustFee, 10)
    if (adjustFee !== '' && !Number.isNaN(fee)) body.consultation_fee = fee
    try {
      await appointmentApi.adjust(adjustModal.id, body)
      setAdjustModal(null)
      await load()
    } catch (e) {
      setAdjustError(e?.message || 'Adjust failed. Please try again.')
    } finally {
      setAdjusting(false)
    }
  }

  async function handleLoadSummary(sessionId) {
    if (!sessionId) return
    setSummaryModal({ loading: true, data: null, error: null, sessionId })
    try {
      const res = await getTriageSessionSummary(sessionId)
      const data = res?.data ?? res
      setSummaryModal({ loading: false, data, error: null })
    } catch (e) {
      setSummaryModal({ loading: false, data: null, error: e?.message || 'Failed to load AI summary.' })
    }
  }

  const dateLabel = isAllTime ? 'All Time' : (selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'No Date')

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      {/* Breadcrumb — only when not embedded */}
      {!embedded && (
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-[#606070] dark:hover:text-indigo-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><polyline points="15 18 9 12 15 6" /></svg>
          Dashboard
        </button>
      )}

      {/* Header — only when not embedded */}
      {!embedded && (
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Patient Queue</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">
                {dateLabel} · {clinicianName}
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0] sm:flex">
              <span className="inline-flex h-4 w-4 text-slate-400"><IconCalendar /></span>
              {isAllTime ? 'All Time' : (selectedDate || 'No Date')}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{actionError}</p>
          <button type="button" className="text-rose-500 hover:text-rose-700 dark:text-rose-400" onClick={() => setActionError(null)}>
            ✕
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{actionSuccess}</p>
          <button type="button" className="text-emerald-500 hover:text-emerald-700 dark:text-emerald-400" onClick={() => setActionSuccess(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={loading ? '–' : stats.total}
          gradientFrom="#6366f1"
          gradientTo="#818cf8"
          glowColor="#6366f150"
          icon={<IconUsers />}
        />
        <StatCard
          label="Waiting"
          value={loading ? '–' : stats.waiting}
          gradientFrom="#f59e0b"
          gradientTo="#fbbf24"
          glowColor="#f59e0b50"
          icon={<IconClock />}
        />
        <StatCard
          label="In Room"
          value={loading ? '–' : stats.inRoom}
          gradientFrom="#10b981"
          gradientTo="#34d399"
          glowColor="#10b98150"
          icon={<IconUsers />}
        />
        <StatCard
          label="Completed"
          value={loading ? '–' : stats.completed}
          gradientFrom="#64748b"
          gradientTo="#94a3b8"
          glowColor="#64748b50"
          icon={<IconCheckCircle />}
        />
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <DatePickerInput
            value={selectedDate}
            onChange={(v) => { setIsAllTime(false); setSelectedDate(v) }}
            isAllTime={isAllTime}
            onActivate={() => setIsAllTime(false)}
          />
          <button
            type="button"
            aria-label="Show all-time appointments"
            className={`flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent px-4 text-sm font-semibold transition-all duration-300 ${isAllTime ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#1c1c25] dark:text-[#c8c8e0] dark:hover:bg-[#252530]'}`}
            onClick={() => setIsAllTime(true)}
          >
            All Time
          </button>
          <label className="group flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition-all duration-300 hover:border-slate-300 hover:shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5] dark:hover:border-[#353545] dark:focus-within:border-indigo-600 dark:focus-within:ring-indigo-900/20 sm:max-w-xs">
            <span className="inline-flex h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-500 dark:text-[#606070] dark:group-focus-within:text-indigo-400" aria-hidden="true"><IconSearch /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient..."
              className="w-full bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
            />
          </label>
        </div>

        {/* Filter Tabs - sticky */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((item) => {
            const isActive = filter === item.key
            let count
            if (item.key === 'all') { count = stats.total }
            else if (item.key === 'waiting') { count = stats.waiting }
            else if (item.key === 'in-room') { count = stats.inRoom }
            else if (item.key === 'completed') { count = stats.completed }
            else if (item.key === 'overdue') { count = stats.overdue }
            else {
              const targetStatus = item.key === 'confirmed' ? APPOINTMENT_STATUS.CONFIRMED : APPOINTMENT_STATUS.PENDING
              count = appointments.filter((a) => a.status === targetStatus).length
            }
            return (
              <button
                key={item.key}
                type="button"
                className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-[#252530] dark:bg-[#111118] dark:text-[#70708a] dark:hover:border-[#353545] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                }`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
                <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-[#1c1c25]'}`}>
                  {loading ? '…' : count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
        </div>
      )}

      {/* Patient Cards */}
      {!loading && filteredPatients.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredPatients.map((patient, idx) => {
            const name = getPatientDisplayName(patient)
            let pStatus = 'waiting'
            if (patient.status === APPOINTMENT_STATUS.CONFIRMED) pStatus = 'confirmed'
            else if (patient.status === APPOINTMENT_STATUS.IN_PROGRESS) pStatus = 'in-room'
            else if (patient.status === APPOINTMENT_STATUS.COMPLETED) pStatus = 'completed'
            else if (patient.status === APPOINTMENT_STATUS.OVERDUE) pStatus = 'overdue'
            else if (patient.status === APPOINTMENT_STATUS.DECLINED || patient.status === APPOINTMENT_STATUS.CANCELLED) pStatus = 'declined'

            const hasSevereAllergy = typeof patient.allergies === 'string'
              ? patient.allergies.toLowerCase().includes('severe')
              : Array.isArray(patient.allergies)
              ? patient.allergies.some((a) => typeof a === 'string' ? a.toLowerCase().includes('severe') : a?.severity?.toLowerCase().includes('severe'))
              : false

            const complaint = patient.chief_complaint ?? patient.complaint ?? ''
            const age = patient.patient_age ?? patient.age ?? ''
            const gender = patient.patient_gender ?? patient.gender ?? ''
            const time = patient.start_time ?? patient.time ?? ''
            const accent = getAccentColor(pStatus)

            return (
              <article
                key={patient.id ?? `patient-${idx}`}
                className={`group relative flex flex-col gap-4 rounded-[20px] bg-white/80 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] md:flex-row md:items-center md:gap-5 dark:bg-[#111118]/80 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] ${
                  patient.ai_referred
                    ? 'border border-indigo-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:border-indigo-300 dark:border-indigo-900/60 dark:hover:border-indigo-700/80'
                    : 'border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:border-[#252530] dark:hover:border-[#353545]'
                }`}
              >
                {/* Ambient glow container */}
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-[20px] bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 opacity-0 transition-opacity duration-300 group-hover:from-indigo-50/50 group-hover:to-transparent group-hover:opacity-100 dark:group-hover:from-indigo-900/10" aria-hidden="true" />

                {/* Accent bar */}
                {pStatus !== 'completed' && pStatus !== 'declined' && (
                  <div className={`absolute -left-px top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full ${accent} opacity-80`} />
                )}

                {/* Avatar */}
                <div className="relative shrink-0 md:pl-2">
                  <span className={`inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarGradient(pStatus)} text-[20px] font-extrabold text-white shadow-sm ring-1 ring-slate-100/50 dark:ring-[#252530]/50`}>
                    {getInitials(name)}
                  </span>
                  {patient.queue_number ? (
                    <span className="absolute -bottom-1.5 -right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 border-2 border-white text-[11px] font-bold text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:border-[#111118]">
                      {patient.queue_number}
                    </span>
                  ) : (
                    <span className="absolute -bottom-1.5 -right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border-2 border-white text-[11px] font-bold text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:bg-[#252530] dark:border-[#111118] dark:text-[#9898b0]">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 md:pl-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">{name}</p>
                    {patient.ai_referred && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm dark:from-indigo-950/60 dark:to-violet-950/60 dark:text-indigo-300">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/></svg>
                        AI Recommended · Review
                      </span>
                    )}
                    {patient.ai_referred && patient.urgency_level && patient.urgency_level !== 'low' && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        patient.urgency_level === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${patient.urgency_level === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        {patient.urgency_level === 'urgent' ? 'Urgent' : 'Priority'}
                      </span>
                    )}
                    {(age || gender) && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                        {age}{age && gender ? ' · ' : ''}{gender}
                      </span>
                    )}
                    {hasSevereAllergy && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/50 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <span className="inline-flex h-3.5 w-3.5"><IconShieldAlert /></span>{' '}
                        Allergy
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-[#70708a]">
                    {patient.specialty_name && <span className="font-medium">{patient.specialty_name}</span>}
                    {patient.specialty_name && time && <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-[#353545] sm:inline-block" />}
                    {time && <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-[#a0a0b8]"><span className="inline-flex h-3.5 w-3.5 opacity-70"><IconClock /></span>{time}</span>}
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-[#353545] sm:inline-block" />
                    <span className="font-mono text-[10px] text-slate-400 dark:text-[#505060]">ID:{patient.id?.slice(0, 8)}</span>
                  </div>
                  {complaint && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-600 dark:bg-[#16161e]/80 dark:text-[#9898b0]">
                      <span className="mt-0.5 shrink-0 text-slate-400 dark:text-[#505060]"><IconMessageSquare /></span>
                      <span className="leading-relaxed line-clamp-2 italic">"{complaint}"</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center justify-between pt-2 md:pt-0 md:justify-end border-t border-slate-100/80 md:border-0 dark:border-[#252530]/80">
                  <div className="flex flex-col md:items-end gap-2.5 w-full md:w-auto">
                    <div className="flex items-center justify-between md:justify-end w-full gap-2">
                       <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset px-2.5 py-1 text-xs font-semibold ${
                        pStatus === 'waiting' ? 'bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/20' :
                        pStatus === 'confirmed' ? 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/20' :
                        pStatus === 'in-room' ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/20' :
                        pStatus === 'overdue' ? 'bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/20' :
                        pStatus === 'declined' ? 'bg-rose-50 text-rose-600 ring-rose-600/10 dark:bg-rose-950/20 dark:text-rose-500 dark:ring-rose-500/10' :
                        'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-[#1c1c25] dark:text-[#9898b0] dark:ring-[#353545]'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(pStatus)}`} aria-hidden="true" />
                        {getStatusLabel(pStatus)}
                      </span>
                      <LabReadinessBadge lr={patient.lab_readiness} />
                    </div>

                    {pStatus === 'waiting' && (
                      <div className="mt-1 flex w-full md:w-auto flex-wrap items-center gap-2">
                        {patient.ai_referred && patient.triage_session_id && (
                          <button
                            type="button"
                            className="flex-1 md:flex-none inline-flex justify-center rounded-xl border border-indigo-200/80 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-[0_2px_8px_-4px_rgba(99,102,241,0.2)] transition-all hover:bg-indigo-50/50 dark:border-indigo-800/60 dark:bg-transparent dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                            onClick={() => handleLoadSummary(patient.triage_session_id)}
                          >
                            AI Summary
                          </button>
                        )}
                        <button
                          type="button"
                          className="flex-1 md:flex-none inline-flex justify-center rounded-xl border border-rose-200/80 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-50 dark:border-rose-900/60 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30"
                          onClick={() => { setDeclineModal({ id: patient.id, patientName: name }); setDeclineReason(''); setDeclineRedirect('') }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="flex-1 md:flex-none inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                          onClick={() => setConfirmModal({ id: patient.id, patientName: name, specialty: patient.specialty_name, date: patient.appointment_date, time: patient.start_time })}
                        >
                          Confirm
                        </button>
                      </div>
                    )}

                    {pStatus !== 'pending-payment' && pStatus !== 'waiting' && pStatus !== 'declined' && (
                      <div className="mt-1 flex w-full md:w-auto items-center gap-2">
                        {patient.ai_referred && patient.triage_session_id && (
                          <button
                            type="button"
                            className="flex-1 md:flex-none inline-flex justify-center rounded-xl border border-indigo-200/80 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-[0_2px_8px_-4px_rgba(99,102,241,0.2)] transition-all hover:bg-indigo-50/50 hover:shadow-indigo-200 dark:border-indigo-800/60 dark:bg-transparent dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                            onClick={() => handleLoadSummary(patient.triage_session_id)}
                          >
                            AI Summary
                          </button>
                        )}
                        <button
                          type="button"
                          className="flex-1 md:flex-none inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                          onClick={() => {
                            setSelectedPatient(patient)
                            navigateTo('emr')
                          }}
                        >
                          Open EMR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPatients.length === 0 && (
        <EmptyState filter={filter} />
      )}

      {/* ── Confirm Modal ─────────────────────────────────── */}
      {confirmModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setConfirmModal(null)}
          onKeyDown={(e) => e.key === 'Escape' && setConfirmModal(null)}
        >
          <dialog open aria-label="Confirm appointment" className="static m-0 w-full max-w-sm border-0 bg-transparent p-0 shadow-none">
            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Confirm Appointment</h3>
                    <p className="text-xs text-slate-500 dark:text-[#70708a]">A queue number will be assigned</p>
                  </div>
                </div>
                <button type="button" className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1c1c25] dark:hover:text-[#c8c8e0]" onClick={() => setConfirmModal(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Patient info */}
              <div className="px-5 pt-4 pb-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{confirmModal.patientName}</p>
                  {(confirmModal.specialty || confirmModal.date) && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                      {[confirmModal.specialty, confirmModal.date, confirmModal.time].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              {/* Footer */}
              <div className="flex gap-2 px-5 py-4">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!actionLoading}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  onClick={() => {
                    const apptId = confirmModal.id
                    setConfirmModal(null)
                    handleConfirm(apptId)
                  }}
                >
                  {actionLoading ? 'Confirming…' : 'Yes, Confirm'}
                </button>
              </div>
            </div>
          </dialog>
        </div>,
        document.body
      )}

      {/* ── Decline Modal ─────────────────────────────────── */}
      {declineModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDeclineModal(null)}
          onKeyDown={(e) => e.key === 'Escape' && setDeclineModal(null)}
        >
          <dialog open aria-label="Decline appointment" className="static m-0 w-full max-w-md border-0 bg-transparent p-0 shadow-none">
            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600 dark:text-rose-400" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Decline Appointment</h3>
                    {declineModal.patientName && (
                      <p className="text-xs text-slate-500 dark:text-[#70708a]">{declineModal.patientName}</p>
                    )}
                  </div>
                </div>
                <button type="button" className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1c1c25] dark:hover:text-[#c8c8e0]" onClick={() => setDeclineModal(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Body */}
              <div className="space-y-4 px-5 py-4">
                <p className="text-sm text-slate-500 dark:text-[#70708a]">Optionally provide a reason and redirect the patient to another department.</p>
                <div>
                  <label htmlFor="decline-reason" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Reason <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea
                    id="decline-reason"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-300 focus:ring-1 focus:ring-rose-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-rose-800/60 dark:focus:ring-rose-950/30"
                    placeholder="Symptoms not within this specialty, patient requested reschedule…"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="decline-redirect" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Refer to department <span className="font-normal text-slate-400">(optional)</span></label>
                  <select
                    id="decline-redirect"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5]"
                    value={declineRedirect}
                    onChange={(e) => setDeclineRedirect(e.target.value)}
                  >
                    <option value="">No referral</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                  onClick={() => setDeclineModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                  onClick={() => handleDecline(declineModal.id)}
                >
                  {actionLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />{' '}
                      Declining…
                    </>
                  ) : 'Decline Appointment'}
                </button>
              </div>
            </div>
          </dialog>
        </div>,
        document.body
      )}

      {/* ── Adjust Modal ─────────────────────────────────── */}
      {adjustModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setAdjustModal(null)}
          onKeyDown={(e) => e.key === 'Escape' && setAdjustModal(null)}
        >
          <dialog open aria-label="Adjust appointment" className="static m-0 w-full max-w-sm border-0 bg-transparent p-0 shadow-none">
            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1c1c25]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-[#9898b0]" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Adjust Appointment</h3>
                    <p className="text-xs text-slate-500 dark:text-[#70708a]">{adjustModal.patientName} · {adjustModal.startTime}{adjustModal.endTime ? ` – ${adjustModal.endTime}` : ''}</p>
                  </div>
                </div>
                <button type="button" className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1c1c25] dark:hover:text-[#c8c8e0]" onClick={() => setAdjustModal(null)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Body */}
              <div className="space-y-4 px-5 py-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <p className="text-xs text-blue-700 dark:text-blue-300">Subsequent confirmed appointments will be shifted automatically. Affected patients will be notified.</p>
                </div>
                <div>
                  <label htmlFor="adj-duration" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Duration (minutes)</label>
                  <input
                    id="adj-duration"
                    type="number"
                    min="5"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-700 dark:focus:ring-indigo-950/30"
                    value={adjustDuration}
                    onChange={(e) => setAdjustDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="adj-fee" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Consultation Fee (VND) <span className="font-normal text-slate-400">(optional)</span></label>
                  <input
                    id="adj-fee"
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-700 dark:focus:ring-indigo-950/30"
                    placeholder="Leave blank to keep current fee"
                    value={adjustFee}
                    onChange={(e) => setAdjustFee(e.target.value)}
                  />
                </div>
                {adjustError && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{adjustError}</p>
                )}
              </div>
              {/* Footer */}
              <div className="flex gap-2 px-5 py-4 border-t border-slate-100 dark:border-[#1c1c25]">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                  onClick={() => setAdjustModal(null)}
                  disabled={adjusting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={adjusting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleAdjust}
                >
                  {adjusting ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Adjusting…</>
                  ) : 'Save Adjustment'}
                </button>
              </div>
            </div>
          </dialog>
        </div>,
        document.body
      )}

      {/* AI Triage Summary Modal */}
      {summaryModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSummaryModal(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSummaryModal(null)}
        >
          <dialog open aria-label="AI Triage Summary" className="static m-0 w-full max-w-lg border-0 bg-transparent p-0 shadow-none">
            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-white text-sm">✦</span>
                <span className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">AI Triage Summary</span>
              </div>
              <div className="flex items-center gap-2">
                {summaryModal.sessionId && onOpenTriageSession && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-800/60 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                    onClick={() => { onOpenTriageSession(summaryModal.sessionId); setSummaryModal(null) }}
                  >
                    Full Detail
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                )}
                <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={() => setSummaryModal(null)} aria-label="Close">✕</button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {summaryModal.loading && (
                <div className="flex items-center justify-center py-10">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  <span className="ml-3 text-sm text-slate-400">Loading summary…</span>
                </div>
              )}
              {summaryModal.error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{summaryModal.error}</p>
              )}
              {summaryModal.data && (() => {
                const s = summaryModal.data
                const recommendationReasons = [s.clinical_reasoning, s.department_reasoning]
                  .filter((reason) => typeof reason === 'string' && reason.trim())
                return (
                  <div className="space-y-4">
                    {s.chief_complaint && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#505060]">Chief Complaint</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{s.chief_complaint}</p>
                      </div>
                    )}
                    {s.patient_description && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 italic text-sm text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
                        "{s.patient_description}"
                      </div>
                    )}
                    {s.reported_symptoms?.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#505060]">Reported Symptoms</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.reported_symptoms.map((sym) => (
                            <span key={sym} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0]">{sym}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {s.duration && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
                          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#505060]">Duration</p>
                          <p className="text-xs font-medium text-slate-800 dark:text-[#dddde8]">{s.duration}</p>
                        </div>
                      )}
                      {s.severity && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
                          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#505060]">Severity</p>
                          <p className="text-xs font-medium capitalize text-slate-800 dark:text-[#dddde8]">{s.severity}</p>
                        </div>
                      )}
                    </div>
                    {s.suspected_conditions?.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#505060]">Suspected Conditions</p>
                        <ul className="space-y-1">
                          {s.suspected_conditions.map((c) => (
                            <li key={c} className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-[#c8c8e0]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(s.recommended_department || s.urgency_level || recommendationReasons.length > 0) && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800/60 dark:bg-indigo-950/30">
                        {s.recommended_department && <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">→ {s.recommended_department}</p>}
                        {s.urgency_level && <p className="mt-0.5 text-xs text-indigo-500 dark:text-indigo-400">Urgency: {s.urgency_level}</p>}
                        {recommendationReasons.length > 0 && (
                          <div className="mt-3 border-t border-indigo-200/80 pt-2 dark:border-indigo-800/50">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Why AI Suggested This</p>
                            <div className="space-y-1.5">
                              {recommendationReasons.map((reason) => (
                                <p key={reason} className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-200">{reason}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {s.triage_status && (
                      <p className="text-right text-[11px] text-slate-400 dark:text-[#505060]">Session status: {s.triage_status}</p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
          </dialog>
        </div>,
        document.body
      )}
    </div>
  )
}

PatientQueueView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  onOpenTriageSession: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.string,
    full_name: PropTypes.string,
    name: PropTypes.string,
  }),
}

PatientQueueView.defaultProps = {
  user: null,
}
