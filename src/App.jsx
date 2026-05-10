import { useState, useEffect } from 'react'
import './index.css'

import { authApi } from './api/auth'
import { patientApi } from './api/patient'
import { clearAccessToken, initializeToken } from './api/client'
import { connectWebSocket } from './api/websocket'
import { notificationApi } from './api/notification'

import LoginView from './views/auth/LoginView'
import LandingPage from './views/LandingPage'
import SignupView from './views/auth/SignupView'
import OtpVerifyView from './views/auth/OtpVerifyView'
import ResetPasswordView from './views/auth/ResetPasswordView'

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
import ProfileSetupView from './views/patient/ProfileSetupView'
import PaymentReturnView from './views/patient/PaymentReturnView'
import DoctorRatingView from './views/patient/DoctorRatingView'
import PatientPaymentHistoryView from './views/patient/PaymentHistoryView'
import TriageHistoryView from './views/patient/TriageHistoryView'

import DoctorDashboardView from './views/doctor/DoctorDashboardView'
import DoctorBoard from './views/doctor/DoctorBoard'
import PatientQueueView from './views/doctor/PatientQueueView'
import ScheduleView from './views/doctor/ScheduleView'
import EMRWorkspace from './views/doctor/emr/EMRWorkspace'
import DoctorChatView from './views/doctor/DoctorChatView'
import LabResultReviewView from './views/doctor/LabResultReviewView'
import DoctorProfileView from './views/doctor/DoctorProfileView'
import TriageQueueView from './views/doctor/TriageQueueView'

import AdminDashboardView from './views/admin/AdminDashboardView'
import UserManagementView from './views/admin/UserManagementView'
import AppointmentManagementView from './views/admin/AppointmentManagementView'
import ReportsView from './views/admin/ReportsView'
import SystemConfigView from './views/admin/SystemConfigView'
import AdminPaymentHistoryView from './views/admin/PaymentHistoryView'

import PatientSideNav from './components/patient/PatientSideNav'
import PatientTopBar from './components/patient/PatientTopBar'
import DoctorSideNav from './components/doctor/DoctorSideNav'
import DoctorTopBar from './components/doctor/DoctorTopBar'
import AdminSideNav from './components/admin/AdminSideNav'
import AdminTopBar from './components/admin/AdminTopBar'
import { AdminSettingsProvider } from './context/AdminSettingsContext'

const AVATAR_GRADIENTS = [
  { from: 'from-indigo-400', to: 'to-violet-500' },
  { from: 'from-rose-400', to: 'to-pink-500' },
  { from: 'from-emerald-400', to: 'to-teal-500' },
  { from: 'from-amber-400', to: 'to-orange-500' },
  { from: 'from-sky-400', to: 'to-blue-500' },
]

function deriveUserMeta(user) {
  if (!user) return null
  if (user.initials && user.avatar) return user
  const name = user.full_name || user.name || user.email || '?'
  const parts = name.trim().split(/\s+/)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + (name.codePointAt(i) ?? 0)) % AVATAR_GRADIENTS.length
  return { ...user, initials, avatar: AVATAR_GRADIENTS[hash] }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authPage, setAuthPage] = useState('landing')
  const [pendingEmail, setPendingEmail] = useState('')
  const [appReady, setAppReady] = useState(false)
  const [paymentReturn, setPaymentReturn] = useState(() => {
    const params = new URLSearchParams(globalThis.location.search)
    const status = params.get('status')
    const txnRef = params.get('txn_ref')
    if (!status || !txnRef) return null
    globalThis.history.replaceState({}, '', globalThis.location.pathname)
    return { status, txnRef }
  })

  const [dark, setDark] = useState(() => localStorage.getItem('healthai-theme') === 'dark')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [patientView, setPatientView] = useState('dashboard')
  const [patientViewData, setPatientViewData] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [patientNavExpanded, setPatientNavExpanded] = useState(true)
  const [patientMobileOpen, setPatientMobileOpen] = useState(false)

  const [doctorView, setDoctorView] = useState('dashboard')
  // NOTE: renamed from selectedPatient to avoid collision with patient role's selectedAppointment
  const [selectedDoctorPatient, setSelectedDoctorPatient] = useState(null)
  const [doctorEmrTab, setDoctorEmrTab] = useState(null)
  const [triageInitialId, setTriageInitialId] = useState(null)
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

  useEffect(() => {
    localStorage.setItem('healthai-theme', dark ? 'dark' : 'light')
  }, [dark])

  // Hydrate in-memory access token first, then fetch current user
  useEffect(() => {
    initializeToken()
      .then(() => authApi.me())
      .then(async (user) => {
        if (user?.role === 'patient') {
          try {
            const profileData = await patientApi.getProfile()
            const isComplete = !!(profileData?.profile?.full_name)
            return { ...user, is_profile_completed: isComplete }
          } catch {
            return user
          }
        }
        return user
      })
      .then((user) => setCurrentUser(deriveUserMeta(user)))
      .catch(() => setCurrentUser(null))
      .finally(() => setAppReady(true))
  }, [])

  // Connect WebSocket after login, disconnect on logout
  useEffect(() => {
    if (!currentUser) return undefined

    // Fetch real unread count from the API immediately after login
    notificationApi.getUnreadCount()
      .then((data) => setUnreadCount(data?.count ?? 0))
      .catch(() => {})

    const disconnect = connectWebSocket(currentUser.id, (message) => {
      // WS messages are wrapped: { event: string, data: {...} }
      // Only process new notification events; ignore "connected", "pong", etc.
      if (message?.event !== 'notification.new' || !message?.data) return
      const notification = message.data
      setUnreadCount((c) => c + 1)
      setOrderNotifications((prev) => [notification, ...prev])

      // Patient: show alert when their appointment is created via AI Triage
      if (notification?.event_type === 'appointment.created_patient' && currentUser.role === 'patient') {
        globalThis.alert(
          `${notification.title || 'Booking successful!'}\n${notification.body || 'Your appointment is ready.'}`
        )
      }
    })
    return disconnect
  }, [currentUser])

  const handleLogout = () => {
    clearAccessToken()
    authApi.logout().catch(() => {})
    setCurrentUser(null)
    setPatientView('dashboard')
    setDoctorView('dashboard')
    setAdminView('dashboard')
    setSelectedDoctorPatient(null)
    setSelectedAppointment(null)
    setSelectedLab(null)
    setDoctorEmrTab(null)
    setLabOrders([])
    setOrderNotifications([])
    setPaymentReturn(null)
  }

  // Listen for forced logout triggered by failed token refresh in api/client.js
  useEffect(() => {
    const onForceLogout = () => handleLogout()
    globalThis.addEventListener('auth:logout-required', onForceLogout)
    return () => globalThis.removeEventListener('auth:logout-required', onForceLogout)
  }, [])

  const navigatePatient = (view, data) => {
    if (view === patientView && !data) return
    setIsTransitioning(true)
    globalThis.setTimeout(() => {
      setPatientView(view)
      setPatientViewData(data ?? null)
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

  const createBookingRequest = (appt, triageSession) => {
    const bookingWithTriage = triageSession
      ? { ...appt, triage_session_id: triageSession.id, ai_referred: true, urgency_level: triageSession.urgency_level }
      : appt
    setBookings((prev) => [bookingWithTriage, ...prev])
    setActiveBookingId(appt.id)
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

  const handleLogin = (user) => {
    setCurrentUser(deriveUserMeta(user))
    if (user.role === 'patient') setPatientView('dashboard')
    if (user.role === 'doctor') setDoctorView('dashboard')
    if (user.role === 'admin') {
      setAdminView('dashboard')
      setAdminNavExpanded(adminSidebarSize !== 'collapsed')
    }
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

    if (paymentReturn && currentUser?.role === 'patient') {
      return wrap(
        <PaymentReturnView
          status={paymentReturn.status}
          txnRef={paymentReturn.txnRef}
          onViewAppointments={() => navigatePatient('appointments')}
          onRetry={() => navigatePatient('booking-wizard')}
        />,
      )
    }

    switch (patientView) {
      case 'dashboard':
        return wrap(<PatientDashboardView setCurrentView={navigatePatient} user={currentUser} labOrders={labOrders} />)
      case 'symptom-checker': {
        const tid = patientViewData?.triageSessionId
        return wrap(<SymptomCheckerView setCurrentView={navigatePatient} currentUser={currentUser} initialTriageId={tid} />)
      }
      case 'booking-wizard':
        return wrap(
          <BookingWizardView
            setCurrentView={navigatePatient}
            onSubmitBooking={createBookingRequest}
            currentUser={currentUser}
            triageSession={patientViewData?.triageSession ?? null}
            onClearTriage={() => navigatePatient('symptom-checker')}
            preselectedDepartment={patientViewData?.preselectedDepartment ?? null}
          />,
        )
      case 'booking-confirmed':
        return wrap(
          <BookingConfirmedView
            setCurrentView={navigatePatient}
            booking={bookings.find((item) => item.id === activeBookingId) || null}
            wsNotifications={orderNotifications}
          />,
        )
      case 'appointments':
        return wrap(
          <AppointmentsView
            setCurrentView={navigatePatient}
            setSelectedAppointment={setSelectedAppointment}
            currentUser={currentUser}
            wsNotifications={orderNotifications}
            onRateDoctor={(appt) => {
              setSelectedAppointment(appt)
              navigatePatient('rating')
            }}
          />,
        )
      case 'reschedule':
        return wrap(<RescheduleView setCurrentView={navigatePatient} selectedAppointment={selectedAppointment} currentUser={currentUser} />)
      case 'reschedule-confirmed':
        return wrap(<RescheduleConfirmedView setCurrentView={navigatePatient} />)
      case 'health-record':
        return wrap(<HealthRecordView setCurrentView={navigatePatient} currentUser={currentUser} />)
      case 'payment-history':
        return wrap(<PatientPaymentHistoryView setCurrentView={navigatePatient} currentUser={currentUser} />)
      case 'triage-history':
        return wrap(<TriageHistoryView setCurrentView={navigatePatient} currentUser={currentUser} />)
      case 'lab-results':
          return wrap(<LabResultsView setCurrentView={navigatePatient} setSelectedLab={setSelectedLab} labOrders={labOrders} currentUser={currentUser} />)
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
            currentUser={currentUser}
          />,
        )
      case 'profile-setup':
        return wrap(<ProfileSetupView setCurrentView={navigatePatient} currentUser={currentUser} />)
      case 'payment-return':
        return wrap(
          <PaymentReturnView
            status={paymentReturn?.status}
            txnRef={paymentReturn?.txnRef}
            onViewAppointments={() => navigatePatient('appointments')}
            onRetry={() => navigatePatient('booking-wizard')}
          />,
        )
      case 'rating':
        return wrap(
          <DoctorRatingView
            appointment={selectedAppointment}
            onDone={() => navigatePatient('appointments')}
            onSkip={() => navigatePatient('appointments')}
          />,
        )
      default:
        return wrap(<PatientDashboardView setCurrentView={navigatePatient} user={currentUser} labOrders={labOrders} />)
    }
  }

  function renderDoctorView() {
    const isFullHeight = doctorView === 'emr' || doctorView === 'doctor-chat' || doctorView === 'triage-queue'

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
        return wrap(
          <DoctorBoard
            navigateTo={setDoctorView}
            setSelectedPatient={setSelectedDoctorPatient}
            user={currentUser}
            bookings={bookings}
            updateBookingStatus={updateBookingStatus}
          />
        )
      case 'patient-queue':
        return wrap(
          <PatientQueueView
            navigateTo={navigateDoctor}
            user={currentUser}
            setSelectedPatient={setSelectedDoctorPatient}
            selectedPatient={selectedDoctorPatient}
            bookings={bookings}
            updateBookingStatus={updateBookingStatus}
            onOpenTriageSession={(id) => { setTriageInitialId(id); navigateDoctor('triage-queue') }}
          />,
        )
      case 'schedule':
        return wrap(
          <ScheduleView
            navigateTo={navigateDoctor}
            user={currentUser}
            setSelectedPatient={setSelectedDoctorPatient}
            selectedPatient={selectedDoctorPatient}
            bookings={bookings}
          />,
        )
      case 'emr':
        return wrap(
          <EMRWorkspace
            navigateTo={navigateDoctor}
            user={currentUser}
            selectedPatient={selectedDoctorPatient}
            setSelectedPatient={setSelectedDoctorPatient}
            labOrders={labOrders}
            setLabOrders={setLabOrders}
            emrRequestedTab={doctorEmrTab}
            clearEmrRequestedTab={() => setDoctorEmrTab(null)}
          />,
        )
      case 'doctor-dashboard':
        return wrap(<DoctorDashboardView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedDoctorPatient} selectedPatient={selectedDoctorPatient} />)
      case 'doctor-chat':
        return wrap(<DoctorChatView navigateTo={navigateDoctor} user={currentUser} selectedPatient={selectedDoctorPatient} />)
      case 'triage-queue':
        return wrap(<TriageQueueView navigateTo={navigateDoctor} initialSessionId={triageInitialId} onInitialHandled={() => setTriageInitialId(null)} />)
      case 'lab-review':
        return wrap(
          <LabResultReviewView
            labOrders={labOrders}
            setLabOrders={setLabOrders}
            onNotify={(notification) => setOrderNotifications((prev) => [notification, ...prev])}
            onBack={() => navigateDoctor('dashboard')}
            navigateTo={navigateDoctor}
            setSelectedPatient={setSelectedDoctorPatient}
          />,
        )
      case 'profile':
        return wrap(<DoctorProfileView navigateTo={navigateDoctor} user={currentUser} />)
      default:
        return wrap(<DoctorDashboardView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedDoctorPatient} selectedPatient={selectedDoctorPatient} />)
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
      case 'payment-history':
        return wrap(<AdminPaymentHistoryView {...props} />)
      case 'reports':
        return wrap(<ReportsView {...props} />)
      case 'settings':
        return wrap(<SystemConfigView {...props} />)
      default:
        return wrap(<AdminDashboardView {...props} />)
    }
  }

  // ── Loading spinner (no scroll lock needed) ────────────────────────────────
  if (!appReady) {
    return (
      <div className={`${dark ? 'dark' : ''} app-root flex h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-[#08080f]`}>
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" aria-label="Loading" />
      </div>
    )
  }

  // ── Unauthenticated pages — rendered outside the scroll-locked shell ────────
  if (!currentUser) {
    if (authPage === 'landing') {
      return (
        <div className={`${dark ? 'dark' : ''} app-root`}>
          <LandingPage
            onLogin={() => setAuthPage('login')}
            onSignup={() => setAuthPage('signup')}
          />
        </div>
      )
    }
    if (authPage === 'signup') {
      return (
        <div className={`${dark ? 'dark' : ''} app-root`}>
          <SignupView
            dark={dark}
            setDark={setDark}
            onSuccess={(registeredEmail) => {
              setPendingEmail(registeredEmail)
              setAuthPage('otp-verify')
            }}
            onLoginClick={() => setAuthPage('login')}
          />
        </div>
      )
    }
    if (authPage === 'otp-verify') {
      return (
        <div className={`${dark ? 'dark' : ''} app-root`}>
          <OtpVerifyView
            email={pendingEmail}
            dark={dark}
            setDark={setDark}
            onVerified={() => setAuthPage('login')}
            onBackToLogin={() => setAuthPage('login')}
          />
        </div>
      )
    }

    if (authPage === 'reset-password') {
      return (
        <div className={`${dark ? 'dark' : ''} app-root`}>
          <ResetPasswordView
            dark={dark}
            setDark={setDark}
            initialEmail={pendingEmail}
            onBackToLogin={() => setAuthPage('login')}
          />
        </div>
      )
    }
    return (
      <div className={`${dark ? 'dark' : ''} app-root`}>
        <LoginView
          dark={dark}
          setDark={setDark}
          onLogin={handleLogin}
          onNeedVerify={(email) => {
            setPendingEmail(email)
            setAuthPage('otp-verify')
          }}
          onForgotPassword={(email) => {
            setPendingEmail(email || '')
            setAuthPage('reset-password')
          }}
          onSignupClick={() => setAuthPage('signup')}
        />
      </div>
    )
  }

  // ── Authenticated app shell (scroll-locked sidebar layout) ─────────────────
  return (
    <div
      className={`${dark ? 'dark' : ''} app-root flex h-screen overflow-hidden overflow-x-hidden w-full max-w-full`}
    >
      {currentUser?.role === 'patient' && !currentUser?.is_profile_completed && (
        <main className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-[#f8fafc] px-4 py-10 dark:bg-[#08080f] sm:px-6 sm:py-12">
          <ProfileSetupView
            currentUser={currentUser}
            onComplete={(updatedUser) => setCurrentUser(deriveUserMeta({ ...currentUser, ...updatedUser, is_profile_completed: true }))}
          />
        </main>
      )}

      {currentUser?.role === 'patient' && currentUser?.is_profile_completed && (
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
              setUnreadCount={setUnreadCount}
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
              selectedPatient={selectedDoctorPatient}
              setSelectedPatient={setSelectedDoctorPatient}
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
