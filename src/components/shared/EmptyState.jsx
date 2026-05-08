import PropTypes from 'prop-types'

/**
 * Reusable empty state component.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon]       - custom icon node
 * @param {string} [props.iconEmoji]          - emoji fallback (e.g. "📋")
 * @param {string} [props.title]              - primary message
 * @param {string} [props.description]        - secondary helper text
 * @param {string} [props.actionLabel]        - CTA button label
 * @param {Function} [props.onAction]         - CTA onClick handler
 * @param {string} [props.className]
 */
export function EmptyState({
  icon,
  iconEmoji,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center py-10 text-center ${className}`}>
      {/* Icon area */}
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
        {icon || (iconEmoji ? (
          <span className="text-2xl leading-none" aria-hidden="true">{iconEmoji}</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        ))}
      </div>

      <p className="mb-1 text-sm font-medium text-slate-600 dark:text-[#9898b0]">
        {title}
      </p>
      {description && (
        <p className="mb-4 max-w-xs text-xs text-slate-400 dark:text-[#606070]">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  iconEmoji: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
}
