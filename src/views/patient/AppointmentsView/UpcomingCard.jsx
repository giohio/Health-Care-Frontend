import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconMapPin, IconCalendar, IconStar } from '../../../icons'
import { APPOINTMENT_STATUS, APPT_STATUS_LABEL, APPT_STATUS_COLOR } from '../../../constants/enums'
import { paymentApi } from '../../../api/payment'

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function parseApptDate(dateStr) {
  if (!dateStr) return { month: '--', day: '--', weekdayShort: '', fullDate: '' }
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    weekdayShort: d.toLocaleString('en-US', { weekday: 'long' }),
    fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
  }
}

export default function UpcomingCard({ appt, onReschedule, onCancel, variant, onViewTriage }) {
  const [confirming, setConfirming] = useState(false)
  const [fading, setFading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  const isPendingPayment = appt.effectiveStatus || appt.status === APPOINTMENT_STATUS.PENDING_PAYMENT

  // AI Triage fields
  const isAiReferred = appt.ai_referred || appt.triage_session_id
  const urgencyLevel = appt.urgency_level || null

  function urgencyBadge(level) {
    if (!level || level === 'low' || level === 'medium') return null
    const isUrgent = level === 'urgent' || level === 'high'
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
        isUrgent
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
        {level === 'urgent' ? 'Urgent' : 'Priority'}
      </span>
    )
  }

  async function handlePay() {
    setPaying(true)
    setPayError(null)
    try {
      const result = await paymentApi.initiatePayment(appt.id)
      const url = result?.payment_url ?? result?.paymentUrl ?? result?.data?.payment_url ?? result?.data?.url
      if (url) {
        globalThis.location.href = url
      } else {
        setPayError('Payment URL not available. Please try again.')
      }
    } catch (err) {
      setPayError(err?.message || 'Failed to generate payment link.')
    } finally {
      setPaying(false)
    }
  }

  const { month, day, fullDate } = parseApptDate(appt.appointment_date)
  const doctorName = appt.doctor_name ?? 'Doctor'
  const specialtyName = appt.specialty_name ?? ''
  const startTime = appt.start_time ? appt.start_time.slice(0, 5) : ''
  const endTime = appt.end_time ? appt.end_time.slice(0, 5) : ''
  const location = appt.clinic_name ?? appt.location ?? ''
  const cancelHelpText = Reflect.get(appt, 'cancelText') ?? 'This action cannot be undone.'
  const displayStatus = appt.effectiveStatus || appt.status
  const statusLabel = APPT_STATUS_LABEL[displayStatus] ?? displayStatus
  const statusColorObj = APPT_STATUS_COLOR[displayStatus] ?? null
  const statusBadgeStyle = statusColorObj ? { backgroundColor: statusColorObj.bg, color: statusColorObj.text } : {}
  const accentClass = displayStatus === APPOINTMENT_STATUS.CONFIRMED ? 'bg-indigo-500' : displayStatus === APPOINTMENT_STATUS.OVERDUE ? 'bg-rose-500' : 'bg-amber-400'
  const fadeClass = fading ? 'opacity-0' : 'opacity-100'
  const initials = doctorName.replace(/^Dr\.\s*/i, '').split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
  const rating = appt.doctor_rating ?? appt.rating ?? null

  function handleYesCancel() {
    setFading(true)
    globalThis.setTimeout(() => onCancel(appt.id, doctorName), 300)
  }

  // ── Confirmation overlay ───────────────────────────────────────────────
  if (confirming) {
    return (
      <div className={`rounded-2xl border border-rose-200 bg-rose-50 p-4 transition-all duration-300 dark:border-rose-900/50 dark:bg-rose-950/30 ${fadeClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Cancel this appointment?</p>
            <p className="mt-0.5 text-xs text-rose-400 dark:text-rose-500/70">{cancelHelpText}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setConfirming(false)}>Keep it</button>
            <button type="button" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600" onClick={handleYesCancel}>Yes, Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  // ── REMINDER VARIANT ──────────────────────────────────────────────────
  if (variant === 'reminder') {
    return (
      <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-[#252530] dark:bg-[#111118] ${fadeClass}`}>
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">{doctorName}</p>
            <p className="mt-0.5 text-sm text-slate-400 dark:text-[#606070]">{specialtyName}</p>
            {rating !== null && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-amber-400"><IconStar size={14} /></span>
                <span className="text-xs font-medium text-slate-600 dark:text-[#9898b0]">
                  {typeof rating === 'number' ? rating.toFixed(2) : rating} out of 5
                </span>
              </div>
            )}
            <span className="mt-2 inline-block rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={statusBadgeStyle}>{statusLabel}</span>
            {isAiReferred && (
              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/></svg>
                AI Referred
              </span>
            )}
            {urgencyBadge(urgencyLevel)}
          </div>
          {appt.avatar_url ? (
            <img src={appt.avatar_url} alt={doctorName} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              {initials}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-5 border-y border-slate-100 px-5 py-3 dark:border-[#1c1c25]">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#9898b0]">
            <span className="text-indigo-500 dark:text-indigo-400"><IconCalendar size={13} /></span>
            <span className="text-sm font-medium">{fullDate}</span>
          </div>
          {startTime && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#9898b0]">
              <span className="text-indigo-500 dark:text-indigo-400"><IconClock /></span>
              <span className="text-sm font-medium">{startTime}{endTime ? `–${endTime}` : ''}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 py-4">
          {isPendingPayment ? (
            <button
              type="button"
              disabled={paying}
              onClick={handlePay}
              className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? 'Redirecting…' : 'Pay Now'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onReschedule(appt)}
              className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
            >
              Reschedule
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
          >
            Cancel
          </button>
        </div>
        {payError && <p className="px-5 pb-3 text-xs text-rose-500">{payError}</p>}
      </div>
    )
  }

  // ── DEFAULT COMPACT VARIANT ────────────────────────────────────────────
  const subtitle = `${specialtyName}${specialtyName && startTime ? ' · ' : ''}${startTime}`

  return (
    <div className={`card-hover flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e] ${fadeClass}`}>
      <span className={`w-1 self-stretch rounded-full ${accentClass}`} aria-hidden="true" />
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#252530] dark:bg-[#1c1c25]">
        <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{month}</span>
        <span className="block text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{doctorName}</p>
          {isAiReferred && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/></svg>
              AI
            </span>
          )}
          {urgencyBadge(urgencyLevel)}
        </div>
        <p className="text-xs text-slate-400 dark:text-[#606070]">{subtitle}</p>
        {location ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-[#606070]">
            <span className="text-slate-300 dark:text-[#404050]"><IconMapPin size={12} /></span>
            {location}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {isAiReferred && onViewTriage && (
            <button
              type="button"
              onClick={() => onViewTriage(appt.triage_session_id)}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all duration-150 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
            >
              View AI Summary
            </button>
          )}
          {isPendingPayment && (
            <button
              type="button"
              disabled={paying}
              className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-400"
              onClick={handlePay}
            >
              {paying ? 'Redirecting…' : 'Pay Now'}
            </button>
          )}
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => onReschedule(appt)}>Reschedule</button>
          <button type="button" className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-all duration-150 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40" onClick={() => setConfirming(true)}>Cancel</button>
        </div>
        {payError && <p className="mt-2 text-xs text-rose-500">{payError}</p>}
      </div>
      <span className="h-fit rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={statusBadgeStyle}>{statusLabel}</span>
    </div>
  )
}
UpcomingCard.propTypes = {
  appt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor_name: PropTypes.string,
    specialty_name: PropTypes.string,
    appointment_date: PropTypes.string,
    start_time: PropTypes.string,
    end_time: PropTypes.string,
    clinic_name: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string.isRequired,
    cancelText: PropTypes.string,
    avatar_url: PropTypes.string,
    doctor_rating: PropTypes.number,
    rating: PropTypes.number,
    ai_referred: PropTypes.bool,
    triage_session_id: PropTypes.string,
    urgency_level: PropTypes.string,
  }).isRequired,
  onReschedule: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'reminder']),
  onViewTriage: PropTypes.func,
}

UpcomingCard.defaultProps = { variant: 'default' }
