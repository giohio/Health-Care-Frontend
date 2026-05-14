import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { IconSparkle } from '../../icons'
import { LAB_AI_ANALYSIS } from '../../data/aiAnalysis'
import AiRiskBadge from '../../components/shared/AiRiskBadge'
import { formatRelativeTime, getTimeRemaining } from '../../utils/formatTime'
import { emrApi } from '../../api/emr'
import { paymentApi } from '../../api/payment'
import { Toast } from '../../components/shared/Toast'
import { aiDraftPreview, normalizeAiDraftForDisplay, stripAiWarning } from '../../components/emr/labResultUtils'

/** Map a published_findings / ai_visual_findings JSON array to the details row shape. */
function mapFindingsToDetails(findings) {
  const rows = Array.isArray(findings)
    ? findings
    : Array.isArray(findings?.findings)
      ? findings.findings
      : []
  if (rows.length === 0) return []
  return rows.map((f) => {
    // Blood-panel style: { name, value, unit, flag/status, reference_range/reference_low/reference_high }
    if (f.name && f.value !== undefined) {
      const hasRef = f.reference_low !== undefined && f.reference_high !== undefined
      const ref = hasRef
        ? `${f.reference_low}–${f.reference_high} ${f.unit || ''}`.trim()
        : (f.reference_range || f.ref_range || f.reference || '-')
      const statusMap = {
        high: 'High',
        critical_high: 'Critical',
        low: 'Low',
        critical_low: 'Critical',
        normal: 'Normal',
        not_applicable: 'Normal',
        H: 'High',
        L: 'Low',
        C: 'Critical',
        N: 'Normal',
      }
      const rawStatus = f.flag ?? f.status
      const unitSuffix = f.unit ? ` ${f.unit}` : ''
      return {
        test: f.name,
        yourValue: `${f.value}${unitSuffix}`,
        normalRange: ref || '-',
        status: statusMap[rawStatus] || statusMap[String(rawStatus || '').toLowerCase()] || 'Normal',
      }
    }
    // Imaging style: { finding, severity, region, location }
    if (f.finding) {
      const statusMap = { normal: 'Normal', mild: 'Normal', moderate: 'High', severe: 'High' }
      const location = f.region || f.location || ''
      return {
        test: location ? `${f.finding} (${location})` : f.finding,
        yourValue: f.severity || '-',
        normalRange: '-',
        status: statusMap[(f.severity || '').toLowerCase()] || 'Normal',
      }
    }
    return null
  }).filter(Boolean)
}

function dotsByRiskLevel(riskLevel) {
  if (riskLevel === 'high') return ['bg-rose-400', 'bg-rose-400', 'bg-slate-200 dark:bg-[#252530]']
  if (riskLevel === 'moderate') return ['bg-amber-400', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
  return ['bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
}

function FlaskConicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function isImagingOrSignalName(value) {
  const name = String(value || '').toLowerCase()
  return [
    /\bx-?ray\b/,
    /\bcxr\b/,
    /\bct\b/,
    /\bmri\b/,
    /\bultrasound\b/,
    /\busg\b/,
    /\becg\b/,
    /\bekg\b/,
    /\belectrocardiogram\b/,
    /\bscan\b/,
  ].some((pattern) => pattern.test(name))
}

/** Map a single API lab result + order into the view's lab shape. */
function mapApiResultToLab(apiRes, ordersMap, patientId) {
  const order = ordersMap[apiRes.order_id] || null
  const testName = order?.test_name || null
  const rawFindings = apiRes.published_findings || apiRes.ai_visual_findings
  let findings = rawFindings
  if (typeof rawFindings === 'string') {
    try { findings = JSON.parse(rawFindings) } catch { findings = [] }
  }
  const details = mapFindingsToDetails(findings)
  const abnormalCount = details.filter(d => d.status !== 'Normal').length
  const rawSummaryText = apiRes.published_text || apiRes.ai_draft_text || 'Results are ready for review.'
  const summaryText = stripAiWarning(rawSummaryText)
  const previewText = aiDraftPreview(summaryText) || 'Results are ready for review.'
  const label = testName
    || (apiRes.file_type && apiRes.file_type !== 'manual' ? `Lab Result (${apiRes.file_type.toUpperCase()})` : null)
    || 'Lab Result'
  return {
    id: apiRes.id,
    order_id: apiRes.order_id,
    patient_id: patientId,
    name: label,
    status: apiRes.status === 'PUBLISHED' ? 'Reviewed' : 'New',
    doctor: 'Your Doctor',
    date: `Received ${formatRelativeTime(apiRes.created_at || new Date())}`,
    aiSummary: previewText,
    flags: abnormalCount,
    explanation: normalizeAiDraftForDisplay(summaryText),
    ai_draft_text: apiRes.ai_draft_text,
    published_text: apiRes.published_text,
    ai_confidence: apiRes.ai_confidence,
    ai_visual_findings: apiRes.ai_visual_findings,
    published_findings: apiRes.published_findings,
    fileUrl: apiRes.file_url,
    details,
  }
}

export default function LabResultsView({ setCurrentView, setSelectedLab, labOrders, currentUser }) {
  const [resultType, setResultType] = useState('blood')
  const [filter, setFilter] = useState('all')
  const [imagingFilter, setImagingFilter] = useState('all')
  const [readyNotifiedOrderIds, setReadyNotifiedOrderIds] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [fetchedResults, setFetchedResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(null) // orderId being paid

  useEffect(() => {
    async function fetchLabResults() {
      if (!currentUser?.id) return
      setLoading(true)
      setFetchError(null)
      try {
        const [resultsRes, ordersRes] = await Promise.allSettled([
          emrApi.getLabResults({ patient_id: currentUser.id }),
          emrApi.getLabOrders({ patient_id: currentUser.id }),
        ])

        let items = []
        if (resultsRes.status === 'fulfilled' && resultsRes.value) {
          const raw = resultsRes.value
          items = Array.isArray(raw) ? raw : (raw.items || raw.data || [])
        }

        const ordersMap = {}
        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
          for (const o of ordersRes.value) ordersMap[o.id] = o
        }

        const mapped = items.map(apiRes => mapApiResultToLab(apiRes, ordersMap, currentUser.id))
        setFetchedResults(mapped)
      } catch (err) {
        console.error('Failed to fetch lab results', err)
        setFetchError('Unable to load your lab results. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchLabResults()
  }, [currentUser])

  const pendingOrders = useMemo(() => (
    labOrders.filter(
      (order) => order.patientId === currentUser?.id && (
        order.status === 'pending'
        || order.status === 'processing'
        || order.status === 'PENDING'
      ),
    )
  ), [labOrders, currentUser])

  // Filter unpaid lab orders: fee > 0 && payment_status !== "PAID"
  const unpaidOrders = useMemo(() => (
    labOrders.filter(
      (order) => order.patientId === currentUser?.id 
        && order.fee > 0 
        && order.payment_status !== 'PAID'
    )
  ), [labOrders, currentUser])

  const readyOrders = useMemo(() => (
    labOrders.filter(
      (order) => order.patientId === currentUser?.id && (
        order.status === 'ready'
        || order.status === 'reviewed'
        || order.status === 'AI_DRAFT'
        || order.status === 'PUBLISHED'
      ),
    )
  ), [labOrders, currentUser])

  const dynamicReadyResults = useMemo(() => (
    readyOrders.map((order) => {
      const aiData = order.resultKey ? LAB_AI_ANALYSIS[order.resultKey] : null
      return {
        id: order.id,
        aiKey: order.resultKey,
        name: order.tests.join(', '),
        status: order.status === 'reviewed' ? 'Reviewed' : 'New',
        doctor: order.orderedBy,
        date: `Received ${formatRelativeTime(order.estimatedReadyAt)}`,
        aiSummary: aiData?.recommendation || 'Your ordered tests are complete and ready for review.',
        flags: aiData?.flags?.length || 0,
        explanation: aiData?.primaryFlag || 'Results were generated from your recent lab order.',
        details: aiData?.flags?.map((flag) => ({
          test: flag.marker,
          yourValue: flag.value,
          normalRange: '-',
          status: flag.status ? flag.status.charAt(0).toUpperCase() + flag.status.slice(1) : 'Normal',
        })) || [],
      }
    })
  ), [readyOrders])

const allBloodResults = useMemo(() => ([...fetchedResults, ...dynamicReadyResults]), [fetchedResults, dynamicReadyResults])

  const visibleResults = useMemo(() => {
    if (filter === 'pending') return []
    let scopedResults = allBloodResults
    if (filter === 'new') scopedResults = scopedResults.filter((r) => r.status === 'New')
    if (filter === 'reviewed') scopedResults = scopedResults.filter((r) => r.status === 'Reviewed')
    return scopedResults
  }, [allBloodResults, filter])

  const imagingResults = useMemo(() => {
    const scoped = allBloodResults.filter((result) => isImagingOrSignalName(result.name))
    if (imagingFilter === 'all') return scoped
    return scoped.filter((result) => {
      const abnormal = Number(result.flags || 0) > 0
      if (imagingFilter === 'low') return !abnormal
      if (imagingFilter === 'medium') return abnormal
      if (imagingFilter === 'high') return false
      return true
    })
  }, [allBloodResults, imagingFilter])

  useEffect(() => {
    const unseenReadyOrder = readyOrders.find((order) => !readyNotifiedOrderIds.includes(order.id))
    if (!unseenReadyOrder) return

    const startTimer = globalThis.setTimeout(() => {
      setReadyNotifiedOrderIds((prev) => [...prev, unseenReadyOrder.id])
      setToastMessage(`Lab results for ${unseenReadyOrder.tests.join(', ')} are now ready.`)
    }, 0)

    return () => {
      globalThis.clearTimeout(startTimer)
    }
  }, [readyNotifiedOrderIds, readyOrders])

  const handlePayNow = async (orderId) => {
    setPaymentLoading(orderId)
    try {
      const result = await paymentApi.getLabPaymentUrl(orderId)
      if (result?.payment_url) {
        window.location.href = result.payment_url
      } else {
        setToastMessage('Unable to generate payment URL. Please try again.')
      }
    } catch (err) {
      console.error('Failed to get payment URL', err)
      setToastMessage('Payment processing failed. Please try again later.')
    } finally {
      setPaymentLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">

      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Lab Results</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your test results, explained in plain language by AI.</p>

      {/* Payment Required Banner */}
      {unpaidOrders.length > 0 && (
        <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <div className="flex gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 0 1-2 2h-5l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Payment Required</h3>
              <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                {unpaidOrders.length} lab test{unpaidOrders.length !== 1 ? 's' : ''} need payment before collection.
              </p>
              <div className="mt-3 space-y-2">
                {unpaidOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 dark:bg-indigo-900/20">
                    <span className="text-xs font-medium text-slate-700 dark:text-indigo-200">
                      {order.test_name} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.fee || 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePayNow(order.id)}
                      disabled={paymentLoading === order.id}
                      className="rounded px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                    >
                      {paymentLoading === order.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Type toggle */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-[#252530] dark:bg-[#111118]">
          {[
            ['blood', 'Blood Tests'],
            ['imaging', 'Imaging & Signals'],
          ].map(([key, label]) => {
            const active = resultType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setResultType(key); setImagingFilter('all') }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${active ? 'bg-slate-900 text-white dark:bg-[#eeeef5] dark:text-[#0c0c13]' : 'text-slate-500 hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]'}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Status filter — blood */}
        {resultType === 'blood' && (
          <div className="flex items-center gap-2" role="tablist" aria-label="Filter lab results">
            {[
              ['all', 'All'],
              ['new', 'New'],
              ['reviewed', 'Reviewed'],
              ['pending', 'Pending'],
            ].map(([key, label]) => {
              const active = filter === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545]'
                  }`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              )
            })}
            <span className="ml-1 text-xs text-slate-400 dark:text-[#606070]">Newest first</span>
          </div>
        )}

        {/* Risk filter — imaging */}
        {resultType === 'imaging' && (
          <div className="flex items-center gap-2" role="tablist" aria-label="Filter imaging results">
            {[
              ['all', 'All'],
              ['low', 'Low Risk'],
              ['medium', 'Medium Risk'],
              ['high', 'High Risk'],
            ].map(([key, label]) => {
              const active = imagingFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545]'
                  }`}
                  onClick={() => setImagingFilter(key)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {resultType === 'blood' && (
        <div className="space-y-4">
          {filter !== 'reviewed' && filter !== 'new' && pendingOrders.length > 0 && (
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Pending Results</p>

              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <article key={order.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 border-l-4 border-l-amber-400 bg-white px-5 py-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                    <div className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                      <span className="inline-flex h-5 w-5"><FlaskConicalIcon /></span>
                      {order.status === 'processing' && (
                        <span className="absolute inset-0 rounded-xl border-2 border-amber-400/40" style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{order.tests.join(', ')}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                        Ordered by {order.orderedBy} · {formatRelativeTime(order.orderedAt)}
                      </p>

                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                        <span
                          className={`block h-full rounded-full ${order.status === 'pending' ? 'w-1/4 bg-amber-400' : 'w-2/3 bg-indigo-500'}`}
                          style={order.status === 'processing' ? { animation: 'progress 2s ease infinite' } : undefined}
                        />
                      </div>

                      <p className={`mt-1 text-[11px] ${order.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {order.status === 'pending' ? 'Waiting for lab processing to begin...' : 'Your sample is being analysed...'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${order.status === 'pending' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300'}`}>
                        {order.status === 'pending' ? 'Pending' : 'Processing'}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-[#606070]">Est. ready in ~{getTimeRemaining(order.estimatedReadyAt)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-[#252530] dark:bg-[#111118]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-[#252530] dark:border-t-indigo-400" />
              <p className="mt-3 text-sm text-slate-500 dark:text-[#70708a]">Loading your lab results...</p>
            </div>
          )}

          {!loading && fetchError && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-12 dark:border-rose-900/40 dark:bg-rose-950/30">
              <span className="text-2xl">⚠️</span>
              <p className="mt-2 text-sm font-medium text-rose-700 dark:text-rose-300">{fetchError}</p>
            </div>
          )}

          {!loading && !fetchError && visibleResults.length === 0 && pendingOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-[#252530] dark:bg-[#111118]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#505060]"><FlaskConicalIcon /></span>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-[#70708a]">No lab results yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Results will appear here once your doctor orders lab tests.</p>
            </div>
          )}

          {visibleResults.map((lab) => {
            const aiData = LAB_AI_ANALYSIS[lab.aiKey]
            const dots = dotsByRiskLevel(aiData?.riskLevel)
            const isNew = lab.status === 'New'

            return (
              <button
                key={lab.id}
                type="button"
                className="card-hover flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]"
                onClick={() => {
                  setSelectedLab(lab)
                  setCurrentView('lab-detail')
                }}
              >
                <span className={`w-1 self-stretch rounded-full ${isNew ? 'bg-amber-400' : 'bg-slate-200 dark:bg-[#252530]'}`} aria-hidden="true" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{lab.name}</h2>
                    <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${isNew ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300' : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]'}`}>{lab.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">Ordered by {lab.doctor}</p>
                  <p className="text-xs text-slate-400 dark:text-[#606070]">{lab.date}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#252530] dark:bg-[#1c1c25]">
                      <span className="flex-shrink-0 text-indigo-400 dark:text-indigo-500"><IconSparkle size={12} /></span>
                      <span className="truncate text-xs text-slate-600 dark:text-[#9898b0]">{lab.aiSummary}</span>
                    </div>

                    {aiData && (
                      <AiRiskBadge
                        riskLevel={aiData.riskLevel}
                        confidence={aiData.confidence}
                        compact
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">View Details →</span>
                  <div className="flex gap-1">
                    {dots.map((dot, idx) => <span key={`${lab.id}-${idx}`} className={`h-2 w-2 rounded-full ${dot}`} />)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {resultType === 'imaging' && (
        <div className="space-y-3">
          {imagingResults.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-[#252530] dark:bg-[#111118]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#505060]"><FlaskConicalIcon /></span>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-[#70708a]">No imaging or signal results yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Results will appear here when your doctor publishes them.</p>
            </div>
          )}

          {imagingResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  setSelectedLab(result)
                  setCurrentView('lab-detail')
                }}
                className="card-hover w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <span className="text-[10px] font-bold tracking-tight">IMG</span>
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{result.name}</h2>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">{result.date}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-[#9898b0]">{result.aiSummary}</p>
                    </div>
                  </div>
                </div>
              </button>
          ))}
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      )}
    </div>
  )
}

LabResultsView.propTypes = {
  labOrders: PropTypes.arrayOf(PropTypes.object),
  setCurrentView: PropTypes.func.isRequired,
  setSelectedLab: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
}

LabResultsView.defaultProps = {
  labOrders: [],
  currentUser: null,
}
