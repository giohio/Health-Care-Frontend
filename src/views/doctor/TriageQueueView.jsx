import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  getTriageSessions,
  getTriageSession,
  confirmTriageSession,
  referInternalTriageSession,
} from '../../api/ai'
import { patientApi } from '../../api/patient'

// ---------------------------------------------------------------------------
// Icon atoms
// ---------------------------------------------------------------------------
function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.5 9a9 9 0 0 1 14.7-3.4L23 10" />
      <path d="M20.5 15a9 9 0 0 1-14.7 3.4L1 14" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const URGENCY_TONE = {
  'Priority':   'amber',
  'Emergency':  'rose',
  'Routine':    'emerald',
  'Ưu tiên':     'amber',
  'Cấp cứu':     'rose',
  'Thông thường': 'emerald',
}

function urgencyBadge(level) {
  const tone = URGENCY_TONE[level] ?? 'slate'
  const cls = {
    rose:    'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{level ?? '—'}</span>
}

const STATUS_LABEL = {
  active:            'Active',
  ai_suggested:      'AI Suggested',
  auto_confirmed:    'Auto Confirmed',
  pending_review:    'Pending Review',
  doctor_confirmed:  'Confirmed',
  referred_internal: 'Referred',
  abandoned:         'Abandoned',
}

function statusBadge(status) {
  const isReview = status === 'pending_review'
  const isDone   = status === 'doctor_confirmed' || status === 'referred_internal' || status === 'auto_confirmed'
  let cls
  if (isReview) {
    cls = 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
  } else if (isDone) {
    cls = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
  } else {
    cls = 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]'
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{STATUS_LABEL[status] ?? status}</span>
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function relTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

// ---------------------------------------------------------------------------
// Patient-name enrichment helpers (module-level to satisfy lint)
// ---------------------------------------------------------------------------
async function fetchPatientName(pid) {
  try {
    const p = await patientApi.getPatientSummary(pid)
    return p?.full_name ?? p?.data?.full_name ?? p?.name ?? p?.data?.name ?? null
  } catch {
    return null
  }
}

async function enrichSessionsWithNames(raw) {
  const needsName = raw.filter((s) => !s.patient_name && s.patient_id)
  if (needsName.length === 0) return raw

  const uniqueIds = [...new Set(needsName.map((s) => s.patient_id))]
  const nameMap = {}
  await Promise.allSettled(
    uniqueIds.map(async (pid) => { nameMap[pid] = await fetchPatientName(pid) })
  )
  return raw.map((s) => (s.patient_name ? s : { ...s, patient_name: nameMap[s.patient_id] ?? null }))
}

async function enrichAndSet(raw, setSessions) {
  const enriched = await enrichSessionsWithNames(raw)
  setSessions(enriched)
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------
function SessionDetailPanel({ session, onConfirm, onRefer, onClose, loading }) {
  const [notes, setNotes] = useState('')
  const isPending = session.status === 'pending_review'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-[#252530]">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
          onClick={onClose}
          aria-label="Back to list"
        >
          <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronLeftIcon /></span>
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-white font-semibold text-sm shadow-md">
            {session.patient_name ? session.patient_name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5] truncate">
              {session.patient_name ?? 'Patient'}
            </p>
            <p className="text-xs text-slate-400 dark:text-[#606070]">{fmtDate(session.created_at)}</p>
          </div>
        </div>
        {statusBadge(session.status)}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#252530] dark:bg-[#111118]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#606070]">Suggested Dept.</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5] capitalize">{session.suggested_department ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#252530] dark:bg-[#111118]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#606070]">Urgency</p>
            <p className="mt-1">{urgencyBadge(session.urgency_level)}</p>
          </div>
          {session.final_department && (
            <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Final Dept.</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300 capitalize">{session.final_department}</p>
            </div>
          )}
          {session.doctor_notes && (
            <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#252530] dark:bg-[#111118]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#606070]">Doctor's Note</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-[#c8c8e0]">{session.doctor_notes}</p>
            </div>
          )}

          {/* Pending booking request */}
          {session.pending_booking && (
            <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-950/30">
              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">Patient&apos;s Booking Request</p>
              <div className="space-y-1 text-sm">
                {session.pending_booking.doctor_name && (
                  <p className="text-slate-700 dark:text-[#c8c8e0]">
                    <span className="font-medium">Doctor:</span> {session.pending_booking.doctor_name}
                  </p>
                )}
                {session.pending_booking.date && (
                  <p className="text-slate-700 dark:text-[#c8c8e0]">
                    <span className="font-medium">Date:</span> {session.pending_booking.date}
                    {session.pending_booking.time && <span> at {session.pending_booking.time}</span>}
                  </p>
                )}
                {session.pending_booking.department && (
                  <p className="text-slate-700 dark:text-[#c8c8e0]">
                    <span className="font-medium">Dept.:</span> {session.pending_booking.department}
                  </p>
                )}
              </div>
              <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">Confirming will create this appointment.</p>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#606070]">Conversation</p>
          <div className="space-y-2">
            {(session.messages ?? []).map((msg, idx) => {
              const isUser = msg.role === 'user'
              return (
                <div key={`${msg.role}-${idx}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? 'rounded-tr-md bg-indigo-600 text-white'
                      : 'rounded-tl-md border border-slate-200 bg-white text-slate-700 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="border-t border-slate-200 px-6 py-4 space-y-3 dark:border-[#252530]">
          <textarea
            rows={2}
            style={{ resize: 'none' }}
            placeholder="Add notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5] dark:focus:border-indigo-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              onClick={() => onConfirm(session.id, notes)}
            >
              {loading ? 'Saving…' : session.pending_booking ? 'Confirm & Create Appointment' : 'Confirm AI Suggestion'}
            </button>
            <button
              type="button"
              disabled={loading}
              className="flex-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
              onClick={() => onRefer(session.id, notes)}
            >
              {loading ? 'Saving…' : 'Refer to Internal Med.'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

SessionDetailPanel.propTypes = {
  session:   PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onRefer:   PropTypes.func.isRequired,
  onClose:   PropTypes.func.isRequired,
  loading:   PropTypes.bool.isRequired,
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
export default function TriageQueueView({ navigateTo, initialSessionId, onInitialHandled }) {
  const [sessions, setSessions]           = useState([])
  const [total, setTotal]                 = useState(0)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [filter, setFilter]               = useState('pending_review')
  const [selected, setSelected]           = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const loadSessions = (status) => {
    setLoading(true)
    setError(null)
    const params = status === 'all' ? {} : { status }
    getTriageSessions(params)
      .then((res) => {
        const raw = res?.sessions ?? res?.data?.sessions ?? []
        setTotal(res?.total ?? res?.data?.total ?? raw.length)
        return enrichAndSet(raw, setSessions)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSessions(filter) }, [filter])

  // Auto-open a specific session if navigated here from Patient Queue
  useEffect(() => {
    if (!initialSessionId) return
    openDetail(initialSessionId)
    onInitialHandled?.()
  }, [initialSessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const openDetail = (id) => {
    setDetailLoading(true)
    getTriageSession(id)
      .then(async (res) => {
        const session = res?.data ?? res
        if (!session.patient_name && session.patient_id) {
          session.patient_name = await fetchPatientName(session.patient_id)
        }
        setSelected(session)
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false))
  }

  const handleConfirm = async (id, notes) => {
    setActionLoading(true)
    try {
      const updated = await confirmTriageSession(id, notes)
      const session = updated?.data ?? updated
      // preserve the patient_name we already resolved
      if (!session.patient_name && selected?.patient_name) {
        session.patient_name = selected.patient_name
      }
      setSelected(session)
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'doctor_confirmed' } : s))
    } catch { /* show nothing, user sees the same panel */ }
    finally { setActionLoading(false) }
  }

  const handleRefer = async (id, notes) => {
    setActionLoading(true)
    try {
      const updated = await referInternalTriageSession(id, notes)
      const session = updated?.data ?? updated
      if (!session.patient_name && selected?.patient_name) {
        session.patient_name = selected.patient_name
      }
      setSelected(session)
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'referred_internal' } : s))
    } catch { /* same */ }
    finally { setActionLoading(false) }
  }

  const FILTER_TABS = [
    { key: 'pending_review',   label: 'Pending Review' },
    { key: 'doctor_confirmed', label: 'Confirmed' },
    { key: 'referred_internal', label: 'Referred' },
    { key: 'auto_confirmed',   label: 'Auto' },
    { key: 'all',              label: 'All' },
  ]

  return (
    <div className="flex h-full w-full min-h-0 min-w-0">
      {/* List panel */}
      <div className={`flex flex-col ${selected ? 'hidden md:flex md:w-1/2 lg:w-2/5' : 'flex-1'} border-r border-slate-200 dark:border-[#252530]`}>
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530] dark:bg-[#0c0c13]/80">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#16161e]"
            onClick={() => navigateTo('dashboard')}
            aria-label="Back to dashboard"
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronLeftIcon /></span>
          </button>

          <span className="h-4 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-md">
            <span className="inline-flex h-3.5 w-3.5"><SparklesIcon /></span>
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">AI Triage Queue</span>

          <button
            type="button"
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
            onClick={() => loadSessions(filter)}
            aria-label="Refresh"
          >
            <span className="inline-flex h-3.5 w-3.5 text-slate-400 dark:text-[#606070]"><RefreshIcon /></span>
          </button>

          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
            onClick={() => navigateTo('patient-queue')}
          >
            Queue
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3 w-3"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-slate-200 bg-white px-4 py-2 dark:border-[#252530] dark:bg-[#0c0c13]">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-slate-400 dark:text-[#606070]">{total} sessions</span>
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#08080f]">
          {loading && (
            <div className="flex h-32 items-center justify-center">
              <span className="text-sm text-slate-400 dark:text-[#606070]">Loading sessions…</span>
            </div>
          )}

          {!loading && error && (
            <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400">
              {error}
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
                <span className="inline-flex h-5 w-5"><SparklesIcon /></span>
              </span>
              <span className="text-sm text-slate-400 dark:text-[#606070]">No sessions found</span>
            </div>
          )}

          {!loading && sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={`w-full border-b border-slate-100 px-5 py-4 text-left transition-all duration-150 hover:bg-white dark:border-[#1a1a22] dark:hover:bg-[#111118] ${selected?.id === session.id ? 'bg-white dark:bg-[#111118]' : ''}`}
              onClick={() => openDetail(session.id)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative mt-0.5 shrink-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                    (() => {
                      if (session.status === 'pending_review') return 'bg-gradient-to-br from-amber-400 to-orange-500'
                      if (session.status === 'auto_confirmed') return 'bg-gradient-to-br from-emerald-400 to-teal-500'
                      if (session.status === 'doctor_confirmed') return 'bg-gradient-to-br from-blue-400 to-indigo-500'
                      if (session.status === 'referred_internal') return 'bg-gradient-to-br from-violet-400 to-purple-500'
                      return 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-[#404050] dark:to-[#505060]'
                    })()
                  }`}>
                    {session.patient_name ? session.patient_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  {/* Urgency dot */}
                  {(session.urgency_level === 'Emergency' || session.urgency_level === 'Cấp cứu') && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-[#111118]" />
                  )}
                  {(session.urgency_level === 'Priority' || session.urgency_level === 'Ưu tiên') && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500 dark:border-[#111118]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    {/* Patient name — primary info */}
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5] truncate">
                      {session.patient_name ?? `Patient ${session.patient_id ? session.patient_id.slice(0, 6) + '…' : ''}`}
                    </p>
                    <span className="shrink-0 text-[11px] text-slate-400 dark:text-[#606070]">{relTime(session.created_at)}</span>
                  </div>

                  {/* Department + urgency in one row */}
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-xs font-medium capitalize text-slate-600 dark:text-[#9898b0]">
                      {session.suggested_department ?? 'Unknown dept.'}
                    </p>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-[#404050]" />
                    {urgencyBadge(session.urgency_level)}
                  </div>

                  {/* Status row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {statusBadge(session.status)}
                    {session.status === 'auto_confirmed' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        AUTO
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && !detailLoading && (
        <div className="flex-1 min-h-0 bg-white dark:bg-[#0c0c13]">
          <SessionDetailPanel
            session={selected}
            onConfirm={handleConfirm}
            onRefer={handleRefer}
            onClose={() => setSelected(null)}
            loading={actionLoading}
          />
        </div>
      )}

      {selected && detailLoading && (
        <div className="flex flex-1 items-center justify-center bg-white dark:bg-[#0c0c13]">
          <span className="text-sm text-slate-400 dark:text-[#606070]">Loading…</span>
        </div>
      )}

      {!selected && !loading && sessions.length > 0 && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-white dark:bg-[#0c0c13]">
          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 dark:bg-indigo-950/40">
              <span className="inline-flex h-7 w-7"><SparklesIcon /></span>
            </span>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-[#9898b0]">Select a session to view</p>
          </div>
        </div>
      )}
    </div>
  )
}

TriageQueueView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  initialSessionId: PropTypes.string,
  onInitialHandled: PropTypes.func,
}

TriageQueueView.defaultProps = {
  initialSessionId: null,
  onInitialHandled: null,
}
