import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { emrApi } from '../../api/emr'
import { patientApi } from '../../api/patient'
import DatePickerInput from '../../components/shared/DatePickerInput'
import {
  normalizeStatus,
  formatDateLabel,
  patientLabel,
  testLabel,
  detectPriority,
} from '../../components/emr/labResultUtils'
import {
  AiDraftRenderer,
  UploadModal,
  VerifyModal,
  HolisticSummaryModal,
} from '../../components/emr/LabResultModals'

// ---------------------------------------------------------------------------
// Module-local helpers (not in LabResultModals — specific to this view)
// ---------------------------------------------------------------------------

function getInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '').join('')
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILTER_TABS = [
  { key: 'All',             label: 'All' },
  { key: 'needs_upload',    label: 'Needs Upload' },
  { key: 'processing',      label: 'Processing' },
  { key: 'ready_to_verify', label: 'Ready to Verify' },
  { key: 'published',       label: 'Published' },
]

// ---------------------------------------------------------------------------
// Status badge helpers
// ---------------------------------------------------------------------------

function statusBadge(category) {
  const map = {
    needs_upload:    { cls: 'inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400', label: 'Needs Upload' },
    processing:      { cls: 'inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-400', label: 'Processing' },
    ready_to_verify: { cls: 'inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-300', label: '✨ Ready to Verify' },
    published:       { cls: 'inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400', label: '✓ Published' },
  }
  return map[category] || map.processing
}

// ---------------------------------------------------------------------------
// PatientGroup component
// ---------------------------------------------------------------------------

function PatientGroup({ patientName, uploadedCount, total, publishedCount, appointmentId, children, onOpenEmr, onSummary }) {
  const [open, setOpen] = useState(true)
  const progress = total > 0 ? Math.round((uploadedCount / total) * 100) : 0
  const canSummary = !!appointmentId
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
      {/* Group header */}
      <div className="flex w-full items-center gap-3 px-5 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 min-w-0 items-center gap-3 text-left"
        >
          <span className="lr-avatar shrink-0">{getInitials(patientName)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{patientName}</p>
            <p className="text-xs text-slate-400 dark:text-[#7070a0]">
              {uploadedCount}/{total} results uploaded
            </p>
          </div>
          {/* Mini progress bar */}
          <div className="mx-3 hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-[#252530] sm:block">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`shrink-0 text-xs text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {canSummary && (
            <button
              type="button"
              onClick={onSummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-700/50 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/30"
              title="View AI holistic summary for all lab results"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>
              </svg>
              AI Summary
              {publishedCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white dark:bg-violet-400">
                  {publishedCount}
                </span>
              )}
            </button>
          )}
          {onOpenEmr && (
            <button
              type="button"
              onClick={onOpenEmr}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13h6"/><path d="M12 9v8"/></svg>
              Open EMR
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-[#1c1c25] dark:border-[#1c1c25]">
          {children}
        </div>
      )}
    </div>
  )
}

PatientGroup.propTypes = {
  patientName: PropTypes.string.isRequired,
  uploadedCount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  publishedCount: PropTypes.number,
  appointmentId: PropTypes.string,
  children: PropTypes.node.isRequired,
  onOpenEmr: PropTypes.func,
  onSummary: PropTypes.func,
}

PatientGroup.defaultProps = {
  publishedCount: 0,
  appointmentId: null,
  onOpenEmr: null,
  onSummary: null,
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LabResultReviewView({ labOrders, setLabOrders, onNotify, onBack, navigateTo, setSelectedPatient }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [isAllTime, setIsAllTime] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [labResults, setLabResults]           = useState([])
  const [loadingOrders, setLoadingOrders]     = useState(true)
  const [loadingResults, setLoadingResults]   = useState(true)
  const [justPublishedId, setJustPublishedId] = useState(null)
  const [verifyingId, setVerifyingId]         = useState(null)
  const [uploadModal, setUploadModal]         = useState(null)
  const [verifyModal, setVerifyModal]         = useState(null)
  const [deletingId, setDeletingId]           = useState(null)
  const [deleteConfirm, setDeleteConfirm]     = useState(null) // order to confirm-delete
  const [summaryModal, setSummaryModal]       = useState(null) // { appointmentId, patientName }

  const fetchAll = useCallback(async () => {
    setLoadingOrders(true)
    setLoadingResults(true)
    try {
      const [ordersRes, resultsRes] = await Promise.all([
        emrApi.getLabOrders({}),
        emrApi.getLabResults({}),
      ])
      let orders  = Array.isArray(ordersRes)  ? ordersRes  : (ordersRes?.items  || ordersRes?.data  || [])
      const results = Array.isArray(resultsRes) ? resultsRes : (resultsRes?.items || resultsRes?.data || [])

      // Enrich orders with patient names from Patient Service
      const needsName = orders.filter((o) => !o.patient_name && !o.patientName && (o.patient_id || o.patientId))
      if (needsName.length > 0) {
        const uniqueIds = [...new Set(needsName.map((o) => o.patient_id || o.patientId))]
        const nameMap = {}
        await Promise.allSettled(uniqueIds.map(async (pid) => {
          try {
            const p = await patientApi.getPatientSummary(pid)
            nameMap[pid] = p?.full_name ?? p?.data?.full_name ?? p?.name ?? p?.data?.name ?? null
          } catch { /* leave null */ }
        }))
        orders = orders.map((o) => {
          if (o.patient_name || o.patientName) return o
          const pid = o.patient_id || o.patientId
          return pid && nameMap[pid] ? { ...o, patient_name: nameMap[pid] } : o
        })
      }

      setLabOrders(orders)
      setLabResults(results)
    } catch (err) {
      console.error('Failed to fetch lab data:', err)
    } finally {
      setLoadingOrders(false)
      setLoadingResults(false)
    }
  }, [setLabOrders])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resultByOrderId = useMemo(() => {
    const map = {}
    labResults.forEach((r) => { map[r.order_id] = r })
    return map
  }, [labResults])

const cards = useMemo(() => {
    let filteredOrders = labOrders
    if (!isAllTime && selectedDate) {
      filteredOrders = labOrders.filter((order) => {
        const orderTime = new Date(order.ordered_at || order.orderedAt || order.created_at)
        if (Number.isNaN(orderTime.getTime())) return false
        const yy = orderTime.getFullYear()
        const mm = String(orderTime.getMonth() + 1).padStart(2, '0')
        const dd = String(orderTime.getDate()).padStart(2, '0')
        return `${yy}-${mm}-${dd}` === selectedDate
      })
    }
    return filteredOrders.map((order) => {
      const result = resultByOrderId[order.id] || null
      return { order, result, category: result ? normalizeStatus(result.status) : 'needs_upload' }
    })
  }, [labOrders, resultByOrderId, isAllTime, selectedDate])

  const tabCounts = useMemo(() => {
    const counts = { All: cards.length, needs_upload: 0, processing: 0, ready_to_verify: 0, published: 0 }
    cards.forEach(({ category }) => { counts[category] = (counts[category] || 0) + 1 })
    return counts
  }, [cards])

  const visibleCards = useMemo(() => {
    if (activeFilter === 'All') return cards
    return cards.filter(({ category }) => category === activeFilter)
  }, [cards, activeFilter])

  const dateGroups = useMemo(() => {
    const dMap = new Map()
    cards.forEach((card) => {
      if (activeFilter !== 'All' && card.category !== activeFilter) return

      const orderTime = new Date(card.order.ordered_at || card.order.orderedAt || card.order.created_at)
      let dateKey = Number.isNaN(orderTime.getTime()) ? 'Unknown Date' : orderTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const sortTime = Number.isNaN(orderTime.getTime()) ? 0 : new Date(orderTime.getFullYear(), orderTime.getMonth(), orderTime.getDate()).getTime()

      if (!dMap.has(dateKey)) {
        dMap.set(dateKey, {
          dateLabel: dateKey,
          sortTime,
          patients: new Map(),
        })
      }
      
      const pMap = dMap.get(dateKey).patients
      const pid = card.order.patient_id || card.order.patientId || 'unknown'
      if (!pMap.has(pid)) {
         pMap.set(pid, {
            patientId: pid,
            patientName: patientLabel(card.order),
            appointmentId: card.order.appointment_id || card.order.appointmentId || null,
            groupCards: [],
            uploadedCount: 0,
            publishedCount: 0,
         })
      }
      const pEntry = pMap.get(pid)
      pEntry.groupCards.push(card)
      if (card.category !== 'needs_upload') pEntry.uploadedCount += 1
      if (card.category === 'published') pEntry.publishedCount += 1
    })

    const sortedDates = [...dMap.values()].sort((a, b) => b.sortTime - a.sortTime)
    return sortedDates.map((dObj) => ({
      ...dObj,
      patientGroups: [...dObj.patients.values()],
    }))
  }, [cards, activeFilter])

  const handleVerify = async ({ order, result, interpretation, doctorNotes }) => {
    if (!result?.id) return
    setVerifyingId(result.id)
    try {
      await emrApi.verifyLabResult(result.id, {
        doctor_notes: doctorNotes || undefined,
        ai_draft_text: interpretation || undefined,
      })
      setLabResults((prev) => prev.map((r) =>
        r.id === result.id ? { ...r, status: 'PUBLISHED', verified_at: new Date().toISOString() } : r
      ))
      onNotify({
        id: `${result.id}-published`,
        type: 'lab',
        title: 'Lab Result Published',
        body: `${testLabel(order)} for ${patientLabel(order)} has been verified and published.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'lab-results',
      })
      setJustPublishedId(result.id)
      setVerifyModal(null)
      globalThis.setTimeout(() => setJustPublishedId((p) => p === result.id ? null : p), 2600)
    } catch (err) {
      console.error('Failed to verify lab result:', err)
      throw err
    } finally {
      setVerifyingId(null)
    }
  }

  const handleDeleteOrder = async (order) => {
    setDeletingId(order.id)
    try {
      await emrApi.deleteLabOrder(order.id)
      setLabOrders((prev) => prev.filter((o) => o.id !== order.id))
      setLabResults((prev) => prev.filter((r) => r.order_id !== order.id))
      setDeleteConfirm(null)
      onNotify({ type: 'success', message: `Lab order "${testLabel(order)}" deleted.` })
    } catch (err) {
      if (err?.status === 404) {
        // Order no longer exists on backend — treat as already deleted
        setLabOrders((prev) => prev.filter((o) => o.id !== order.id))
        setLabResults((prev) => prev.filter((r) => r.order_id !== order.id))
        setDeleteConfirm(null)
        onNotify({ type: 'success', message: `Lab order "${testLabel(order)}" deleted.` })
      } else {
        console.error('Failed to delete lab order:', err)
        onNotify({ type: 'error', message: 'Could not delete the order. Please try again.' })
      }
    } finally {
      setDeletingId(null)
    }
  }

  const isLoading = loadingOrders || loadingResults

  const hasProcessing = useMemo(() => cards.some(({ category }) => category === 'processing'), [cards])

  // Track which result IDs we've already notified about to avoid duplicate alerts
  const notifiedUrgentRef = useRef(new Set())

  // Poll every 8 s while any result is still being processed by the AI
  const pollingRef = useRef(null)
  useEffect(() => {
    if (isLoading || !hasProcessing) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
      return undefined
    }
    if (pollingRef.current) return undefined // already running
    pollingRef.current = setInterval(async () => {
      try {
        const res = await emrApi.getLabResults({})
        const fresh = Array.isArray(res) ? res : (res?.items || res?.data || [])
        // Fire urgent notification for newly-ready results with high/urgent priority
        fresh.forEach((r) => {
          if (notifiedUrgentRef.current.has(r.id)) return
          const cat = normalizeStatus(r.status)
          if (cat !== 'ready_to_verify') return
          const priority = detectPriority(r.ai_draft_text || r.aiDraft || '')
          if (priority !== 'urgent' && priority !== 'high') return
          notifiedUrgentRef.current.add(r.id)
          const order = labOrders.find((o) => o.id === r.order_id) || {}
          onNotify({
            id: `urgent-${r.id}`,
            type: 'urgent',
            title: `⚠️ ${priority === 'urgent' ? 'URGENT' : 'HIGH'} — AI Analysis Ready`,
            body: `${testLabel(order)} for ${patientLabel(order)} requires immediate physician review.`,
            time: 'Just now',
            isRead: false,
            navigateTo: 'lab-results',
          })
        })
        setLabResults(fresh)
      } catch { /* retry next tick */ }
    }, 8000)
    return () => { clearInterval(pollingRef.current); pollingRef.current = null }
  }, [isLoading, hasProcessing, labOrders, onNotify])

  return (
    <section className="lr-shell">
      <button type="button" className="lr-back-btn" onClick={onBack}>
        <span className="inline-flex h-4 w-4"><ArrowLeftIcon /></span>
        <span>Back</span>
      </button>

      <h1 className="lr-title">Lab Result Review</h1>
      <p className="lr-subtitle">Manage lab orders and review results for your patients</p>

      {/* Date Filter */}
      {!isLoading && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <DatePickerInput
            value={selectedDate}
            onChange={(v) => { setIsAllTime(false); setSelectedDate(v) }}
            isAllTime={isAllTime}
            onActivate={() => setIsAllTime(false)}
          />
          <button
            type="button"
            className={`flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent px-4 text-sm font-semibold transition-all duration-300 ${isAllTime ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#1c1c25] dark:text-[#c8c8e0] dark:hover:bg-[#252530]'}`}
            onClick={() => setIsAllTime(true)}
          >
            All Time
          </button>
        </div>
      )}

      {/* Progress stats chips */}
      {!isLoading && cards.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { key: 'needs_upload',    label: 'Awaiting Upload', color: 'amber' },
            { key: 'processing',      label: 'Processing',      color: 'sky' },
            { key: 'ready_to_verify', label: 'Ready to Verify', color: 'indigo' },
            { key: 'published',       label: 'Published',       color: 'emerald' },
          ].map(({ key, label, color }) => {
            const count = tabCounts[key] ?? 0
            if (count === 0) return null
            const colors = {
              amber:   'border-amber-200   bg-amber-50   text-amber-700   dark:border-amber-800/40   dark:bg-amber-950/30   dark:text-amber-400',
              sky:     'border-sky-200     bg-sky-50     text-sky-700     dark:border-sky-800/40     dark:bg-sky-950/30     dark:text-sky-400',
              indigo:  'border-indigo-200  bg-indigo-50  text-indigo-700  dark:border-indigo-800/40  dark:bg-indigo-950/30  dark:text-indigo-300',
              emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400',
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${colors[color]}`}
              >
                <span className="text-base font-bold leading-none">{count}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="lr-tabs" role="tablist" aria-label="Lab result status filters">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeFilter === key}
            className={`lr-tab ${activeFilter === key ? 'is-active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            <span>{label}</span>
            <span className="lr-tab-count">{tabCounts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="lr-list">
        {isLoading && (
          <div className="lr-empty">
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-r-transparent" />
            <span className="ml-2 text-sm text-slate-400">Loading lab data…</span>
          </div>
        )}

        {!isLoading && visibleCards.length === 0 && (
          <div className="lr-empty">No records found for this filter.</div>
        )}

        {!isLoading && dateGroups.map((dateGroup) => (
          <div key={dateGroup.dateLabel} className="mb-8">
            <h2 className="mb-4 text-xs font-black uppercase tracking-[0.1em] text-indigo-500 dark:text-indigo-400">
              {dateGroup.dateLabel}
            </h2>
            {dateGroup.patientGroups.map(({ patientId, patientName, appointmentId, groupCards, uploadedCount, publishedCount }) => {
              const handleOpenEmr = (navigateTo && setSelectedPatient)
                ? () => {
                    setSelectedPatient({ id: patientId, patient_id: patientId, patient_name: patientName, name: patientName })
                    navigateTo('emr')
                  }
                : undefined
              const handleSummary = appointmentId
                ? () => setSummaryModal({ appointmentId, patientName })
                : undefined
              return (
                <PatientGroup
                  key={patientId}
                  patientName={patientName}
                  uploadedCount={uploadedCount}
                  total={groupCards.length}
                  publishedCount={publishedCount}
                  appointmentId={appointmentId}
                  onOpenEmr={handleOpenEmr}
                  onSummary={handleSummary}
                >
              <div className="relative pl-6 ml-4 mt-6 sm:ml-6 space-y-8 pb-2">
              {[...groupCards].sort((a, b) => new Date(b.order.ordered_at || b.order.created_at || 0) - new Date(a.order.ordered_at || a.order.created_at || 0)).map(({ order, result, category }, idx, arr) => {
                const badge = statusBadge(category)
                const isVerifying = verifyingId === result?.id
                const justPublished = justPublishedId === result?.id
                const orderTime = new Date(order.ordered_at || order.orderedAt || order.created_at)

                return (
                  <div key={order.id} className="relative group">
                    {/* Timeline line — only between items, not after the last one */}
                    {idx !== arr.length - 1 && (
                      <span className="pointer-events-none absolute left-[-25px] top-[30px] bottom-[-2rem] z-0 w-[2px] bg-indigo-100 dark:bg-[#2a2a35]" aria-hidden="true" />
                    )}
                    {/* Timeline dot */}
                    <span className="absolute -left-[31px] top-4 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-white transition-transform group-hover:scale-125 dark:bg-indigo-400 dark:ring-[#111118]" aria-hidden="true" />
                    
                    <div className="mb-2.5 pl-1">
                      <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {Number.isNaN(orderTime.getTime()) ? '—' : orderTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                        <span className="opacity-75">{Number.isNaN(orderTime.getTime()) ? '' : orderTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                      <article className="lr-card mt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                        <div className="lr-card-top">
                          <div>
                            <p className="lr-test-name font-semibold text-slate-800 dark:text-[#c8c8e0]">{testLabel(order)}</p>
                            <div className="lr-meta">
                              <span>Ordered: {formatDateLabel(order.ordered_at || order.orderedAt || order.created_at)}</span>
                              {result && <span>Result: {formatDateLabel(result.created_at)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={badge.cls}>{badge.label}</span>
                            {/* Delete — only for non-published orders */}
                            {category !== 'published' && (
                              <button
                                type="button"
                                title="Delete this order"
                                onClick={() => setDeleteConfirm(order)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-[#404050] dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                    {category === 'needs_upload' && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setUploadModal(order)}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-400"
                        >
                          <span className="inline-flex h-4 w-4"><UploadIcon /></span>{' '}
                          Upload: {testLabel(order)}
                        </button>
                      </div>
                    )}

                    {category === 'processing' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#7070a0]">
                          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-r-transparent" aria-hidden="true" />{' '}
                          AI is analysing the result…
                        </div>
                        {result?.id && (
                          <button
                            type="button"
                            onClick={() => setUploadModal({ ...order, replaceResultId: result.id })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                          >
                            <span className="inline-flex h-3.5 w-3.5"><UploadIcon /></span>
                            Upload again
                          </button>
                        )}
                      </div>
                    )}

                    {category === 'ready_to_verify' && result && (
                      <div className="lr-ai-panel">
                        <p className="lr-ai-title">AI Interpretation</p>

                        {/* Specialist review warning — shown when AI flagged low confidence or fallback */}
                        {(result.required_specialty || String(result.status || '').toUpperCase() === 'NEEDS_MANUAL_REVIEW') && (
                          <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-700/40 dark:bg-amber-950/30">
                            <span className="text-sm">⚠️</span>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                              {result.required_specialty
                                ? `Specialist review required — ${result.required_specialty}`
                                : 'Low AI confidence — manual review recommended'}
                            </p>
                          </div>
                        )}

                        <div className="lr-ai-text">
                          <AiDraftRenderer
                            text={result.ai_draft_text || result.aiDraft || ''}
                            fileType={result.file_type}
                            collapsed
                          />
                        </div>
                        {result.ai_confidence != null && (
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-[#505060]">
                            Confidence: {Math.round(result.ai_confidence * 100)}%
                          </p>
                        )}
                        <div className="lr-actions">
                          <button
                            type="button"
                            disabled={isVerifying}
                            onClick={() => setVerifyModal({ order, result })}
                            className="lr-verify-btn disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isVerifying
                              ? <><span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> Verifying…</>
                              : 'Review & Publish…'
                            }
                          </button>
                          {result?.id && (
                            <button
                              type="button"
                              onClick={() => setUploadModal({ ...order, replaceResultId: result.id })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                            >
                              <span className="inline-flex h-3.5 w-3.5"><UploadIcon /></span>
                              Upload again
                            </button>
                          )}
                          {justPublished && <span className="lr-success">✓ Result published</span>}
                        </div>
                      </div>
                    )}

                    {category === 'published' && result && (
                      <p className="lr-published-note">
                        Verified at: {formatDateLabel(result.verified_at || result.verifiedAt || result.published_at)}
                      </p>
                    )}
                    </article>
                  </div>
                )
              })}
              </div>
            </PatientGroup>
          )
        })}
          </div>
        ))}
      </div>

      {uploadModal && (
        <UploadModal
          order={uploadModal}
          resultId={uploadModal.replaceResultId || null}
          onClose={() => setUploadModal(null)}
          onSuccess={() => { setUploadModal(null); fetchAll() }}
        />
      )}

      {verifyModal && (
        <VerifyModal
          order={verifyModal.order}
          result={verifyModal.result}
          onClose={() => setVerifyModal(null)}
          onConfirm={({ interpretation, doctorNotes }) =>
            handleVerify({ order: verifyModal.order, result: verifyModal.result, interpretation, doctorNotes })
          }
        />
      )}

      {summaryModal && (
        <HolisticSummaryModal
          appointmentId={summaryModal.appointmentId}
          patientName={summaryModal.patientName}
          onClose={() => setSummaryModal(null)}
        />
      )}

      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-all" role="dialog" aria-modal="true">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1c1c25] dark:shadow-rose-900/10 dark:ring-1 dark:ring-white/5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <h2 className="mb-1.5 text-lg font-bold text-slate-800 dark:text-[#ececf0]">Delete Lab Order</h2>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-[#8888aa]">
                  Are you sure you want to permanently delete the order for{' '}
                  <strong className="font-semibold text-slate-700 dark:text-[#c8c8e0]">{testLabel(deleteConfirm)}</strong>
                  {' '}({patientLabel(deleteConfirm)})?<br className="hidden sm:block" /> This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-[#2a2a35] dark:bg-[#1c1c25] dark:text-[#a0a0c0] dark:hover:bg-[#252530] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirm.id}
                onClick={() => handleDeleteOrder(deleteConfirm)}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[#1c1c25]"
              >
                {deletingId === deleteConfirm.id ? (
                  <><span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> Deleting…</>
                ) : 'Yes, delete it'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}

LabResultReviewView.propTypes = {
  labOrders: PropTypes.array.isRequired,
  setLabOrders: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  navigateTo: PropTypes.func,
  setSelectedPatient: PropTypes.func,
}

LabResultReviewView.defaultProps = {
  navigateTo: null,
  setSelectedPatient: null,
}
