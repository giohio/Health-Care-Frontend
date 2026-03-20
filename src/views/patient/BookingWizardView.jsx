import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconArrowLeft, IconWarning, IconStar } from '../../icons'

const STEPS = [
  { n: 1, label: 'Specialty & Doctor' },
  { n: 2, label: 'Date & Time' },
  { n: 3, label: 'Confirm' },
]

const SPECIALTIES = [
  { id: 'cardiology', label: 'Cardiology', icon: '🫀' },
  { id: 'neurology', label: 'Neurology', icon: '🧠' },
  { id: 'general', label: 'General Practice', icon: '🩺' },
]

const DOCTORS = [
  { id: 'sc', initials: 'SC', name: 'Dr. Sarah Chen', detail: 'General Practice · 12 yrs exp.', rating: '4.9' },
  { id: 'mr', initials: 'MR', name: 'Dr. Marcus Reid', detail: 'General Practice · 8 yrs exp.', rating: '4.7' },
]

const DAYS = [
  { key: 'mon', label: 'MON', date: 17 },
  { key: 'tue', label: 'TUE', date: 18 },
  { key: 'wed', label: 'WED', date: 19 },
  { key: 'thu', label: 'THU', date: 20 },
  { key: 'fri', label: 'FRI', date: 21 },
  { key: 'sat', label: 'SAT', date: 22 },
  { key: 'sun', label: 'SUN', date: 23 },
]

const TIME_SLOTS = [
  { key: '9:00AM', label: '9:00 AM', unavailable: true },
  { key: '9:30AM', label: '9:30 AM', unavailable: true },
  { key: '10:00AM', label: '10:00 AM', unavailable: false },
  { key: '10:30AM', label: '10:30 AM', unavailable: false },
  { key: '11:00AM', label: '11:00 AM', unavailable: false },
  { key: '2:00PM', label: '2:00 PM', unavailable: false },
  { key: '2:30PM', label: '2:30 PM', unavailable: false },
  { key: '3:00PM', label: '3:00 PM', unavailable: false },
]

function Stepper({ step }) {
  return (
    <div className="mb-8 mt-6 flex items-center">
      {STEPS.map((s, i) => {
        const active = s.n === step
        const done = s.n < step
        let circleClass = 'bg-slate-200 text-slate-400 dark:bg-[#252530] dark:text-[#505060]'
        if (done) circleClass = 'bg-slate-900 text-white dark:bg-[#eeeef5] dark:text-[#0c0c13]'
        if (active) circleClass = 'bg-indigo-600 text-white'

        let labelClass = 'text-slate-400 dark:text-[#505060]'
        if (done) labelClass = 'text-slate-900 dark:text-[#eeeef5]'
        if (active) labelClass = 'text-indigo-600 dark:text-indigo-400'

        return (
          <div key={s.n} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${circleClass}`}>
                {done ? '✓' : s.n}
              </span>
              <span className={`text-xs font-medium ${labelClass}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-slate-200 dark:bg-[#252530]" />}
          </div>
        )
      })}
    </div>
  )
}

Stepper.propTypes = { step: PropTypes.number.isRequired }

export default function BookingWizardView({ setCurrentView, onSubmitBooking }) {
  const [step, setStep] = useState(1)
  const [specialty, setSpecialty] = useState('general')
  const [doctor, setDoctor] = useState('sc')
  const [day, setDay] = useState('wed')
  const [time, setTime] = useState('10:00AM')

  const selectedSpecialty = SPECIALTIES.find((item) => item.id === specialty) || SPECIALTIES[0]
  const selectedDoctor = DOCTORS.find((item) => item.id === doctor) || DOCTORS[0]
  const selectedDay = DAYS.find((item) => item.key === day) || DAYS[0]
  const selectedTime = TIME_SLOTS.find((item) => item.key === time) || TIME_SLOTS[0]

  const summaryRows = [
    { label: 'Doctor', value: selectedDoctor.name },
    { label: 'Specialty', value: selectedSpecialty.label },
    { label: 'Date', value: `${selectedDay.label}, March ${selectedDay.date}` },
    { label: 'Time', value: selectedTime.label },
    { label: 'Clinic', value: 'Hanoi Central Clinic' },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <button
        id="bw-back-btn"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-[#9898b0] dark:hover:text-[#eeeef5]"
        onClick={() => setCurrentView('dashboard')}
        aria-label="Back to Dashboard"
      >
        <IconArrowLeft size={15} />
        Back to Dashboard
      </button>

      <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Book an Appointment</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Select a specialty, doctor, date, and time.</p>

      <Stepper step={step} />

      {step === 1 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Select Specialty</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SPECIALTIES.map((s) => (
              <button
                key={s.id}
                className={`card-hover rounded-2xl border p-4 text-center transition-all duration-200 ${specialty === s.id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/50' : 'border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118]'}`}
                onClick={() => setSpecialty(s.id)}
                aria-pressed={specialty === s.id}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{s.label}</span>
              </button>
            ))}
          </div>

          <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Available Doctors</p>
          <div className="space-y-3">
            {DOCTORS.map((d) => (
              <button
                key={d.id}
                className={`card-hover flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${doctor === d.id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/50' : 'border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118]'}`}
                onClick={() => setDoctor(d.id)}
                aria-pressed={doctor === d.id}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">{d.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{d.name}</p>
                  <p className="text-xs text-slate-400 dark:text-[#606070]">{d.detail}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-[#c8c8e0]"><span className="text-amber-500 dark:text-amber-400"><IconStar size={12} /></span>{d.rating}</div>
              </button>
            ))}
          </div>

          <button id="bw-next-1" className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]" onClick={() => setStep(2)}>Continue to Date & Time →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Select a Date</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => {
              const selected = day === d.key
              return (
                <button
                  key={d.key}
                  className={`card-hover min-w-[58px] rounded-xl border px-3 py-2 text-center ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-900 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5]'}`}
                  onClick={() => setDay(d.key)}
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
              let buttonClass = 'border-slate-200 bg-white text-slate-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]'
              if (selected) buttonClass = 'border-indigo-600 bg-indigo-600 text-white'
              if (t.unavailable) {
                buttonClass = 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]'
              }

              return (
                <button
                  key={t.key}
                  disabled={t.unavailable}
                  className={`card-hover rounded-xl border px-2 py-2 text-sm ${buttonClass}`}
                  onClick={() => !t.unavailable && setTime(t.key)}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          <button id="bw-next-2" className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]" onClick={() => setStep(3)}>Review Booking →</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {summaryRows.map((row, idx) => (
              <div key={row.label} className={`flex items-center justify-between py-2 ${idx < summaryRows.length - 1 ? 'border-b border-slate-100 dark:border-[#1c1c25]' : ''}`}>
                <span className="text-xs text-slate-400 dark:text-[#606070]">{row.label}</span>
                <span className="text-sm text-slate-600 dark:text-[#9898b0]">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="mt-0.5 inline-flex text-rose-600 dark:text-rose-400"><IconWarning size={15} /></span>
            <p className="text-sm leading-relaxed">
              Your allergy file (<strong className="font-semibold">Seafood</strong>, <strong className="font-semibold">Penicillin</strong>) will be automatically shared with Dr. Chen before your appointment.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button id="bw-change-btn" className="flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setStep(1)}>← Change Details</button>
            <button
              id="bw-confirm-btn"
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
              onClick={() => {
                const bookingPayload = {
                  patientId: 'PT-2024-0142',
                  patientName: 'Jane Doe',
                  doctorId: selectedDoctor.id,
                  doctorName: selectedDoctor.name,
                  specialtyId: selectedSpecialty.id,
                  specialtyLabel: selectedSpecialty.label,
                  dayKey: selectedDay.key,
                  dateLabel: `March ${selectedDay.date}`,
                  dayLabel: selectedDay.label,
                  timeKey: selectedTime.key,
                  timeLabel: selectedTime.label,
                  clinic: 'Hanoi Central Clinic',
                }

                onSubmitBooking(bookingPayload)
              }}
            >
              Confirm Booking ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

BookingWizardView.propTypes = {
  onSubmitBooking: PropTypes.func.isRequired,
  setCurrentView: PropTypes.func.isRequired,
}
