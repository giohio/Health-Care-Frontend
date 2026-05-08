import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { IconCheck, IconClock, IconX } from '../../icons'
import { paymentApi } from '../../api/payment'
import { NOTIFICATION_EVENT } from '../../constants/enums'

export default function BookingConfirmedView({ setCurrentView, booking, wsNotifications }) {
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [pollingMsg, setPollingMsg] = useState('Generating payment link...')

  // Poll payment URL after booking
  useEffect(() => {
    if (!booking?.id) return
    let cancelled = false

    async function pollPaymentUrl() {
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => globalThis.setTimeout(r, 2000))
        if (cancelled) return
        try {
          const payment = await paymentApi.initiatePayment(booking.id)
          const url = payment?.payment_url ?? payment?.url ?? payment?.data?.payment_url ?? payment?.data?.url
          if (url) {
            setPaymentUrl(url)
            return
          }
        } catch (err) {
          // 404 = payment record not yet created by backend; keep polling
          // 409 = already paid/failed; stop
          if (err?.status !== 404) return
        }
      }
      if (!cancelled) setPollingMsg('Please try again later')
    }

    pollPaymentUrl()
    return () => { cancelled = true }
  }, [booking?.id])

  // Listen for payment.created WebSocket notification — the polling mechanism above
  // already handles fetching the URL; here we simply ensure the effect runs when
  // a new notification arrives so the poller can pick it up on the next tick.
  useEffect(() => {
    if (!wsNotifications || !booking?.id) return undefined
    const latest = wsNotifications[0]
    if (latest?.event_type === NOTIFICATION_EVENT.PAYMENT_CREATED) {
      // Payment URL will be resolved by the polling effect; no action needed here.
    }
    return undefined
  }, [wsNotifications, booking?.id])
  const apiStatus = booking?.status || 'pending'
  const isPending = apiStatus === 'pending' || apiStatus === 'pending_payment'
  const isConfirmed = apiStatus === 'confirmed'
  const isCancelled = apiStatus === 'cancelled' || apiStatus === 'declined'

  let title = 'Awaiting confirmation'
  if (isCancelled) title = 'Appointment Unavailable'
  if (isConfirmed) title = 'Appointment Confirmed'

  const subtitle = booking
    ? `Dr. ${booking.doctor_name || ''} - ${booking.appointment_date || ''} - ${booking.start_time || ''}`
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

  const ringClassName = `relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border ${ringClass}`
  const innerClassName = `absolute inset-2 rounded-full ${innerClass}`
  const iconWrapClassName = `relative inline-flex h-12 w-12 items-center justify-center rounded-full text-white ${iconWrapClass}`

  let statusIcon = <span className="inline-flex h-6 w-6"><IconClock /></span>
  if (isCancelled) statusIcon = <IconX />
  if (isConfirmed) statusIcon = <IconCheck size={24} />

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className={ringClassName}>
        <div className={innerClassName} />

        <div className={iconWrapClassName}>
          {statusIcon}
        </div>
      </div>

      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">{subtitle}</p>

      {isPending && !paymentUrl && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          <p className="text-sm text-slate-500 dark:text-[#70708a]">{pollingMsg}</p>
        </div>
      )}

      {paymentUrl && (
        <a
          href={paymentUrl}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:-translate-y-px hover:bg-amber-600 transition-all duration-150"
          rel="noopener noreferrer"
        >
          Pay via VNPAY
        </a>
      )}

      {isPending && !paymentUrl && (
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
    id: PropTypes.string,
    appointment_date: PropTypes.string,
    start_time: PropTypes.string,
    doctor_name: PropTypes.string,
    status: PropTypes.string,
  }),
  setCurrentView: PropTypes.func.isRequired,
  wsNotifications: PropTypes.arrayOf(PropTypes.object),
}

BookingConfirmedView.defaultProps = {
  booking: null,
  wsNotifications: [],
}
