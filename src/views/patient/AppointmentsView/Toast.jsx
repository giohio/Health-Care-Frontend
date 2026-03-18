import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Toast({ message, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const exitId = setTimeout(() => setIsExiting(true), 3750)
    const closeId = setTimeout(onDismiss, 4000)
    return () => {
      clearTimeout(exitId)
      clearTimeout(closeId)
    }
  }, [onDismiss])

  return (
    <div className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-[#252530] bg-[#0f0f18]/90 px-5 py-3 text-sm text-white backdrop-blur-xl transition-all duration-200 dark:border-white/20 dark:bg-[#eeeef5]/95 dark:text-[#0c0c13] ${isExiting ? 'translate-y-2 opacity-0' : 'opacity-100'}`} role="status" aria-live="polite">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-600" aria-hidden="true">
        <span className="inline-flex h-4 w-4"><CheckIcon /></span>
      </span>
      <span>{message}</span>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
}
