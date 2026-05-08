import { useMemo, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { doctorApi } from '../../api/doctor'
import { appointmentApi } from '../../api/appointment'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

const WORKING_DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const TIME_OPTIONS = Array.from({ length: 27 }, (_, index) => {
  const totalMinutes = (7 * 60) + (index * 30)
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const m = String(totalMinutes % 60).padStart(2, '0')
  return `${h}:${m}`
})

const DEFAULT_WORKING_SCHEDULE = {
  mon: { enabled: true, start: '08:00', end: '17:00' },
  tue: { enabled: true, start: '08:00', end: '17:00' },
  wed: { enabled: true, start: '08:00', end: '17:00' },
  thu: { enabled: true, start: '08:00', end: '17:00' },
  fri: { enabled: true, start: '08:00', end: '17:00' },
  sat: { enabled: false, start: '08:00', end: '12:00' },
  sun: { enabled: false, start: '08:00', end: '12:00' },
}

const DAY_KEY_TO_FULL = {
  mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday',
  fri: 'friday', sat: 'saturday', sun: 'sunday',
}
const DAY_FULL_TO_KEY = Object.fromEntries(Object.entries(DAY_KEY_TO_FULL).map(([k, v]) => [v, k]))
const DAY_KEY_TO_INDEX = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
}
const DAY_INDEX_TO_KEY = {
  0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun',
}
const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_KEYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function makeWeekDays(offsetWeeks) {
  const today = new Date()
  const todayISO = isoDate(today)
  const dow = today.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + offsetWeeks * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = isoDate(d)
    return {
      key: DAY_KEYS_ORDER[i],
      name: DAY_NAMES[i],
      date: d.getDate(),
      iso,
      isToday: iso === todayISO,
    }
  })
}

function getInitials(name) {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function mapScheduleToState(schedule) {
  const result = Object.fromEntries(
    Object.entries(DEFAULT_WORKING_SCHEDULE).map(([k, v]) => [k, { ...v, enabled: false }]),
  )
  let items = []
  if (Array.isArray(schedule)) {
    items = schedule
  } else if (Array.isArray(schedule?.working_days)) {
    items = schedule.working_days
  }

  if (items.length === 0) return result

  for (const wd of items) {
    let key = null
    if (typeof wd.day_of_week === 'number') {
      key = DAY_INDEX_TO_KEY[wd.day_of_week]
    } else if (typeof wd.day_of_week === 'string') {
      const normalized = wd.day_of_week.toLowerCase()
      key = DAY_FULL_TO_KEY[normalized] ?? DAY_INDEX_TO_KEY[Number(normalized)] ?? normalized
    }

    if (key) {
      result[key] = { enabled: true, start: (wd.start_time ?? '08:00').slice(0, 5), end: (wd.end_time ?? '17:00').slice(0, 5) }
    }
  }
  return result
}

function mapApptToEvent(appt) {
  const name = appt.patient_name ?? 'Patient'
  return {
    id: appt.id,
    time: (appt.start_time ?? '00:00').slice(0, 5),
    type: appt.specialty_name ?? 'Consultation',
    duration: appt.duration_minutes ? `${appt.duration_minutes}min` : '30min',
    patient: {
      id: appt.patient_id,
      appointment_id: appt.id,
      status: appt.status,
      name,
      initials: getInitials(name),
      specialty: appt.specialty_name ?? '',
    },
  }
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function formatHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}

function getEventTone(type) {
  if (type === 'Consultation') {
    return {
      card: 'border border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/50',
      accent: 'bg-indigo-500',
      title: 'text-indigo-700 dark:text-indigo-300',
      sub: 'text-indigo-600/90 dark:text-indigo-300/80',
    }
  }

  if (type === 'Follow-up') {
    return {
      card: 'border border-teal-200 bg-teal-50 dark:border-teal-900/40 dark:bg-teal-950/40',
      accent: 'bg-teal-500',
      title: 'text-teal-700 dark:text-teal-300',
      sub: 'text-teal-700/80 dark:text-teal-300/80',
    }
  }

  if (type === 'First Visit') {
    return {
      card: 'border border-violet-200 bg-violet-50 dark:border-violet-900/40 dark:bg-violet-950/40',
      accent: 'bg-violet-500',
      title: 'text-violet-700 dark:text-violet-300',
      sub: 'text-violet-700/80 dark:text-violet-300/80',
    }
  }

  if (type === 'Chronic Review') {
    return {
      card: 'border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
      accent: 'bg-amber-400',
      title: 'text-amber-700 dark:text-amber-300',
      sub: 'text-amber-700/80 dark:text-amber-300/80',
    }
  }

  return {
    card: 'border border-slate-200 bg-slate-50 dark:border-[#252530] dark:bg-[#16161e]',
    accent: 'bg-slate-300 dark:bg-[#404050]',
    title: 'text-slate-700 dark:text-[#c8c8e0]',
    sub: 'text-slate-500 dark:text-[#70708a]',
  }
}

function isHourMatch(hour, time) {
  const [hourPart] = time.split(':')
  return Number(hourPart) === hour
}

function toMinutes(hhmm) {
  const [h, m] = (hhmm || '').split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return (h * 60) + m
}

export default function ScheduleView({ navigateTo, setSelectedPatient, user }) {
  const [activeTab, setActiveTab] = useState('appointments')
  const [workingSchedule, setWorkingSchedule] = useState(DEFAULT_WORKING_SCHEDULE)
  const [daysOff, setDaysOff] = useState([])
  const [newDayOff, setNewDayOff] = useState('')
  const [saveToast, setSaveToast] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()))

  // Keep selectedDate in sync with the week being viewed
  const weekDays = useMemo(() => makeWeekDays(weekOffset), [weekOffset])
  useEffect(() => {
    setSelectedDate(weekDays.find((d) => d.isToday)?.iso ?? weekDays[0]?.iso ?? selectedDate)
  }, [weekOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  const [dayAppts, setDayAppts] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(false)

  const dayEvents = useMemo(() => dayAppts.map(mapApptToEvent), [dayAppts])

  const upcomingAppts = useMemo(() => {
    const now = new Date().toTimeString().slice(0, 5)
    return dayAppts
      .filter((a) => (a.start_time ?? '00:00') >= now)
      .slice(0, 5)
  }, [dayAppts])

  const loadAppts = useCallback(async () => {
    if (!user?.id) return
    setLoadingAppts(true)
    try {
      const data = await appointmentApi.getByDoctor(user.id, { date_from: selectedDate, date_to: selectedDate })
      const raw = Array.isArray(data) ? data : (data?.appointments ?? [])
      // Filter client-side in case the backend does not honour the date param
      const list = raw.filter((a) => {
        const d = a.appointment_date ?? a.date ?? ''
        return !d || d.slice(0, 10) === selectedDate
      })
      setDayAppts(list)
    } catch {
      setDayAppts([])
    } finally {
      setLoadingAppts(false)
    }
  }, [user?.id, selectedDate])

  const loadSchedule = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await doctorApi.getSchedule(user.id)
      setWorkingSchedule(mapScheduleToState(data))
      const off = Array.isArray(data?.days_off) ? data.days_off : []
      setDaysOff(off)
    } catch { /* use defaults */ }
  }, [user?.id])

  useEffect(() => { if (activeTab === 'appointments') loadAppts() }, [loadAppts, activeTab])
  useEffect(() => { if (activeTab === 'working') loadSchedule() }, [loadSchedule, activeTab])

  const specialtyLabel = user?.specialty ?? 'Clinical Practice'

  const normalizedDaysOff = useMemo(() => (
    [...daysOff].sort((a, b) => a.localeCompare(b))
  ), [daysOff])

  const handleWorkingToggle = (dayKey) => {
    setWorkingSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled },
    }))
  }

  const handleWorkingTimeChange = (dayKey, field, value) => {
    setWorkingSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }))
  }

  const handleAddDayOff = async () => {
    if (!newDayOff || !user?.id) return
    try {
      await doctorApi.addDayOff(user.id, { date: newDayOff })
      setDaysOff((prev) => (prev.includes(newDayOff) ? prev : [...prev, newDayOff]))
      setNewDayOff('')
    } catch { /* ignore */ }
  }

  const handleRemoveDayOff = async (day) => {
    if (!user?.id) return
    try {
      await doctorApi.removeDayOff(user.id, day)
      setDaysOff((prev) => prev.filter((d) => d !== day))
    } catch { /* ignore */ }
  }

  const handleSaveWorkingSchedule = async () => {
    if (!user?.id) return
    const enabledDays = Object.entries(workingSchedule).filter(([, v]) => v.enabled)

    if (enabledDays.length === 0) {
      setSaveToast('Please enable at least one working day')
      globalThis.setTimeout(() => setSaveToast(''), 2200)
      return
    }

    for (const [dayKey, dayState] of enabledDays) {
      const start = toMinutes(dayState.start)
      const end = toMinutes(dayState.end)
      if (start == null || end == null || start >= end) {
        const dayLabel = WORKING_DAYS.find((d) => d.key === dayKey)?.label ?? dayKey
        setSaveToast(`Invalid hours on ${dayLabel}: start must be earlier than end`)
        globalThis.setTimeout(() => setSaveToast(''), 3000)
        return
      }
    }

    try {
      const schedules = enabledDays
        .map(([k, v]) => ({
          doctor_id: user.id,
          day_of_week: DAY_KEY_TO_INDEX[k],
          start_time: v.start.length === 5 ? v.start + ':00' : v.start,
          end_time: v.end.length === 5 ? v.end + ':00' : v.end,
          slot_duration_minutes: 30,
        }))
      await doctorApi.setSchedule(user.id, schedules)
      setSaveToast('Working hours saved')
    } catch (err) {
      setSaveToast(err?.message || 'Failed to save')
    }
    globalThis.setTimeout(() => setSaveToast(''), 2200)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigateTo('dashboard')}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-[#606070] dark:hover:text-indigo-400"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><polyline points="15 18 9 12 15 6" /></svg>
        Dashboard
      </button>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Schedule</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {specialtyLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]"
            aria-label="Previous week"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronLeftIcon /></span>
          </button>

          <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-400">{weekOffset === 0 ? 'This Week' : weekDays[0].iso.slice(0, 7)}</span>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]"
            aria-label="Next week"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronRightIcon /></span>
          </button>

          <span className="h-9 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] active:scale-[0.98]"
            aria-label="View all appointments"
            onClick={() => navigateTo('patient-queue')}
          >
            <span className="inline-flex h-4 w-4"><ListIcon /></span>
            <span>View All</span>
          </button>
        </div>
      </div>

      <div className="sched-work-tabs" role="tablist" aria-label="Schedule tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'appointments'}
          className={`sched-work-tab ${activeTab === 'appointments' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointment Schedule
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'working'}
          className={`sched-work-tab ${activeTab === 'working' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('working')}
        >
          Working Hours
        </button>
      </div>

      {activeTab === 'working' && (
        <section className="sched-work-panel">
          <h2 className="sched-work-title">Working Hours Configuration</h2>

          <div className="sched-work-grid" aria-label="Working hours by day">
            {WORKING_DAYS.map((day) => {
              const state = workingSchedule[day.key]
              return (
                <div key={day.key} className="sched-work-row">
                  <label className="sched-work-toggle-wrap">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={() => handleWorkingToggle(day.key)}
                    />
                    <span>{day.label}</span>
                  </label>

                  {state.enabled ? (
                    <div className="sched-work-time-wrap">
                      <select
                        value={state.start}
                        onChange={(e) => handleWorkingTimeChange(day.key, 'start', e.target.value)}
                        className="sched-work-select"
                        aria-label={`${day.label} start time`}
                      >
                        {TIME_OPTIONS.map((timeOption) => (
                          <option key={`${day.key}-start-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                      <span className="sched-work-sep">-</span>
                      <select
                        value={state.end}
                        onChange={(e) => handleWorkingTimeChange(day.key, 'end', e.target.value)}
                        className="sched-work-select"
                        aria-label={`${day.label} end time`}
                      >
                        {TIME_OPTIONS.map((timeOption) => (
                          <option key={`${day.key}-end-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="sched-work-off-label">Off</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="sched-work-days-off">
            <p className="sched-work-subtitle">Days Off</p>

            <div className="sched-work-days-off-input">
              <input
                type="date"
                value={newDayOff}
                onChange={(e) => setNewDayOff(e.target.value)}
                className="sched-work-date-input"
              />
              <button
                type="button"
                className="sched-work-add-btn"
                onClick={handleAddDayOff}
              >
                Add
              </button>
            </div>

            <div className="sched-work-days-off-list">
              {normalizedDaysOff.length === 0 && <p className="sched-work-empty">No days off added yet.</p>}

              {normalizedDaysOff.map((day) => (
                <div key={day} className="sched-work-day-chip">
                  <span>{day}</span>
                  <button
                    type="button"
                    className="sched-work-remove-btn"
                    onClick={() => handleRemoveDayOff(day)}
                    aria-label={`Remove ${day}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sched-work-actions">
            <button
              type="button"
              className="sched-work-save-btn"
              onClick={handleSaveWorkingSchedule}
            >
              Save Changes
            </button>

            {saveToast && <span className="sched-work-toast">{saveToast}</span>}
          </div>
        </section>
      )}

      {activeTab === 'appointments' && (
        <>

      <div className="mb-4 grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = day.iso === selectedDate
          return (
            <button
              key={day.key}
              type="button"
              className="py-2 text-center w-full"
              onClick={() => setSelectedDate(day.iso)}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#606070]">{day.name}</p>

              {isSelected ? (
                <span className="mx-auto mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                  {day.date}
                </span>
              ) : (
                <p className={`mt-0.5 text-lg font-bold ${day.isToday ? 'text-indigo-500' : 'text-slate-800 dark:text-[#c8c8e0]'}`}>{day.date}</p>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="relative">
            {HOURS.map((hour) => {
              const hourEvents = dayEvents.filter((event) => isHourMatch(hour, event.time))

              return (
                <div key={hour} className="mb-1 flex min-h-[64px] items-start gap-3">
                  <div className="w-16 shrink-0 pt-1 text-right text-[11px] font-medium text-slate-400 dark:text-[#606070]">
                    {formatHour(hour)}
                  </div>

                  <div className="relative flex-1 border-t border-slate-100 pt-2 dark:border-[#1c1c25]">
                    {hourEvents.map((event) => {
                      const tone = getEventTone(event.type)
                      const isBreak = event.type === 'Break'
                      const title = isBreak ? event.label : event.patient.name
                      let subtitle = `${event.type} · ${event.duration}`
                      if (isBreak) subtitle = event.duration
                      if (event.bookingStatus === 'pending') subtitle = `${event.type} · Awaiting confirmation`

                      const defaultClasses = `mb-1 flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${tone.card} ${isBreak ? '' : 'card-hover cursor-pointer'}`
                      const pendingClasses = 'mb-1 flex w-full items-start gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-left transition-all duration-200 dark:border-amber-800/60 dark:bg-amber-950/30'
                      const cardClasses = event.bookingStatus === 'pending' ? pendingClasses : defaultClasses

                      return (
                        <button
                          key={event.id}
                          type="button"
                          className={cardClasses}
                          onClick={() => {
                            if (isBreak) return
                            setSelectedPatient(event.patient)
                            navigateTo('emr')
                          }}
                          disabled={isBreak}
                        >
                          <span className={`w-1 shrink-0 self-stretch rounded-full ${tone.accent}`} aria-hidden="true" />
                          <span>
                            <span className={`block text-sm font-semibold ${tone.title}`}>{title}</span>
                            <span className={`mt-0.5 block text-xs ${tone.sub}`}>{subtitle}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="w-64 shrink-0">
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Today at a Glance</p>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-[#252530] dark:bg-[#111118]">
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-[#1c1c25]">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">First patient</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{dayAppts[0]?.start_time ?? '–'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-[#1c1c25]">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">Last patient</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{dayAppts.at(-1)?.start_time ?? '–'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">Total patients</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{loadingAppts ? '…' : dayAppts.length}</span>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Upcoming</p>

            <div className="flex flex-col gap-2">
              {upcomingAppts.length === 0 && !loadingAppts && (
                <p className="text-xs text-slate-400 dark:text-[#606070]">No upcoming appointments.</p>
              )}
              {upcomingAppts.map((appt) => (
                <article key={appt.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-[#1c1c25] dark:bg-[#111118]">
                  <span className="w-[3px] shrink-0 self-stretch rounded-full bg-indigo-400" aria-hidden="true" />
                  <span className="w-14 shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{appt.start_time}</span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-800 dark:text-[#c8c8e0]">{appt.patient_name ?? 'Patient'}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-[#70708a]">{appt.specialty_name ?? ''}</span>
                  </span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
        </>
      )}
    </div>
  )
}

ScheduleView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

ScheduleView.defaultProps = {
  user: null,
}
