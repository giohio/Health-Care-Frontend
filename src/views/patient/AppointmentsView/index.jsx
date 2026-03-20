import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { UPCOMING_APPOINTMENTS, PAST_APPOINTMENTS } from './data'
import UpcomingCard from './UpcomingCard'
import PastCard from './PastCard'
import Toast from './Toast'
import { IconCalendar } from '../../../icons'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
]

export default function AppointmentsView({ setCurrentView, setSelectedAppointment, bookings }) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [upcoming, setUpcoming] = useState(UPCOMING_APPOINTMENTS)
  const [toast, setToast] = useState(null)

  function handleReschedule(appt) {
    setSelectedAppointment(appt)
    setCurrentView('reschedule')
  }

  function handleCancel(id, doctorName) {
    setUpcoming((prev) => prev.filter((a) => a.id !== id))
    setToast(`Appointment with ${doctorName} has been cancelled.`)
  }

  const bookingAppointments = useMemo(() => (
    bookings
      .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((booking) => ({
        id: booking.id,
        doctor: booking.doctorName,
        specialty: booking.specialtyLabel,
        month: 'MAR',
        day: Number(booking.dateLabel.replace('March ', '')),
        time: booking.timeLabel,
        clinic: booking.clinic,
        status: booking.status === 'pending' ? 'Pending' : 'Confirmed',
        cancelText: `${booking.doctorName} · ${booking.dateLabel} · ${booking.timeLabel}`,
      }))
  ), [bookings])

  const allUpcoming = useMemo(() => ([...bookingAppointments, ...upcoming]), [bookingAppointments, upcoming])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">My Appointments</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Manage your upcoming and past visits.</p>

      <div className="mt-6 mb-6 flex w-full border-b border-slate-200 dark:border-[#252530]" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`mr-6 border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? 'border-indigo-600 text-slate-900 dark:border-indigo-400 dark:text-[#eeeef5]' : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-[#606070] dark:hover:text-[#9898b0]'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upcoming' && (
        <div role="tabpanel" aria-labelledby="tab-upcoming">
          {allUpcoming.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-[#1c1c25] dark:text-[#606070]">
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
          ) : (
            <div className="space-y-3">
              {allUpcoming.map((appt) => (
                <UpcomingCard
                  key={appt.id}
                  appt={appt}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div role="tabpanel" aria-labelledby="tab-past" className="space-y-3">
          {PAST_APPOINTMENTS.map((appt) => (
            <PastCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

AppointmentsView.propTypes = {
  bookings: PropTypes.arrayOf(PropTypes.shape({
    clinic: PropTypes.string,
    createdAt: PropTypes.number,
    dateLabel: PropTypes.string,
    doctorName: PropTypes.string,
    id: PropTypes.string,
    specialtyLabel: PropTypes.string,
    status: PropTypes.string,
    timeLabel: PropTypes.string,
  })),
  setCurrentView: PropTypes.func.isRequired,
  setSelectedAppointment: PropTypes.func.isRequired,
}

AppointmentsView.defaultProps = {
  bookings: [],
}
