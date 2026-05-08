import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { authApi } from '../../api/auth'
import { paymentApi } from '../../api/payment'
import { useAdminSettings } from '../../context/AdminSettingsContext'

const INPUT_CLASS =
  'w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150'

const SECTION_ITEMS = [
  { key: 'clinic', label: 'Clinic Info', icon: Building2Icon },
  { key: 'hours', label: 'Working Hours', icon: IconClock },
  { key: 'lab-fees', label: 'Lab Test Fees', icon: DollarSignIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon },
  { key: 'security', label: 'Security', icon: ShieldIcon },
  { key: 'appearance', label: 'Appearance', icon: PaletteIcon },
]

const INITIAL_HOURS = [
  { day: 'Mon', enabled: true, from: '08:00', to: '17:00', slots: 16 },
  { day: 'Tue', enabled: true, from: '08:00', to: '17:00', slots: 16 },
  { day: 'Wed', enabled: true, from: '08:00', to: '17:00', slots: 16 },
  { day: 'Thu', enabled: true, from: '08:00', to: '17:00', slots: 16 },
  { day: 'Fri', enabled: true, from: '08:00', to: '17:00', slots: 16 },
  { day: 'Sat', enabled: true, from: '08:00', to: '12:00', slots: 8 },
  { day: 'Sun', enabled: false, from: '08:00', to: '12:00', slots: 0, locked: true },
]

function SaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function Building2Icon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M2 22h20" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
    </svg>
  )
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function DollarSignIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function PaletteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0 0 20h1a3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 0-8h-4z" />
      <circle cx="7.5" cy="9.5" r="1" />
      <circle cx="12" cy="7" r="1" />
      <circle cx="16.5" cy="9.5" r="1" />
    </svg>
  )
}

function saveLabel(saved, saving) {
  if (saved) return 'Saved!'
  if (saving) return 'Saving…'
  return 'Save Changes'
}

function Toggle({ enabled, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ${
        enabled
          ? 'bg-rose-600 dark:bg-rose-500'
          : 'bg-slate-200 dark:bg-[#2a2a35]'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

Toggle.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

function SectionCard({ children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
      {children}
    </section>
  )
}

SectionCard.propTypes = {
  children: PropTypes.node.isRequired,
}

export default function SystemConfigView({ user }) {
  const [activeSection, setActiveSection] = useState('clinic')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    sidebarSize,
    setSidebarSize,
  } = useAdminSettings()

  const [clinicName, setClinicName] = useState('HealthAI Medical Center')
  const [supportEmail, setSupportEmail] = useState('contact@healthai.vn')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maxAppointments, setMaxAppointments] = useState(50)
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00')

  const [hours, setHours] = useState(INITIAL_HOURS)
  const [duration, setDuration] = useState(30)

  const [labFees, setLabFees] = useState([])
  const [labFeeEdits, setLabFeeEdits] = useState({})
  const [labFeeLoading, setLabFeeLoading] = useState(false)
  const [labFeeSaving, setLabFeeSaving] = useState(null)
  const [labFeeError, setLabFeeError] = useState('')

  const [notificationSettings, setNotificationSettings] = useState([
    { key: 'appointment-reminders', title: 'Appointment Reminders', sub: 'Send SMS + email 24h before', enabled: true },
    { key: 'new-patient', title: 'New Patient Registration', sub: 'Notify admin on new signup', enabled: true },
    { key: 'lab-result', title: 'Lab Result Ready', sub: 'Alert doctor when results arrive', enabled: true },
    { key: 'cancellations', title: 'Appointment Cancellations', sub: 'Notify doctor + admin', enabled: true },
    { key: 'daily-summary', title: 'Daily Schedule Summary', sub: 'Morning briefing at 7:00 AM', enabled: true },
    { key: 'maintenance', title: 'System Maintenance Alerts', sub: 'Downtime and update notices', enabled: true },
    { key: 'revenue-reports', title: 'Revenue Reports', sub: 'Weekly financial summary email', enabled: false },
    { key: 'patient-feedback', title: 'Patient Feedback', sub: 'Post-appointment satisfaction survey', enabled: false },
  ])

  const [securitySettings, setSecuritySettings] = useState([
    { key: 'two-factor', title: 'Two-Factor Authentication', sub: 'Require 2FA for all staff logins', enabled: false },
    { key: 'session-timeout', title: 'Session Timeout', sub: 'Auto logout after 30 minutes', enabled: true },
    { key: 'login-limit', title: 'Login Attempt Limit', sub: 'Lock after 5 failed attempts', enabled: true },
    { key: 'audit-log', title: 'Audit Log', sub: 'Record all data access events', enabled: true },
  ])

  const [timeoutDuration, setTimeoutDuration] = useState('30 min')
  const [passwordRules, setPasswordRules] = useState([
    { key: 'min-8', label: 'Minimum 8 characters', checked: true },
    { key: 'uppercase', label: 'At least one uppercase letter', checked: true },
    { key: 'number', label: 'At least one number', checked: true },
    { key: 'special', label: 'Special characters required', checked: false },
  ])

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await authApi.getConfig()
      if (cfg.clinic_name != null) setClinicName(cfg.clinic_name)
      if (cfg.support_email != null) setSupportEmail(cfg.support_email)
      if (cfg.maintenance_mode != null) setMaintenanceMode(cfg.maintenance_mode)
      if (cfg.default_slot_duration_minutes != null) setDuration(cfg.default_slot_duration_minutes)
      if (cfg.max_appointments_per_day != null) setMaxAppointments(cfg.max_appointments_per_day)
      if (cfg.working_hours_start != null) setWorkingHoursStart(cfg.working_hours_start)
      if (cfg.working_hours_end != null) setWorkingHoursEnd(cfg.working_hours_end)
    } catch { /* keep defaults */ }

    // Load notification settings from backend
    try {
      const notifRes = await authApi.getNotificationSettings()
      if (notifRes.settings != null) setNotificationSettings(notifRes.settings)
    } catch { /* keep defaults */ }

    // Load security settings from backend
    try {
      const secRes = await authApi.getSecuritySettings()
      if (secRes != null) {
        const mapped = [
          { key: 'two-factor', title: 'Two-Factor Authentication', sub: 'Require 2FA for all staff logins', enabled: !!secRes.two_factor },
          { key: 'session-timeout', title: 'Session Timeout', sub: 'Auto logout after 30 minutes', enabled: true },
          { key: 'login-limit', title: 'Login Attempt Limit', sub: 'Lock after 5 failed attempts', enabled: true },
          { key: 'audit-log', title: 'Audit Log', sub: 'Record all data access events', enabled: !!secRes.audit_log },
        ]
        setSecuritySettings(mapped)
        if (secRes.session_timeout_minutes) {
          const mins = Number(secRes.session_timeout_minutes)
          if (mins >= 60) setTimeoutDuration(`${mins / 60} hour`)
          else setTimeoutDuration(`${mins} min`)
        }
        if (Array.isArray(secRes.password_rules)) {
          setPasswordRules(secRes.password_rules)
        }
      }
    } catch { /* keep defaults */ }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  const fetchLabFees = useCallback(async () => {
    setLabFeeLoading(true)
    setLabFeeError('')
    try {
      const configs = await paymentApi.getLabFeeConfigs()
      const list = Array.isArray(configs)
        ? configs
        : Array.isArray(configs?.data)
          ? configs.data
          : Array.isArray(configs?.items)
            ? configs.items
            : []

      setLabFees(list)
      setLabFeeEdits({})

      if (!Array.isArray(configs) && list.length === 0) {
        setLabFeeError('Could not parse lab fee payload from API response.')
      }
    } catch (err) {
      console.error('Failed to load lab fees', err)
      setLabFeeError(err?.message || 'Failed to load lab fees')
      setLabFees([])
    } finally {
      setLabFeeLoading(false)
    }
  }, [])

  // Fetch lab fees when section changes to 'lab-fees'
  useEffect(() => {
    if (activeSection === 'lab-fees') {
      fetchLabFees()
    }
  }, [activeSection, fetchLabFees])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        authApi.updateConfig({
          clinic_name: clinicName,
          support_email: supportEmail,
          maintenance_mode: maintenanceMode,
          default_slot_duration_minutes: duration,
          max_appointments_per_day: maxAppointments,
          working_hours_start: workingHoursStart,
          working_hours_end: workingHoursEnd,
        }),
        authApi.updateNotificationSettings(notificationSettings),
        authApi.updateSecuritySettings({
          audit_log: securitySettings.find((s) => s.key === 'audit-log')?.enabled ?? true,
          password_rules: passwordRules,
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* save failed */ } finally {
      setSaving(false)
    }
  }

  const toggleHour = (day) => {
    setHours((prev) =>
      prev.map((entry) =>
        entry.day === day && !entry.locked
          ? { ...entry, enabled: !entry.enabled }
          : entry
      )
    )
  }

  const updateHour = (day, field, value) => {
    setHours((prev) =>
      prev.map((entry) =>
        entry.day === day ? { ...entry, [field]: value } : entry
      )
    )
  }

  const toggleByKey = (setter, key) => {
    setter((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const togglePasswordRule = (key) => {
    setPasswordRules((prev) =>
      prev.map((rule) =>
        rule.key === key ? { ...rule, checked: !rule.checked } : rule
      )
    )
  }

  const handleLabFeeEdit = (testId, newFee) => {
    setLabFeeEdits(prev => ({ ...prev, [testId]: newFee }))
  }

  const handleLabFeeSave = async (testId) => {
    const newFee = labFeeEdits[testId]
    if (!newFee || newFee < 0) return
    
    setLabFeeSaving(testId)
    try {
      await paymentApi.updateLabFee(testId, newFee)
      setLabFees(prev => prev.map(f => f.test_id === testId ? { ...f, fee: newFee } : f))
      setLabFeeEdits(prev => { const copy = { ...prev }; delete copy[testId]; return copy })
    } catch (err) {
      console.error('Failed to save lab fee', err)
    } finally {
      setLabFeeSaving(null)
    }
  }

  return (
    <>
      <span className="sr-only">{user.name}</span>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#eeeef5]">System Settings</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#9898b0]">
            Configure clinic operations and system preferences
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] ${
            saved
              ? 'bg-emerald-600'
              : 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 hover:shadow-[0_4px_12px_rgba(244,63,94,0.35)]'
          }`}
        >
          {saved ? <CheckIcon className="h-4 w-4" /> : <SaveIcon className="h-4 w-4" />}
          {saveLabel(saved, saving)}
        </button>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <aside className="w-full flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:w-56">
          <div className="flex flex-col gap-0.5">
            {SECTION_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-rose-50 font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-[#9898b0] dark:hover:bg-[#16161e]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </aside>

        <div className="flex-1">
          {activeSection === 'clinic' && (
            <SectionCard>
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Clinic Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Clinic Name</span>
                  <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className={INPUT_CLASS} />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Address</span>
                  <input type="text" defaultValue="123 Hoan Kiem St, Hanoi" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Phone</span>
                  <input type="text" defaultValue="+84 24 3825 4567" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Support Email</span>
                  <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Website</span>
                  <input type="text" defaultValue="www.healthai.vn" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Tax ID</span>
                  <input type="text" defaultValue="0123456789" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">License Number</span>
                  <input type="text" defaultValue="HN-MED-2024-0142" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Established</span>
                  <input type="date" defaultValue="2020-01-15" className={INPUT_CLASS} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Max Appointments / Day</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={maxAppointments}
                    onChange={(e) => setMaxAppointments(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </label>

                <div className="flex items-center justify-between md:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">Maintenance Mode</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Temporarily disable patient-facing features</p>
                  </div>
                  <Toggle enabled={maintenanceMode} onToggle={() => setMaintenanceMode((v) => !v)} />
                </div>

                <div className="mt-2 md:col-span-2">
                  <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-[#9898b0]">Clinic Logo</p>
                  <button
                    type="button"
                    className="w-full rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center transition hover:border-rose-300 hover:bg-rose-50/30 dark:border-[#252530] dark:hover:border-rose-700 dark:hover:bg-rose-950/20"
                  >
                    <UploadIcon className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-[#404050]" />
                    <p className="text-sm text-slate-500 dark:text-[#70708a]">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">PNG, JPG up to 2MB</p>
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {activeSection === 'hours' && (
            <SectionCard>
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Working Hours</h2>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                {hours.map((entry) => (
                  <div key={entry.day} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="flex w-32 items-center gap-3">
                      <Toggle
                        enabled={entry.enabled}
                        disabled={entry.locked}
                        onToggle={() => toggleHour(entry.day)}
                      />
                      <span className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{entry.day}</span>
                    </div>

                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="time"
                        value={entry.from}
                        onChange={(e) => updateHour(entry.day, 'from', e.target.value)}
                        disabled={!entry.enabled}
                        className={`${INPUT_CLASS} w-32 ${entry.enabled ? '' : 'cursor-not-allowed opacity-60'}`}
                      />
                      <span className="text-xs text-slate-400 dark:text-[#606070]">to</span>
                      <input
                        type="time"
                        value={entry.to}
                        onChange={(e) => updateHour(entry.day, 'to', e.target.value)}
                        disabled={!entry.enabled}
                        className={`${INPUT_CLASS} w-32 ${entry.enabled ? '' : 'cursor-not-allowed opacity-60'}`}
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-[#70708a]">
                      {entry.enabled ? `${entry.slots} slots` : 'Closed'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-[#1c1c25]">
                <p className="mb-3 text-xs font-medium text-slate-600 dark:text-[#9898b0]">
                  Default Appointment Duration
                </p>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDuration(value)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        duration === value
                          ? 'bg-rose-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'
                      }`}
                    >
                      {value} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-[#1c1c25]">
                <p className="mb-3 text-xs font-medium text-slate-600 dark:text-[#9898b0]">Default Working Hours (saved to server)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className={`${INPUT_CLASS} w-36`}
                  />
                  <span className="text-xs text-slate-400 dark:text-[#606070]">to</span>
                  <input
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className={`${INPUT_CLASS} w-36`}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {activeSection === 'lab-fees' && (
            <SectionCard>
              <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Lab Test Fees</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#9898b0]">
                    Configure and update pricing for laboratory tests (in VND)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchLabFees}
                  disabled={labFeeLoading}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
                >
                  Refresh
                </button>
              </div>

              {!!labFeeError && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  {labFeeError}
                </div>
              )}

              {labFeeLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-rose-600 dark:border-[#252530] dark:border-t-rose-400" />
                </div>
              )}

              {!labFeeLoading && labFees.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]">
                  No lab fees configured yet
                </div>
              )}

              {!labFeeLoading && labFees.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#1c1c25]">
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-[#9898b0]">Test Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-[#9898b0]">Test ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-[#9898b0]">Fee (VND)</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-[#9898b0]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                      {labFees.map(fee => {
                        const editValue = labFeeEdits[fee.test_id]
                        const isEditing = editValue !== undefined
                        return (
                          <tr key={fee.test_id} className="hover:bg-slate-50 dark:hover:bg-[#1c1c25]">
                            <td className="px-4 py-3 text-slate-900 dark:text-[#eeeef5]">{fee.test_name}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-[#9898b0]">{fee.test_id}</td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => handleLabFeeEdit(fee.test_id, parseInt(e.target.value, 10) || 0)}
                                  className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]"
                                />
                              ) : (
                                <span className="text-slate-900 dark:text-[#eeeef5]">
                                  {new Intl.NumberFormat('vi-VN').format(fee.fee)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => handleLabFeeSave(fee.test_id)}
                                  disabled={labFeeSaving === fee.test_id}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                >
                                  {labFeeSaving === fee.test_id ? 'Saving...' : 'Save'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLabFeeEdit(fee.test_id, fee.fee)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {activeSection === 'notifications' && (
            <SectionCard>
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Notification Settings</h2>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                {notificationSettings.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{item.sub}</p>
                    </div>
                    <Toggle
                      enabled={item.enabled}
                      onToggle={() => toggleByKey(setNotificationSettings, item.key)}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeSection === 'security' && (
            <SectionCard>
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Security Settings</h2>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                {securitySettings.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{item.sub}</p>
                    </div>
                    <Toggle
                      enabled={item.enabled}
                      onToggle={() => toggleByKey(setSecuritySettings, item.key)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">
                    Session Timeout Duration
                  </span>
                  <select
                    value={timeoutDuration}
                    onChange={(e) => setTimeoutDuration(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-[#1c1c25]">
                <p className="mb-3 text-xs font-medium text-slate-600 dark:text-[#9898b0]">Password Requirements</p>
                <div className="flex flex-col gap-3">
                  {passwordRules.map((rule) => (
                    <label key={rule.key} className="flex cursor-pointer items-center gap-3">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150 ${
                          rule.checked
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-2 border-slate-300 dark:border-[#3a3a4b]'
                        }`}
                      >
                        {rule.checked && <CheckIcon className="h-3 w-3" />}
                      </span>
                      <input
                        type="checkbox"
                        checked={rule.checked}
                        onChange={() => togglePasswordRule(rule.key)}
                        className="sr-only"
                      />
                      <span className="text-sm text-slate-700 dark:text-[#c8c8e0]">{rule.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}

          {activeSection === 'appearance' && (
            <SectionCard>
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Appearance</h2>
              </div>

              <div className="mb-6">
                <p className="mb-3 text-xs font-medium text-slate-600 dark:text-[#9898b0]">Color Theme</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`rounded-xl border p-4 text-center transition-all duration-150 ${
                      themeMode === 'light'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]'
                    }`}
                  >
                    <div className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="mb-1 h-1.5 w-3/4 rounded-full bg-indigo-300" />
                      <div className="h-1.5 w-1/2 rounded-full bg-teal-300" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-[#eeeef5]">Light</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`rounded-xl border p-4 text-center transition-all duration-150 ${
                      themeMode === 'dark'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]'
                    }`}
                  >
                    <div className="h-12 w-full rounded-lg border border-[#252530] bg-[#0a0a0f] p-2">
                      <div className="mb-1 h-1.5 w-3/4 rounded-full bg-indigo-500" />
                      <div className="h-1.5 w-1/2 rounded-full bg-indigo-400" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-[#eeeef5]">Dark</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('system')}
                    className={`rounded-xl border p-4 text-center transition-all duration-150 ${
                      themeMode === 'system'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-[#252530] dark:hover:bg-[#16161e]'
                    }`}
                  >
                    <div className="h-12 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-[#252530]">
                      <div className="flex h-full">
                        <div className="w-1/2 bg-slate-50" />
                        <div className="w-1/2 bg-[#0a0a0f]" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-[#eeeef5]">System</p>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 dark:border-[#1c1c25]">
                <p className="text-xs font-medium text-slate-600 dark:text-[#9898b0]">Admin Accent Color</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">Currently affects admin portal only</p>

                <div className="mt-3 flex gap-3">
                  {[
                    { key: 'rose', color: 'bg-rose-500' },
                    { key: 'indigo', color: 'bg-indigo-500' },
                    { key: 'teal', color: 'bg-teal-500' },
                    { key: 'violet', color: 'bg-violet-500' },
                    { key: 'amber', color: 'bg-amber-500' },
                  ].map((swatch) => (
                    <button
                      key={swatch.key}
                      type="button"
                      onClick={() => setAccentColor(swatch.key)}
                      className={`h-9 w-9 rounded-xl ${swatch.color} transition hover:scale-110 ring-2 ring-offset-2 dark:ring-offset-[#111118] ${
                        accentColor === swatch.key ? 'ring-rose-500' : 'ring-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-[#1c1c25]">
                <p className="mb-3 text-xs font-medium text-slate-600 dark:text-[#9898b0]">Default Sidebar</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarSize('expanded')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      sidebarSize === 'expanded'
                        ? 'bg-rose-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'
                    }`}
                  >
                    Expanded
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarSize('collapsed')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      sidebarSize === 'collapsed'
                        ? 'bg-rose-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'
                    }`}
                  >
                    Collapsed
                  </button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  )
}

SystemConfigView.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
