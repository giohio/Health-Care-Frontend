import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { IconArrowLeft, IconStar } from '../../icons'
import { doctorApi } from '../../api/doctor'
import { appointmentApi } from '../../api/appointment'

const STEPS = [
  { n: 1, label: 'Specialty & Doctor' },
  { n: 2, label: 'Date & Time' },
  { n: 3, label: 'Confirm' },
]

// Generate the next 7 days
function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleString('en', { weekday: 'short' }).toUpperCase()
    days.push({ key, label, date: d.getDate() })
  }
  return days
}

const days = getNext7Days()

// Returns Mon=0 … Sun=6 from an ISO date string
function dayISOtoDow(isoKey) {
  return (new Date(`${isoKey}T00:00:00`).getDay() + 6) % 7
}

const DOW_STR_TO_IDX = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
}

// Parse schedule API response → Set of enabled DOW indices (Mon=0…Sun=6), or null if unknown
function getEnabledDows(scheduleData) {
  let items = []
  if (Array.isArray(scheduleData)) {
    items = scheduleData
  } else if (Array.isArray(scheduleData?.working_days)) {
    items = scheduleData.working_days
  }
  const enabled = new Set()
  for (const wd of items) {
    const dow = typeof wd.day_of_week === 'number'
      ? wd.day_of_week
      : DOW_STR_TO_IDX[String(wd.day_of_week ?? '').toLowerCase()]
    if (dow != null && !Number.isNaN(dow)) enabled.add(dow)
  }
  return enabled.size > 0 ? enabled : null
}

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

export default function BookingWizardView({
  setCurrentView,
  onSubmitBooking,
  currentUser,
  // AI Triage referral props
  triageSession,
  onClearTriage,
  // Doctor-referred department (from decline "Book Again" flow)
  preselectedDepartment,
}) {
  const [step, setStep] = useState(1)

  // Step 1: specialty + doctor selection
  const [specialties, setSpecialties] = useState([])
  const [specialty, setSpecialty] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [doctor, setDoctor] = useState(null)
  const [step1Loading, setStep1Loading] = useState(true)

  // Step 2: date + slot
  const [day, setDay] = useState(null)
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      result.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleString('en', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
      })
    }
    return result
  }, [])
  useEffect(() => {
    if (day === null && days.length > 0) setDay(days[0].key)
  }, [day, days])
  const [timeSlots, setTimeSlots] = useState([])
  const [time, setTime] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [doctorWorkDays, setDoctorWorkDays] = useState(null) // Set<DOW 0-6> or null

  // Step 3: submit
  const [complaint, setComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Load specialties
  useEffect(() => {
    doctorApi.getSpecialties()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setSpecialties(list)
        if (list.length > 0) setSpecialty(list[0])
      })
      .catch(() => {})
      .finally(() => setStep1Loading(false))
  }, [])

  // Pre-select specialty when triageSession changes
  useEffect(() => {
    if (!triageSession?.suggested_department || specialties.length === 0) return
    const dept = triageSession.suggested_department.toLowerCase()
    const matched = specialties.find(
      (s) => s.name?.toLowerCase() === dept
        || s.name?.toLowerCase().includes(dept)
        || dept.includes(s.name?.toLowerCase()),
    )
    if (matched) setSpecialty(matched)
  }, [triageSession?.suggested_department, specialties])

  // Pre-select specialty when redirected from a declined appointment ("Book Again")
  useEffect(() => {
    if (!preselectedDepartment || specialties.length === 0) return
    // triageSession takes priority if also present
    if (triageSession?.suggested_department) return
    const dept = preselectedDepartment.toLowerCase()
    const matched = specialties.find(
      (s) => s.name?.toLowerCase() === dept
        || s.name?.toLowerCase().includes(dept)
        || dept.includes(s.name?.toLowerCase()),
    )
    if (matched) setSpecialty(matched)
  }, [preselectedDepartment, specialties, triageSession?.suggested_department])

  // Load doctors when specialty changes
  useEffect(() => {
    if (!specialty) return
    doctorApi.getDoctorsBySpecialty(specialty.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setDoctors(list)
        if (list.length > 0) setDoctor(list[0])
      })
      .catch(() => {
        setDoctors([])
      })
  }, [specialty])

  // Fetch doctor's working schedule when doctor changes
  useEffect(() => {
    if (!doctor) { setDoctorWorkDays(null); return }
    let cancelled = false
    doctorApi.getSchedule(doctor.user_id)
      .then((data) => { if (!cancelled) setDoctorWorkDays(getEnabledDows(data)) })
      .catch(() => { if (!cancelled) setDoctorWorkDays(null) })
    return () => { cancelled = true }
  }, [doctor])

  // When working days are loaded, move selected day to first available if it's an off-day
  useEffect(() => {
    if (!doctorWorkDays) return
    if (!doctorWorkDays.has(dayISOtoDow(day))) {
      const firstAvail = days.find((d) => doctorWorkDays.has(dayISOtoDow(d.key)))
      setDay(firstAvail ? firstAvail.key : days[0].key)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorWorkDays])

  // Load time slots when doctor or day changes (step 2)
  useEffect(() => {
    if (!doctor || !day || step !== 2) return
    let cancelled = false
    const startTimer = globalThis.setTimeout(() => {
      if (cancelled) return
      setSlotsLoading(true)
      setTime(null)
    }, 0)
    appointmentApi.getSlots(doctor.user_id, {
      appointment_date: day,
      specialty_id: specialty?.id,
    })
      .then((data) => {
        if (cancelled) return
        const raw = Array.isArray(data?.slots) ? data.slots : []
        // Deduplicate by start_time (backend may return slots across multiple days)
        const seen = new Set()
        const slots = raw.filter((s) => {
          if (seen.has(s.start_time)) return false
          seen.add(s.start_time)
          return true
        })
        const today = new Date().toISOString().slice(0, 10)
        const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
        setTimeSlots(slots.map((s) => {
          const [hh, mm] = s.start_time.split(':').map(Number)
          const slotMinutes = hh * 60 + mm
          const isPast = day === today && slotMinutes <= nowMinutes
          return {
            key: s.start_time,
            label: s.start_time.slice(0, 5),
            unavailable: !s.is_available || isPast,
          }
        }))
        const first = slots.find((s) => {
          const [hh, mm] = s.start_time.split(':').map(Number)
          const slotMinutes = hh * 60 + mm
          const isPast = day === today && slotMinutes <= nowMinutes
          return s.is_available && !isPast
        })
        setTime(first?.start_time ?? null)
      })
      .catch(() => { if (!cancelled) setTimeSlots([]) })
      .finally(() => { if (!cancelled) setSlotsLoading(false) })
    return () => {
      cancelled = true
      globalThis.clearTimeout(startTimer)
    }
  }, [doctor, day, step, specialty])

  async function handleConfirm() {
    if (!doctor || !specialty || !day || !time) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const body = {
        doctor_id: doctor.user_id,
        specialty_id: specialty.id,
        appointment_date: day,
        start_time: time,
        chief_complaint: complaint || undefined,
        patient_id: currentUser?.id || undefined,
      }
      // AI Triage referral: attach triage metadata
      if (triageSession?.id) {
        body.triage_session_id = triageSession.id
        body.ai_referred = true
        if (triageSession.urgency_level) body.urgency_level = triageSession.urgency_level
      }
      const appt = await appointmentApi.create(body)
      onSubmitBooking(appt, triageSession)
    } catch (err) {
      setSubmitError(err.message || 'Booking failed. Please try again.')
      setSubmitting(false)
    }
  }

  const summaryRows = [
    { label: 'Doctor', value: doctor ? `Dr. ${doctor.full_name}` : '—' },
    { label: 'Specialty', value: specialty?.name || '—' },
    { label: 'Date', value: day },
    { label: 'Time', value: time || '—' },
    ...(triageSession ? [{ label: 'Type', value: 'AI-Assisted Booking', highlight: true }] : []),
  ]

  let slotsContent = null
  if (slotsLoading) {
    slotsContent = <div className="api-loading"><div className="api-skeleton" /></div>
  } else if (timeSlots.length === 0) {
    slotsContent = <p className="text-sm text-slate-400 dark:text-[#606070]">No time slots available for this date.</p>
  } else {
    slotsContent = (
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((t) => {
          const selected = time === t.key
          let buttonClass = 'border-slate-200 bg-white text-slate-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]'
          if (selected) buttonClass = 'border-indigo-600 bg-indigo-600 text-white'
          if (t.unavailable) buttonClass = 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]'
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
    )
  }

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

      {triageSession && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-900/50">
          {/* Specialty highlight banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/><path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z"/></svg>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-indigo-200">AI Recommended Specialty</p>
                  <p className="text-base font-bold text-white">
                    {triageSession.suggested_department || 'Specialist Consultation'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {triageSession.urgency_level && triageSession.urgency_level !== 'low' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2.5 py-1 text-[11px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                    {triageSession.urgency_level === 'urgent' ? 'URGENT' : 'PRIORITY'}
                  </span>
                )}
                {onClearTriage && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                    onClick={onClearTriage}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="bg-indigo-50/50 px-4 py-2 dark:bg-indigo-950/20">
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Specialty has been pre-selected below based on your symptoms</p>
          </div>
        </div>
      )}

      <Stepper step={step} />

      {step === 1 && (
        <div>
          {step1Loading ? (
            <div className="api-loading"><div className="api-skeleton" /><div className="api-skeleton api-skeleton--short" /></div>
          ) : (
            <>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Select Specialty</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {specialties.map((s) => (
                  <button
                    key={s.id}
                    className={`card-hover rounded-2xl border p-4 text-center transition-all duration-200 ${specialty?.id === s.id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/50' : 'border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118]'}`}
                    onClick={() => setSpecialty(s)}
                    aria-pressed={specialty?.id === s.id}
                  >
                    <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{s.name}</span>
                  </button>
                ))}
              </div>

              <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Available Doctors</p>
              {doctors.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-[#606070]">No doctors available for this specialty.</p>
              ) : (
                <div className="space-y-3">
                  {doctors.map((d) => {
                    const initials = d.full_name?.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'DR'
                    return (
                      <button
                        key={d.user_id}
                        className={`card-hover flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${doctor?.user_id === d.user_id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/50' : 'border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118]'}`}
                        onClick={() => setDoctor(d)}
                        aria-pressed={doctor?.user_id === d.user_id}
                      >
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">{initials}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">Dr. {d.full_name}</p>
                          <p className="text-xs text-slate-400 dark:text-[#606070]">{d.title || specialty?.name} {d.experience_years ? `· ${d.experience_years} yrs exp.` : ''}</p>
                        </div>
                        {d.average_rating && (
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-[#c8c8e0]">
                            <span className="text-amber-500 dark:text-amber-400"><IconStar size={12} /></span>
                            {d.average_rating.toFixed(1)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          <button
            id="bw-next-1"
            className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500"
            disabled={!doctor || !specialty}
            onClick={() => setStep(2)}
          >Continue to Date &amp; Time →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Select a Date</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => {
              const selected = day === d.key
              const isDayOff = doctorWorkDays !== null && !doctorWorkDays.has(dayISOtoDow(d.key))
              let btnClass
              if (isDayOff) {
                btnClass = 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#404050]'
              } else if (selected) {
                btnClass = 'border-indigo-600 bg-indigo-600 text-white'
              } else {
                btnClass = 'border-slate-200 bg-white text-slate-900 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5]'
              }
              let labelCls = 'text-slate-400 dark:text-[#606070]'
              if (isDayOff) labelCls = 'text-slate-300 dark:text-[#404050]'
              else if (selected) labelCls = 'text-white'
              return (
                <button
                  key={d.key}
                  disabled={isDayOff}
                  className={`card-hover min-w-[58px] rounded-xl border px-3 py-2 text-center ${btnClass}`}
                  onClick={() => !isDayOff && setDay(d.key)}
                >
                  <span className={`block text-[11px] ${labelCls}`}>{d.label}</span>
                  <span className="block text-sm font-semibold">{d.date}</span>
                  {isDayOff && <span className="block text-[9px] leading-none mt-0.5 opacity-70">Off</span>}
                </button>
              )
            })}
          </div>

          <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Available Times</p>
          {slotsContent}

          <button
            id="bw-next-2"
            className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500"
            disabled={!time}
            onClick={() => setStep(3)}
          >Review Booking →</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {summaryRows.map((row, idx) => (
              <div key={row.label} className={`flex items-center justify-between py-2 ${idx < summaryRows.length - 1 ? 'border-b border-slate-100 dark:border-[#1c1c25]' : ''}`}>
                <span className="text-xs text-slate-400 dark:text-[#606070]">{row.label}</span>
                <span className={`text-sm ${row.highlight ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-[#9898b0]'}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="bw-chief-complaint" className="block text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5">
              Chief Complaint <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="bw-chief-complaint"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none resize-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
              rows={3}
              placeholder="Describe your main symptoms or reason for visit..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </div>

          {submitError && <p className="api-error__inline mt-2">{submitError}</p>}

          <div className="mt-6 flex gap-3">
            <button id="bw-change-btn" className="flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={() => setStep(1)}>← Change Details</button>
            <button
              id="bw-confirm-btn"
              disabled={submitting}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500"
              onClick={handleConfirm}
            >
              {submitting ? 'Booking...' : 'Confirm Booking ✓'}
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
  currentUser: PropTypes.shape({ id: PropTypes.string }),
  // AI Triage referral
  triageSession: PropTypes.shape({
    id: PropTypes.string.isRequired,
    urgency_level: PropTypes.string,
    suggested_department: PropTypes.string,
    status: PropTypes.string,
  }),
  onClearTriage: PropTypes.func,
  preselectedDepartment: PropTypes.string,
}
