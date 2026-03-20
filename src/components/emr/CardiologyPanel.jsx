import PropTypes from 'prop-types'
import AiDisclaimer from '../shared/AiDisclaimer'

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 19 9 5 6 12 2 12" />
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

function getRhythmBadge(result, confidence) {
  if (result === 'afib') {
    return {
      className: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      dotClass: 'bg-rose-500 dark:bg-rose-400',
      label: `Atrial Fibrillation · ${confidence}% confidence`,
    }
  }

  if (result === 'svt') {
    return {
      className: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
      dotClass: 'bg-amber-500 dark:bg-amber-400',
      label: `SVT Pattern · ${confidence}% confidence`,
    }
  }

  return {
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
    label: `Normal Sinus Rhythm · ${confidence}% confidence`,
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

const ECG_PATH = [
  'M0,80 L20,80 Q30,70 40,80 L55,80 L60,90 L65,20 L70,88 L85,80 Q100,65 115,80 L150,80',
  'M150,80 L170,80 Q180,70 190,80 L205,80 L210,90 L215,20 L220,88 L235,80 Q250,65 265,80 L300,80',
  'M300,80 L320,80 Q330,70 340,80 L355,80 L360,90 L365,20 L370,88 L385,80 Q400,65 415,80 L450,80',
  'M450,80 L470,80 Q480,70 490,80 L505,80 L510,90 L515,20 L520,88 L535,80 Q550,65 565,80 L600,80',
].join(' ')

export default function CardiologyPanel({ data }) {
  const resultBadge = getRhythmBadge(data.result, data.confidence)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
            <span className="inline-flex h-5 w-5"><ActivityIcon /></span>
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">ECG Analysis</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Ordered by {data.orderedBy} · {data.analyzedAt}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${resultBadge.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${resultBadge.dotClass}`} />
          {resultBadge.label}
        </span>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center rounded-2xl border border-rose-100 bg-rose-50 px-8 py-5 dark:border-rose-900/40 dark:bg-rose-950/40">
            <p className="text-5xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{data.heartRate}</p>
            <p className="mt-1 text-sm font-medium text-rose-400 dark:text-rose-500">BPM</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">Heart Rate</p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Rhythm</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{data.rhythm}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">PR Interval</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{data.prInterval}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">QRS Duration</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{data.qrsDuration}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">QTc</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{data.qtcInterval}</p>
            </div>
          </div>
        </div>
      </article>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">ECG Waveform (Lead II)</p>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div
            className="relative h-40 bg-[#0a1628] px-4 py-3"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,100,100,0.1) 0, rgba(255,100,100,0.1) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,100,100,0.1) 0, rgba(255,100,100,0.1) 1px, transparent 1px, transparent 20px)',
            }}
          >
            <svg viewBox="0 0 600 120" className="h-full w-full" aria-hidden="true" preserveAspectRatio="none">
              <line x1="70" y1="8" x2="70" y2="112" stroke="rgba(248,113,113,0.4)" strokeDasharray="4 4" />
              <line x1="220" y1="8" x2="220" y2="112" stroke="rgba(248,113,113,0.4)" strokeDasharray="4 4" />
              <path
                d={ECG_PATH}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="62" y="16" fill="#fca5a5" fontSize="10">RR = 833ms</text>
            </svg>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
            <p className="text-[10px] font-mono text-slate-500">Lead II · 25mm/s · 10mm/mV</p>
            <p className="text-[10px] italic text-slate-600">Simulated — connect to ECG device</p>
          </div>
        </article>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">AI Findings</p>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-[#252530] dark:bg-[#16161e]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Parameter</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Value</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Status</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {data.findings.map((finding) => (
              <div key={finding.parameter} className="grid grid-cols-3 items-start gap-4 px-5 py-3.5">
                <p className="text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{finding.parameter}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">{finding.value}</p>
                <span className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-[11px] font-semibold ${getFindingBadge(finding.status)}`}>
                  {findingLabel(finding.status)}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">AI Interpretation</p>

        <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40">
          <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-rose-500 dark:text-rose-400">
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

CardiologyPanel.propTypes = {
  data: PropTypes.shape({
    orderedBy: PropTypes.string.isRequired,
    analyzedAt: PropTypes.string.isRequired,
    result: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    heartRate: PropTypes.number.isRequired,
    rhythm: PropTypes.string.isRequired,
    prInterval: PropTypes.string.isRequired,
    qrsDuration: PropTypes.string.isRequired,
    qtcInterval: PropTypes.string.isRequired,
    findings: PropTypes.arrayOf(PropTypes.shape({
      parameter: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })).isRequired,
    aiSummary: PropTypes.string.isRequired,
    disclaimer: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
  }).isRequired,
}
