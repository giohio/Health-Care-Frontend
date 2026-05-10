import PropTypes from 'prop-types'

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

const RESULT_MAP = {
  success: {
    icon: CheckCircleIcon,
    iconColor: 'text-emerald-500',
    bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
    border: 'border-emerald-200 dark:border-emerald-900/40',
    title: 'Payment Successful!',
    message: 'Your appointment has been confirmed and payment received.',
    primaryLabel: 'View Appointments',
    primaryAction: 'onViewAppointments',
    showRetry: false,
  },
  failed: {
    icon: XCircleIcon,
    iconColor: 'text-rose-500',
    bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20',
    border: 'border-rose-200 dark:border-rose-900/40',
    title: 'Payment Failed',
    message: 'We could not process your payment. Please try again or contact support.',
    primaryLabel: 'Try Again',
    primaryAction: 'onRetry',
    showRetry: false,
  },
  pending: {
    icon: IconClock,
    iconColor: 'text-amber-500',
    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    title: 'Payment Pending',
    message: "Your payment is being processed. We'll notify you once it's confirmed.",
    primaryLabel: 'View Appointments',
    primaryAction: 'onViewAppointments',
    showRetry: false,
  },
}

export default function PaymentReturnView({ status, onViewAppointments, onRetry }) {
  const result = RESULT_MAP[status] ?? RESULT_MAP.pending
  const Icon = result.icon
  let statusBadgeLabel = 'Processing'
  if (status === 'success') statusBadgeLabel = 'Payment Completed'
  if (status === 'failed') statusBadgeLabel = 'Payment Failed'

  return (
    <div className="mx-auto max-w-xl px-2 sm:px-0">
      <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 ${result.bg} ${result.border}`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/25 blur-2xl dark:bg-white/5" />

        <div className="relative flex flex-col items-center gap-4 text-center">
          <span className={`inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-white/85 shadow-sm dark:border-white/10 dark:bg-black/20 ${result.iconColor}`}>
            <span className="inline-flex h-10 w-10"><Icon /></span>
          </span>

          <div className="space-y-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${result.border} ${result.iconColor} bg-white/70 dark:bg-black/25`}>
              {statusBadgeLabel}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">{result.title}</h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 dark:text-[#a4a4bb]">{result.message}</p>
          </div>

          <div className="mt-1 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={result.primaryAction === 'onRetry' ? onRetry : onViewAppointments}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_8px_20px_rgba(79,70,229,0.35)] active:scale-[0.99] dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {result.primaryLabel}
            </button>

            {status === 'failed' && (
              <button
                type="button"
                onClick={onViewAppointments}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-white/60 transition-all duration-150 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-black/20"
              >
                View Appointments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

PaymentReturnView.propTypes = {
  status: PropTypes.oneOf(['success', 'failed', 'pending']),
  onViewAppointments: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
}

PaymentReturnView.defaultProps = {
  status: 'pending',
}
