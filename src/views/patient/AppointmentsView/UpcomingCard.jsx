import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconMapPin } from '../../../icons'

export default function UpcomingCard({ appt, onReschedule, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const [fading, setFading] = useState(false)

  function handleYesCancel() {
    setFading(true)
    setTimeout(() => onCancel(appt.id, appt.doctor), 300)
  }

  const statusClass = appt.status === 'Confirmed'
    ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300'
    : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300'

  const accentClass = appt.status === 'Confirmed' ? 'bg-indigo-500' : 'bg-amber-400'

  if (confirming) {
    return (
      <div className={`rounded-2xl border border-rose-200 bg-rose-50 p-4 transition-all duration-300 dark:border-rose-900/50 dark:bg-rose-950/30 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Cancel this appointment?</p>
            <p className="mt-0.5 text-xs text-rose-400 dark:text-rose-500/70">{appt.cancelText}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setConfirming(false)}>Keep it</button>
            <button className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600" onClick={handleYesCancel}>Yes, Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card-hover flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none ${fading ? 'opacity-0' : 'opacity-100'} dark:hover:border-[#353545] dark:hover:bg-[#16161e]`}>
      <span className={`w-1 self-stretch rounded-full ${accentClass}`} aria-hidden="true" />

      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#252530] dark:bg-[#1c1c25]">
        <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{appt.month}</span>
        <span className="block text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{appt.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{appt.doctor}</p>
        <p className="text-xs text-slate-400 dark:text-[#606070]">{appt.specialty} · {appt.time}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-[#606070]"><span className="text-slate-300 dark:text-[#404050]"><IconMapPin size={12} /></span>{appt.clinic}</p>

        <div className="mt-3 flex gap-2">
          <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => onReschedule(appt)}>Reschedule</button>
          <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-all duration-150 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40" onClick={() => setConfirming(true)}>Cancel</button>
        </div>
      </div>

      <span className={`h-fit rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>{appt.status}</span>
    </div>
  )
}

UpcomingCard.propTypes = {
  appt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    month: PropTypes.string.isRequired,
    day: PropTypes.number.isRequired,
    time: PropTypes.string.isRequired,
    clinic: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    cancelText: PropTypes.string.isRequired,
  }).isRequired,
  onReschedule: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
