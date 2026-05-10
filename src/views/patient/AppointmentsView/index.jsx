import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import UpcomingCard from './UpcomingCard'
import PastCard from './PastCard'
import { Toast } from '../../../components/shared/Toast'
import { IconCalendar } from '../../../icons'
import { appointmentApi } from '../../../api/appointment'
import { APPOINTMENT_STATUS, NOTIFICATION_EVENT } from '../../../constants/enums'
import { getTodayISO } from '../../../utils/formatters'

const UPCOMING_STATUSES = new Set([
  APPOINTMENT_STATUS.PENDING_PAYMENT,
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.IN_PROGRESS,
])

const PAST_STATUSES = new Set([
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.DECLINED,
  APPOINTMENT_STATUS.NO_SHOW,
  APPOINTMENT_STATUS.OVERDUE,
])

const OVERDUE_THRESHOLD_MINUTES = 30

function isOverdue(appointment) {
  const now = new Date()
  const dateStr = appointment.appointment_date
  const endTimeStr = appointment.end_time || '23:59:59'
  const endDateTime = new Date(`${dateStr}T${endTimeStr}`)
  return (
    new Date(endDateTime.getTime() + OVERDUE_THRESHOLD_MINUTES * 60 * 1000) < now &&
    !PAST_STATUSES.has(appointment.status)
  )
}

const DAY_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function getWeekDays(aroundISO) {
  const d = new Date(aroundISO + 'T00:00:00')
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(monday)
    nd.setDate(monday.getDate() + i)
    return nd.toISOString().split('T')[0]
  })
}

// ── Week strip ──────────────────────────────────────────────────────────────
function WeekStrip({ weekDays, selectedDay, today, apptDaySet, onSelect }) {
  return (
    <div className="flex items-center justify-between gap-0.5 py-2">
      {weekDays.map((iso) => {
        const d = new Date(iso + 'T00:00:00')
        const dowIdx = (d.getDay() + 6) % 7
        const dayNum = d.getDate()
        const isSel = iso === selectedDay
        const isToday = iso === today
        const hasDot = apptDaySet.has(iso)

            const dayNumColor = isSel ? 'text-white' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-[#c8c8e0]'
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelect(iso)}
                className={[
                  'flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2.5 transition-all duration-150',
                  isSel ? 'bg-indigo-600 shadow-md shadow-indigo-500/25' : 'hover:bg-slate-50 dark:hover:bg-[#16161e]',
                ].join(' ')}
              >
                <span className={`text-base font-bold leading-none ${dayNumColor}`}>{dayNum}</span>
                <span className={[
                  'text-[10px] font-medium leading-none',
                  isSel ? 'text-indigo-200' : 'text-slate-400 dark:text-[#606070]',
                ].join(' ')}>{DAY_ABBR[dowIdx]}</span>
            <span className={['mt-0.5 h-1 w-1 rounded-full', hasDot && !isSel ? 'bg-indigo-500' : 'bg-transparent'].join(' ')} />
          </button>
        )
      })}
    </div>
  )
}
WeekStrip.propTypes = {
  weekDays: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedDay: PropTypes.string.isRequired,
  today: PropTypes.string.isRequired,
  apptDaySet: PropTypes.instanceOf(Set).isRequired,
  onSelect: PropTypes.func.isRequired,
}

// ── Timeline appointment mini-card ─────────────────────────────────────────
function TimelineApptCard({ appt }) {
  const specialty = appt.specialty_name || 'Appointment'
  const doctorName = appt.doctor_name || 'Doctor'
  const initials = doctorName.replace(/^Dr\.\s*/i, '').split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')

  return (
    <div className="mb-2.5 flex items-center justify-between gap-3 rounded-2xl bg-orange-50/80 px-4 py-3 dark:bg-amber-950/25">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{specialty}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{doctorName}</p>
      </div>
      {appt.avatar_url ? (
        <img src={appt.avatar_url} alt={doctorName} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          {initials}
        </div>
      )}
    </div>
  )
}
TimelineApptCard.propTypes = { appt: PropTypes.object.isRequired }

// ── Schedule timeline ───────────────────────────────────────────────────────
function ScheduleTimeline({ appointments, selectedDay, today }) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
          <IconCalendar size={20} />
        </div>
        <p className="text-sm text-slate-400 dark:text-[#606070]">
          {selectedDay === today ? 'Nothing scheduled for today' : 'No appointments on this day'}
        </p>
      </div>
    )
  }

  const getHour = (t) => (t ? Number.parseInt(t.split(':')[0], 10) : 9)
  const apptHours = appointments.map((a) => getHour(a.start_time))
  const minH = Math.max(0, Math.min(...apptHours) - 1)
  const maxH = Math.min(23, Math.max(...apptHours) + 1)
  const hours = Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i)

  const isToday = selectedDay === today
  const nowH = new Date().getHours()
  const nowM = new Date().getMinutes()

  return (
    <div>
      {hours.map((h) => {
        const apptAtHour = appointments.filter((a) => getHour(a.start_time) === h)
        const showNow = isToday && nowH === h
        const nowOffset = Math.round((nowM / 60) * 48)

        return (
          <div key={h} className="flex gap-4">
            <span className="w-11 shrink-0 pt-1 text-right text-[11px] font-mono text-slate-400 dark:text-[#606070]">
              {String(h).padStart(2, '0')}:00
            </span>
            <div className="relative flex-1 border-t border-slate-100 pt-2 pb-1 dark:border-[#1c1c25]">
              {showNow && (
                <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: `${nowOffset}px` }}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="ml-0.5 h-px flex-1 bg-indigo-400/60" />
                </div>
              )}
              {apptAtHour.map((appt) => <TimelineApptCard key={appt.id} appt={appt} />)}
              {apptAtHour.length === 0 && <div className="h-10" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
ScheduleTimeline.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDay: PropTypes.string.isRequired,
  today: PropTypes.string.isRequired,
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AppointmentsView({ setCurrentView, setSelectedAppointment, currentUser, onRateDoctor, wsNotifications }) {
  const today = getTodayISO()
  const [selectedDay, setSelectedDay] = useState(today)
  const [weekDays] = useState(() => getWeekDays(today))
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPast, setShowPast] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [toast, setToast] = useState(null)
  const lastWsNotifId = useRef(null)

  const load = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentApi.getMy()
      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data?.items)) list = data.items
      else if (Array.isArray(data?.appointments)) list = data.appointments
      setAppointments(list.map((a) => {
        const status = a.status?.toLowerCase() ?? a.status
        const paymentStatus = a.payment_status?.toLowerCase() ?? a.paymentStatus?.toLowerCase() ?? a.payment_status ?? a.paymentStatus
        const effectiveStatus = isOverdue({ ...a, status })
          ? APPOINTMENT_STATUS.OVERDUE
          : (status === APPOINTMENT_STATUS.PENDING_PAYMENT && paymentStatus === 'paid'
              ? APPOINTMENT_STATUS.PENDING
              : status)
        return {
          ...a,
          status,
          payment_status: paymentStatus,
          effectiveStatus,
        }
      }))
    } catch (err) {
      setError(err.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { load() }, [load])

  // Refresh + show toast on relevant WS notifications
  useEffect(() => {
    if (!wsNotifications?.length) return
    const latest = wsNotifications[0]
    if (!latest?.id || latest.id === lastWsNotifId.current) return
    lastWsNotifId.current = latest.id
    const eventType = latest?.event_type
    if (
      eventType === NOTIFICATION_EVENT.APPT_CREATED_PATIENT
      || eventType === NOTIFICATION_EVENT.APPT_CONFIRMED
      || eventType === NOTIFICATION_EVENT.PAYMENT_PAID
      || eventType === NOTIFICATION_EVENT.PAYMENT_SUCCESS
    ) {
      load()
      const retry = globalThis.setTimeout(() => load(), 1500)
      if (eventType === NOTIFICATION_EVENT.PAYMENT_PAID || eventType === NOTIFICATION_EVENT.PAYMENT_SUCCESS) {
        setToast('Payment successful. Your appointment status is updating.')
      } else {
        setToast('Booking successful! Your appointment is ready.')
      }
      return () => globalThis.clearTimeout(retry)
    } else if (latest?.event_type === NOTIFICATION_EVENT.APPT_DECLINED) {
      load()
      setToast(latest.body || 'Your appointment was declined by the doctor.')
    }
  }, [wsNotifications, load])

  function handleReschedule(appt) {
    setSelectedAppointment(appt)
    setCurrentView('reschedule')
  }

  async function handleCancel(id, doctorName) {
    try {
      await appointmentApi.cancel(id, '')
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: APPOINTMENT_STATUS.CANCELLED } : a))
      setToast(`Appointment with ${doctorName} has been cancelled.`)
    } catch (err) {
      setToast(err.message || 'Failed to cancel appointment')
    }
  }

  const upcoming = useMemo(
    () => appointments
      .filter((a) => {
        const s = a.effectiveStatus || a.status
        return UPCOMING_STATUSES.has(s) && !isOverdue(a)
      })
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)),
    [appointments]
  )
  const past = useMemo(() => appointments.filter((a) => PAST_STATUSES.has(a.effectiveStatus || a.status)), [appointments])

  const apptDaySet = useMemo(() => {
    const s = new Set()
    upcoming.forEach((a) => { if (a.appointment_date) s.add(a.appointment_date.split('T')[0]) })
    return s
  }, [upcoming])

  const dayAppts = useMemo(
    () => upcoming.filter((a) => a.appointment_date?.split('T')[0] === selectedDay),
    [upcoming, selectedDay]
  )

  const nextAppt = upcoming[0] ?? null

  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const selectedLabel = selectedDay === today
    ? 'Today'
    : new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  if (loading) return <div className="api-loading"><div className="api-skeleton" /><div className="api-skeleton api-skeleton--short" /></div>
  if (error) return (
    <div className="api-error">
      <p>{error}</p>
      <button onClick={load} className="api-error__retry">Retry</button>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 dark:text-[#606070]">{todayLabel}</p>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">
            {showAll ? 'All Appointments' : 'Today'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Week / All toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-[#252530] dark:bg-[#1c1c25]">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className={[
                'rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors',
                showAll === false
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-[#252535] dark:text-[#eeeef5]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-[#80809a] dark:hover:text-[#c8c8e0]',
              ].join(' ')}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={[
                'rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors',
                showAll
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-[#252535] dark:text-[#eeeef5]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-[#80809a] dark:hover:text-[#c8c8e0]',
              ].join(' ')}
            >
              All
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('booking-wizard')}
            className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Book
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          WEEK MODE
      ══════════════════════════════════════════════════════════════ */}
      {!showAll && (
        <>
          {/* ── WEEK STRIP ──────────────────────────────────────────── */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white px-1 dark:border-[#1c1c25] dark:bg-[#111118]">
            <WeekStrip
              weekDays={weekDays}
              selectedDay={selectedDay}
              today={today}
              apptDaySet={apptDaySet}
              onSelect={setSelectedDay}
            />
          </div>

          {/* ── SCHEDULE ────────────────────────────────────────────── */}
          <section className="mt-7">
            <p className="mb-4 text-lg font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">
              Schedule{' '}
              <span className="font-normal text-slate-400 dark:text-[#606070]">{selectedLabel}</span>
            </p>
            <ScheduleTimeline appointments={dayAppts} selectedDay={selectedDay} today={today} />
          </section>

          {/* ── REMINDER ────────────────────────────────────────────── */}
          {nextAppt && (
            <section className="mt-8">
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Reminder</p>
              <p className="mt-0.5 mb-3 text-xs text-slate-400 dark:text-[#606070]">Don&apos;t forget your upcoming appointment</p>
              <UpcomingCard
                appt={nextAppt}
                variant="reminder"
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            </section>
          )}

          {/* ── EMPTY STATE ─────────────────────────────────────────── */}
          {upcoming.length === 0 && (
            <div className="mt-8 py-8 text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
                <IconCalendar size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#70708a]">No upcoming appointments</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Book a new visit whenever you&apos;re ready.</p>
              <button
                className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]"
                onClick={() => setCurrentView('booking-wizard')}
              >
                Book Appointment
              </button>
            </div>
          )}

          {/* ── PAST VISITS ─────────────────────────────────────────── */}
          {past.length > 0 && (
            <section className="mt-10">
              <button
                type="button"
                className="flex w-full items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]"
                onClick={() => setShowPast((p) => !p)}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">
                  Past Visits ({past.length})
                </p>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-slate-400 transition-transform duration-200 ${showPast ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showPast && (
                <div className="mt-3 space-y-2.5">
                  {past.map((appt) => (
                    <PastCard
                      key={appt.id}
                      appt={appt}
                      onRate={(appt.effectiveStatus || appt.status) === APPOINTMENT_STATUS.COMPLETED ? () => onRateDoctor?.(appt) : undefined}
                      onBookAgain={(dept) => setCurrentView('booking-wizard', { preselectedDepartment: dept })}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ALL MODE — flat list of every appointment
      ══════════════════════════════════════════════════════════════ */}
      {showAll && (
        <div className="mt-6 space-y-8">

          {/* ── Upcoming ──────────────────────────────────────────────── */}
          <section>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">
              Upcoming ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-[#252530]">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
                  <IconCalendar size={18} />
                </div>
                <p className="text-sm text-slate-400 dark:text-[#606070]">No upcoming appointments</p>
                <button
                  className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                  onClick={() => setCurrentView('booking-wizard')}
                >
                  Book now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <UpcomingCard
                    key={appt.id}
                    appt={appt}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onViewTriage={(id) => setCurrentView('symptom-checker', { triageSessionId: id })}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Past ──────────────────────────────────────────────────── */}
          {past.length > 0 && (
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">
                Past Visits ({past.length})
              </p>
              <div className="space-y-2.5">
                {past.map((appt) => (
                  <PastCard
                    key={appt.id}
                    appt={appt}
                    onRate={(appt.effectiveStatus || appt.status) === APPOINTMENT_STATUS.COMPLETED ? () => onRateDoctor?.(appt) : undefined}
                    onBookAgain={(dept) => setCurrentView('booking-wizard', { preselectedDepartment: dept })}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

AppointmentsView.propTypes = {
  currentUser: PropTypes.shape({ id: PropTypes.string }),
  setCurrentView: PropTypes.func.isRequired,
  setSelectedAppointment: PropTypes.func.isRequired,
  onRateDoctor: PropTypes.func,
  wsNotifications: PropTypes.arrayOf(PropTypes.object),
}

AppointmentsView.defaultProps = {
  currentUser: null,
  onRateDoctor: null,
}
