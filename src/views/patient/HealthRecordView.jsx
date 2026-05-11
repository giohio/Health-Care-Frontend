import { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import { IconWarning } from '../../icons'
import { patientApi } from '../../api/patient'
import { clinicalApi } from '../../api/clinical'

const BLOOD_TYPES = ['A', 'B', 'AB', 'O']
const GENDER_LABEL = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' }

const INS_TO_API = { 'Public (BHYT)': 'BHYT_PUBLIC', 'Private': 'PRIVATE', 'None': 'NONE' }
const INS_FROM_API = { 'BHYT_PUBLIC': 'Public (BHYT)', 'PRIVATE': 'Private', 'NONE': 'None' }

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function badgeTone(severity) {
  if (severity === 'Severe') return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  if (severity === 'Moderate') return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300'
  return 'border border-slate-200 bg-slate-100 text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a]'
}

function PersonalRow({ label, control }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 max-sm:flex-col max-sm:items-start">
      <span className="w-36 shrink-0 text-xs text-slate-400 dark:text-[#606070] max-sm:w-auto">{label}</span>
      <div className="min-w-0 flex-1 text-sm text-slate-600 dark:text-[#9898b0]">{control}</div>
    </div>
  )
}

PersonalRow.propTypes = { label: PropTypes.string.isRequired, control: PropTypes.node.isRequired }

function parseAllergiesString(str) {
  if (!str) return []
  const list = Array.isArray(str) ? str : str.split(';')
  return list.map((s, i) => {
    const trimmed = String(s).trim()
    if (!trimmed) return null
    const match = trimmed.match(/^(.+?)\s*\((\w+)\):\s*(.+)$/)
    if (match) return { id: i + 1, name: match[1].trim(), severity: match[2].trim(), reaction: match[3].trim() }
    return { id: i + 1, name: trimmed, severity: 'Moderate', reaction: '' }
  }).filter(Boolean)
}

function serializeAllergies(list) {
  return list.filter((a) => a.name).map((a) => `${a.name} (${a.severity}): ${a.reaction}`).join('; ')
}

export default function HealthRecordView({ currentUser }) {
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [personal, setPersonal] = useState({ fullName: '', dateOfBirth: '', gender: '', bloodType: '', phone: '', email: '' })
  const [health, setHealth] = useState({ chronic_conditions: '', current_medications: '', past_surgeries: '', family_history: '' })
  const [clinicalSummary, setClinicalSummary] = useState(null)
  const [allergies, setAllergies] = useState([])
  const [fadingAllergyIds, setFadingAllergyIds] = useState([])
  const [vitals, setVitals] = useState({ height_cm: '', weight_kg: '', blood_pressure: '', heart_rate_bpm: '' })
  const [isEditingVitals, setIsEditingVitals] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState({ name: '', relationship: 'Spouse', phone: '', email: '' })
  const [isEditingEmergency, setIsEditingEmergency] = useState(false)
  const [insurance, setInsurance] = useState({ provider: '', policy_id: '', type: 'None', expiry_date: '' })
  const [isEditingInsurance, setIsEditingInsurance] = useState(false)
  const [vaccinations, setVaccinations] = useState([])
  const [visitNotes, setVisitNotes] = useState([])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const photoInputRef = useRef(null)

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await patientApi.getProfile()
      const p = data.profile ?? {}
      const h = data.health_background ?? {}
      setPersonal({
        fullName: p.full_name ?? '',
        dateOfBirth: p.date_of_birth ?? '',
        gender: p.gender ?? '',
        bloodType: h.blood_type ?? '',
        phone: p.phone_number ?? '',
        email: currentUser?.email ?? '',
      })
      setHealth({
        chronic_conditions: h.chronic_conditions ?? '',
        current_medications: h.current_medications ?? '',
        past_surgeries: h.past_surgeries ?? '',
        family_history: h.family_history ?? '',
      })
      setAllergies(parseAllergiesString(h.allergies))
      const vs = p.vital_signs ?? {}
      setVitals({
        height_cm: vs.height_cm ?? h.height_cm ?? '',
        weight_kg: vs.weight_kg ?? h.weight_kg ?? '',
        blood_pressure: vs.blood_pressure ?? '',
        heart_rate_bpm: vs.heart_rate_bpm ?? '',
      })
      const ec = p.emergency_contact ?? {}
      setEmergencyContact({
        name: ec.name ?? '',
        relationship: ec.relationship ?? 'Spouse',
        phone: ec.phone ?? '',
        email: ec.email ?? '',
      })
      const ins = p.insurance ?? {}
      setInsurance({
        provider: ins.provider ?? '',
        policy_id: ins.policy_id ?? '',
        type: INS_FROM_API[ins.type] ?? ins.type ?? 'None',
        expiry_date: ins.expiry_date ?? '',
      })
      setProfilePhotoUrl(p.profile_photo_url ?? null)
      setUpdatedAt(p.updated_at ?? null)
      try {
        const cData = await clinicalApi.getSummary(currentUser.id)
        if (cData) setClinicalSummary(cData.data ?? cData)
      } catch (cErr) {
        console.error('Failed to load clinical summary:', cErr)
      }
      try {
        const vData = await clinicalApi.getVaccinations(currentUser.id)
        if (Array.isArray(vData)) setVaccinations(vData)
        else if (vData?.data && Array.isArray(vData.data)) setVaccinations(vData.data)
      } catch {
        setVaccinations([])
      }
      try {
        const nData = await clinicalApi.getNotes(currentUser.id)
        const notes = Array.isArray(nData) ? nData : (nData?.notes ?? nData?.data ?? [])
        setVisitNotes(Array.isArray(notes)
          ? notes
            .filter((note) => String(note?.note_type || '').toLowerCase() !== 'summary')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [])
      } catch {
        setVisitNotes([])
      }
    } catch (err) {
      setError(err.message || 'Failed to load health record')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.email, currentUser?.id])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleSavePersonal() {
    setSaveLoading(true)
    try {
      await patientApi.patchProfile({ full_name: personal.fullName, date_of_birth: personal.dateOfBirth, gender: personal.gender, phone_number: personal.phone })
      await patientApi.updateHealth({ ...health, blood_type: personal.bloodType, allergies: serializeAllergies(allergies) })
      setIsEditingPersonal(false)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaveLoading(false)
    }
  }

  function handlePersonalChange(key, value) {
    setPersonal((prev) => ({ ...prev, [key]: value }))
  }

  function handleAddAllergy() {
    const id = allergies.length ? Math.max(...allergies.map((a) => a.id)) + 1 : 1
    setAllergies((prev) => [...prev, { id, name: '', severity: 'Moderate', reaction: '', isNew: true }])
  }

  function handleAllergyChange(id, key, value) {
    setAllergies((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function handleDeleteAllergy(id) {
    setFadingAllergyIds((prev) => [...prev, id])
    globalThis.setTimeout(() => finalizeDeleteAllergy(id), 220)
  }

  function finalizeDeleteAllergy(id) {
    setAllergies((prev) => prev.filter((item) => item.id !== id))
    setFadingAllergyIds((prev) => prev.filter((value) => value !== id))
  }

  function handleHealthChange(key, value) {
    setHealth((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSaveAllergies() {
    setSaveLoading(true)
    try {
      await patientApi.updateHealth({ ...health, allergies: serializeAllergies(allergies) })
      setAllergies((prev) => prev.map((a) => ({ ...a, isNew: false })))
    } catch (err) {
      setError(err.message || 'Failed to save allergies')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleSaveVitals() {
    setSaveLoading(true)
    try {
      const vital_signs = {}
      if (vitals.height_cm !== '') vital_signs.height_cm = Number(vitals.height_cm)
      if (vitals.weight_kg !== '') vital_signs.weight_kg = Number(vitals.weight_kg)
      if (vitals.blood_pressure) vital_signs.blood_pressure = vitals.blood_pressure
      if (vitals.heart_rate_bpm !== '') vital_signs.heart_rate_bpm = Number(vitals.heart_rate_bpm)
      await patientApi.patchProfile({ vital_signs })
      setIsEditingVitals(false)
    } catch (err) {
      setError(err.message || 'Failed to save vitals')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleSaveEmergency() {
    setSaveLoading(true)
    try {
      await patientApi.patchProfile({ emergency_contact: emergencyContact })
      setIsEditingEmergency(false)
    } catch (err) {
      setError(err.message || 'Failed to save emergency contact')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleSaveInsurance() {
    setSaveLoading(true)
    try {
      await patientApi.patchProfile({ insurance: { ...insurance, type: INS_TO_API[insurance.type] ?? insurance.type } })
      setIsEditingInsurance(false)
    } catch (err) {
      setError(err.message || 'Failed to save insurance')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handlePhotoUpload(file) {
    if (!file) return
    setPhotoLoading(true)
    try {
      const result = await patientApi.uploadProfilePhoto(file)
      setProfilePhotoUrl(result?.url ?? result?.profile_photo_url ?? null)
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setPhotoLoading(false)
    }
  }

  const inputClasses = 'w-full border-b border-indigo-300 bg-transparent pb-0.5 text-slate-900 outline-none focus:border-indigo-600 dark:border-indigo-600 dark:text-[#eeeef5] dark:focus:border-indigo-400'
  let actionBtnText = 'Edit'
  if (saveLoading) actionBtnText = 'Saving...'
  else if (isEditingPersonal) actionBtnText = 'Save'

  const personalActionClass = isEditingPersonal
    ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500'
    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'

  function handlePersonalActionClick() {
    if (isEditingPersonal) { handleSavePersonal(); return }
    setIsEditingPersonal(true)
  }

  if (loading) return <div className="api-loading"><div className="api-skeleton" /><div className="api-skeleton api-skeleton--short" /></div>
  if (error) return <div className="api-error"><p>{error}</p><button onClick={loadProfile} className="api-error__retry">Retry</button></div>

  const selectClasses = 'rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]'
  const editSaveClass = (editing) => `rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${editing ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'}`

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Health Record</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your personal medical profile and allergy information.</p>

      {/* Personal Information */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Personal Information</p>
          <button type="button" disabled={saveLoading} className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${personalActionClass}`} onClick={handlePersonalActionClick}>{actionBtnText}</button>
        </div>
        <div className="mb-3 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-[#252530] dark:bg-[#111118]">
          <div className="relative shrink-0">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-300 dark:ring-indigo-700" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                {personal.fullName ? personal.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() : '?'}
              </div>
            )}
            <button type="button" aria-label="Change profile photo" disabled={photoLoading} onClick={() => photoInputRef.current?.click()} className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md ring-2 ring-white hover:bg-indigo-700 dark:ring-[#111118]">
              {photoLoading ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              )}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e.target.files?.[0])} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">{personal.fullName || 'Your Name'}</p>
            <p className="text-xs text-slate-400 dark:text-[#606070]">{personal.email || '--'}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Full Name" control={isEditingPersonal ? <input className={inputClasses} value={personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} /> : personal.fullName || '--'} />
          <PersonalRow label="Date of Birth" control={isEditingPersonal ? <input type="date" className={inputClasses} value={personal.dateOfBirth} onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} min="1900-01-01" /> : personal.dateOfBirth || '--'} />
          <PersonalRow label="Gender" control={isEditingPersonal ? (
            <select className={selectClasses} value={personal.gender} onChange={(e) => handlePersonalChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          ) : (GENDER_LABEL[personal.gender] || personal.gender || '--')} />
          <PersonalRow label="Blood Type" control={isEditingPersonal ? (
            <select className={selectClasses} value={personal.bloodType} onChange={(e) => handlePersonalChange('bloodType', e.target.value)}>
              <option value="">Select</option>
              {BLOOD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          ) : personal.bloodType || '--'} />
          <PersonalRow label="Phone" control={isEditingPersonal ? <input className={inputClasses} value={personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} /> : personal.phone || '--'} />
          <PersonalRow label="Email" control={personal.email || '--'} />
        </div>
      </section>

      {/* Vital Signs */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Vital Signs</p>
          <button type="button" disabled={saveLoading} onClick={() => isEditingVitals ? handleSaveVitals() : setIsEditingVitals(true)} className={editSaveClass(isEditingVitals)}>{saveLoading && isEditingVitals ? 'Saving...' : isEditingVitals ? 'Save' : 'Edit'}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Height" control={isEditingVitals ? <input type="number" min="0" className={inputClasses} placeholder="cm" value={vitals.height_cm} onChange={(e) => setVitals((v) => ({ ...v, height_cm: e.target.value }))} /> : vitals.height_cm ? `${vitals.height_cm} cm` : '--'} />
          <PersonalRow label="Weight" control={isEditingVitals ? <input type="number" min="0" className={inputClasses} placeholder="kg" value={vitals.weight_kg} onChange={(e) => setVitals((v) => ({ ...v, weight_kg: e.target.value }))} /> : vitals.weight_kg ? `${vitals.weight_kg} kg` : '--'} />
          <PersonalRow label="BMI" control={(() => {
            const hVal = parseFloat(vitals.height_cm)
            const wVal = parseFloat(vitals.weight_kg)
            if (!hVal || !wVal) return '--'
            const bmi = (wVal / ((hVal / 100) ** 2)).toFixed(1)
            let tone = 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
            let bmiLabel = 'Underweight'
            if (bmi >= 30) { tone = 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'; bmiLabel = 'Obese' }
            else if (bmi >= 25) { tone = 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300'; bmiLabel = 'Overweight' }
            else if (bmi >= 18.5) { tone = 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'; bmiLabel = 'Normal' }
            return (
              <span className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-[#9898b0]">{bmi}</span>
                <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{bmiLabel}</span>
              </span>
            )
          })()} />
          <PersonalRow label="Blood Pressure" control={isEditingVitals ? <input className={inputClasses} placeholder="e.g. 120/80 mmHg" value={vitals.blood_pressure} onChange={(e) => setVitals((v) => ({ ...v, blood_pressure: e.target.value }))} /> : vitals.blood_pressure || '--'} />
          <PersonalRow label="Resting Heart Rate" control={isEditingVitals ? <input type="number" min="0" className={inputClasses} placeholder="bpm" value={vitals.heart_rate_bpm} onChange={(e) => setVitals((v) => ({ ...v, heart_rate_bpm: e.target.value }))} /> : vitals.heart_rate_bpm ? `${vitals.heart_rate_bpm} bpm` : '--'} />
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Emergency Contact</p>
          <button type="button" disabled={saveLoading} onClick={() => isEditingEmergency ? handleSaveEmergency() : setIsEditingEmergency(true)} className={editSaveClass(isEditingEmergency)}>{saveLoading && isEditingEmergency ? 'Saving...' : isEditingEmergency ? 'Save' : 'Edit'}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Contact Name" control={isEditingEmergency ? <input className={inputClasses} value={emergencyContact.name} onChange={(e) => setEmergencyContact((v) => ({ ...v, name: e.target.value }))} /> : emergencyContact.name || '--'} />
          <PersonalRow label="Relationship" control={isEditingEmergency ? (
            <select className={selectClasses} value={emergencyContact.relationship} onChange={(e) => setEmergencyContact((v) => ({ ...v, relationship: e.target.value }))}>
              {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : emergencyContact.relationship || '--'} />
          <PersonalRow label="Phone" control={isEditingEmergency ? <input className={inputClasses} value={emergencyContact.phone} onChange={(e) => setEmergencyContact((v) => ({ ...v, phone: e.target.value }))} /> : emergencyContact.phone || '--'} />
          <PersonalRow label="Email (optional)" control={isEditingEmergency ? <input className={inputClasses} value={emergencyContact.email} onChange={(e) => setEmergencyContact((v) => ({ ...v, email: e.target.value }))} /> : emergencyContact.email || '--'} />
        </div>
      </section>

      {/* Insurance */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Insurance</p>
          <button type="button" disabled={saveLoading} onClick={() => isEditingInsurance ? handleSaveInsurance() : setIsEditingInsurance(true)} className={editSaveClass(isEditingInsurance)}>{saveLoading && isEditingInsurance ? 'Saving...' : isEditingInsurance ? 'Save' : 'Edit'}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Provider" control={isEditingInsurance ? <input className={inputClasses} value={insurance.provider} onChange={(e) => setInsurance((v) => ({ ...v, provider: e.target.value }))} /> : insurance.provider || '--'} />
          <PersonalRow label="Policy / Member ID" control={isEditingInsurance ? <input className={inputClasses} value={insurance.policy_id} onChange={(e) => setInsurance((v) => ({ ...v, policy_id: e.target.value }))} /> : insurance.policy_id || '--'} />
          <PersonalRow label="Policy Type" control={isEditingInsurance ? (
            <select className={selectClasses} value={insurance.type} onChange={(e) => setInsurance((v) => ({ ...v, type: e.target.value }))}>
              <option value="Public (BHYT)">Public (BHYT)</option>
              <option value="Private">Private</option>
              <option value="None">None</option>
            </select>
          ) : insurance.type || '--'} />
          <PersonalRow label="Expiry Date" control={isEditingInsurance ? <input type="date" className={inputClasses} value={insurance.expiry_date} onChange={(e) => setInsurance((v) => ({ ...v, expiry_date: e.target.value }))} /> : insurance.expiry_date || '--'} />
        </div>
      </section>

      {/* Health Background */}
      <section className="mt-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Health Background</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {[{ key: 'chronic_conditions', label: 'Chronic Conditions' }, { key: 'current_medications', label: 'Current Medications' }, { key: 'past_surgeries', label: 'Past Surgeries' }, { key: 'family_history', label: 'Family History' }].map(({ key, label }) => (
            <PersonalRow key={key} label={label} control={isEditingPersonal ? <input className={inputClasses} value={health[key]} onChange={(e) => handleHealthChange(key, e.target.value)} /> : health[key] || '--'} />
          ))}
        </div>
      </section>

      {/* Allergy Profile */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Allergy Profile</p>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={handleAddAllergy}>+ Add Allergy</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {allergies.length === 0 && <p className="px-5 py-4 text-sm text-slate-400 dark:text-[#606070]">No allergies recorded.</p>}
          {allergies.map((allergy) => {
            const isFading = fadingAllergyIds.includes(allergy.id)
            const isEditable = allergy.isNew === true
            return (
              <div key={allergy.id} className={`flex items-center justify-between gap-4 px-5 py-4 transition-opacity duration-200 max-sm:flex-col max-sm:items-start ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="min-w-0 flex-1">
                  {isEditable ? (
                    <>
                      <input className={inputClasses} placeholder="Allergy name" value={allergy.name} onChange={(e) => handleAllergyChange(allergy.id, 'name', e.target.value)} />
                      <input className={`${inputClasses} mt-2`} placeholder="Reaction" value={allergy.reaction} onChange={(e) => handleAllergyChange(allergy.id, 'reaction', e.target.value)} />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{allergy.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">{allergy.severity} - Reaction: {allergy.reaction}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditable ? (
                    <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={allergy.severity} onChange={(e) => handleAllergyChange(allergy.id, 'severity', e.target.value)}>
                      <option value="Severe">Severe</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Mild">Mild</option>
                    </select>
                  ) : (
                    <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${badgeTone(allergy.severity)}`}>{allergy.severity}</span>
                  )}
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition-colors hover:text-rose-500 dark:text-[#404050] dark:hover:text-rose-400" aria-label={`Delete ${allergy.name || 'allergy'}`} onClick={() => handleDeleteAllergy(allergy.id)}><TrashIcon /></button>
                </div>
              </div>
            )
          })}
        </div>
        {allergies.some((a) => a.severity === 'Severe') && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]" role="alert" aria-live="polite">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"><IconWarning size={16} /></span>
            <p className="text-sm leading-relaxed">Severe allergies are automatically flagged to all assigned doctors before every appointment.</p>
          </div>
        )}
        {allergies.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button type="button" disabled={saveLoading} onClick={handleSaveAllergies} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-500">{saveLoading ? 'Saving...' : 'Save Allergies'}</button>
          </div>
        )}
      </section>

      {/* Vaccination History */}
      <section className="mt-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Vaccination History</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {vaccinations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <span className="text-3xl emoji-vaccine" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-500 dark:text-[#606070]">No vaccination records on file.</p>
            </div>
          ) : vaccinations.map((vac) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            let dueBadge = <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">Up to date</span>
            if (vac.next_due_date) {
              const due = new Date(vac.next_due_date)
              const diffDays = Math.ceil((due - today) / 86400000)
              if (diffDays < 0) dueBadge = <span className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">Overdue</span>
              else if (diffDays <= 30) dueBadge = <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">Due soon</span>
            }
            return (
              <div key={`${vac.vaccine_name}-${vac.date_administered}`} className="flex items-center justify-between gap-4 px-5 py-4 max-sm:flex-col max-sm:items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{vac.vaccine_name}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">Administered: {vac.date_administered || '--'}{vac.next_due_date ? ` - Next due: ${vac.next_due_date}` : ''}</p>
                </div>
                {dueBadge}
              </div>
            )
          })}
        </div>
      </section>

      {clinicalSummary && (
        <section className="mt-10 mb-10">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Clinical Summary (Auto-synced)</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Diagnoses</h3>
            {clinicalSummary.diagnoses && clinicalSummary.diagnoses.length > 0 ? (
              <ul className="mb-4 list-disc list-inside pl-4 text-sm text-slate-600 dark:text-[#9898b0]">
                {clinicalSummary.diagnoses.map((d) => <li key={d.id}>{d.diagnosis_name} (Code: {d.icd10_code}) - {d.status}</li>)}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-slate-400 dark:text-[#606070]">No active diagnoses found.</p>
            )}
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Medications</h3>
            {clinicalSummary.medications && clinicalSummary.medications.length > 0 ? (
              <ul className="list-disc list-inside pl-4 text-sm text-slate-600 dark:text-[#9898b0]">
                {clinicalSummary.medications.map((m) => <li key={m.id}>{m.drug_name} - {m.dosage} ({m.frequency})</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 dark:text-[#606070]">No active medications found.</p>
            )}
          </div>
        </section>
      )}

      {/* Visit Notes */}
      <section className="mt-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Visit Notes</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {visitNotes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-[#606070]">No visit notes have been recorded yet.</p>
            </div>
          ) : visitNotes.map((note) => (
            <div key={note.id} className="flex items-start justify-between gap-4 px-5 py-4 max-sm:flex-col max-sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {note.is_ai_generated && <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-300">AI Draft</span>}
                  {note.note_type && <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#70708a] capitalize">{note.note_type}</span>}
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-[#c8c8e0]">{note.content}</p>
                {note.created_at && <p className="mt-1 text-xs text-slate-400 dark:text-[#606070]">{new Date(note.created_at).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {updatedAt && (
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-[#505060]">
          Health record last updated: {new Date(updatedAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

HealthRecordView.propTypes = {
  currentUser: PropTypes.shape({ id: PropTypes.string, email: PropTypes.string }),
}

HealthRecordView.defaultProps = {
  currentUser: null,
}
