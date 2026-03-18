import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconArrowLeft } from '../../../icons'

const DAYS = [
  { key: 'mar20', label: 'THU', date: 20, display: 'Thu, Mar 20', unavailable: false },
  { key: 'mar21', label: 'FRI', date: 21, display: 'Fri, Mar 21', unavailable: false },
  { key: 'mar22', label: 'SAT', date: 22, display: 'Sat, Mar 22', unavailable: false },
  { key: 'mar23', label: 'SUN', date: 23, display: 'Sun, Mar 23', unavailable: true },
  { key: 'mar24', label: 'MON', date: 24, display: 'Mon, Mar 24', unavailable: false },
  { key: 'mar25', label: 'TUE', date: 25, display: 'Tue, Mar 25', unavailable: false },
  { key: 'mar26', label: 'WED', date: 26, display: 'Wed, Mar 26', unavailable: false },
]

const TIME_SLOTS = [
  { key: '9:00AM', label: '9:00 AM', unavailable: true },
  { key: '9:30AM', label: '9:30 AM', unavailable: true },
  { key: '11:00AM', label: '11:00 AM', unavailable: false },
  { key: '11:30AM', label: '11:30 AM', unavailable: false },
  { key: '2:00PM', label: '2:00 PM', unavailable: false },
  { key: '2:30PM', label: '2:30 PM', unavailable: false },
  { key: '3:30PM', label: '3:30 PM', unavailable: false },
  { key: '4:00PM', label: '4:00 PM', unavailable: false },
]

export default function RescheduleView({ setCurrentView, selectedAppointment }) {
  const [day, setDay] = useState('mar22')
  const [time, setTime] = useState('11:00AM')

  const appt = selectedAppointment ?? {
    doctor: 'Dr. Sarah Chen',
    specialty: 'General Practice',
    month: 'MAR',
    day: 19,
    time: '10:00 AM',
    clinic: 'Hanoi Central Clinic',
    status: 'Confirmed',
    oldDisplay: 'Wed, Mar 19',
  }

  const oldDate = appt.oldDisplay ?? `${appt.month} ${appt.day}`
  const newDayObj = DAYS.find((d) => d.key === day)
  const newTimeObj = TIME_SLOTS.find((t) => t.key === time)

  return (
    <div className="mx-auto max-w-4xl">
      <button
        id="rs-back-btn"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-[#9898b0] dark:hover:text-[#eeeef5]"
        onClick={() => setCurrentView('appointments')}
        aria-label="Back to My Appointments"
      >
        <IconArrowLeft size={15} />
        Back to My Appointments
      </button>

      <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Reschedule Appointment</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Choose a new date and time for your visit.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:shadow-none">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Currently scheduled</p>
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#1c1c25] dark:bg-[#16161e]">
            <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{appt.month}</span>
            <span className="block text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{appt.day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{appt.doctor}</p>
            <p className="text-xs text-slate-400 dark:text-[#606070]">{appt.specialty} · {appt.time}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">{appt.clinic}</p>
          </div>
          <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300">{appt.status}</span>
        </div>
      </div>

      <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Pick a New Date</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((d) => {
          const selected = day === d.key
          return (
            <button
              key={d.key}
              disabled={d.unavailable}
              className={`card-hover min-w-[58px] rounded-xl border px-3 py-2 text-center ${d.unavailable ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]' : selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-900 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5]'}`}
              onClick={() => !d.unavailable && setDay(d.key)}
            >
              <span className={`block text-[11px] ${selected ? 'text-white' : 'text-slate-400 dark:text-[#606070]'}`}>{d.label}</span>
              <span className="block text-sm font-semibold">{d.date}</span>
            </button>
          )
        })}
      </div>

      <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Available Times</p>
      <div className="grid grid-cols-4 gap-2">
        {TIME_SLOTS.map((t) => {
          const selected = time === t.key
          return (
            <button
              key={t.key}
              disabled={t.unavailable}
              className={`card-hover rounded-xl border px-2 py-2 text-sm ${t.unavailable ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]' : selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]'}`}
              onClick={() => !t.unavailable && setTime(t.key)}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:grid-cols-2">
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Current</p>
          <p className="mt-2 text-sm text-slate-400 line-through dark:text-[#606070]">{oldDate}</p>
          <p className="text-sm text-slate-400 line-through dark:text-[#606070]">{appt.time}</p>
        </div>
        <div className="border-l border-slate-100 p-4 dark:border-[#252530]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600 dark:text-indigo-400">New</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{newDayObj?.display}</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{newTimeObj?.label}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button id="rs-keep-btn" className="flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setCurrentView('appointments')}>Keep Original</button>
        <button id="rs-confirm-btn" className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]" onClick={() => setCurrentView('reschedule-confirmed')}>Confirm Reschedule</button>
      </div>
    </div>
  )
}

RescheduleView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.shape({
    doctor: PropTypes.string,
    specialty: PropTypes.string,
    month: PropTypes.string,
    day: PropTypes.number,
    time: PropTypes.string,
    clinic: PropTypes.string,
    status: PropTypes.string,
    oldDisplay: PropTypes.string,
  }),
}

RescheduleView.defaultProps = {
  selectedAppointment: null,
}
