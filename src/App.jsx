import { useState } from 'react'
import './index.css'
import { findUser } from './data/users'

import LoginView from './views/auth/LoginView'

import PatientDashboardView from './views/patient/DashboardView'
import SymptomCheckerView from './views/patient/SymptomCheckerView'
import BookingWizardView from './views/patient/BookingWizardView'
import BookingConfirmedView from './views/patient/BookingConfirmedView'
import AppointmentsView from './views/patient/AppointmentsView'
import RescheduleView from './views/patient/RescheduleView'
import RescheduleConfirmedView from './views/patient/RescheduleConfirmedView'
import HealthRecordView from './views/patient/HealthRecordView'
import LabResultsView from './views/patient/LabResultsView'
import LabDetailView from './views/patient/LabDetailView'
import NotificationsView from './views/patient/NotificationsView'

import DoctorDashboardView from './views/doctor/DoctorDashboardView'
import PatientQueueView from './views/doctor/PatientQueueView'
import ScheduleView from './views/doctor/ScheduleView'
import EMRWorkspaceView from './views/doctor/EMRWorkspaceView'
import DoctorChatView from './views/doctor/DoctorChatView'

import AdminDashboardView from './views/admin/AdminDashboardView'
import UserManagementView from './views/admin/UserManagementView'
import AppointmentManagementView from './views/admin/AppointmentManagementView'
import ReportsView from './views/admin/ReportsView'
import SystemConfigView from './views/admin/SystemConfigView'

import PatientSideNav from './components/patient/PatientSideNav'
import PatientTopBar from './components/patient/PatientTopBar'
import DoctorSideNav from './components/doctor/DoctorSideNav'
import DoctorTopBar from './components/doctor/DoctorTopBar'
import AdminSideNav from './components/admin/AdminSideNav'
import AdminTopBar from './components/admin/AdminTopBar'
import { AdminSettingsProvider } from './context/AdminSettingsContext'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)

  const [dark, setDark] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [patientView, setPatientView] = useState('dashboard')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [unreadCount, setUnreadCount] = useState(3)
  const [patientNavExpanded, setPatientNavExpanded] = useState(true)
  const [patientMobileOpen, setPatientMobileOpen] = useState(false)

  const [doctorView, setDoctorView] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctorEmrTab, setDoctorEmrTab] = useState(null)
  const [doctorNavExpanded, setDoctorNavExpanded] = useState(true)
  const [doctorMobileOpen, setDoctorMobileOpen] = useState(false)

  const [labOrders, setLabOrders] = useState([])
  const [orderNotifications, setOrderNotifications] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [bookingNotifications, setBookingNotifications] = useState([])

  const [adminView, setAdminView] = useState('dashboard')
  const [adminNavExpanded, setAdminNavExpanded] = useState(true)
  const [adminMobileOpen, setAdminMobileOpen] = useState(false)
  const [adminThemeMode, setAdminThemeMode] = useState('dark')
  const [adminAccentColor, setAdminAccentColor] = useState('rose')
  const [adminSidebarSize, setAdminSidebarSize] = useState('expanded')

  const applyAdminThemeMode = (mode) => {
    setAdminThemeMode(mode)

    if (mode === 'light') {
      setDark(false)
      return
    }

    if (mode === 'dark') {
      setDark(true)
      return
    }

    const systemPrefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(systemPrefersDark)
  }

  const applyAdminSidebarSize = (size) => {
    setAdminSidebarSize(size)
    setAdminNavExpanded(size !== 'collapsed')
  }

  const navigatePatient = (view) => {
    if (view === patientView) return
    setIsTransitioning(true)
    globalThis.setTimeout(() => {
      setPatientView(view)
      setIsTransitioning(false)
    }, 180)
  }

  const navigateDoctor = (view) => {
    if (view === doctorView) return
    setIsTransitioning(true)
    globalThis.setTimeout(() => {
      setDoctorView(view)
      setIsTransitioning(false)
    }, 180)
  }

  const addOrderNotification = (order, type) => {
    const notifMap = {
      submitted: {
        type: 'appointment',
        title: 'Lab Order Submitted',
        body: `CBC, CRP ordered for ${order.patientName}. Estimated ready in 2-4 hours.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'emr',
      },
      ready: {
        type: 'lab',
        title: 'Lab Results Ready',
        body: `Results for ${order.patientName} are now available for review.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'lab-results',
      },
    }

    const template = notifMap[type]
    if (!template) return

    const notif = {
      id: Date.now(),
      ...template,
    }

    setOrderNotifications((prev) => [notif, ...prev])

    if (type === 'ready') {
      setUnreadCount((prev) => prev + 1)
    }
  }

  const addBookingNotification = (booking, type) => {
    const notifMap = {
      confirmed: {
        type: 'appointment',
        title: 'Appointment Confirmed',
        body: `Your appointment with ${booking.doctorName} on ${booking.dateLabel} at ${booking.timeLabel} has been confirmed.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'appointments',
      },
      cancelled: {
        type: 'appointment',
        title: 'Appointment Cancelled',
        body: `${booking.doctorName} is unavailable at ${booking.timeLabel} on ${booking.dateLabel}. Please book again.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'booking-confirmed',
      },
    }

    const template = notifMap[type]
    if (!template) return

    setBookingNotifications((prev) => [{ id: Date.now(), ...template }, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  const createBookingRequest = (bookingInput) => {
    const booking = {
      id: `bk-${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
      ...bookingInput,
    }

    setBookings((prev) => [booking, ...prev])
    setActiveBookingId(booking.id)
    setPatientView('booking-confirmed')
  }

  const updateBookingStatus = (bookingId, status) => {
    let changedBooking = null

    setBookings((prev) => prev.map((booking) => {
      if (booking.id !== bookingId) return booking
      if (booking.status === status) return booking

      changedBooking = { ...booking, status, updatedAt: Date.now() }
      return changedBooking
    }))

    if (!changedBooking) return

    if (status === 'confirmed') {
      addBookingNotification(changedBooking, 'confirmed')
    }

    if (status === 'cancelled') {
      addBookingNotification(changedBooking, 'cancelled')
    }
  }

  const navigateAdmin = (view) => {
    if (view === adminView) return
    setIsTransitioning(true)
    globalThis.setTimeout(() => {
      setAdminView(view)
      setIsTransitioning(false)
    }, 180)
  }

  const handleLogin = (email, password) => {
    const user = findUser(email, password)
    if (user) {
      setCurrentUser(user)
      if (user.role === 'patient') setPatientView('dashboard')
      if (user.role === 'doctor') setDoctorView('dashboard')
      if (user.role === 'admin') {
        setAdminView('dashboard')
        setAdminNavExpanded(adminSidebarSize !== 'collapsed')
      }
      return { success: true }
    }

    return {
      success: false,
      error: 'Invalid email or password.',
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setPatientView('dashboard')
    setDoctorView('dashboard')
    setAdminView('dashboard')
    setSelectedPatient(null)
    setSelectedAppointment(null)
    setSelectedLab(null)
    setDoctorEmrTab(null)
    setLabOrders([])
    setOrderNotifications([])
  }

  function renderPatientView() {
    const isFullHeight = patientView === 'symptom-checker'

    const wrap = (children) => (isFullHeight
      ? (
        <div key={patientView} className="view-enter flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
          {children}
        </div>
      )
      : (
        <div
          key={patientView}
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
            transition: isTransitioning
              ? 'opacity 100ms ease, transform 100ms ease'
              : 'opacity 200ms ease, transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
          className="flex-1 overflow-y-auto relative z-10"
        >
          <div className="max-w-4xl mx-auto px-8 py-12 min-w-0">
            {children}
          </div>
        </div>
      ))

    switch (patientView) {
      case 'dashboard':
        return wrap(<PatientDashboardView setCurrentView={navigatePatient} user={currentUser} labOrders={labOrders} />)
      case 'symptom-checker':
        return wrap(<SymptomCheckerView setCurrentView={navigatePatient} />)
      case 'booking-wizard':
        return wrap(<BookingWizardView setCurrentView={navigatePatient} onSubmitBooking={createBookingRequest} />)
      case 'booking-confirmed':
        return wrap(
          <BookingConfirmedView
            setCurrentView={navigatePatient}
            booking={bookings.find((item) => item.id === activeBookingId) || null}
          />,
        )
      case 'appointments':
        return wrap(
          <AppointmentsView
            setCurrentView={navigatePatient}
            setSelectedAppointment={setSelectedAppointment}
            bookings={bookings}
          />,
        )
      case 'reschedule':
        return wrap(<RescheduleView setCurrentView={navigatePatient} selectedAppointment={selectedAppointment} />)
      case 'reschedule-confirmed':
        return wrap(<RescheduleConfirmedView setCurrentView={navigatePatient} />)
      case 'health-record':
        return wrap(<HealthRecordView setCurrentView={navigatePatient} />)
      case 'lab-results':
        return wrap(<LabResultsView setCurrentView={navigatePatient} setSelectedLab={setSelectedLab} labOrders={labOrders} />)
      case 'lab-detail':
        return wrap(<LabDetailView setCurrentView={navigatePatient} selectedLab={selectedLab} />)
      case 'notifications':
        return wrap(
          <NotificationsView
            setCurrentView={navigatePatient}
            unreadCount={unreadCount}
            setUnreadCount={setUnreadCount}
            orderNotifications={orderNotifications}
            setOrderNotifications={setOrderNotifications}
            bookingNotifications={bookingNotifications}
            setBookingNotifications={setBookingNotifications}
          />,
        )
      default:
        return wrap(<PatientDashboardView setCurrentView={navigatePatient} user={currentUser} />)
    }
  }

  function renderDoctorView() {
    const isFullHeight = doctorView === 'emr' || doctorView === 'doctor-chat'

    const wrap = (children) => (isFullHeight
      ? (
        <div key={doctorView} className="view-enter flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
          {children}
        </div>
      )
      : (
        <div
          key={doctorView}
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
            transition: isTransitioning
              ? 'opacity 100ms ease, transform 100ms ease'
              : 'opacity 200ms ease, transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
          className="flex-1 overflow-y-auto relative z-10"
        >
          <div className="max-w-4xl mx-auto px-8 py-12 min-w-0">
            {children}
          </div>
        </div>
      ))

    switch (doctorView) {
      case 'dashboard':
        return wrap(<DoctorDashboardView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient} />)
      case 'patient-queue':
        return wrap(
          <PatientQueueView
            navigateTo={navigateDoctor}
            user={currentUser}
            setSelectedPatient={setSelectedPatient}
            selectedPatient={selectedPatient}
            bookings={bookings}
            updateBookingStatus={updateBookingStatus}
          />,
        )
      case 'schedule':
        return wrap(
          <ScheduleView
            navigateTo={navigateDoctor}
            user={currentUser}
            setSelectedPatient={setSelectedPatient}
            selectedPatient={selectedPatient}
            bookings={bookings}
          />,
        )
      case 'emr':
        return wrap(
          <EMRWorkspaceView
            navigateTo={navigateDoctor}
            user={currentUser}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            labOrders={labOrders}
            setLabOrders={setLabOrders}
            addOrderNotification={addOrderNotification}
            emrRequestedTab={doctorEmrTab}
            clearEmrRequestedTab={() => setDoctorEmrTab(null)}
          />,
        )
      case 'doctor-chat':
        return wrap(<DoctorChatView navigateTo={navigateDoctor} user={currentUser} selectedPatient={selectedPatient} />)
      default:
        return wrap(<DoctorDashboardView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient} />)
    }
  }

  function renderAdminView() {
    const wrap = (children) => (
      <div
        key={adminView}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
          transition: isTransitioning
            ? 'opacity 100ms ease, transform 100ms ease'
            : 'opacity 200ms ease, transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
        className="flex-1 overflow-y-auto relative z-10"
      >
        <div className="max-w-5xl mx-auto px-8 py-12 min-w-0">
          {children}
        </div>
      </div>
    )

    const props = {
      navigateTo: navigateAdmin,
      user: currentUser,
    }

    switch (adminView) {
      case 'dashboard':
        return wrap(<AdminDashboardView {...props} />)
      case 'users':
        return wrap(<UserManagementView {...props} />)
      case 'appointments':
        return wrap(<AppointmentManagementView {...props} />)
      case 'reports':
        return wrap(<ReportsView {...props} />)
      case 'settings':
        return wrap(<SystemConfigView {...props} />)
      default:
        return wrap(<AdminDashboardView {...props} />)
    }
  }

  return (
    <div
      className={`${dark ? 'dark' : ''} flex h-screen overflow-hidden overflow-x-hidden w-full max-w-full`}
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {!currentUser && (
        <LoginView dark={dark} setDark={setDark} onLogin={handleLogin} />
      )}

      {currentUser?.role === 'patient' && (
        <>
          <PatientSideNav
            expanded={patientNavExpanded}
            setExpanded={setPatientNavExpanded}
            mobileOpen={patientMobileOpen}
            setMobileOpen={setPatientMobileOpen}
            currentView={patientView}
            navigateTo={navigatePatient}
            dark={dark}
            setDark={setDark}
            unreadCount={unreadCount}
            user={currentUser}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <PatientTopBar
              currentView={patientView}
              navigateTo={navigatePatient}
              setMobileOpen={setPatientMobileOpen}
              unreadCount={unreadCount}
              user={currentUser}
            />

            <main className="overflow-hidden flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#08080f]">
              {renderPatientView()}
            </main>
          </div>
        </>
      )}

      {currentUser?.role === 'doctor' && (
        <>
          <DoctorSideNav
            expanded={doctorNavExpanded}
            setExpanded={setDoctorNavExpanded}
            mobileOpen={doctorMobileOpen}
            setMobileOpen={setDoctorMobileOpen}
            currentView={doctorView}
            navigateTo={navigateDoctor}
            user={currentUser}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <DoctorTopBar
              currentView={doctorView}
              navigateTo={navigateDoctor}
              setMobileOpen={setDoctorMobileOpen}
              setDark={setDark}
              dark={dark}
              selectedPatient={selectedPatient}
              labOrders={labOrders}
              bookings={bookings}
              setEmrTab={setDoctorEmrTab}
              user={currentUser}
            />

            <main className="overflow-hidden flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#08080f]">
              {renderDoctorView()}
            </main>
          </div>
        </>
      )}

      {currentUser?.role === 'admin' && (
        <AdminSettingsProvider
          value={{
            themeMode: adminThemeMode,
            setThemeMode: applyAdminThemeMode,
            accentColor: adminAccentColor,
            setAccentColor: setAdminAccentColor,
            sidebarSize: adminSidebarSize,
            setSidebarSize: applyAdminSidebarSize,
          }}
        >
          <>
            <AdminSideNav
              expanded={adminNavExpanded}
              setExpanded={setAdminNavExpanded}
              mobileOpen={adminMobileOpen}
              setMobileOpen={setAdminMobileOpen}
              currentView={adminView}
              navigateTo={navigateAdmin}
              dark={dark}
              setDark={setDark}
              user={currentUser}
              onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <AdminTopBar
                currentView={adminView}
                navigateTo={navigateAdmin}
                setMobileOpen={setAdminMobileOpen}
                user={currentUser}
              />

              <main className="overflow-hidden flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#08080f]">
                {renderAdminView()}
              </main>
            </div>
          </>
        </AdminSettingsProvider>
      )}
    </div>
  )
}
