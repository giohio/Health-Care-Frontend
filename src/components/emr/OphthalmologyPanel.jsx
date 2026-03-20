import PropTypes from 'prop-types'
import AiDisclaimer from '../shared/AiDisclaimer'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function resultBadge(drGrade, confidence) {
  if (drGrade === 4) {
    return {
      className: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      label: `Proliferative DR · ${confidence}%`,
    }
  }

  if (drGrade === 3) {
    return {
      className: 'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
      label: `Severe DR · ${confidence}%`,
    }
  }

  if (drGrade === 2) {
    return {
      className: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
      label: `Moderate DR · ${confidence}%`,
    }
  }

  if (drGrade === 1) {
    return {
      className: 'border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300',
      label: `Mild DR · ${confidence}%`,
    }
  }

  return {
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400',
    label: `No Diabetic Retinopathy · ${confidence}%`,
  }
}

function gradeColorClasses(grade) {
  const map = {
    0: {
      active: 'bg-emerald-500 text-emerald-700 dark:text-emerald-400',
      line: 'bg-emerald-500',
    },
    1: {
      active: 'bg-teal-500 text-teal-700 dark:text-teal-300',
      line: 'bg-teal-500',
    },
    2: {
      active: 'bg-amber-400 text-amber-700 dark:text-amber-300',
      line: 'bg-amber-400',
    },
    3: {
      active: 'bg-orange-500 text-orange-700 dark:text-orange-300',
      line: 'bg-orange-500',
    },
    4: {
      active: 'bg-rose-500 text-rose-700 dark:text-rose-300',
      line: 'bg-rose-500',
    },
  }
  return map[grade] || map[0]
}

function gradeLabelClass(active, gradeColor) {
  if (!active) return 'text-slate-400 dark:text-[#606070]'
  return `font-semibold ${gradeColor.active.split(' ').slice(1).join(' ')}`
}

export default function OphthalmologyPanel({ data }) {
  const badge = resultBadge(data.drGrade, data.confidence)
  const grades = [0, 1, 2, 3, 4]

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <span className="inline-flex h-5 w-5"><EyeIcon /></span>
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Retinal Scan Analysis</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Ordered by {data.orderedBy} · {data.analyzedAt}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex h-56 items-center justify-center bg-[#0d0a1f]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-950/30 text-violet-800/50">
              <span className="inline-flex h-8 w-8"><EyeIcon /></span>
            </span>
            <p className="text-sm text-slate-500 dark:text-[#70708a]">Retinal fundus image not available</p>
            <p className="text-xs text-slate-600 dark:text-[#404050]">Connect to fundus camera system</p>
          </div>
        </div>
      </article>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Diabetic Retinopathy Grade</p>

        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="flex w-full items-center">
            {grades.map((grade) => {
              const active = grade === data.drGrade
              const passed = grade < data.drGrade
              const gradeColor = gradeColorClasses(grade)
              const label = data.gradeLabels.find((item) => item.grade === grade)?.label || `Grade ${grade}`

              return (
                <div key={grade} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    {active ? (
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${gradeColor.active.split(' ')[0]}`}>
                        {grade}
                      </span>
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-xs font-medium text-slate-400 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#606070]">
                        {grade}
                      </span>
                    )}

                    <p className={`mt-2 text-center text-[10px] ${gradeLabelClass(active, gradeColor)}`}>
                      {label}
                    </p>
                  </div>

                  {grade < grades.length - 1 && (
                    <span className={`mb-5 h-0.5 flex-1 ${passed ? gradeColor.line : 'bg-slate-200 dark:bg-[#252530]'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-[#1c1c25]">
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">
              Current Grade: {data.drGrade} — {data.gradeLabels[data.drGrade]?.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Grading: {data.gradingScale}</p>
          </div>
        </article>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Feature Detection</p>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-[#252530] dark:bg-[#16161e]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Feature</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Detected</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Note</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {data.findings.map((finding) => (
              <div key={finding.feature} className="grid grid-cols-3 items-start gap-4 px-5 py-3.5">
                <p className="text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{finding.feature}</p>
                {finding.present ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex h-3.5 w-3.5"><InfoIcon /></span>
                    <span>Present</span>
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex h-3.5 w-3.5"><CheckIcon /></span>
                    <span>Not detected</span>
                  </p>
                )}
                <p className="text-xs leading-relaxed text-slate-500 dark:text-[#70708a]">{finding.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-950/40">
          <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-violet-600 dark:text-violet-400">
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

OphthalmologyPanel.propTypes = {
  data: PropTypes.shape({
    orderedBy: PropTypes.string.isRequired,
    analyzedAt: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    drGrade: PropTypes.number.isRequired,
    gradingScale: PropTypes.string.isRequired,
    gradeLabels: PropTypes.arrayOf(PropTypes.shape({
      grade: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })).isRequired,
    findings: PropTypes.arrayOf(PropTypes.shape({
      feature: PropTypes.string.isRequired,
      present: PropTypes.bool.isRequired,
      note: PropTypes.string.isRequired,
    })).isRequired,
    aiSummary: PropTypes.string.isRequired,
    disclaimer: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
  }).isRequired,
}
