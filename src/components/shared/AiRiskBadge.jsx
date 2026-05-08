import PropTypes from 'prop-types'
import { getRiskConfig } from '../../data/aiAnalysis'

function SparklesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}

SparklesIcon.propTypes = {
  className: PropTypes.string,
}

SparklesIcon.defaultProps = {
  className: '',
}

export default function AiRiskBadge({ riskLevel, confidence, compact }) {
  const safeConfidence = Math.max(0, Math.min(100, confidence))
  const riskConfig = getRiskConfig(riskLevel)

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${riskConfig.bg} ${riskConfig.border} ${riskConfig.text}`}>
        <SparklesIcon className="h-3 w-3" />
        <span>{riskConfig.label}</span>
        <span className="opacity-30">·</span>
        <span>{safeConfidence}%</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${riskConfig.bg} ${riskConfig.border}`}>
      <div className="flex items-center gap-3">
        <SparklesIcon className={`h-4 w-4 ${riskConfig.text}`} />
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${riskConfig.text}`}>AI Risk Assessment</p>
          <p className={`mt-0.5 text-sm font-bold ${riskConfig.text}`}>{riskConfig.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-1">
          <p className={`text-[11px] ${riskConfig.text}`}>{safeConfidence}% confidence</p>
          <div className="h-1.5 w-24 rounded-full bg-white/40 dark:bg-black/20">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${safeConfidence}%`, background: riskConfig.barColor }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

AiRiskBadge.propTypes = {
  riskLevel: PropTypes.oneOf(['high', 'moderate', 'low']).isRequired,
  confidence: PropTypes.number.isRequired,
  compact: PropTypes.bool,
}

AiRiskBadge.defaultProps = {
  compact: false,
}