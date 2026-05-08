import PropTypes from 'prop-types'
import AiDisclaimer from '../shared/AiDisclaimer'

function ScanFaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M21 7V5a2 2 0 0 0-2-2h-2" />
      <path d="M3 17v2a2 2 0 0 0 2 2h2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
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

function headerResult(data) {
  const top = data.classProbabilities.find((item) => item.code === data.topPrediction)
  const highRisk = top?.riskLevel === 'high'

  if (highRisk) {
    return {
      className: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      label: 'Malignancy Risk',
    }
  }

  return {
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400',
    label: `Benign · ${data.confidence}%`,
  }
}

function progressClass(item, isTop) {
  if (isTop) return 'bg-indigo-500'
  if (item.riskLevel === 'high') return 'bg-rose-400'
  return 'bg-slate-300 dark:bg-[#404050]'
}

const ABCDE_ITEMS = [
  { code: 'A', label: 'Asymmetry', field: 'asymmetry' },
  { code: 'B', label: 'Border', field: 'border' },
  { code: 'C', label: 'Color', field: 'color' },
  { code: 'D', label: 'Diameter', field: 'diameter' },
  { code: 'E', label: 'Evolution', field: 'evolution' },
]

export default function DermatologyPanel({ data }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-[#70708a]">No dermatology data available</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-[#505060]">Order a dermoscopy study to view results here.</p>
      </div>
    )
  }
  const sorted = [...data.classProbabilities].sort((a, b) => b.probability - a.probability)
  const badge = headerResult(data)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
            <span className="inline-flex h-5 w-5"><ScanFaceIcon /></span>
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Dermoscopy Analysis</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{data.bodyLocation} · {data.analyzedAt}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex h-48 items-center justify-center bg-[#1a0a12]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-950/30 text-pink-900/50">
              <span className="inline-flex h-8 w-8"><ScanFaceIcon /></span>
            </span>
            <p className="text-sm text-slate-500 dark:text-[#70708a]">Dermoscopy image not available</p>
            <p className="text-xs text-slate-600 dark:text-[#404050]">Connect to dermoscope device</p>
          </div>
        </div>
      </article>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Classification Probabilities</p>
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          {sorted.map((item) => {
            const isTop = item.code === data.topPrediction
            const percent = `${(item.probability * 100).toFixed(0)}%`
            return (
              <div key={item.code} className="mb-4 flex flex-col gap-1 last:mb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">
                    {item.label}
                    {isTop && (
                      <span className="ml-2 text-[10px] text-indigo-500 dark:text-indigo-400">· Top match</span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{percent}</p>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${progressClass(item, isTop)}`}
                    style={{ width: percent }}
                  />
                </div>

                {item.riskLevel === 'high' && item.probability > 0.01 && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400">⚠ Monitor: {item.label}</p>
                )}
              </div>
            )
          })}
        </article>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">ABCDE Lesion Criteria</p>
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="grid grid-cols-5 gap-3">
            {ABCDE_ITEMS.map((item) => (
              <div key={item.code} className="flex flex-col items-center gap-1 text-center">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#c8c8e0]">
                  {item.code}
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">{item.label}</p>
                <p className="text-center text-xs font-medium leading-tight text-slate-800 dark:text-[#c8c8e0]">
                  {data.lesionMetrics[item.field]}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-start gap-3 rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 dark:border-pink-900/40 dark:bg-pink-950/40">
          <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-pink-600 dark:text-pink-400">
            <SparklesIcon />
          </span>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{data.aiSummary}</p>
        </div>
      </section>

      <AiDisclaimer
        text={data.disclaimer}
        modelName={data.modelName}
        dataset={data.dataset}
        analyzedAt={data.analyzedAt}
      />
    </div>
  )
}

DermatologyPanel.propTypes = {
  data: PropTypes.shape({
    analyzedAt: PropTypes.string.isRequired,
    bodyLocation: PropTypes.string.isRequired,
    topPrediction: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    classProbabilities: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      probability: PropTypes.number.isRequired,
      riskLevel: PropTypes.string.isRequired,
    })).isRequired,
    lesionMetrics: PropTypes.shape({
      asymmetry: PropTypes.string.isRequired,
      border: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      diameter: PropTypes.string.isRequired,
      evolution: PropTypes.string.isRequired,
    }).isRequired,
    aiSummary: PropTypes.string.isRequired,
    disclaimer: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
  }).isRequired,
}
