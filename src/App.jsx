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

import PatientSideNav from './components/patient/PatientSideNav'
import PatientTopBar from './components/patient/PatientTopBar'
import DoctorSideNav from './components/doctor/DoctorSideNav'
import DoctorTopBar from './components/doctor/DoctorTopBar'

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
  const [doctorNavExpanded, setDoctorNavExpanded] = useState(true)
  const [doctorMobileOpen, setDoctorMobileOpen] = useState(false)

  const navigatePatient = (view) => {
    if (view === patientView) return
    setIsTransitioning(true)
    window.setTimeout(() => {
      setPatientView(view)
      setIsTransitioning(false)
    }, 180)
  }

  const navigateDoctor = (view) => {
    if (view === doctorView) return
    setIsTransitioning(true)
    window.setTimeout(() => {
      setDoctorView(view)
      setIsTransitioning(false)
    }, 180)
  }

  const handleLogin = (email, password) => {
    const user = findUser(email, password)
    if (user) {
      setCurrentUser(user)
      if (user.role === 'patient') setPatientView('dashboard')
      if (user.role === 'doctor') setDoctorView('dashboard')
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
    setSelectedPatient(null)
    setSelectedAppointment(null)
    setSelectedLab(null)
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
        return wrap(<PatientDashboardView setCurrentView={navigatePatient} user={currentUser} />)
      case 'symptom-checker':
        return wrap(<SymptomCheckerView setCurrentView={navigatePatient} />)
      case 'booking-wizard':
        return wrap(<BookingWizardView setCurrentView={navigatePatient} />)
      case 'booking-confirmed':
        return wrap(<BookingConfirmedView setCurrentView={navigatePatient} />)
      case 'appointments':
        return wrap(<AppointmentsView setCurrentView={navigatePatient} setSelectedAppointment={setSelectedAppointment} />)
      case 'reschedule':
        return wrap(<RescheduleView setCurrentView={navigatePatient} selectedAppointment={selectedAppointment} />)
      case 'reschedule-confirmed':
        return wrap(<RescheduleConfirmedView setCurrentView={navigatePatient} />)
      case 'health-record':
        return wrap(<HealthRecordView setCurrentView={navigatePatient} />)
      case 'lab-results':
        return wrap(<LabResultsView setCurrentView={navigatePatient} setSelectedLab={setSelectedLab} />)
      case 'lab-detail':
        return wrap(<LabDetailView setCurrentView={navigatePatient} selectedLab={selectedLab} />)
      case 'notifications':
        return wrap(<NotificationsView setCurrentView={navigatePatient} unreadCount={unreadCount} setUnreadCount={setUnreadCount} />)
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
        return wrap(<PatientQueueView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient} />)
      case 'schedule':
        return wrap(<ScheduleView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient} />)
      case 'emr':
        return wrap(<EMRWorkspaceView navigateTo={navigateDoctor} user={currentUser} selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />)
      case 'doctor-chat':
        return wrap(<DoctorChatView navigateTo={navigateDoctor} user={currentUser} selectedPatient={selectedPatient} />)
      default:
        return wrap(<DoctorDashboardView navigateTo={navigateDoctor} user={currentUser} setSelectedPatient={setSelectedPatient} selectedPatient={selectedPatient} />)
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
              user={currentUser}
            />

            <main className="overflow-hidden flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#08080f]">
              {renderDoctorView()}
            </main>
          </div>
        </>
      )}
    </div>
  )
}
