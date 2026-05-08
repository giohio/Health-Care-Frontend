import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getTriageSessions, getTriageSession } from '../../api/ai'
import { IconArrowRight, IconRefreshCw, IconSparkles, IconCheckCircle, IconChevronLeft } from '../../icons'

// ── Helpers ─────────────────────────────────────────────────────────────────
const URGENCY_TONE = {
  'Priority':   'amber',
  'Emergency':  'rose',
  'Routine':    'emerald',
  'low':       'slate',
  'medium':    'blue',
  'high':      'amber',
  'urgent':    'rose',
  'Ưu tiên':      'amber',
  'Cấp cứu':      'rose',
  'Thông thường': 'emerald',
}
function urgencyBadge(level) {
  if (!level) return null
  const tone = URGENCY_TONE[level] ?? 'slate'
  const cls = {
    rose:    'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]',
  }[tone]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {level}
    </span>
  )
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
  const cls = {
    active:            'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    ai_suggested:      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
    auto_confirmed:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    pending_review:    'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    doctor_confirmed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    referred_internal: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
    abandoned:         'bg-slate-100 text-slate-500 dark:bg-[#1c1c25] dark:text-[#70708a]',
  }[status] ?? 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onClick, isSelected }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-500/10 dark:border-indigo-700 dark:bg-indigo-950/30'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:hover:border-indigo-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            session.status === 'auto_confirmed' || session.status === 'doctor_confirmed'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm'
              : session.status === 'pending_review'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-500 dark:bg-[#1c1c25] dark:text-[#9898b0]'
          }`}>
            <span className="inline-flex h-5 w-5"><IconSparkles /></span>
          </div>
          <div>
            <p className="text-sm font-semibold capitalize text-slate-900 dark:text-[#eeeef5]">
              {session.suggested_department ?? 'Consultation'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">{fmtDate(session.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {urgencyBadge(session.urgency_level)}
          {statusBadge(session.status)}
        </div>
      </div>

      {/* Conversation preview */}
      {session.messages?.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
          <p className="text-xs font-medium text-slate-400 dark:text-[#606070] mb-1.5">Conversation preview</p>
          {session.messages.slice(-2).map((msg, i) => (
            <div key={i} className={`text-xs leading-relaxed ${msg.role === 'user' ? 'text-slate-600 dark:text-[#9898b0]' : 'text-slate-500 dark:text-[#70708a]'} ${i > 0 ? 'mt-1 border-t border-slate-100 pt-1 dark:border-[#252530]' : ''}`}>
              <span className="font-semibold text-slate-500 dark:text-[#70708a]">{msg.role === 'user' ? 'You: ' : 'AI: '}</span>
              {msg.content?.slice(0, 80)}{msg.content?.length > 80 ? '…' : ''}
            </div>
          ))}
        </div>
      )}

      {session.status === 'doctor_confirmed' || session.status === 'referred_internal' ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="inline-flex h-4 w-4"><IconCheckCircle /></span>
          <span>Completed · {session.final_department ? `Referred to ${session.final_department}` : 'Confirmed'}</span>
          <span className="ml-auto inline-flex h-4 w-4"><IconArrowRight /></span>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <span>View detail</span>
          <span className="ml-auto inline-flex h-4 w-4"><IconArrowRight /></span>
        </div>
      )}
    </button>
  )
}

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
}

// ── Detail Panel ─────────────────────────────────────────────────────────────
function SessionDetail({ session, onClose }) {
  if (!session) return null
  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530] dark:bg-[#0c0c13]/80">
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#16161e]" onClick={onClose}>
          <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><IconChevronLeft /></span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5] truncate">Session Details</p>
          <p className="text-xs text-slate-400 dark:text-[#606070]">{fmtDate(session.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {urgencyBadge(session.urgency_level)}
          {statusBadge(session.status)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#252530] dark:bg-[#111118]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#606070]">Suggested Dept.</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5] capitalize">{session.suggested_department ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#252530] dark:bg-[#111118]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-[#606070]">Final Dept.</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-[#eeeef5]">{session.final_department ?? '—'}</p>
          </div>
          {session.doctor_notes && (
            <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Doctor's Note</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-[#c8c8e0]">{session.doctor_notes}</p>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#606070]">
            Full conversation
          </p>
          <div className="space-y-3">
            {(session.messages ?? []).map((msg, idx) => {
              const isUser = msg.role === 'user'
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'rounded-tr-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm dark:from-indigo-600 dark:to-indigo-700'
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
    </div>
  )
}

SessionDetail.propTypes = {
  session: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}

// ── Main View ────────────────────────────────────────────────────────────────
export default function TriageHistoryView({ setCurrentView, currentUser }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [selected, setSelected] = useState(null)

  const fetchSessions = () => {
    setLoading(true)
    setError(null)
    getTriageSessions()
      .then((res) => {
        const raw = res?.sessions ?? res?.data?.sessions ?? Array.isArray(res) ? res : []
        setSessions(raw)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const openDetail = (id) => {
    if (selected?.id === id) { setSelected(null); return }
    getTriageSession(id)
      .then((res) => setSelected(res?.data ?? res))
      .catch(() => {})
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="inline-flex h-4 w-4"><IconChevronLeft /></span>
        </button>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">
            My Symptom Checks
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#606070]">
            History of AI-assisted consultations
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSessions}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]"
        >
          <span className="inline-flex h-4 w-4"><IconRefreshCw /></span>
        </button>
      </div>

      {/* Quick action: New check */}
      <button
        type="button"
        onClick={() => setCurrentView('symptom-checker')}
        className="mb-6 w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 text-left transition-all duration-150 hover:border-indigo-400 hover:shadow-md dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30 dark:hover:border-indigo-700"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-md">
            <span className="inline-flex h-5 w-5"><IconSparkles /></span>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Start a new symptom check</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">AI-powered triage assistant</p>
          </div>
          <span className="ml-auto inline-flex h-6 w-6 text-indigo-400"><IconArrowRight /></span>
        </div>
      </button>

      {/* Sessions */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 dark:border-[#252530] dark:bg-[#0d0d14]">
          <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-[#16161e]">
            <span className="inline-flex h-8 w-8 text-slate-400 dark:text-[#505060]"><IconSparkles /></span>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-[#c8c8e0]">No symptom checks yet</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#70708a]">
            Start an AI-assisted consultation to get department recommendations.
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={selected?.id === session.id}
              onClick={() => openDetail(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

TriageHistoryView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
}
