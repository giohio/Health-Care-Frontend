import PropTypes from 'prop-types'
import { IconCalendarCheck } from '../../icons'

export default function RescheduleConfirmedView({ setCurrentView }) {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className="ring-pulse relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/60">
        <div className="absolute inset-2 rounded-full bg-indigo-100 dark:bg-indigo-950/70" />
        <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_8px_25px_rgba(99,102,241,0.4)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.3)]">
          <IconCalendarCheck size={22} />
        </div>
      </div>

      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Appointment Rescheduled.</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">Dr. Sarah Chen · Sat, Mar 22 · 11:00 AM</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">A confirmation has been saved to your appointments.</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          id="rc-view-appointments-btn"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          onClick={() => setCurrentView('appointments')}
        >
          View My Appointments
        </button>
        <button
          id="rc-dashboard-btn"
          className="rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]"
          onClick={() => setCurrentView('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

RescheduleConfirmedView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
}
