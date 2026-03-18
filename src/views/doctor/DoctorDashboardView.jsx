import PropTypes from 'prop-types'

const PATIENTS = [
  {
    id: 1,
    name: 'Jane Doe',
    age: 29,
    status: 'Follow-up due',
    risk: 'moderate',
  },
  {
    id: 2,
    name: 'Nguyen Minh Anh',
    age: 42,
    status: 'New lab alerts',
    risk: 'high',
  },
  {
    id: 3,
    name: 'Trinh Bao Vy',
    age: 35,
    status: 'Stable',
    risk: 'low',
  },
]

function getRiskStyles(risk) {
  if (risk === 'high') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
  if (risk === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
}

export default function DashboardView({ navigateTo, selectedPatient, setSelectedPatient, user }) {
  const doctorName = user?.name || 'Doctor'

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="view-enter mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Good morning, {doctorName}.</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Manage appointments, triage alerts, and patient follow-ups.</p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          onClick={() => navigateTo('patient-queue')}
        >
          Open Appointment Queue
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="card-hover view-enter rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Pending Appointments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#eeeef5]">18</p>
        </article>

        <article className="card-hover view-enter rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Lab Alerts</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#eeeef5]">6</p>
        </article>

        <article className="card-hover view-enter rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Urgent Cases</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#eeeef5]">2</p>
        </article>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eeeef5]">Priority Patients</h2>
          {selectedPatient && <span className="text-xs text-indigo-600 dark:text-indigo-400">Selected: {selectedPatient.name}</span>}
        </div>

        <div className="flex flex-col gap-3">
          {PATIENTS.map((patient, index) => (
            <button
              key={patient.id}
              type="button"
              className="card-hover view-enter flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-[#252530] dark:bg-[#16161e] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: 'both' }}
              onClick={() => setSelectedPatient(patient)}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Age {patient.age} · {patient.status}</p>
              </div>
              <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getRiskStyles(patient.risk)}`}>
                {patient.risk}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

DashboardView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  selectedPatient: PropTypes.shape({
    name: PropTypes.string,
  }),
  setSelectedPatient: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
}

DashboardView.defaultProps = {
  selectedPatient: null,
  user: null,
}
