import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { doctorApi } from '../../api/doctor'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const inputClass =
  'w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#0c0c13] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150'

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
      <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-[#eeeef5]">{title}</h2>
      {children}
    </div>
  )
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default function DoctorProfileView({ user }) {
  const [loading, setLoading] = useState(true)

  // Profile fields
  const [bio, setBio] = useState(() => localStorage.getItem('doctor-bio') ?? '')
  const [phone, setPhone] = useState(() => localStorage.getItem('doctor-phone') ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState(null)

  // Appointment defaults (fee + duration)
  const [consultationFee, setConsultationFee] = useState(() => localStorage.getItem('doctor-consultation-fee') ?? '')
  const [defaultDuration, setDefaultDuration] = useState(() => localStorage.getItem('doctor-default-duration') ?? '30')
  const [savingDefaults, setSavingDefaults] = useState(false)
  const [defaultsSaved, setDefaultsSaved] = useState(false)
  const [defaultsError, setDefaultsError] = useState(null)

  // Auto-confirm
  const [autoConfirm, setAutoConfirm] = useState(false)
  const [savingAutoConfirm, setSavingAutoConfirm] = useState(false)

  // Services
  const [services, setServices] = useState([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceFee, setNewServiceFee] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')
  const [addingService, setAddingService] = useState(false)
  const [serviceError, setServiceError] = useState(null)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [doctorData, servicesData] = await Promise.allSettled([
        doctorApi.getDoctor(user.id),
        doctorApi.getServices(user.id),
      ])

      if (doctorData.status === 'fulfilled' && doctorData.value) {
        const d = doctorData.value
        // Load server-side fields; don't overwrite locally-stored extras
        if (!localStorage.getItem('doctor-bio')) setBio(d.bio ?? '')
        if (!localStorage.getItem('doctor-phone')) setPhone(d.phone ?? '')
        if (!localStorage.getItem('doctor-consultation-fee') && d.consultation_fee != null)
          setConsultationFee(String(d.consultation_fee))
        setAutoConfirm(d.auto_confirm ?? false)
      }

      if (servicesData.status === 'fulfilled') {
        const raw = servicesData.value
        let list = []
        if (Array.isArray(raw)) {
          list = raw
        } else if (Array.isArray(raw?.services)) {
          list = raw.services
        }
        setServices(list)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileError(null)
    setProfileSaved(false)
    try {
      // Bio and phone are stored locally (backend Doctor entity doesn't expose these fields)
      localStorage.setItem('doctor-bio', bio)
      localStorage.setItem('doctor-phone', phone)
      setProfileSaved(true)
      globalThis.setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      setProfileError(err?.message ?? 'Failed to save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSaveDefaults() {
    setSavingDefaults(true)
    setDefaultsError(null)
    setDefaultsSaved(false)
    try {
      // Duration and fee are stored locally; surfaced to queue/EMR via localStorage
      const dur = Number(defaultDuration)
      if (!dur || dur < 5) throw new Error('Duration must be at least 5 minutes.')
      localStorage.setItem('doctor-default-duration', String(dur))
      if (consultationFee) {
        const fee = Number(consultationFee)
        if (Number.isNaN(fee) || fee < 0) throw new Error('Fee must be a non-negative number.')
        localStorage.setItem('doctor-consultation-fee', String(fee))
      } else {
        localStorage.removeItem('doctor-consultation-fee')
      }
      setDefaultsSaved(true)
      globalThis.setTimeout(() => setDefaultsSaved(false), 3000)
    } catch (err) {
      setDefaultsError(err?.message ?? 'Failed to save settings.')
    } finally {
      setSavingDefaults(false)
    }
  }

  async function handleToggleAutoConfirm() {
    const next = !autoConfirm
    setSavingAutoConfirm(true)
    try {
      await doctorApi.setAutoConfirm({ auto_confirm: next })
      setAutoConfirm(next)
    } catch {
      // revert on failure — state unchanged
    } finally {
      setSavingAutoConfirm(false)
    }
  }

  async function handleAddService() {
    if (!newServiceName.trim()) {
      setServiceError('Service name is required.')
      return
    }
    setAddingService(true)
    setServiceError(null)
    try {
      const q = {
        name: newServiceName.trim(),
        fee: newServiceFee ? Number(newServiceFee) : undefined,
        duration_minutes: newServiceDuration ? Number(newServiceDuration) : undefined,
      }
      const created = await doctorApi.addService(user.id, q)
      setServices((prev) => [...prev, created])
      setNewServiceName('')
      setNewServiceFee('')
      setNewServiceDuration('')
    } catch (err) {
      setServiceError(err?.message ?? 'Failed to add service.')
    } finally {
      setAddingService(false)
    }
  }

  async function handleDeleteService(svcId) {
    try {
      await doctorApi.deleteService(user.id, svcId)
      setServices((prev) => prev.filter((s) => s.id !== svcId))
    } catch {
      // silent — user can retry
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#1c1c25]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Manage your professional information and services.</p>
      </div>

      {/* Basic Info */}
      <SectionCard title="Professional Details">
        <div className="space-y-4">
          <div>
            <label htmlFor="dp-bio" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
              Bio
            </label>
            <textarea
              id="dp-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your background, expertise, and approach to care…"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="dp-phone" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
              Contact Phone
            </label>
            <input
              id="dp-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 000 000 000"
              className={inputClass}
            />
          </div>

          {profileError && (
            <p className="text-xs text-rose-500">{profileError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex h-4 w-4" aria-hidden="true"><CheckIcon /></span>
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Appointment Settings */}
      <SectionCard title="Appointment Settings">
        <div className="space-y-5">
          {/* Auto-confirm toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">Auto-confirm Appointments</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                Automatically confirm new appointment requests without manual review.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoConfirm}
              disabled={savingAutoConfirm}
              aria-pressed={autoConfirm}
              aria-label={autoConfirm ? 'Disable auto-confirm' : 'Enable auto-confirm'}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
                autoConfirm ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-[#252530]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  autoConfirm ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <hr className="border-slate-100 dark:border-[#1c1c25]" />

          {/* Default adjustment: duration + fee */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Appointment Defaults</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dp-duration" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                  Default Duration (minutes)
                </label>
                <input
                  id="dp-duration"
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  placeholder="30"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="dp-fee" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                  Default Consultation Fee (VND)
                </label>
                <input
                  id="dp-fee"
                  type="number"
                  min="0"
                  step="1000"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="e.g. 300000"
                  className={inputClass}
                />
              </div>
            </div>

            {defaultsError && (
              <p className="mt-2 text-xs text-rose-500">{defaultsError}</p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDefaults}
                disabled={savingDefaults}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                {savingDefaults ? 'Saving…' : 'Save Settings'}
              </button>
              {defaultsSaved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="inline-flex h-4 w-4" aria-hidden="true"><CheckIcon /></span>
                  <span>Saved</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Services */}
      <SectionCard title="Services Offered">
        {services.length > 0 && (
          <div className="mb-4 divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{svc.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[#70708a]">
                    {svc.fee == null ? 'Fee on enquiry' : `${Number(svc.fee).toLocaleString()} VND`}
                    {svc.duration_minutes ? ` · ${svc.duration_minutes} min` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteService(svc.id)}
                  aria-label={`Remove service ${svc.name}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                >
                  <span className="inline-flex h-4 w-4"><TrashIcon /></span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new service */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Service name"
              className={inputClass}
            />
          </div>
          <input
            type="number"
            min="0"
            value={newServiceFee}
            onChange={(e) => setNewServiceFee(e.target.value)}
            placeholder="Fee (VND)"
            className={inputClass}
          />
          <input
            type="number"
            min="1"
            value={newServiceDuration}
            onChange={(e) => setNewServiceDuration(e.target.value)}
            placeholder="Duration (min)"
            className={inputClass}
          />
        </div>

        {serviceError && (
          <p className="mt-2 text-xs text-rose-500">{serviceError}</p>
        )}

        <button
          type="button"
          onClick={handleAddService}
          disabled={addingService}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#252530] dark:text-[#c8c8e0] dark:hover:border-[#353545] dark:hover:bg-[#1c1c25]"
        >
          <span className="inline-flex h-4 w-4"><PlusIcon /></span>
          {addingService ? 'Adding…' : 'Add Service'}
        </button>
      </SectionCard>
    </div>
  )
}

DoctorProfileView.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
}
