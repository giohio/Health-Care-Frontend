import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { IconArrowLeft, IconSparkle } from '../../icons'
import { LAB_AI_ANALYSIS } from '../../data/aiAnalysis'
import { AI_LAB_ANALYSIS } from '../../data/aiLabAnalysis'
import AiRiskBadge from '../../components/shared/AiRiskBadge'
import AiDisclaimer from '../../components/shared/AiDisclaimer'
import { labChat, streamSSE } from '../../api/ai'
import { emrApi } from '../../api/emr'
import AiMessageContent from '../../components/shared/AiMessageContent'

const DEFAULT_LAB = {
  id: 1,
  name: 'Full Blood Panel',
  status: 'New',
  doctor: 'Dr. Sarah Chen',
  date: 'Received Mar 10, 2025',
  explanation:
    "Your results look mostly healthy. Your red blood cell count and white blood cell count are both within expected ranges, which is a good sign. However, your hemoglobin level came in slightly below the normal threshold. This can sometimes cause mild fatigue or low energy. It's not an emergency, but it's worth mentioning to Dr. Chen at your next visit - she may recommend dietary adjustments or a simple iron supplement.",
  details: [
    { test: 'Hemoglobin', yourValue: '11.2 g/dL', normalRange: '12.0-16.0 g/dL', status: 'Low' },
    { test: 'White Blood Cells', yourValue: '6.8 K/uL', normalRange: '4.5-11.0 K/uL', status: 'Normal' },
    { test: 'Platelets', yourValue: '245 K/uL', normalRange: '150-400 K/uL', status: 'Normal' },
    { test: 'Hematocrit', yourValue: '34.1%', normalRange: '36-46%', status: 'Low' },
    { test: 'Red Blood Cells', yourValue: '4.1 M/uL', normalRange: '4.2-5.4 M/uL', status: 'Normal' },
  ],
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.8c.6.5 1 1.2 1.1 2h5.8c.1-.8.5-1.5 1.1-2A7 7 0 0 0 12 2z" />
    </svg>
  )
}

function AlertTriangleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

AlertTriangleIcon.propTypes = {
  className: PropTypes.string,
}

AlertTriangleIcon.defaultProps = {
  className: '',
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

CheckIcon.propTypes = {
  className: PropTypes.string,
}

CheckIcon.defaultProps = {
  className: '',
}

function normalizeMarker(value) {
  return (value || '').toLowerCase().replaceAll(/[^a-z0-9]+/g, '')
}

function findAiFlag(flags, marker) {
  const normalizedMarker = normalizeMarker(marker)

  return flags.find((item) => {
    const aiMarker = normalizeMarker(item.marker)
    return normalizedMarker.includes(aiMarker) || aiMarker.includes(normalizedMarker)
  }) || null
}

function flagStatusClass(status) {
  if (status === 'low') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  if (status === 'high') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  return 'border-slate-200 bg-slate-100 text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]'
}

function flagStatusLabel(status) {
  if (status === 'low') return 'Low'
  if (status === 'high') return 'High'
  return 'Normal'
}

function statusClass(status) {
  if (status === 'Critical') return 'rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  if (status === 'Low' || status === 'High') return 'rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  return 'text-slate-400 dark:text-[#606070]'
}

function statusLabel(status) {
  if (status === 'Low') return 'Low'
  if (status === 'High') return 'High'
  if (status === 'Critical') return 'Critical'
  return 'Normal'
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 4v4" />
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M8 16h8" />
    </svg>
  )
}

function resolveAnalysisType(testName) {
  const normalized = String(testName || '').toLowerCase()

  const isBloodPanel = [
    'blood',
    'cbc',
    'lipid',
    'hba1c',
    'cholesterol',
    'hemoglobin',
  ].some((token) => normalized.includes(token))

  if (isBloodPanel) return 'blood'

  const isEcg = ['ecg', 'electrocardiogram'].some((token) => normalized.includes(token))
  if (isEcg) return 'ecg'

  const isImaging = ['x-ray', 'ct', 'mri', 'imaging', 'scan', 'ultrasound'].some((token) => normalized.includes(token))
  if (isImaging) return 'imaging'

  return 'default'
}

function resolveAnalysisData(testName) {
  const normalized = String(testName || '').toLowerCase()

  if (normalized.includes('lipid')) return AI_LAB_ANALYSIS.lipid
  if (normalized.includes('cbc') || normalized.includes('blood')) return AI_LAB_ANALYSIS.cbc
  if (normalized.includes('ecg')) return AI_LAB_ANALYSIS.ecg
  if (['x-ray', 'ct', 'mri', 'imaging', 'scan', 'ultrasound'].some((token) => normalized.includes(token))) {
    return AI_LAB_ANALYSIS.imaging
  }

  return AI_LAB_ANALYSIS.default
}

function analysisStatusClass(status) {
  if (status === 'normal') return 'la-status la-status--normal'
  if (status === 'borderline') return 'la-status la-status--borderline'
  return 'la-status la-status--abnormal'
}

function analysisStatusLabel(status) {
  if (status === 'normal') return 'Normal'
  if (status === 'borderline') return 'Borderline'
  return 'Abnormal'
}

export default function LabResultDetailView({ setCurrentView, selectedLab }) {
  const lab = selectedLab || DEFAULT_LAB
  const isNew = lab.status === 'New'

  // Prefer real API data over static mock — static is only a fallback when API has nothing
  const hasRealAiData = !!(lab?.published_text || lab?.ai_draft_text || lab?.aiSummary)
  const staticAiData = !hasRealAiData && lab?.aiKey ? LAB_AI_ANALYSIS[lab.aiKey] : null

  const resolveRiskLevel = (confidence) => {
    if (confidence == null) return 'moderate'
    if (confidence >= 0.8) return 'low'
    if (confidence >= 0.5) return 'moderate'
    return 'high'
  }

  // Build flags from published_findings / ai_visual_findings if available
  const resolveRealFlags = () => {
    const raw = lab?.published_findings || lab?.ai_visual_findings
    const parsed = typeof raw === 'string'
      ? (() => { try { return JSON.parse(raw) } catch { return [] } })()
      : raw
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(f => f.flag && f.flag !== 'normal' && f.flag !== 'N')
      .map(f => {
        const unitSuffix = f.unit ? ` ${f.unit}` : ''
        const displayValue = f.value ? `${f.value}${unitSuffix}` : (f.severity || '-')
        const hasRef = f.reference_low === undefined
        const aiNote = hasRef
          ? (f.region || f.location || '')
          : `Ref: ${f.reference_low}–${f.reference_high} ${f.unit || ''}`.trim()
        return {
          marker: f.name || f.finding || 'Finding',
          value: displayValue,
          status: (f.flag === 'H' || f.flag === 'high') ? 'high' : 'low',
          aiNote,
        }
      })
  }

  const aiData = staticAiData || (hasRealAiData ? {
    riskLevel: resolveRiskLevel(lab.ai_confidence),
    confidence: lab.ai_confidence == null ? null : Math.round(lab.ai_confidence * 100),
    modelName: 'HealthAI',
    modelType: 'Clinical Analysis',
    dataset: 'EMR Pipeline',
    flags: resolveRealFlags(),
    recommendation: lab.aiSummary || lab.ai_draft_text || '',
    disclaimer: 'This AI analysis is intended to assist clinical review and should not replace professional medical judgment.',
  } : null)

  const analysisType = resolveAnalysisType(lab.name)
  const aiLabAnalysis = resolveAnalysisData(lab.name)

  const [lcQuestion, setLcQuestion] = useState('')
  const [lcLines, setLcLines] = useState([])
  const [lcLoading, setLcLoading] = useState(false)
  const lcAbortRef = useRef(null)
  const lcSessionRef = useRef(null)  // persists session_id across turns
  const lcInputRef = useRef(null)

  const handleLabChat = async () => {
    const q = lcQuestion.trim()
    if (!q || lcLoading) return
    setLcLoading(true)
    setLcLines([])
    lcAbortRef.current?.abort()
    const ctrl = new AbortController()
    lcAbortRef.current = ctrl
    let buf = ''
    try {
      const response = await labChat(
        {
          question: q,
          patientId: lab?.patient_id || undefined,
          sessionId: lcSessionRef.current || undefined,  // continue existing session
        },
        ctrl.signal
      )
      streamSSE(response, {
        onEvent: (name, data) => {
          // Capture session_id on first call to persist conversation history
          if (name === 'session_id') lcSessionRef.current = data.trim()
        },
        onChunk: (chunk) => { buf += chunk; setLcLines(buf.split('\n')) },
        onDone: () => setLcLoading(false),
        onError: () => { if (!ctrl.signal.aborted) setLcLoading(false) },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setLcLines([err?.message || 'Failed to get AI answer.'])
        setLcLoading(false)
      }
    }
  }

  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const isMockResult = !lab.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(lab.id))

  const handleDownloadPDF = async () => {
    if (pdfLoading) return
    setPdfError('')
    if (isMockResult) {
      setPdfError('PDF is not available for this sample result.')
      return
    }
    setPdfLoading(true)
    try {
      await emrApi.downloadLabResultPDF(lab.id)
    } catch (err) {
      setPdfError(err?.message || 'Failed to download PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button type="button" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-[#9898b0] dark:hover:text-[#eeeef5]" onClick={() => setCurrentView('lab-results')}>
        <IconArrowLeft size={15} />
        Back to Lab Results
      </button>

      <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">{lab.name}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-[#606070]">
        <span>Ordered by {lab.doctor}</span>
        <span>·</span>
        <span>{lab.date}</span>
        <span>·</span>
        <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${isNew ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300' : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]'}`}>{lab.status}</span>
      </div>

      {aiData && (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80" aria-labelledby="lrd-ai-heading">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
                <span className="text-indigo-600 dark:text-indigo-400"><IconSparkle size={14} /></span>
              </span>

              <div>
                <h2 id="lrd-ai-heading" className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">AI Clinical Analysis</h2>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#606070]">{aiData.modelName} · {aiData.modelType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/70 dark:text-indigo-400">Beta</span>
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]">{aiData.dataset}</span>
            </div>
          </div>

          <div className="px-6 py-4">
            <AiRiskBadge
              riskLevel={aiData.riskLevel}
              confidence={aiData.confidence}
            />
          </div>

          <div className="px-6 pb-4">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{lab.explanation}</p>
          </div>

          {aiData.flags.length > 0 && (
            <div className="px-6 pb-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Flagged by AI</p>

              <div className="flex flex-col gap-2">
                {aiData.flags.map((flag) => (
                  <div key={`${flag.marker}-${flag.value}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{flag.marker}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{flag.value}</p>
                    </div>

                    <div className="ml-auto flex items-start gap-2">
                      <div>
                        <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${flagStatusClass(flag.status)}`}>
                          {flagStatusLabel(flag.status)}
                        </span>
                        <p className="mt-1 max-w-[200px] text-right text-[11px] italic text-slate-400 dark:text-[#606070]">{flag.aiNote}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Recommendation</p>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/40 dark:bg-indigo-950/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400"><LightbulbIcon /></span>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{aiData.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 pb-5 pt-3 dark:border-[#1c1c25]">
            <AiDisclaimer
              text={aiData.disclaimer}
              modelName={aiData.modelName}
              dataset={aiData.dataset}
              analyzedAt={aiData.confidence == null ? undefined : `Confidence ${aiData.confidence}%`}
            />
          </div>
        </section>
      )}

      <section className="mt-8" aria-labelledby="lrd-details-label">
        <p id="lrd-details-label" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Detailed Results</p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#252530]">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-[#16161e]">
              <tr className="border-b border-slate-200 dark:border-[#252530]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Test</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Your Value</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Normal Range</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">AI Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
              {lab.details.map((row) => {
                const rowFlag = findAiFlag(aiData?.flags || [], row.test)

                return (
                  <tr key={row.test} className="bg-white hover:bg-slate-50 dark:bg-[#111118] dark:hover:bg-[#16161e]">
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-[#9898b0]">{row.test}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-[#9898b0]">{row.yourValue}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-[#9898b0]">{row.normalRange}</td>
                    <td className="px-4 py-4 text-sm"><span className={statusClass(row.status)}>{statusLabel(row.status)}</span></td>
                    <td className="px-4 py-4 text-sm">
                      {rowFlag ? (
                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                          rowFlag.severity === 'significant'
                            ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          <AlertTriangleIcon className="h-3 w-3" />
                          {rowFlag.severity === 'significant' ? 'Flagged' : 'Watch'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <CheckIcon className="h-3 w-3" />
                          Clear
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="la-section" aria-labelledby="la-heading">
        <div className="la-header">
          <div className="la-title-wrap">
            <span className="la-icon">
              <BotIcon />
            </span>
            <h2 id="la-heading" className="la-title">AI Analysis</h2>
          </div>
          <span className="la-model-badge">{aiLabAnalysis.modelType}</span>
        </div>

        {analysisType === 'blood' && aiLabAnalysis.findings && (
          <article className="la-card">
            <p className="la-card-title">Blood Panel Insights</p>
            <div className="la-table-wrap">
              <table className="la-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Reference Range</th>
                    <th>Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {aiLabAnalysis.findings.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                      <td>{item.range}</td>
                      <td>
                        <span className={analysisStatusClass(item.status)}>{analysisStatusLabel(item.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="la-summary">{aiLabAnalysis.summary}</p>
          </article>
        )}

        {(analysisType === 'ecg' || analysisType === 'imaging') && (
          <article className="la-card">
            <p className="la-card-title">AI Pattern Interpretation</p>
            <p className="la-summary">{aiLabAnalysis.description}</p>

            <div className="la-confidence-row">
              <span className="la-confidence-label">Confidence</span>
              <span className="la-confidence-value">{aiLabAnalysis.confidence}%</span>
            </div>
            <div className="la-confidence-track" aria-hidden="true">
              <span className="la-confidence-fill" style={{ width: `${aiLabAnalysis.confidence}%` }} />
            </div>

            <p className="la-summary">{aiLabAnalysis.summary}</p>
          </article>
        )}

        {analysisType === 'default' && (
          <article className="la-card">
            <p className="la-card-title">AI Summary</p>
            <p className="la-summary">{aiLabAnalysis.summary}</p>
          </article>
        )}

        <div className="la-disclaimer">
          <AiDisclaimer
            text="AI analysis is for reference only and does not replace a physician diagnosis."
            modelName={aiLabAnalysis.modelType}
            dataset={analysisType === 'blood' ? 'Structured Lab Panel' : 'Signals & Clinical Notes'}
            analyzedAt={`Confidence ${aiLabAnalysis.confidence}%`}
          />
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
            <span className="text-indigo-600 dark:text-indigo-400"><IconSparkle size={14} /></span>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Ask AI about this result</h2>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#606070]">Lab Q&A · plain-language explanations</p>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={lcQuestion}
              onChange={(e) => setLcQuestion(e.target.value)}
              ref={lcInputRef}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLabChat() }}
              placeholder="e.g. What does my WBC result mean?"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-700"
            />
            <button
              type="button"
              onClick={handleLabChat}
              disabled={!lcQuestion.trim() || lcLoading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {lcLoading ? (
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              ) : 'Ask'}
            </button>
          </div>
          {lcLines.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <AiMessageContent text={lcLines.join('\n')} />
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={pdfLoading || isMockResult}
          className="rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            {pdfLoading ? (
              <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
            ) : (
              <DownloadIcon />
            )}
            Download PDF
          </span>
        </button>

        {pdfError && (
          <p className="w-full text-xs text-rose-500 dark:text-rose-400">{pdfError}</p>
        )}

        <button
          type="button"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          onClick={() => { lcInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); lcInputRef.current?.focus() }}
        >
          <span className="inline-flex items-center gap-2"><IconSparkle size={12} />Discuss with AI →</span>
        </button>
      </div>
    </div>
  )
}

LabResultDetailView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  selectedLab: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    aiKey: PropTypes.string,
    name: PropTypes.string,
    status: PropTypes.string,
    doctor: PropTypes.string,
    date: PropTypes.string,
    explanation: PropTypes.string,
    details: PropTypes.arrayOf(PropTypes.shape({
      test: PropTypes.string,
      yourValue: PropTypes.string,
      normalRange: PropTypes.string,
      status: PropTypes.string,
    })),
  }),
}
