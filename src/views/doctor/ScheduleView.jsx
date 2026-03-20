import PropTypes from 'prop-types'

const WEEK_DAYS = [
  { key: 'mon', name: 'MON', date: 17, count: 2 },
  { key: 'tue', name: 'TUE', date: 18, count: 2 },
  { key: 'wed', name: 'WED', date: 19, count: 8, isToday: true },
  { key: 'thu', name: 'THU', date: 20, count: 2 },
  { key: 'fri', name: 'FRI', date: 21, count: 1 },
  { key: 'sat', name: 'SAT', date: 22, count: 0, off: true },
  { key: 'sun', name: 'SUN', date: 23, count: 0, off: true },
]

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

const EVENTS_BY_DAY = {
  mon: [
    {
      id: 'm1',
      time: '10:00',
      type: 'Consultation',
      duration: '30min',
      patient: { id: 'PT-2024-0142', name: 'Jane Doe', initials: 'JD', specialty: 'General Consultation' },
    },
    {
      id: 'm2',
      time: '14:30',
      type: 'Follow-up',
      duration: '30min',
      patient: { id: 'PT-2024-0098', name: 'Minh Tran', initials: 'MT', specialty: 'Follow-up' },
    },
  ],
  tue: [
    {
      id: 't1',
      time: '11:00',
      type: 'First Visit',
      duration: '45min',
      patient: { id: 'PT-2024-0201', name: 'Linh Pham', initials: 'LP', specialty: 'First Visit' },
    },
    {
      id: 't2',
      time: '15:00',
      type: 'Follow-up',
      duration: '30min',
      patient: { id: 'PT-2024-0094', name: 'Mai Thi', initials: 'MT', specialty: 'Follow-up' },
    },
  ],
  wed: [
    { id: 'w1', time: '08:00', type: 'Break', duration: '30min', label: 'Morning Rounds' },
    { id: 'w2', time: '08:30', type: 'Break', duration: '30min', label: 'Admin & Notes' },
    {
      id: 'w3',
      time: '10:00',
      type: 'Consultation',
      duration: '30min',
      patient: { id: 'PT-2024-0142', name: 'Jane Doe', initials: 'JD', specialty: 'General Consultation' },
    },
    {
      id: 'w4',
      time: '10:30',
      type: 'Follow-up',
      duration: '30min',
      patient: { id: 'PT-2024-0098', name: 'Minh Tran', initials: 'MT', specialty: 'Follow-up' },
    },
    {
      id: 'w5',
      time: '11:00',
      type: 'First Visit',
      duration: '45min',
      patient: { id: 'PT-2024-0201', name: 'Linh Pham', initials: 'LP', specialty: 'First Visit' },
    },
    {
      id: 'w6',
      time: '11:30',
      type: 'Chronic Review',
      duration: '30min',
      patient: { id: 'PT-2024-0055', name: 'Nam Nguyen', initials: 'NN', specialty: 'Chronic Review' },
    },
    { id: 'w7', time: '12:00', type: 'Break', duration: '60min', label: 'Lunch Break' },
    {
      id: 'w8',
      time: '14:00',
      type: 'Follow-up',
      duration: '15min',
      patient: { id: 'PT-2024-0310', name: 'Thu Le', initials: 'TL', specialty: 'Vaccination' },
    },
    {
      id: 'w9',
      time: '14:30',
      type: 'Consultation',
      duration: '30min',
      patient: { id: 'PT-2024-0187', name: 'Bao Nguyen', initials: 'BN', specialty: 'Lab Review' },
    },
    {
      id: 'w10',
      time: '15:00',
      type: 'Follow-up',
      duration: '30min',
      patient: { id: 'PT-2024-0094', name: 'Mai Thi', initials: 'MT', specialty: 'Follow-up' },
    },
    {
      id: 'w11',
      time: '15:30',
      type: 'Chronic Review',
      duration: '30min',
      patient: { id: 'PT-2024-0033', name: 'Duc Pham', initials: 'DP', specialty: 'Chronic Review' },
    },
  ],
  thu: [
    {
      id: 'th1',
      time: '10:30',
      type: 'Consultation',
      duration: '30min',
      patient: { id: 'PT-2024-0402', name: 'Trang Hoang', initials: 'TH', specialty: 'Consultation' },
    },
    {
      id: 'th2',
      time: '14:00',
      type: 'Follow-up',
      duration: '30min',
      patient: { id: 'PT-2024-0403', name: 'Quang Le', initials: 'QL', specialty: 'Follow-up' },
    },
  ],
  fri: [
    {
      id: 'f1',
      time: '11:30',
      type: 'Chronic Review',
      duration: '30min',
      patient: { id: 'PT-2024-0404', name: 'My Tran', initials: 'MT', specialty: 'Chronic Review' },
    },
  ],
  sat: [],
  sun: [],
}

const UPCOMING = [
  { id: 'u1', time: '10:00', name: 'Jane Doe', type: 'Consultation' },
  { id: 'u2', time: '10:30', name: 'Minh Tran', type: 'Follow-up' },
  { id: 'u3', time: '11:00', name: 'Linh Pham', type: 'First Visit' },
]

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

function to24HourTime(timeLabel) {
  const [time, period] = timeLabel.split(' ')
  const [h, m] = time.split(':')
  let hour = Number(h)

  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  const paddedHour = String(hour).padStart(2, '0')
  return `${paddedHour}:${m}`
}

export default function ScheduleView({ navigateTo, setSelectedPatient, user, bookings }) {
  const activeDay = 'wed'
  const bookingEvents = bookings
    .filter((booking) => booking.dayKey === activeDay && (booking.status === 'pending' || booking.status === 'confirmed'))
    .map((booking) => ({
      id: `bk-${booking.id}`,
      bookingStatus: booking.status,
      duration: '30min',
      patient: {
        id: booking.patientId,
        initials: 'JD',
        name: booking.patientName,
        specialty: booking.specialtyLabel,
      },
      time: to24HourTime(booking.timeLabel),
      type: booking.status === 'pending' ? 'Booking Request' : 'Consultation',
    }))

  const dayEvents = [...bookingEvents, ...(EVENTS_BY_DAY[activeDay] || [])]
  const specialtyLabel = user?.specialty || 'Clinical Practice'

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Schedule</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">March 2025 · {specialtyLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]"
            aria-label="Previous week"
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronLeftIcon /></span>
          </button>

          <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-400">This Week</span>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]"
            aria-label="Next week"
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronRightIcon /></span>
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => (
          <div key={day.key} className="py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#606070]">{day.name}</p>

            {day.isToday ? (
              <span className="mx-auto mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                {day.date}
              </span>
            ) : (
              <p className="mt-0.5 text-lg font-bold text-slate-800 dark:text-[#c8c8e0]">{day.date}</p>
            )}

            {day.off ? (
              <p className="mt-1 text-[10px] text-slate-400 dark:text-[#606070]">Off</p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-400 dark:text-[#606070]">{day.count > 0 ? `${day.count} pts` : ''}</p>
            )}
          </div>
        ))}
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
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">10:00 AM</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-[#1c1c25]">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">Last patient</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">3:30 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-[#1c1c25]">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">Total patients</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">8</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-500 dark:text-[#70708a]">Break time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">1.5 hrs</span>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Upcoming</p>

            <div className="flex flex-col gap-2">
              {UPCOMING.map((item) => (
                <article key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-[#1c1c25] dark:bg-[#111118]">
                  <span className="w-[3px] shrink-0 self-stretch rounded-full bg-indigo-400" aria-hidden="true" />
                  <span className="w-14 shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{item.time}</span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-800 dark:text-[#c8c8e0]">{item.name}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-[#70708a]">{item.type}</span>
                  </span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

ScheduleView.propTypes = {
  bookings: PropTypes.arrayOf(PropTypes.shape({
    dayKey: PropTypes.string,
    id: PropTypes.string,
    patientId: PropTypes.string,
    patientName: PropTypes.string,
    specialtyLabel: PropTypes.string,
    status: PropTypes.string,
    timeLabel: PropTypes.string,
  })),
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

ScheduleView.defaultProps = {
  bookings: [],
  user: null,
}
