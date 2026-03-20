import PropTypes from 'prop-types'
import { IconCheck } from '../../icons'

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function BookingConfirmedView({ setCurrentView, booking }) {
  const status = booking?.status || 'pending'
  const isPending = status === 'pending'
  const isConfirmed = status === 'confirmed'
  const isCancelled = status === 'cancelled'

  let title = 'Awaiting confirmation'
  if (isCancelled) title = 'Appointment Unavailable'
  if (isConfirmed) title = 'Appointment Confirmed'

  const subtitle = booking
    ? `${booking.doctorName} · ${booking.dayLabel}, ${booking.dateLabel} · ${booking.timeLabel}`
    : 'We are preparing your appointment details.'

  let ringClass = 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40'
  if (isCancelled) ringClass = 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40'
  if (isConfirmed) ringClass = 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/60'

  let innerClass = 'bg-amber-100 dark:bg-amber-950/50'
  if (isCancelled) innerClass = 'bg-rose-100 dark:bg-rose-950/50'
  if (isConfirmed) innerClass = 'bg-indigo-100 dark:bg-indigo-950/70'

  let iconWrapClass = 'bg-amber-500'
  if (isCancelled) iconWrapClass = 'bg-rose-600'
  if (isConfirmed) {
    iconWrapClass = 'bg-indigo-600 ring-pulse shadow-[0_8px_25px_rgba(99,102,241,0.4)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.3)]'
  }

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className={`relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border ${ringClass}`}>
        <div className={`absolute inset-2 rounded-full ${innerClass}`} />

        <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full text-white ${iconWrapClass}`}>
          {isCancelled && <XIcon />}
          {isConfirmed && <IconCheck size={24} />}
          {isPending && <span className="inline-flex h-6 w-6"><ClockIcon /></span>}
        </div>
      </div>

      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">{subtitle}</p>

      {isPending && (
        <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">We sent your request to the clinic. You will be notified when a doctor confirms.</p>
      )}

      {isCancelled && (
        <p className="mt-3 text-sm font-medium text-rose-700 dark:text-rose-300">This time slot is no longer available. Please choose a new time.</p>
      )}

      <button
        id="bc-dashboard-btn"
        className="mt-8 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]"
        onClick={() => setCurrentView('dashboard')}
      >
        Back to Dashboard
      </button>

      {isCancelled && (
        <button
          type="button"
          className="ml-3 mt-8 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          onClick={() => setCurrentView('booking-wizard')}
        >
          Book Again
        </button>
      )}
    </div>
  )
}

BookingConfirmedView.propTypes = {
  booking: PropTypes.shape({
    dateLabel: PropTypes.string,
    dayLabel: PropTypes.string,
    doctorName: PropTypes.string,
    status: PropTypes.string,
    timeLabel: PropTypes.string,
  }),
  setCurrentView: PropTypes.func.isRequired,
}

BookingConfirmedView.defaultProps = {
  booking: null,
}
