import PropTypes from 'prop-types'
import { IconMapPin } from '../../../icons'
import { APPT_STATUS_LABEL, APPT_STATUS_COLOR, APPOINTMENT_STATUS } from '../../../constants/enums'

function parseApptDate(dateStr) {
  if (!dateStr) return { month: '--', day: '--' }
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
  }
}

export default function PastCard({ appt, onRate, onBookAgain }) {
  const { month, day } = parseApptDate(appt.appointment_date)
  const doctorName = appt.doctor_name ?? 'Doctor'
  const specialtyName = appt.specialty_name ?? ''
  const startTime = appt.start_time ? appt.start_time.slice(0, 5) : ''
  const location = appt.clinic_name ?? appt.location ?? ''
  const displayStatus = appt.effectiveStatus || appt.status
  const statusLabel = APPT_STATUS_LABEL[displayStatus] ?? displayStatus
  const statusColorObj = APPT_STATUS_COLOR[displayStatus] ?? null
  const isDeclined = displayStatus === APPOINTMENT_STATUS.DECLINED
  const cancelReason = appt.cancel_reason ?? null
  const redirectDept = appt.redirect_department ?? null

  return (
    <div className="flex flex-col gap-0 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]">
      <div className="card-hover flex gap-4 p-4">
        <span className={`w-1 self-stretch rounded-full ${isDeclined ? 'bg-rose-300 dark:bg-rose-800' : 'bg-slate-200 dark:bg-[#252530]'}`} aria-hidden="true" />

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#252530] dark:bg-[#1c1c25]">
          <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{month}</span>
          <span className="block text-xl font-bold text-slate-300 dark:text-[#404050]">{day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-normal text-slate-500 dark:text-[#70708a]">{doctorName}</p>
          <p className="text-xs text-slate-400 dark:text-[#606070]">{specialtyName}{specialtyName && startTime ? ' · ' : ''}{startTime}</p>
          {location ? <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-[#606070]"><span className="text-slate-300 dark:text-[#404050]"><IconMapPin size={12} /></span>{location}</p> : null}
          {isDeclined && cancelReason && (
            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">Reason: {cancelReason}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className="rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: statusColorObj?.bg ?? '#f1f5f9',
              color: statusColorObj?.text ?? '#475569',
            }}
          >{statusLabel}</span>
          {onRate && (
            <button onClick={onRate} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Rate Doctor</button>
          )}
        </div>
      </div>

      {isDeclined && redirectDept && (
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-rose-100 bg-rose-50 px-4 py-2.5 dark:border-rose-900/30 dark:bg-rose-950/20">
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Referred to <span className="font-semibold">{redirectDept}</span>
          </p>
          {onBookAgain && (
            <button
              type="button"
              onClick={() => onBookAgain(redirectDept)}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
            >
              Book Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}

PastCard.propTypes = {
  appt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor_name: PropTypes.string,
    specialty_name: PropTypes.string,
    appointment_date: PropTypes.string,
    start_time: PropTypes.string,
    clinic_name: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string.isRequired,
    cancel_reason: PropTypes.string,
    redirect_department: PropTypes.string,
  }).isRequired,
  onRate: PropTypes.func,
  onBookAgain: PropTypes.func,
}
