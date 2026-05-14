import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { paymentApi } from '../../api/payment'
import { APPOINTMENT_STATUS } from '../../constants/enums'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
  { value: 'refunded', label: 'Refunded' },
]

const PAYMENT_LABEL = {
  paid: 'Paid', pending: 'Pending', failed: 'Failed', expired: 'Expired', refunded: 'Refunded',
}

const APPT_LABEL = {
  pending_payment: 'Awaiting Payment',
  pending:         'Pending Confirm',
  confirmed:       'Confirmed',
  in_progress:     'In Progress',
  completed:       'Completed',
  declined:        'Declined',
  cancelled:       'Cancelled',
  no_show:         'No Show',
  rescheduled:     'Rescheduled',
}

function fmtVnd(amount, currency = 'VND') {
  if (amount == null) return '--'
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function fmtDateTime(value) {
  if (!value) return '--'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(d)
}

function paymentTone(s) {
  if (s === 'paid')                    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (s === 'pending')                 return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300'
  if (s === 'failed' || s === 'expired') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300'
  if (s === 'refunded')                return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300'
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function apptTone(s) {
  if (s === 'pending_payment')                         return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300'
  if (s === 'confirmed' || s === 'in_progress')        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (s === 'completed')                               return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300'
  if (s === 'declined' || s === 'cancelled' || s === 'no_show') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300'
  if (s === 'pending')                                 return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300'
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

// Statuses where the appointment can no longer be paid — hide the action button.
const TERMINAL_APPT_STATUSES = new Set([
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.DECLINED,
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.NO_SHOW,
])

// Show Continue/Retry when payment is pending/failed AND appointment is NOT in a terminal state.
function resolveAction(item) {
  if (item.status !== 'pending' && item.status !== 'failed') return null
  if (item.appointment_status && TERMINAL_APPT_STATUSES.has(item.appointment_status)) return null
  return item.status === 'failed' ? 'retry' : 'continue'
}

function IconReceipt({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-3-2V5a2 2 0 0 1 2-2z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}
IconReceipt.propTypes = { className: PropTypes.string }

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  )
}
IconCheck.propTypes = { className: PropTypes.string }

function StatCard({ label, value, accent }) {
  const bg = {
    emerald: 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30',
    amber:   'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
    rose:    'border-rose-100 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30',
    indigo:  'border-indigo-100 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/30',
  }
  const val = {
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber:   'text-amber-700 dark:text-amber-300',
    rose:    'text-rose-700 dark:text-rose-300',
    indigo:  'text-indigo-700 dark:text-indigo-300',
  }
  return (
    <div className={`rounded-2xl border p-4 ${bg[accent] ?? bg.indigo}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-[#80809a]">{label}</p>
      <p className={`mt-1.5 text-xl font-bold leading-tight ${val[accent] ?? val.indigo}`}>{value}</p>
    </div>
  )
}
StatCard.propTypes = {
  label:  PropTypes.string.isRequired,
  value:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string.isRequired,
}

export default function PaymentHistoryView({ setCurrentView }) {
  const initialFilters = { from_date: '', to_date: '', status: '', page: 1, limit: 20 }
  const [filters,      setFilters]      = useState(initialFilters)
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [rows,         setRows]         = useState([])
  const [meta,         setMeta]         = useState({ total: 0, page: 1, limit: 20, total_pages: 1 })
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [actionId,     setActionId]     = useState(null)
  const [selectedLabOrderIds, setSelectedLabOrderIds] = useState([])

  const load = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const res  = await paymentApi.getHistory(params)
      const data = res?.data ?? res
      setRows(Array.isArray(data?.items) ? data.items : [])
      setMeta({
        total:       data?.total       ?? 0,
        page:        data?.page        ?? params.page  ?? 1,
        limit:       data?.limit       ?? params.limit ?? 20,
        total_pages: data?.total_pages ?? 1,
      })
    } catch (err) {
      setError(err.message || 'Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filters) }, [filters, load])

  const payableLabRows = useMemo(
    () => rows.filter((r) => r.payment_type === 'LAB_ORDER' && r.reference_id && (r.status === 'pending' || r.status === 'expired')),
    [rows],
  )
  const selectedPayableLabRows = useMemo(
    () => payableLabRows.filter((r) => selectedLabOrderIds.includes(r.reference_id)),
    [payableLabRows, selectedLabOrderIds],
  )
  const selectedLabTotal = useMemo(
    () => selectedPayableLabRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [selectedPayableLabRows],
  )
  const allLabRowsSelected = payableLabRows.length > 0 && selectedPayableLabRows.length === payableLabRows.length

  const summary = useMemo(() => {
    const paid    = rows.filter((r) => r.status === 'paid')
    const pending = rows.filter((r) => r.status === 'pending')
    const failed  = rows.filter((r) => r.status === 'failed' || r.status === 'expired')
    return {
      paidVolume:   paid.reduce((s, r) => s + (Number(r.amount) || 0), 0),
      paidCount:    paid.length,
      pendingCount: pending.length,
      failedCount:  failed.length,
    }
  }, [rows])

  function handleDraft(key, value) {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }
  function applyFilters(e) {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, ...draftFilters, page: 1 }))
  }
  function resetFilters() {
    setDraftFilters(initialFilters)
    setFilters(initialFilters)
  }

  async function handleContinuePayment(item) {
    setActionId(item.id)
    setError(null)
    try {
      const res = item.payment_type === 'LAB_ORDER'
        ? await paymentApi.paySelectedLabOrders([item.reference_id])
        : await paymentApi.initiatePayment(item.appointment_id)
      const url = res?.payment_url || res?.url || res?.data?.payment_url || res?.data?.url
      if (url) {
        globalThis.location.assign(url)
      } else {
        setError('No payment URL returned. Please try again or contact support.')
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setActionId(null)
    }
  }

  async function handlePaySelectedLabOrders() {
    if (selectedLabOrderIds.length === 0) return
    setActionId('selected-labs')
    setError(null)
    try {
      const res = await paymentApi.paySelectedLabOrders(selectedLabOrderIds)
      const url = res?.payment_url || res?.url || res?.data?.payment_url || res?.data?.url
      if (url) {
        globalThis.location.assign(url)
      } else {
        setError('No payment URL returned. Please try again or contact support.')
      }
    } catch (err) {
      setError(err.message || 'Failed to process selected lab payments')
    } finally {
      setActionId(null)
    }
  }

  function toggleLabOrderSelection(labOrderId) {
    setSelectedLabOrderIds((prev) => (
      prev.includes(labOrderId)
        ? prev.filter((id) => id !== labOrderId)
        : [...prev, labOrderId]
    ))
  }

  function toggleAllLabOrders() {
    setSelectedLabOrderIds((prev) => {
      const allIds = payableLabRows.map((row) => row.reference_id)
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.includes(id))
      return allSelected ? [] : allIds
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500 dark:text-indigo-400">Billing</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Payment History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9898b0]">Track and manage all payments linked to your appointments.</p>
        </div>
        <button
          type="button"
          className="self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
          onClick={() => setCurrentView('appointments')}
        >
          ← Appointments
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Paid (this page)" value={fmtVnd(summary.paidVolume)} accent="emerald" />
        <StatCard label="Paid"             value={summary.paidCount}           accent="emerald" />
        <StatCard label="Pending"          value={summary.pendingCount}        accent="amber"   />
        <StatCard label="Failed / Expired" value={summary.failedCount}         accent="rose"    />
      </div>

      {/* ── Filters ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={applyFilters}>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">From date</span>
            <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.from_date} onChange={(e) => handleDraft('from_date', e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">To date</span>
            <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.to_date} onChange={(e) => handleDraft('to_date', e.target.value)} min={draftFilters.from_date || undefined} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">Payment status</span>
            <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.status} onChange={(e) => handleDraft('status', e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500">Apply</button>
            <button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]" onClick={resetFilters}>Reset</button>
          </div>
        </form>
      </section>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      {/* ── Meta row ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400 dark:text-[#606070]">
          {meta.total} transaction{meta.total !== 1 ? 's' : ''}&nbsp;&bull;&nbsp;page {meta.page} of {meta.total_pages}
        </p>
        {payableLabRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAllLabOrders}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                allLabRowsSelected
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/50 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#c8c8e0] dark:hover:bg-[#16161e]'
              }`}
            >
              <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded border ${
                allLabRowsSelected
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-transparent dark:border-[#3a3a49] dark:bg-[#111118]'
              }`}>
                <IconCheck className="h-2.5 w-2.5" />
              </span>
              {allLabRowsSelected ? 'Clear lab selection' : 'Select all lab payments'}
            </button>
            <button
              type="button"
              disabled={selectedPayableLabRows.length === 0 || actionId === 'selected-labs'}
              onClick={handlePaySelectedLabOrders}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-indigo-500"
            >
              {actionId === 'selected-labs'
                ? 'Loading...'
                : `Pay selected (${selectedPayableLabRows.length}) - ${fmtVnd(selectedLabTotal)}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Cards ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-[116px] animate-pulse rounded-3xl bg-slate-100 dark:bg-[#1c1c25]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-[#252530] dark:bg-[#111118]">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
            <IconReceipt className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">No payments found</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Try widening your date range or clearing filters.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => {
            const action = resolveAction(item)
            const isLabPayment = item.payment_type === 'LAB_ORDER'
            const isPayableLab = item.payment_type === 'LAB_ORDER' && item.reference_id && (item.status === 'pending' || item.status === 'expired')
            const isSelectedLab = isPayableLab && selectedLabOrderIds.includes(item.reference_id)
            return (
              <article
                key={item.id}
                className={`rounded-3xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-[#111118] ${
                  isSelectedLab
                    ? 'border-indigo-300 ring-2 ring-indigo-500/15 dark:border-indigo-500/60 dark:ring-indigo-400/10'
                    : 'border-slate-200 dark:border-[#252530]'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  {/* Left: icon + details */}
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="flex-shrink-0 pt-0.5">
                      {isPayableLab ? (
                        <button
                          type="button"
                          aria-pressed={isSelectedLab}
                          aria-label={isSelectedLab ? 'Unselect lab payment' : 'Select lab payment'}
                          onClick={() => toggleLabOrderSelection(item.reference_id)}
                          className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${
                            isSelectedLab
                              ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-900/20 hover:bg-indigo-500'
                              : 'border-slate-200 bg-slate-50 text-transparent hover:border-indigo-300 hover:bg-indigo-50 dark:border-[#343442] dark:bg-[#181820] dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10'
                          }`}
                        >
                          <IconCheck className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${paymentTone(item.status)}`}>
                          <IconReceipt className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-2">
                      {/* Status badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.07em] ${paymentTone(item.status)}`}>
                          {PAYMENT_LABEL[item.status] ?? item.status ?? 'Unknown'}
                        </span>
                        {isLabPayment && (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.05em] text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300">
                            Lab payment
                          </span>
                        )}
                        {!isLabPayment && item.appointment_status && (
                          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.05em] ${apptTone(item.appointment_status)}`}>
                            Appt: {APPT_LABEL[item.appointment_status] ?? item.appointment_status}
                          </span>
                        )}
                      </div>
                      {/* Amount */}
                      <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">
                        {fmtVnd(item.amount, item.currency)}
                      </p>
                      {/* Payment context */}
                      <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-slate-500 dark:text-[#9898b0]">
                        {isLabPayment ? (
                          <span className="font-medium text-slate-700 dark:text-[#d6d6ea]">Lab test payment</span>
                        ) : (
                          <span>Appointment: <span className="font-medium text-slate-700 dark:text-[#d6d6ea]">{item.appointment_id || '--'}</span></span>
                        )}
                      </div>
                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[11px] text-slate-400 dark:text-[#606070]">
                        <span>Created {fmtDateTime(item.created_at)}</span>
                        {item.paid_at && <span>Paid {fmtDateTime(item.paid_at)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: action button */}
                  {action && (item.appointment_id || item.payment_type === 'LAB_ORDER') && (
                    <div className="flex flex-shrink-0 items-start sm:pt-1">
                      <button
                        type="button"
                        disabled={actionId === item.id}
                        onClick={() => handleContinuePayment(item)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-indigo-500"
                      >
                        {actionId === item.id ? 'Loading…' : action === 'retry' ? 'Retry Payment' : 'Continue Payment'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
        <p className="text-sm text-slate-500 dark:text-[#9898b0]">Page {meta.page} of {meta.total_pages}</p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={meta.page <= 1 || loading} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]">← Prev</button>
          <button type="button" disabled={meta.page >= meta.total_pages || loading} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]">Next →</button>
        </div>
      </div>

    </div>
  )
}

PaymentHistoryView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
}
