import PropTypes from 'prop-types'

const QUEUE_PATIENTS = [
  {
    id: 'p001',
    queueNo: '01',
    name: 'Jane Doe',
    gender: 'F',
    age: 36,
    appointmentType: 'General Consultation',
    time: '10:00 AM',
    status: 'waiting',
    severeAllergy: true,
  },
  {
    id: 'p002',
    queueNo: '02',
    name: 'Minh Tran',
    gender: 'M',
    age: 45,
    appointmentType: 'Follow-up',
    time: '10:30 AM',
    status: 'in-room',
    severeAllergy: false,
  },
  {
    id: 'p003',
    queueNo: '03',
    name: 'Linh Pham',
    gender: 'F',
    age: 28,
    appointmentType: 'First Visit',
    time: '11:00 AM',
    status: 'waiting',
    severeAllergy: false,
  },
  {
    id: 'p004',
    queueNo: '04',
    name: 'Nam Nguyen',
    gender: 'M',
    age: 62,
    appointmentType: 'Chronic Review',
    time: '11:30 AM',
    status: 'waiting',
    severeAllergy: false,
  },
  {
    id: 'p005',
    queueNo: '05',
    name: 'Thu Le',
    gender: 'F',
    age: 19,
    appointmentType: 'Vaccination',
    time: '2:00 PM',
    status: 'completed',
    severeAllergy: false,
  },
]

const MINI_SCHEDULE = [
  {
    id: 's1',
    time: '08:30',
    label: 'Morning rounds',
    type: 'Ward visit',
    tone: 'scheduled',
  },
  {
    id: 's2',
    time: '10:00',
    label: 'Jane Doe',
    type: 'Consultation',
    tone: 'scheduled',
  },
  {
    id: 's3',
    time: '11:00',
    label: 'Linh Pham',
    type: 'First Visit',
    tone: 'scheduled',
  },
  {
    id: 's4',
    time: '12:30',
    label: 'Lunch Break',
    type: '1 hour',
    tone: 'break',
  },
  {
    id: 's5',
    time: '14:00',
    label: 'Nam Nguyen',
    type: 'Chronic Review',
    tone: 'completed',
  },
]

function StethoscopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M14 12h1" />
      <path d="M10 13a5 5 0 0 0 10 0" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-3z" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FlaskConicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function MessageSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function getQueueDot(status) {
  if (status === 'waiting') return 'bg-amber-400 animate-pulse'
  if (status === 'in-room') return 'bg-emerald-500 animate-pulse'
  return 'bg-slate-300 dark:bg-[#404050]'
}

function getScheduleAccent(tone) {
  if (tone === 'break') return 'bg-amber-300'
  if (tone === 'completed') return 'bg-slate-200 dark:bg-[#252530]'
  return 'bg-indigo-400'
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-[#252530]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">{title}</p>
      <button
        type="button"
        onClick={onAction}
        className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {actionLabel}
      </button>
    </div>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  actionLabel: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
}

export default function DoctorDashboardView({ navigateTo, setSelectedPatient, user }) {
  const doctorName = user?.name || 'Doctor'

  return (
    <div className="relative mx-auto max-w-4xl px-6 py-10">
      <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/25" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-14 top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl dark:bg-teal-900/20" aria-hidden="true" />

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Good morning, {doctorName}.</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Wednesday, March 19 · 8 patients scheduled</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
            onClick={() => navigateTo('patient-queue')}
          >
            <span className="inline-flex h-4 w-4"><StethoscopeIcon /></span>
            <span>Start Consultation</span>
          </button>
        </div>

        <section className="mb-8 grid grid-cols-4 gap-4" aria-label="Daily doctor stats">
          <article className="rounded-2xl border border-slate-200 border-t-2 border-t-indigo-500 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
            <p className="text-[32px] font-bold text-indigo-600 dark:text-indigo-400">8</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">Patients Today</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">3 remaining</p>
          </article>

          <article className="rounded-2xl border border-slate-200 border-t-2 border-t-amber-400 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
            <p className="text-[32px] font-bold text-amber-500 dark:text-amber-400">2</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">In Waiting Room</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Next: Jane Doe</p>
          </article>

          <article className="rounded-2xl border border-slate-200 border-t-2 border-t-emerald-400 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
            <p className="text-[32px] font-bold text-emerald-600 dark:text-emerald-400">5</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">Completed</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Since 8:00 AM</p>
          </article>

          <article className="rounded-2xl border border-slate-200 border-t-2 border-t-rose-400 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80">
            <p className="text-[32px] font-bold text-rose-500 dark:text-rose-400">3</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">Labs Pending Review</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Requires attention</p>
          </article>
        </section>

        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SectionHeader
              title="Today's Queue"
              actionLabel="View All →"
              onAction={() => navigateTo('patient-queue')}
            />

            <div className="flex flex-col gap-3">
              {QUEUE_PATIENTS.map((patient) => (
                <article key={patient.id} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-150 dark:border-[#252530] dark:bg-[#111118]">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 dark:text-[#606070]">{patient.queueNo}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${getQueueDot(patient.status)}`} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                        {patient.age} · {patient.gender}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-[#70708a]">{patient.appointmentType}</span>
                    </div>

                    {patient.severeAllergy && (
                      <div className="mt-1.5 flex items-center gap-1 text-rose-500 dark:text-rose-400">
                        <span className="inline-flex h-3 w-3"><ShieldAlertIcon /></span>
                        <span className="text-[11px]">Severe allergy on file</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">{patient.time}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient)
                        navigateTo('emr')
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                    >
                      <span>Open EMR</span>
                      <span className="inline-flex h-3 w-3"><ArrowRightIcon /></span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <SectionHeader
              title="Today's Schedule"
              actionLabel="Full Calendar →"
              onAction={() => navigateTo('schedule')}
            />

            <div className="flex flex-col gap-2">
              {MINI_SCHEDULE.map((item) => (
                <article key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-[#1c1c25] dark:bg-[#111118]">
                  <span className={`w-[3px] self-stretch rounded-full ${getScheduleAccent(item.tone)}`} aria-hidden="true" />
                  <span className="w-14 shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{item.time}</span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-800 dark:text-[#c8c8e0]">{item.label}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-[#70708a]">{item.type}</span>
                  </span>
                </article>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 border-b border-slate-200 pb-2 dark:border-[#252530]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Quick Actions</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('patient-queue')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-amber-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><FlaskConicalIcon /></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">Review Pending Labs</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('doctor-chat')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-indigo-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><MessageSquareIcon /></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">AI Clinical Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('emr')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-teal-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><FileTextIcon /></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">New Clinical Note</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

DoctorDashboardView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

DoctorDashboardView.defaultProps = {
  user: null,
}
