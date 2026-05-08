import PropTypes from 'prop-types'

/**
 * Consistent loading spinner.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label] - accessible label (aria-label)
 * @param {string} [props.className]
 */
export function LoadingSpinner({ size = 'md', label = 'Loading…', className = '' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size]

  return (
    <output
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className={`${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent opacity-75`}
        style={{ borderColor: 'inherit', borderTopColor: 'transparent' }}
      />
    </output>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  className: PropTypes.string,
}

/**
 * Full-page loading overlay with optional message.
 */
export function LoadingOverlay({ message = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-20 ${className}`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
      {message && (
        <p className="text-sm text-slate-500 dark:text-[#9898b0]">{message}</p>
      )}
    </div>
  )
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
}

/**
 * Inline skeleton shimmer block.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {'sm'|'md'|'lg'} [props.height='md'] - preset heights
 */
export function SkeletonBlock({ className = '', height = 'md' }) {
  const heightClass = { sm: 'h-4', md: 'h-6', lg: 'h-10' }[height]
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-[#252535] ${heightClass} ${className}`}
      aria-hidden="true"
    />
  )
}

SkeletonBlock.propTypes = {
  className: PropTypes.string,
  height: PropTypes.oneOf(['sm', 'md', 'lg']),
}
