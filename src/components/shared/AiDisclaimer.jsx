import PropTypes from 'prop-types'

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function AiDisclaimer({ text, modelName, dataset, analyzedAt }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#252530] dark:bg-[#16161e]">
      <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-slate-400 dark:text-[#606070]">
        <AlertTriangleIcon />
      </span>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-[#70708a]">{text}</p>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 dark:text-[#505060]">
          <span>Model: {modelName}</span>
          <span>·</span>
          <span>Dataset: {dataset}</span>
          <span>·</span>
          <span>{analyzedAt}</span>
        </div>
      </div>
    </div>
  )
}

AiDisclaimer.propTypes = {
  text: PropTypes.string.isRequired,
  modelName: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  analyzedAt: PropTypes.string.isRequired,
}
