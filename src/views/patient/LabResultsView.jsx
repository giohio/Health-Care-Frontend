import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { IconSparkle } from '../../icons'

const LAB_RESULTS = [
  {
    id: 1,
    name: 'Full Blood Panel',
    status: 'New',
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
    id: 2,
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
    id: 3,
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
    id: 4,
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

function filteredResults(filter) {
  if (filter === 'new') return LAB_RESULTS.filter((result) => result.status === 'New')
  if (filter === 'reviewed') return LAB_RESULTS.filter((result) => result.status === 'Reviewed')
  return LAB_RESULTS
}

function dotsByFlags(flags) {
  if (flags === 2) return ['bg-rose-400', 'bg-rose-400', 'bg-slate-200 dark:bg-[#252530]']
  if (flags === 1) return ['bg-amber-400', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
  return ['bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]', 'bg-slate-200 dark:bg-[#252530]']
}

export default function LabResultsView({ setCurrentView, setSelectedLab }) {
  const [filter, setFilter] = useState('all')

  const visibleResults = useMemo(() => filteredResults(filter), [filter])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Lab Results</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your test results, explained in plain language by AI.</p>

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

      <div className="space-y-4">
        {visibleResults.map((lab) => {
          const dots = dotsByFlags(lab.flags)
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

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]">
                  <span className="text-indigo-400 dark:text-indigo-500"><IconSparkle size={12} /></span>
                  <span>{lab.aiSummary}</span>
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
    </div>
  )
}

LabResultsView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  setSelectedLab: PropTypes.func.isRequired,
}
