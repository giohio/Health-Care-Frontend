import PropTypes from 'prop-types'
import { IconArrowLeft, IconSparkle } from '../../icons'
import { LAB_AI_ANALYSIS } from '../../data/aiAnalysis'
import AiRiskBadge from '../../components/shared/AiRiskBadge'

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

export default function LabResultDetailView({ setCurrentView, selectedLab }) {
  const lab = selectedLab || DEFAULT_LAB
  const isNew = lab.status === 'New'
  const aiData = lab?.aiKey
    ? LAB_AI_ANALYSIS[lab.aiKey]
    : null

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
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-[#606070]" />
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-[#606070]">{aiData.disclaimer}</p>
            </div>
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

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]">
          <span className="inline-flex items-center gap-2"><DownloadIcon />Download PDF</span>
        </button>

        <button type="button" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]" onClick={() => setCurrentView('symptom-checker')}>
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
