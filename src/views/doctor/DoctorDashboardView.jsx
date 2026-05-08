import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { appointmentApi } from '../../api/appointment'
import { APPOINTMENT_STATUS } from '../../constants/enums'
import { SkeletonBlock } from '../../components/shared/LoadingSpinner'
import { EmptyState } from '../../components/shared/EmptyState'
import {
  IconStethoscope, IconArrowRight, IconShieldAlert,
  IconFlask, IconMessageSquare, IconFileText,
} from '../../icons'

function getQueueDot(status) {
  if (status === 'waiting') return 'bg-amber-400 animate-pulse'
  if (status === 'confirmed') return 'bg-blue-400 animate-pulse'
  if (status === 'in-room') return 'bg-emerald-500 animate-pulse'
  if (status === 'overdue') return 'bg-rose-400 animate-pulse'
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
  const doctorName = user?.full_name ?? user?.name ?? 'Doctor'
  const [stats, setStats] = useState({ total: 0, waiting: 0, in_progress: 0, completed: 0 })
  const [queue, setQueue] = useState([])
  const [todayAppts, setTodayAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setLoadError(null)
    try {
      const [statsData, queueData, allAppts] = await Promise.all([
        appointmentApi.getStats({ doctor_id: user.id, range: 'today' }).catch(() => ({})),
        appointmentApi.getQueue(user.id).catch(() => []),
        appointmentApi.getByDoctor(user.id, { date_from: new Date().toISOString().slice(0, 10), date_to: new Date().toISOString().slice(0, 10) }).catch(() => []),
      ])
      setStats({
        total: statsData.total_appointments ?? statsData.total ?? 0,
        waiting: (statsData.pending_appointments ?? 0) + (statsData.confirmed_appointments ?? 0),
        in_progress: statsData.in_progress ?? 0,
        completed: statsData.completed_appointments ?? statsData.completed ?? 0,
      })
      const queueArr = Array.isArray(queueData) ? queueData : (queueData?.appointments ?? [])
      const seen = new Set()
      const deduped = queueArr.filter((a) => {
        if (a.id == null) return true
        if (seen.has(a.id)) return false
        seen.add(a.id)
        return true
      })
      const allArr = Array.isArray(allAppts) ? allAppts : (allAppts?.appointments ?? [])
      const seen2 = new Set()
      const dedupedAll = allArr.filter((a) => {
        if (a.id == null) return true
        if (seen2.has(a.id)) return false
        seen2.add(a.id)
        return true
      })
      setQueue(deduped.slice(0, 5))
      setTodayAppts(dedupedAll.slice(0, 5))
    } catch (err) {
      setLoadError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="app-root relative mx-auto max-w-4xl px-6 py-10">
      <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/25" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-14 top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl dark:bg-teal-900/20" aria-hidden="true" />

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Good morning, <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">{doctorName}.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#8a8aa0]">
              {today} <span className="mx-1.5 opacity-50">•</span>
              <span className="font-medium text-slate-600 dark:text-[#a0a0b8]">{loading ? '...' : `${stats.total} appointments`}</span> scheduled today
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
            onClick={() => navigateTo('patient-queue')}
          >
            <span className="inline-flex h-4 w-4"><IconStethoscope /></span>
            <span>Start Consultation</span>
          </button>
        </div>

        <section className="mb-8 grid grid-cols-4 gap-4" aria-label="Daily doctor stats">
          <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] dark:border-[#252530] dark:bg-[#111118]/80 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-indigo-50 opacity-60 blur-3xl transition-all group-hover:bg-indigo-100 group-hover:opacity-100 dark:bg-indigo-900/30 dark:group-hover:bg-indigo-900/50" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-[32px] font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{loading ? '–' : stats.total}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">Patients Today</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">{loading ? '...' : `${Math.max(0, stats.total - stats.completed)} remaining today`}</p>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] dark:border-[#252530] dark:bg-[#111118]/80 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-50 opacity-60 blur-3xl transition-all group-hover:bg-amber-100 group-hover:opacity-100 dark:bg-amber-900/30 dark:group-hover:bg-amber-900/50" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <p className="text-[32px] font-extrabold tracking-tight text-amber-500 dark:text-amber-400">{loading ? '–' : stats.waiting}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">In Waiting Room</p>
              <p className="mt-1 truncate text-xs text-slate-400 dark:text-[#606070]">{queue[0]?.patient_name ? `Next: ${queue[0].patient_name}` : 'No one waiting'}</p>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] dark:border-[#252530] dark:bg-[#111118]/80 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-50 opacity-60 blur-3xl transition-all group-hover:bg-emerald-100 group-hover:opacity-100 dark:bg-emerald-900/30 dark:group-hover:bg-emerald-900/50" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-[32px] font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{loading ? '–' : stats.completed}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">Completed</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Since midnight</p>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] dark:border-[#252530] dark:bg-[#111118]/80 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-rose-50 opacity-60 blur-3xl transition-all group-hover:bg-rose-100 group-hover:opacity-100 dark:bg-rose-900/30 dark:group-hover:bg-rose-900/50" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <p className="text-[32px] font-extrabold tracking-tight text-rose-500 dark:text-rose-400">{loading ? '–' : stats.in_progress}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-[#70708a]">In Progress</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Active sessions</p>
            </div>
          </article>
        </section>

        {loadError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/30">
            <span className="text-sm text-rose-700 dark:text-rose-300">{loadError}</span>
            <button type="button" onClick={load} className="ml-auto shrink-0 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30">Retry</button>
          </div>
        )}

        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SectionHeader
              title="Today's Queue"
              actionLabel="View All →"
              onAction={() => navigateTo('patient-queue')}
            />

            <div className="flex flex-col gap-3">
              {loading && <SkeletonBlock className="h-20 w-full" />}
              {!loading && queue.length === 0 && (
                <EmptyState
                  iconEmoji="📋"
                  title="No patients in queue"
                  description="Patients will appear here when they check in"
                />
              )}
              {queue.map((patient, idx) => {
                if (!patient.id && idx === 0) return null
                let queueStatus = 'waiting'
                if (patient.status === APPOINTMENT_STATUS.CONFIRMED) queueStatus = 'confirmed'
                else if (patient.status === APPOINTMENT_STATUS.IN_PROGRESS) queueStatus = 'in-room'
                else if (patient.status === APPOINTMENT_STATUS.COMPLETED) queueStatus = 'completed'
                else if (patient.status === APPOINTMENT_STATUS.OVERDUE) queueStatus = 'overdue'

                const hasSevereAllergy = typeof patient.allergies === 'string'
                  ? patient.allergies.toLowerCase().includes('severe')
                  : false
                return (
                  <article key={patient.id ?? `q-${idx}`} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-150 dark:border-[#252530] dark:bg-[#111118]">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400 dark:text-[#606070]">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${getQueueDot(queueStatus)}`} aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.patient_name ?? patient.name ?? 'Patient'}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {patient.patient_age && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">{patient.patient_age}{patient.patient_gender ? ` · ${patient.patient_gender}` : ''}</span>}
                        {patient.chief_complaint && <span className="text-xs text-slate-500 dark:text-[#70708a]">{patient.chief_complaint}</span>}
                      </div>
                      {hasSevereAllergy && (
                        <div className="mt-1.5 flex items-center gap-1 text-rose-500 dark:text-rose-400">
                          <span className="inline-flex h-3 w-3"><IconShieldAlert /></span>
                          <span className="text-[11px]">Severe allergy on file</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">{patient.start_time ?? patient.time ?? ''}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(patient)
                          navigateTo('emr')
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                      >
                        <span>Open EMR</span>
                        <span className="inline-flex h-3 w-3"><IconArrowRight /></span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="col-span-1">
            <SectionHeader
              title="Today's Schedule"
              actionLabel="Full Calendar →"
              onAction={() => navigateTo('schedule')}
            />

            <div className="flex flex-col gap-2">
              {loading && <SkeletonBlock className="h-10 w-full" />}
              {!loading && todayAppts.length === 0 && (
                <EmptyState
                  iconEmoji="📅"
                  title="No schedule items today"
                  description="Your appointments will appear here"
                />
              )}
              {todayAppts.map((appt, idx) => {
                const tone = appt.status === APPOINTMENT_STATUS.COMPLETED ? 'completed' : 'scheduled'
                return (
                  <article key={appt.id ?? `sched-${idx}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-[#1c1c25] dark:bg-[#111118]">
                    <span className={`w-[3px] self-stretch rounded-full ${getScheduleAccent(tone)}`} aria-hidden="true" />
                    <span className="w-14 shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{appt.start_time ?? ''}</span>
                    <span>
                      <span className="block text-xs font-semibold text-slate-800 dark:text-[#c8c8e0]">{appt.patient_name ?? appt.name ?? 'Patient'}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-[#70708a]">{appt.chief_complaint ?? appt.specialty_name ?? ''}</span>
                    </span>
                  </article>
                )
              })}
            </div>

            <div className="mt-6">
              <div className="mb-3 border-b border-slate-200 pb-2 dark:border-[#252530]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Quick Actions</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('lab-review')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-amber-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><IconFlask /></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">Review Pending Labs</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('doctor-chat')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-indigo-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><IconMessageSquare /></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">AI Clinical Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('emr')}
                  className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-teal-500 dark:bg-[#1c1c25]">
                    <span className="inline-flex h-4 w-4"><IconFileText /></span>
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
    id: PropTypes.string,
    full_name: PropTypes.string,
    name: PropTypes.string,
  }),
}

DoctorDashboardView.defaultProps = {
  user: null,
}
