import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { IconArrowLeft } from '../../../icons'
import { appointmentApi } from '../../../api/appointment'
import { APPT_STATUS_LABEL, APPT_STATUS_COLOR } from '../../../constants/enums'

function makeNextDays(n = 7) {
  const days = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const isoDate = d.toISOString().slice(0, 10)
    days.push({
      key: isoDate,
      label: d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
      date: d.getDate(),
      display: d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    })
  }
  return days
}

export default function RescheduleView({ setCurrentView, selectedAppointment }) {
  const DAYS = useMemo(() => makeNextDays(7), [])
  const [selectedDay, setSelectedDay] = useState(DAYS[1]?.key ?? DAYS[0]?.key)
  const [selectedTime, setSelectedTime] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const appt = selectedAppointment ?? {}

  const apptMonth = appt.appointment_date
    ? new Date(appt.appointment_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()
    : '--'
  const apptDay = appt.appointment_date ? new Date(appt.appointment_date).getDate() : '--'
  const statusLabel = APPT_STATUS_LABEL[appt.status] ?? appt.status ?? ''
  const statusColorClass = APPT_STATUS_COLOR[appt.status] ?? 'border border-slate-200 bg-slate-100 text-slate-500'

  useEffect(() => {
    if (!appt.doctor_id || !selectedDay) return
    setSlotsLoading(true)
    setSelectedTime(null)
    appointmentApi.getSlots(appt.doctor_id, {
      appointment_date: selectedDay,
      specialty_id: appt.specialty_id,
    }).then((data) => {
      const slots = Array.isArray(data) ? data : (data?.slots ?? [])
      setTimeSlots(slots)
    }).catch(() => setTimeSlots([])).finally(() => setSlotsLoading(false))
  }, [selectedDay, appt.doctor_id, appt.specialty_id])

  async function handleConfirm() {
    if (!selectedTime || !appt.id) return
    setSubmitting(true)
    setError(null)
    try {
      await appointmentApi.reschedule(appt.id, { new_date: selectedDay, new_time: selectedTime })
      setCurrentView('reschedule-confirmed')
    } catch (err) {
      setError(err.message || 'Failed to reschedule')
    } finally {
      setSubmitting(false)
    }
  }

  const newDayObj = DAYS.find((d) => d.key === selectedDay)

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
            <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{apptMonth}</span>
            <span className="block text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{apptDay}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{appt.doctor_name ?? 'Doctor'}</p>
            <p className="text-xs text-slate-400 dark:text-[#606070]">{appt.specialty_name ?? ''}{appt.specialty_name && appt.start_time ? ' · ' : ''}{appt.start_time ?? ''}</p>
            {appt.clinic_name && <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">{appt.clinic_name}</p>}
          </div>
          {statusLabel && <span className={`h-fit rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusColorClass}`}>{statusLabel}</span>}
        </div>
      </div>

      <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Pick a New Date</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((d) => {
          const selected = selectedDay === d.key
          const dayButtonTone = selected
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-slate-200 bg-white text-slate-900 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5]'
          const dayLabelTone = selected ? 'text-white' : 'text-slate-400 dark:text-[#606070]'

          return (
            <button
              key={d.key}
              className={`card-hover min-w-[58px] rounded-xl border px-3 py-2 text-center ${dayButtonTone}`}
              onClick={() => setSelectedDay(d.key)}
            >
              <span className={`block text-[11px] ${dayLabelTone}`}>{d.label}</span>
              <span className="block text-sm font-semibold">{d.date}</span>
            </button>
          )
        })}
      </div>

      <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Available Times</p>
      {slotsLoading && <p className="text-sm text-slate-400 dark:text-[#606070]">Loading slots…</p>}
      {!slotsLoading && timeSlots.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-[#606070]">No available slots for this day.</p>
      )}
      {!slotsLoading && timeSlots.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((slot) => {
            const slotTime = typeof slot === 'string' ? slot : slot.start_time
            const selected = selectedTime === slotTime
            const unavailable = slot.is_available === false
            
            let slotClasses = 'border-slate-200 bg-white text-slate-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]'
            if (unavailable) {
              slotClasses = 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]'
            } else if (selected) {
              slotClasses = 'border-indigo-600 bg-indigo-600 text-white'
            }

            return (
              <button
                key={slotTime}
                disabled={unavailable}
                className={`card-hover rounded-xl border px-2 py-2 text-sm ${slotClasses}`}
                onClick={() => {
                  if (unavailable) return
                  setSelectedTime(slotTime)
                }}
              >
                {slotTime}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-8 grid overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:grid-cols-2">
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Current</p>
          <p className="mt-2 text-sm text-slate-400 line-through dark:text-[#606070]">{appt.appointment_date ?? '--'}</p>
          <p className="text-sm text-slate-400 line-through dark:text-[#606070]">{appt.start_time ?? '--'}</p>
        </div>
        <div className="border-l border-slate-100 p-4 dark:border-[#252530]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600 dark:text-indigo-400">New</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{newDayObj?.display ?? '—'}</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{selectedTime ?? '—'}</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button id="rs-keep-btn" className="flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setCurrentView('appointments')}>Keep Original</button>
        <button
          id="rs-confirm-btn"
          disabled={!selectedTime || submitting}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          onClick={handleConfirm}
        >
          {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}

RescheduleView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  selectedAppointment: PropTypes.shape({
    id: PropTypes.string,
    doctor_id: PropTypes.string,
    doctor_name: PropTypes.string,
    specialty_id: PropTypes.string,
    specialty_name: PropTypes.string,
    appointment_date: PropTypes.string,
    start_time: PropTypes.string,
    clinic_name: PropTypes.string,
    status: PropTypes.string,
  }),
}

RescheduleView.defaultProps = {
  selectedAppointment: null,
}

