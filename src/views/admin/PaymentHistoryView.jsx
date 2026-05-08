import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { paymentApi } from '../../api/payment'
import { patientApi } from '../../api/patient'
import { doctorApi } from '../../api/doctor'

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
  if (s === 'paid')                      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (s === 'pending')                   return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300'
  if (s === 'failed' || s === 'expired') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300'
  if (s === 'refunded')                  return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300'
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function apptTone(s) {
  if (s === 'pending_payment')                             return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300'
  if (s === 'confirmed' || s === 'in_progress')            return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (s === 'completed')                                   return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300'
  if (s === 'declined' || s === 'cancelled' || s === 'no_show') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300'
  if (s === 'pending')                                     return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300'
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function StatCard({ label, value, accent }) {
  const bg = {
    emerald: 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30',
    amber:   'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
    rose:    'border-rose-100 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30',
  }
  const val = {
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber:   'text-amber-700 dark:text-amber-300',
    rose:    'text-rose-700 dark:text-rose-300',
  }
  return (
    <div className={`rounded-2xl border p-4 ${bg[accent] ?? bg.rose}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-[#80809a]">{label}</p>
      <p className={`mt-1.5 text-xl font-bold leading-tight ${val[accent] ?? val.rose}`}>{value}</p>
    </div>
  )
}
StatCard.propTypes = {
  label:  PropTypes.string.isRequired,
  value:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string.isRequired,
}

export default function AdminPaymentHistoryView({ navigateTo }) {
  const initialFilters = { from_date: '', to_date: '', status: '', patient_id: '', doctor_id: '', page: 1, limit: 50 }
  const [filters,      setFilters]      = useState(initialFilters)
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [rows,         setRows]         = useState([])
  const [meta,         setMeta]         = useState({ total: 0, page: 1, limit: 50, total_pages: 1 })
  const [loading,      setLoading]      = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('all') // 'all' or 'pending-refunds' 
  const [refunds, setRefunds] = useState([])
  const [refundLoading, setRefundLoading] = useState(false)
  const [refundMarking, setRefundMarking] = useState(null) // paymentId being marked
  const [nameMap, setNameMap] = useState({ patients: {}, doctors: {} })
  const resolvedIds = useRef({ patients: new Set(), doctors: new Set() })

  // Resolve patient / doctor UUIDs to display names after each page load
  useEffect(() => {
    const newPatientIds = rows
      .map((r) => r.patient_id)
      .filter((id) => id && !resolvedIds.current.patients.has(id))
    const newDoctorIds = rows
      .map((r) => r.doctor_id)
      .filter((id) => id && !resolvedIds.current.doctors.has(id))

    if (newPatientIds.length === 0 && newDoctorIds.length === 0) return

    newPatientIds.forEach((id) => resolvedIds.current.patients.add(id))
    newDoctorIds.forEach((id) => resolvedIds.current.doctors.add(id))

    const patientPromises = newPatientIds.map((id) =>
      patientApi.getPatientSummary(id)
        .then((data) => ({ id, name: data?.full_name || data?.name || null }))
        .catch(() => ({ id, name: null }))
    )
    const doctorPromises = newDoctorIds.map((id) =>
      doctorApi.getDoctor(id)
        .then((data) => ({ id, name: data?.full_name || data?.name || null }))
        .catch(() => ({ id, name: null }))
    )

    Promise.all([...patientPromises, ...doctorPromises]).then((results) => {
      const pMap = {}
      const dMap = {}
      results.forEach(({ id, name }) => {
        if (!name) return
        if (newPatientIds.includes(id)) pMap[id] = name
        else dMap[id] = name
      })
      setNameMap((prev) => ({
        patients: { ...prev.patients, ...pMap },
        doctors: { ...prev.doctors, ...dMap },
      }))
    })
  }, [rows])

  const load = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const res = await paymentApi.getAdminHistory(params)
      const data = res?.data ?? res
      setRows(Array.isArray(data?.items) ? data.items : [])
      setMeta({
        total: data?.total ?? 0,
        page: data?.page ?? params.page ?? 1,
        limit: data?.limit ?? params.limit ?? 50,
        total_pages: data?.total_pages ?? 1,
      })
    } catch (err) {
      setError(err.message || 'Failed to load admin payment history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filters) }, [filters, load])

  // Fetch pending refunds
  useEffect(() => {
    if (tab === 'pending-refunds') {
      setRefundLoading(true)
      paymentApi.getAdminHistory({ status: 'refund_pending', limit: 100 })
        .then(res => {
          const data = res?.data ?? res
          setRefunds(Array.isArray(data?.items) ? data.items : [])
        })
        .catch(err => console.error('Failed to load pending refunds', err))
        .finally(() => setRefundLoading(false))
    }
  }, [tab])

  const handleMarkRefunded = async (paymentId) => {
    setRefundMarking(paymentId)
    try {
      await paymentApi.markRefunded(paymentId)
      setRefunds(prev => prev.filter(r => r.id !== paymentId))
    } catch (err) {
      console.error('Failed to mark refunded', err)
    } finally {
      setRefundMarking(null)
    }
  }

  const stats = useMemo(() => {
    const paid   = rows.filter((r) => r.status === 'paid')
    const failed = rows.filter((r) => r.status === 'failed' || r.status === 'expired')
    return {
      paidVolume:   paid.reduce((s, r) => s + (Number(r.amount) || 0), 0),
      paidCount:    paid.length,
      pendingCount: rows.filter((r) => r.status === 'pending').length,
      failedCount:  failed.length,
    }
  }, [rows])

  function handleFilterChange(key, value) {
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

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-400">Finance Console</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Payment History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9898b0]">Search and audit the full payment timeline across all patients and doctors.</p>
        </div>
        <button
          type="button"
          className="self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
          onClick={() => navigateTo('reports')}
        >
          ← Reports
        </button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-[#252530]">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'all' ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-[#9898b0] dark:hover:text-[#eeeef5]'}`}
        >
          All Payments
        </button>
        <button
          type="button"
          onClick={() => setTab('pending-refunds')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'pending-refunds' ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-[#9898b0] dark:hover:text-[#eeeef5]'}`}
        >
          Pending Refunds
        </button>
      </div>

      {tab === 'all' && (
      <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Paid Volume"     value={fmtVnd(stats.paidVolume)} accent="emerald" />
        <StatCard label="Paid"            value={stats.paidCount}          accent="emerald" />
        <StatCard label="Pending"         value={stats.pendingCount}       accent="amber"   />
        <StatCard label="Failed/Expired"  value={stats.failedCount}        accent="rose"    />
      </div>

      {/* ── Filters ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" onSubmit={applyFilters}>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">From</span>
            <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.from_date} onChange={(e) => handleFilterChange('from_date', e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">To</span>
            <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.to_date} onChange={(e) => handleFilterChange('to_date', e.target.value)} min={draftFilters.from_date || undefined} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">Status</span>
            <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">Patient ID</span>
            <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.patient_id} onChange={(e) => handleFilterChange('patient_id', e.target.value)} placeholder="UUID" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-[#80809a]">Doctor ID</span>
            <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={draftFilters.doctor_id} onChange={(e) => handleFilterChange('doctor_id', e.target.value)} placeholder="UUID" />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 dark:hover:bg-rose-500">Apply</button>
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

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#1c1c25]">
          <p className="text-xs text-slate-400 dark:text-[#606070]">
            {meta.total} record{meta.total !== 1 ? 's' : ''}&nbsp;&bull;&nbsp;page {meta.page} of {meta.total_pages}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#1c1c25]" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
                <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-3-2V5a2 2 0 0 1 2-2z" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">No payment records match</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Try clearing patient/doctor filters or widening the date window.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-[#1c1c25]">
              <thead>
                <tr className="bg-slate-50/60 text-left text-[11px] uppercase tracking-[0.08em] text-slate-400 dark:bg-white/2 dark:text-[#606070]">
                  <th className="px-5 py-3 font-semibold">Amount / Appt</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Appointment</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Txn Ref</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                {rows.map((item) => (
                  <tr key={item.id} className="align-top transition-colors hover:bg-slate-50/60 dark:hover:bg-white/2">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{fmtVnd(item.amount, item.currency)}</p>
                      <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400 dark:text-[#606070]">{item.appointment_id || '--'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.07em] ${paymentTone(item.status)}`}>
                        {PAYMENT_LABEL[item.status] ?? item.status ?? 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.appointment_status ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.05em] ${apptTone(item.appointment_status)}`}>
                          {APPT_LABEL[item.appointment_status] ?? item.appointment_status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-[#606070]">--</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#9898b0]">
                      <span className="max-w-[140px] truncate block" title={item.patient_id || ''}>
                        {nameMap.patients[item.patient_id] || item.patient_id?.slice(0, 8) + '…' || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#9898b0]">
                      <span className="max-w-[140px] truncate block" title={item.doctor_id || ''}>
                        {nameMap.doctors[item.doctor_id]
                          ? `Dr. ${nameMap.doctors[item.doctor_id].split(/\s+/).slice(-1)[0]}`
                          : item.doctor_id?.slice(0, 8) + '…' || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#9898b0]">{item.vnpay_txn_ref || '--'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-[#9898b0]">{fmtDateTime(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
        <p className="text-sm text-slate-500 dark:text-[#9898b0]">Page {meta.page} of {meta.total_pages}</p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={meta.page <= 1 || loading} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]">← Prev</button>
          <button type="button" disabled={meta.page >= meta.total_pages || loading} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]">Next →</button>
        </div>
      </div>
      </>
      )}

      {/* ── Pending Refunds Tab ───────────────────────────────────────── */}
      {tab === 'pending-refunds' && (
        <div className="space-y-4">
          {refundLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 dark:border-[#252530] dark:bg-[#111118]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-rose-600 dark:border-[#252530] dark:border-t-rose-400" />
            </div>
          )}

          {!refundLoading && refunds.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 dark:border-[#252530] dark:bg-[#111118]">
              <span className="text-3xl">✓</span>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-[#9898b0]">No pending refunds</p>
            </div>
          )}

          {!refundLoading && refunds.length > 0 && (
            <div className="space-y-2">
              {refunds.map(payment => (
                <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#111118]">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">
                        {payment.patient_name || 'Patient'} — {payment.test_name || 'Lab Order'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#9898b0]">
                        Amount: {fmtVnd(payment.amount, payment.currency)} • {fmtDateTime(payment.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkRefunded(payment.id)}
                      disabled={refundMarking === payment.id}
                      className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                      {refundMarking === payment.id ? 'Marking...' : 'Mark Refunded'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

AdminPaymentHistoryView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
}