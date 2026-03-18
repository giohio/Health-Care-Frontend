import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconWarning, IconClose, IconStethoscope, IconCalendar } from '../../icons'

export default function Dashboard({ setCurrentView, user }) {
  const [allergyDismissed, setAllergyDismissed] = useState(false)
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Good morning, {firstName}.</h1>
      <p className="mt-1 text-sm font-normal leading-relaxed text-slate-500 dark:text-[#70708a]">How are you feeling today?</p>

      {!allergyDismissed && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]" role="alert" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"><IconWarning size={16} /></span>
            <p className="flex-1 text-sm font-normal leading-relaxed">
              Active Allergy Alerts on file: <strong className="font-semibold">Seafood</strong> and <strong className="font-semibold">Penicillin</strong>
            </p>
            <button
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
              onClick={() => setAllergyDismissed(true)}
              aria-label="Dismiss allergy alert"
              id="dismiss-allergy-btn"
            >
              <IconClose size={14} />
            </button>
          </div>
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Health overview">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#606070]">Next Appointment</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Mar 19</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Dr. Sarah Chen · 10:00 AM</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#606070]">Lab Results</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-amber-500 dark:text-amber-400">2 New</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">Requires your attention</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#606070]">Active Allergies</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-rose-500 dark:text-rose-400">3 on file</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">2 severe · 1 mild</p>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          id="symptom-checker-card"
          className="card-hover flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]"
          onClick={() => setCurrentView('symptom-checker')}
          aria-label="Navigate to Symptom Checker"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><IconStethoscope size={22} /></span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">Check my Symptoms</span>
          <span className="text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">Chat with our AI to understand your condition.</span>
        </button>

        <button
          id="book-appointment-card"
          className="card-hover flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]"
          onClick={() => setCurrentView('booking-wizard')}
          aria-label="Navigate to Book an Appointment"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><IconCalendar size={22} /></span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">Book an Appointment</span>
          <span className="text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">Find a doctor and schedule a visit.</span>
        </button>
      </div>

      <section className="mt-9" aria-labelledby="upcoming-label">
        <p id="upcoming-label" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Upcoming</p>
        <div className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:shadow-none dark:hover:border-[#353545] dark:hover:bg-[#16161e]">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-[#252530] dark:bg-[#1c1c25]">
            <span className="block text-[11px] font-normal text-slate-400 dark:text-[#606070]">MAR</span>
            <span className="block text-xl font-bold text-slate-900 dark:text-[#c8c8e0]">24</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">Dr. Sarah Chen · General Consultation</p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">10:00 AM — Hanoi Central Clinic</p>
          </div>
          <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300">Confirmed</span>
        </div>
      </section>
    </div>
  )
}

Dashboard.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
}

Dashboard.defaultProps = {
  user: null,
}
