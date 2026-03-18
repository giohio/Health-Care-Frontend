import PropTypes from 'prop-types'
import { IconCheck } from '../../icons'

export default function BookingConfirmedView({ setCurrentView }) {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className="ring-pulse relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/60">
        <div className="absolute inset-2 rounded-full bg-indigo-100 dark:bg-indigo-950/70" />
        <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_8px_25px_rgba(99,102,241,0.4)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.3)]">
          <IconCheck size={24} />
        </div>
      </div>
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">You&apos;re all set, Jane.</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">Dr. Sarah Chen · Wed, March 19 · 10:00 AM</p>
      <button
        id="bc-dashboard-btn"
        className="mt-8 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]"
        onClick={() => setCurrentView('dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  )
}

BookingConfirmedView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
}
