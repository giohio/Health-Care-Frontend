import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import PatientQueueView from './PatientQueueView'
import TriageQueueView from './TriageQueueView'
import { BotIcon, ClipboardListIcon } from './emr/EmrIcons'

export default function DoctorBoard({ navigateTo, setSelectedPatient, user, bookings, updateBookingStatus }) {
  const [activeTab, setActiveTab] = useState('appointments')
  const [triageInitialId, setTriageInitialId] = useState(null)

  const handleOpenTriage = (id) => {
    setTriageInitialId(id)
    setActiveTab('triage')
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const doctorName = user?.full_name ?? user?.name ?? 'Doctor'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f4f6fb] dark:bg-[#07070e]">
      {/* Premium Hero Header */}
      <div className="relative shrink-0 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900" />
        {/* Decorative orbs */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />
        <div className="absolute right-1/3 top-0 h-32 w-32 rounded-full bg-violet-300/15 blur-2xl" />

        <div className="relative px-8 py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-200/80 dark:text-indigo-300/70">
                {today}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                {greeting}, Dr. {doctorName.replace(/^Dr\.?\s*/i, '').split(' ')[0]} 👋
              </h1>
              <p className="mt-1.5 text-sm text-indigo-100/70 dark:text-indigo-200/60">
                Here&apos;s your clinical overview for today
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 p-1 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'appointments'
                    ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <ClipboardListIcon className="h-3.5 w-3.5" />
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('triage')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'triage'
                    ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <BotIcon className="h-3.5 w-3.5" />
                AI Triage
              </button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#f4f6fb] to-transparent dark:from-[#07070e]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'appointments' ? (
          <div className="h-full overflow-y-auto">
            <PatientQueueView
              navigateTo={navigateTo}
              setSelectedPatient={setSelectedPatient}
              user={user}
              bookings={bookings}
              updateBookingStatus={updateBookingStatus}
              onOpenTriageSession={handleOpenTriage}
              embedded
            />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <TriageQueueView
              navigateTo={navigateTo}
              initialSessionId={triageInitialId}
              onInitialHandled={() => setTriageInitialId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

DoctorBoard.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  setSelectedPatient: PropTypes.func.isRequired,
  user: PropTypes.object,
  bookings: PropTypes.array,
  updateBookingStatus: PropTypes.func,
}
