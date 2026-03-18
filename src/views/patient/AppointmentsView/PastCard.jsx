import PropTypes from 'prop-types'
import { IconMapPin } from '../../../icons'

export default function PastCard({ appt }) {
  return (
    <div className="card-hover flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]">
      <span className="w-1 self-stretch rounded-full bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#252530] dark:bg-[#1c1c25]">
        <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{appt.month}</span>
        <span className="block text-xl font-bold text-slate-300 dark:text-[#404050]">{appt.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-normal text-slate-500 dark:text-[#70708a]">{appt.doctor}</p>
        <p className="text-xs text-slate-400 dark:text-[#606070]">{appt.specialty} · {appt.time}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-[#606070]"><span className="text-slate-300 dark:text-[#404050]"><IconMapPin size={12} /></span>{appt.clinic}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]">Completed</span>
        <button className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">View Notes</button>
      </div>
    </div>
  )
}

PastCard.propTypes = {
  appt: PropTypes.shape({
    doctor: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    month: PropTypes.string.isRequired,
    day: PropTypes.number.isRequired,
    time: PropTypes.string.isRequired,
    clinic: PropTypes.string.isRequired,
  }).isRequired,
}
