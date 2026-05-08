import { useState } from 'react'
import PropTypes from 'prop-types'
import { generateTreatmentPlan } from '../../api/ai'

const URGENCY_CONFIG = {
  ROUTINE:   { label: 'Routine',   cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400' },
  URGENT:    { label: 'Urgent',    cls: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400' },
  EMERGENCY: { label: 'Emergency', cls: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-400' },
}

const CATEGORY_LABEL = {
  medication: 'Medication',
  lifestyle:  'Lifestyle',
  follow_up:  'Follow-up',
  referral:   'Referral',
}

const CATEGORY_COLOR = {
  medication: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
  lifestyle:  'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
  follow_up:  'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]',
  referral:   'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
    </svg>
  )
}

/**
 * TreatmentPlanPanel — shows AI-generated treatment plan for a lab result.
 *
 * Props:
 * - labSummary: string — the AI draft text / lab result summary to base the plan on
 * - patientId:  string — patient user id (for clinical context)
 * - symptoms:   string (optional) — presenting symptoms
 */
export default function TreatmentPlanPanel({ labSummary, patientId, symptoms }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (loading || !labSummary) return
    setLoading(true)
    setError(null)
    setPlan(null)
    try {
      const result = await generateTreatmentPlan({ labSummary, patientId, symptoms })
      setPlan(result)
    } catch (err) {
      setError(err?.message || 'Failed to generate treatment plan.')
    } finally {
      setLoading(false)
    }
  }

  const urgencyConfig = plan ? (URGENCY_CONFIG[plan.urgency] ?? URGENCY_CONFIG.ROUTINE) : null

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/50">
            <span className="h-4 w-4 text-teal-600 dark:text-teal-400"><SparkleIcon /></span>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">AI Treatment Plan</h2>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#606070]">HealthAI · Clinical Decision Support</p>
          </div>
        </div>
        <span className="rounded-lg border border-teal-200 bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:border-teal-800/50 dark:bg-teal-950/70 dark:text-teal-400">Beta</span>
      </div>

      <div className="px-6 py-5">
        {!plan && !loading && (
          <div className="text-center">
            <p className="mb-4 text-sm text-slate-500 dark:text-[#70708a]">
              Generate an evidence-based treatment plan from this lab result.
            </p>
            <button
              type="button"
              disabled={!labSummary || loading}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-700 dark:hover:bg-teal-600"
            >Generate Treatment Plan
            </button>
            {error && <p className="mt-3 text-sm text-rose-500 dark:text-rose-400">{error}</p>}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-teal-400 border-r-transparent" />
            <span className="text-sm text-slate-400 dark:text-[#7070a0]">Generating treatment plan…</span>
          </div>
        )}

        {plan && (
          <div className="space-y-5">
            {/* Summary + urgency */}
            <div className="flex flex-wrap items-start gap-3">
              <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{plan.summary}</p>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold ${urgencyConfig.cls}`}>
                  {urgencyConfig.label}
                </span>
                {plan.follow_up_days != null && (
                  <span className="text-[11px] text-slate-400 dark:text-[#606070]">
                    Follow-up in {plan.follow_up_days} {plan.follow_up_days === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {plan.recommendations?.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">
                  Recommendations
                </p>
                <div className="flex flex-col gap-2">
                  {plan.recommendations.map((rec, i) => (
                    <div
                      key={`${rec.category}-${rec.text?.slice(0, 10)}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]"
                    >
                      <span className={`mt-0.5 flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[rec.category] ?? CATEGORY_COLOR.follow_up}`}>
                        {CATEGORY_LABEL[rec.category] ?? rec.category}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-[#c8c8e0]">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            <div className="border-t border-slate-100 pt-4 dark:border-[#1c1c25]">
              <p className="mb-3 text-[11px] italic text-slate-400 dark:text-[#505060]">
                AI suggestions are for physician review only. Always apply clinical judgment.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400 disabled:opacity-50"
              >
                Regenerate Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

TreatmentPlanPanel.propTypes = {
  labSummary: PropTypes.string,
  patientId:  PropTypes.string,
  symptoms:   PropTypes.string,
}

TreatmentPlanPanel.defaultProps = {
  labSummary: '',
  patientId:  undefined,
  symptoms:   undefined,
}
