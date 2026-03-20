import PropTypes from 'prop-types'
import AiDisclaimer from '../shared/AiDisclaimer'

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7V6a2 2 0 0 1 2-2h1" />
      <path d="M20 7V6a2 2 0 0 0-2-2h-1" />
      <path d="M4 17v1a2 2 0 0 0 2 2h1" />
      <path d="M20 17v1a2 2 0 0 1-2 2h-1" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}

function ImageOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.5 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.5" />
      <path d="m3 3 18 18" />
      <path d="m10 10 1.5 1.5L14 9l4 4" />
      <circle cx="9" cy="9" r="1" />
    </svg>
  )
}

function ZoomInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function RotateCcwIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v6h6" />
      <path d="M3.4 8A9 9 0 1 0 6 4.3" />
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

function getResultBadge(result, confidence) {
  if (result === 'pneumonia') {
    return {
      className: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      dotClass: 'bg-rose-500 dark:bg-rose-400',
      label: `Pneumonia Detected · ${confidence}% confidence`,
    }
  }

  if (result === 'inconclusive') {
    return {
      className: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
      dotClass: 'bg-amber-500 dark:bg-amber-400',
      label: `Inconclusive · ${confidence}% confidence`,
    }
  }

  return {
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
    label: `Normal · ${confidence}% confidence`,
  }
}

function getFindingBadge(status) {
  if (status === 'abnormal') {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  }

  if (status === 'watch') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }

  return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400'
}

function findingLabel(status) {
  if (status === 'abnormal') return 'Abnormal'
  if (status === 'watch') return 'Watch'
  return 'Normal'
}

export default function RadiologyPanel({ data }) {
  const resultBadge = getResultBadge(data.result, data.confidence)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <span className="inline-flex h-5 w-5"><ScanIcon /></span>
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Chest X-Ray Analysis</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Ordered by {data.orderedBy} · {data.analyzedAt}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${resultBadge.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${resultBadge.dotClass}`} />
          {resultBadge.label}
        </span>
      </header>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="relative flex h-64 items-center justify-center bg-slate-900 dark:bg-[#0a0a0f]">
          {data.imageUrl ? (
            <img src={data.imageUrl} className="h-full w-full object-contain" alt="Chest X-Ray" />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-600 dark:bg-[#1c1c25] dark:text-[#404050]">
                <span className="inline-flex h-8 w-8"><ImageOffIcon /></span>
              </span>
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-[#70708a]">X-Ray image not available</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-[#404050]">Connect to PACS system to view imaging</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-800 px-4 py-2.5 dark:border-[#1c1c25] dark:bg-[#0c0c13]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700 dark:hover:bg-[#1c1c25]"
              aria-label="Zoom in"
            >
              <span className="inline-flex h-3.5 w-3.5"><ZoomInIcon /></span>
            </button>

            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700 dark:hover:bg-[#1c1c25]"
              aria-label="Zoom out"
            >
              <span className="inline-flex h-3.5 w-3.5"><ZoomOutIcon /></span>
            </button>

            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700 dark:hover:bg-[#1c1c25]"
              aria-label="Rotate image"
            >
              <span className="inline-flex h-3.5 w-3.5"><RotateCcwIcon /></span>
            </button>
          </div>

          <span className="ml-auto text-[10px] italic text-slate-600 dark:text-[#404050]">PACS Unavailable</span>
        </div>
      </article>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">AI Findings</p>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-[#252530] dark:bg-[#16161e]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Region</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Finding</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Note</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {data.findings.map((finding) => (
              <div key={finding.region} className="grid grid-cols-3 items-start gap-4 px-5 py-3.5">
                <p className="text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{finding.region}</p>
                <span className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-[11px] font-semibold ${getFindingBadge(finding.status)}`}>
                  {findingLabel(finding.status)}
                </span>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-[#70708a]">{finding.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">AI Interpretation</p>

        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 dark:border-teal-900/40 dark:bg-teal-950/40">
          <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400">
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

RadiologyPanel.propTypes = {
  data: PropTypes.shape({
    orderedBy: PropTypes.string.isRequired,
    analyzedAt: PropTypes.string.isRequired,
    result: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    findings: PropTypes.arrayOf(PropTypes.shape({
      region: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      note: PropTypes.string.isRequired,
    })).isRequired,
    aiSummary: PropTypes.string.isRequired,
    disclaimer: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
  }).isRequired,
}
