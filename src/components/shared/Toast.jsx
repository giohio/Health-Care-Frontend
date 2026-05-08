import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

/**
 * Shared Toast notification component.
 * Animates in/out, auto-dismisses after 4s.
 *
 * @param {object} props
 * @param {string} props.message
 * @param {'success'|'error'|'info'|'warning'} [props.type='success']
 * @param {Function} props.onDismiss
 * @param {number} [props.duration=4000] - auto-dismiss ms
 */
export function Toast({ message, type = 'success', onDismiss, duration = 4000 }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const exitId = setTimeout(() => setIsExiting(true), duration - 250)
    const closeId = setTimeout(onDismiss, duration)
    return () => {
      clearTimeout(exitId)
      clearTimeout(closeId)
    }
  }, [onDismiss, duration])

  const config = {
    success: {
      bg: 'dark:bg-[#eeeef5]/95 bg-[#0f0f18]/90',
      text: 'dark:text-[#0c0c13] text-white',
      border: 'dark:border-white/20 border-[#252530]',
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      iconText: 'text-emerald-400 dark:text-emerald-600',
    },
    error: {
      bg: 'dark:bg-[#eeeef5]/95 bg-[#0f0f18]/90',
      text: 'dark:text-[#0c0c13] text-white',
      border: 'dark:border-white/20 border-[#252530]',
      iconBg: 'bg-rose-500/15 dark:bg-rose-500/20',
      iconText: 'text-rose-400 dark:text-rose-600',
    },
    info: {
      bg: 'dark:bg-[#eeeef5]/95 bg-[#0f0f18]/90',
      text: 'dark:text-[#0c0c13] text-white',
      border: 'dark:border-white/20 border-[#252530]',
      iconBg: 'bg-indigo-500/15 dark:bg-indigo-500/20',
      iconText: 'text-indigo-400 dark:text-indigo-600',
    },
    warning: {
      bg: 'dark:bg-[#eeeef5]/95 bg-[#0f0f18]/90',
      text: 'dark:text-[#0c0c13] text-white',
      border: 'dark:border-white/20 border-[#252530]',
      iconBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      iconText: 'text-amber-400 dark:text-amber-600',
    },
  }[type]

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border px-5 py-3 backdrop-blur-xl transition-all duration-200',
        config.bg,
        config.text,
        config.border,
        isExiting ? 'translate-y-2 opacity-0' : 'opacity-100',
      ].join(' ')}
    >
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${config.iconBg} ${config.iconText}`} aria-hidden="true">
        <IconCheck />
      </span>
      <span>{message}</span>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  onDismiss: PropTypes.func.isRequired,
  duration: PropTypes.number,
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
