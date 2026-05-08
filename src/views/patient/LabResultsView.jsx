import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { IconSparkle } from '../../icons'
import { LAB_AI_ANALYSIS } from '../../data/aiAnalysis'
import { PATIENT_FRIENDLY_RESULTS } from '../../data/patientSpecialtyResults'
import AiRiskBadge from '../../components/shared/AiRiskBadge'
import { formatRelativeTime, getTimeRemaining } from '../../utils/formatTime'
import { emrApi } from '../../api/emr'
    doctor: 'Dr. Sarah Chen',
    date: 'Received Mar 10, 2025',
    aiSummary: 'Most values are within normal range. Hemoglobin is slightly low - worth discussing with your doctor.',
    flags: 1,
    explanation: "Your results look mostly healthy. Your red blood cell count and white blood cell count are both within expected ranges, which is a good sign. However, your hemoglobin level came in slightly below the normal threshold. This can sometimes cause mild fatigue or low energy. It's not an emergency, but it's worth mentioning to Dr. Chen at your next visit - she may recommend dietary adjustments or a simple iron supplement.",
    details: [
      { test: 'Hemoglobin', yourValue: '11.2 g/dL', normalRange: '12.0-16.0 g/dL', status: 'Low' },
      { test: 'White Blood Cells', yourValue: '6.8 K/uL', normalRange: '4.5-11.0 K/uL', status: 'Normal' },
      { test: 'Platelets', yourValue: '245 K/uL', normalRange: '150-400 K/uL', status: 'Normal' },
      { test: 'Hematocrit', yourValue: '34.1%', normalRange: '36-46%', status: 'Low' },
      { test: 'Red Blood Cells', yourValue: '4.1 M/uL', normalRange: '4.2-5.4 M/uL', status: 'Normal' },
    ],
  },
  {
    id: 'lipid-profile',
    aiKey: 'lipid-profile',
    name: 'Lipid Profile',
    status: 'New',
    doctor: 'Dr. Sarah Chen',
    date: 'Received Mar 10, 2025',
    aiSummary: 'LDL cholesterol is above the recommended level. Your doctor may suggest dietary changes.',
    flags: 2,
    explanation: 'Your lipid panel suggests elevated LDL cholesterol compared with the ideal range. This is a common pattern and can often be improved through nutrition, regular activity, and follow-up monitoring. Discuss this result with your doctor so you can decide whether lifestyle changes alone are enough or if additional treatment is needed.',
    details: [
      { test: 'Total Cholesterol', yourValue: '212 mg/dL', normalRange: '< 200 mg/dL', status: 'High' },
      { test: 'LDL Cholesterol', yourValue: '146 mg/dL', normalRange: '< 100 mg/dL', status: 'High' },
      { test: 'HDL Cholesterol', yourValue: '52 mg/dL', normalRange: '> 40 mg/dL', status: 'Normal' },
      { test: 'Triglycerides', yourValue: '132 mg/dL', normalRange: '< 150 mg/dL', status: 'Normal' },
      { test: 'Non-HDL Cholesterol', yourValue: '160 mg/dL', normalRange: '< 130 mg/dL', status: 'High' },
    ],
  },
  {
    id: 'thyroid-function',
    aiKey: 'thyroid-function',
    name: 'Thyroid Function (TSH)',
    status: 'Reviewed',
    doctor: 'Dr. Linh Nguyen',
    date: 'Received Jan 22, 2025',
    aiSummary: 'Thyroid hormone levels are normal. No action needed.',
    flags: 0,
    explanation: 'Your thyroid markers are within normal limits, which means your thyroid function looks stable. No urgent follow-up is required based on this test alone. Continue routine checkups as advised by your care team.',
    details: [
      { test: 'TSH', yourValue: '2.3 mIU/L', normalRange: '0.4-4.0 mIU/L', status: 'Normal' },
      { test: 'Free T4', yourValue: '1.2 ng/dL', normalRange: '0.8-1.8 ng/dL', status: 'Normal' },
      { test: 'Free T3', yourValue: '3.1 pg/mL', normalRange: '2.3-4.2 pg/mL', status: 'Normal' },
    ],
  },
  {
    id: 'vitamin-iron',
    aiKey: 'vitamin-iron',
    name: 'Vitamin D & Iron Panel',
    status: 'Reviewed',
    doctor: 'Dr. Sarah Chen',
    date: 'Received Aug 14, 2024',
    aiSummary: 'Mild iron deficiency detected. Supplement was prescribed following this result.',
    flags: 1,
    explanation: "This panel showed mild iron deficiency at the time of testing. Your care plan already included supplementation, which is a standard and effective response. Keep following your doctor's guidance and monitor symptoms like fatigue during follow-up.",
    details: [
      { test: 'Ferritin', yourValue: '18 ng/mL', normalRange: '20-200 ng/mL', status: 'Low' },
      { test: 'Serum Iron', yourValue: '58 ug/dL', normalRange: '60-170 ug/dL', status: 'Low' },
      { test: 'Vitamin D (25-OH)', yourValue: '31 ng/mL', normalRange: '30-100 ng/mL', status: 'Normal' },
      { test: 'Transferrin Saturation', yourValue: '21%', normalRange: '20-50%', status: 'Normal' },
    ],
  },
]

function dotsByRiskLevel(riskLevel) {
  if (riskLevel === 'high') return ['bg-rose-400', 'bg-rose-400', 'bg-slate-200 dark:bg-[#252530]']
  if (riskLevel === 'moderate') return ['bg-amber-400', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
  return ['bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
}

function symbolForResult(icon) {
  if (icon === 'heart') return 'HT'
  if (icon === 'eye') return 'OPH'
  if (icon === 'skin') return 'DERM'
  if (icon === 'lungs') return 'PULM'
  if (icon === 'droplet') return 'NEPH'
  return 'RAD'
}

function themeClasses(theme) {
  const styles = {
    teal: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/50 dark:text-teal-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/50 dark:text-violet-300',
    pink: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/50 dark:bg-pink-950/50 dark:text-pink-300',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/50 dark:text-cyan-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300',
  }

  return styles[theme] || styles.teal
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

export default function LabResultsView({ setCurrentView, setSelectedLab, labOrders, currentUser }) {
  const [resultType, setResultType] = useState('blood')
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedImagingId, setSelectedImagingId] = useState(null)
  const [readyNotifiedOrderIds, setReadyNotifiedOrderIds] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [fetchedResults, setFetchedResults] = useState([])

  useEffect(() => {
    async function fetchLabResults() {
      if (!currentUser?.id) return
      try {
        const res = await emrApi.getLabResults({ patient_id: currentUser.id })
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data.items || [])
          
          const mapped = items.map(apiRes => {
            const aiData = apiRes.ai_draft_text ? { recommendation: apiRes.ai_draft_text } : null
            return {
              id: apiRes.id,
              aiKey: apiRes.id,
              name: apiRes.file_type ? `Lab Reuslt (${apiRes.file_type.toUpperCase()})` : 'Lab Result',
              status: apiRes.status === 'PUBLISHED' ? 'Reviewed' : 'New',
              doctor: 'Your Doctor', // Fallback as we might not have the doctor name linked directly in the compact response
              date: `Received ${formatRelativeTime(apiRes.created_at || new Date())}`,
              aiSummary: aiData?.recommendation || 'Results are ready for review.',
              flags: 0,
              explanation: aiData?.recommendation || 'Results were generated from your recent lab order.',
              fileUrl: apiRes.file_url,
              details: [] // Mapped details if available from API
            }
          })
          setFetchedResults(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch lab results', err)
      }
    }
    fetchLabResults()
  }, [currentUser])

  const pendingOrders = useMemo(() => (
    labOrders.filter(
      (order) => order.patientId === 'PT-2024-0142' && (
        order.status === 'pending'
        || order.status === 'processing'
        || order.status === 'PENDING'
      ),
    )
  ), [labOrders])

  const readyOrders = useMemo(() => (
    labOrders.filter(
      (order) => order.patientId === 'PT-2024-0142' && (
        order.status === 'ready'
        || order.status === 'reviewed'
        || order.status === 'AI_DRAFT'
        || order.status === 'PUBLISHED'
      ),
    )
  ), [labOrders])

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

const allBloodResults = useMemo(() => ([...fetchedResults, ...dynamicReadyResults, ...LAB_RESULTS]), [fetchedResults, dynamicReadyResults])

  const visibleResults = useMemo(() => {
    let scopedResults = allBloodResults

    if (filter === 'new') scopedResults = scopedResults.filter((result) => result.status === 'New')
    if (filter === 'reviewed') scopedResults = scopedResults.filter((result) => result.status === 'Reviewed')

    if (statusFilter === 'pending') return []
    if (statusFilter === 'ready') return scopedResults
    return scopedResults
  }, [allBloodResults, filter, statusFilter])

  const selectedImaging = useMemo(
    () => PATIENT_FRIENDLY_RESULTS.find((item) => item.id === selectedImagingId) || null,
    [selectedImagingId],
  )

  useEffect(() => {
    const unseenReadyOrder = readyOrders.find((order) => !readyNotifiedOrderIds.includes(order.id))
    if (!unseenReadyOrder) return

    const startTimer = globalThis.setTimeout(() => {
      setReadyNotifiedOrderIds((prev) => [...prev, unseenReadyOrder.id])
      setToastMessage(`✓ Lab results for ${unseenReadyOrder.tests.join(', ')} are now ready.`)
    }, 0)

    const clearTimer = globalThis.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => {
      globalThis.clearTimeout(startTimer)
      globalThis.clearTimeout(clearTimer)
    }
  }, [readyNotifiedOrderIds, readyOrders])

  return (
    <div className="mx-auto max-w-4xl">
      <style>{`@keyframes progress { 0% { width: 60%; } 50% { width: 80%; } 100% { width: 60%; } }`}</style>

      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Lab Results</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your test results, explained in plain language by AI.</p>

      <div className="mt-5 mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-[#252530] dark:bg-[#111118]">
        {[
          ['blood', 'Blood Tests'],
          ['imaging', 'Imaging & Signals'],
        ].map(([key, label]) => {
          const active = resultType === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setResultType(key)
                setSelectedImagingId(null)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${active ? 'bg-slate-900 text-white dark:bg-[#eeeef5] dark:text-[#0c0c13]' : 'text-slate-500 hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]'}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {resultType === 'blood' && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            ['all', 'All'],
            ['pending', 'Pending Results'],
            ['ready', 'Results Ready'],
          ].map(([key, label]) => {
            const active = statusFilter === key
            return (
              <button
                key={key}
                type="button"
                className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-all ${active ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545]'}`}
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {resultType === 'blood' && (
        <div className="mt-6 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <div className="flex gap-2" role="tablist" aria-label="Lab result filters">
            {[
              ['all', 'All'],
              ['new', 'New'],
              ['reviewed', 'Reviewed'],
            ].map(([key, label]) => {
              const active = filter === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-all ${active ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545]'}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <span className="text-xs text-slate-400 dark:text-[#606070]">Newest first</span>
        </div>
      )}

      {resultType === 'blood' && (
        <div className="space-y-4">
          {statusFilter !== 'ready' && pendingOrders.length > 0 && (
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

      {resultType === 'imaging' && !selectedImaging && (
        <div className="space-y-3">
          {PATIENT_FRIENDLY_RESULTS.map((result) => {
            const symbol = symbolForResult(result.icon)
            return (
              <button
                key={result.id}
                type="button"
                onClick={() => setSelectedImagingId(result.id)}
                className="card-hover w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${themeClasses(result.theme)}`}>
                      <span className="text-[10px] font-bold tracking-tight">{symbol}</span>
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{result.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">{result.date}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-[#9898b0]">{result.summary}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <AiRiskBadge riskLevel={result.riskLevel} confidence={result.confidence} compact />
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${themeClasses(result.theme)}`}>
                      {result.aiLabel}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {resultType === 'imaging' && selectedImaging && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:shadow-none">
          <button
            type="button"
            onClick={() => setSelectedImagingId(null)}
            className="mb-4 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]"
          >
            ← Back to all results
          </button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eeeef5]">{selectedImaging.title}</h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">{selectedImaging.date} · Model: {selectedImaging.model}</p>
            </div>
            <AiRiskBadge riskLevel={selectedImaging.riskLevel} confidence={selectedImaging.confidence} />
          </div>

          <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#252530] dark:bg-[#1c1c25]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-[#70708a]">Simple Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{selectedImaging.summary}</p>
          </section>

          <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#14141b]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-[#70708a]">What This Means</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">{selectedImaging.details}</p>
          </section>

          <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#14141b]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-[#70708a]">Key Findings</p>
            <ul className="mt-2 space-y-2">
              {selectedImaging.findings.map((finding) => (
                <li key={finding} className="flex items-start gap-2 text-sm text-slate-600 dark:text-[#9898b0]">
                  <span className="mt-0.5 text-emerald-500 dark:text-emerald-400">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <span className="mt-0.5 text-sm font-bold">!</span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">Suggested Next Step</p>
                <p className="mt-1 text-sm leading-relaxed">{selectedImaging.recommendation}</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setCurrentView('symptom-checker')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <span>Discuss with AI Assistant →</span>
          </button>
        </article>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          {toastMessage}
        </div>
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
