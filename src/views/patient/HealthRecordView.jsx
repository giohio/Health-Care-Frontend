import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { IconWarning } from '../../icons'
import { patientApi } from '../../api/patient'
import { clinicalApi } from '../../api/clinical'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

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
  return str.split(';').map((s, i) => {
    const trimmed = s.trim()
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
        bloodType: p.blood_type ?? '',
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

      try {
        const cData = await clinicalApi.getSummary(currentUser.id)
        if (cData.success && cData.data) {
          setClinicalSummary(cData.data)
        }
      } catch (cErr) {
        console.error('Failed to load clinical summary:', cErr)
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
      await patientApi.updateProfile({
        full_name: personal.fullName,
        date_of_birth: personal.dateOfBirth,
        gender: personal.gender,
        blood_type: personal.bloodType,
        phone_number: personal.phone,
      })
      await patientApi.updateHealth({
        ...health,
        allergies: serializeAllergies(allergies),
      })
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
    globalThis.setTimeout(() => {
      finalizeDeleteAllergy(id)
    }, 220)
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

  const inputClasses = 'w-full border-b border-indigo-300 bg-transparent pb-0.5 text-slate-900 outline-none focus:border-indigo-600 dark:border-indigo-600 dark:text-[#eeeef5] dark:focus:border-indigo-400'

  let actionBtnText = 'Edit'
  if (saveLoading) actionBtnText = 'Saving...'
  else if (isEditingPersonal) actionBtnText = 'Save'

  const personalActionClass = isEditingPersonal
    ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500'
    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'

  function handlePersonalActionClick() {
    if (isEditingPersonal) {
      handleSavePersonal()
      return
    }
    setIsEditingPersonal(true)
  }

  if (loading) return <div className="api-loading"><div className="api-skeleton" /><div className="api-skeleton api-skeleton--short" /></div>
  if (error) return <div className="api-error"><p>{error}</p><button onClick={loadProfile} className="api-error__retry">Retry</button></div>

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Health Record</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your personal medical profile and allergy information.</p>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Personal Information</p>
          <button
            type="button"
            disabled={saveLoading}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${personalActionClass}`}
            onClick={handlePersonalActionClick}
          >
            {actionBtnText}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Full Name" control={isEditingPersonal ? <input className={inputClasses} value={personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} /> : personal.fullName || '—'} />
          <PersonalRow label="Date of Birth" control={isEditingPersonal ? <input type="date" className={inputClasses} value={personal.dateOfBirth} onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)} /> : personal.dateOfBirth || '—'} />
          <PersonalRow label="Gender" control={isEditingPersonal ? (
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={personal.gender} onChange={(e) => handlePersonalChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : personal.gender || '—'} />
          <PersonalRow
            label="Blood Type"
            control={isEditingPersonal ? (
              <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={personal.bloodType} onChange={(e) => handlePersonalChange('bloodType', e.target.value)}>
                <option value="">Select</option>
                {BLOOD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            ) : personal.bloodType || '—'}
          />
          <PersonalRow label="Phone" control={isEditingPersonal ? <input className={inputClasses} value={personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} /> : personal.phone || '—'} />
          <PersonalRow label="Email" control={personal.email || '—'} />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Allergy Profile</p>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={handleAddAllergy}>+ Add Allergy</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {allergies.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-400 dark:text-[#606070]">No allergies recorded.</p>
          )}
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
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">{allergy.severity} · Reaction: {allergy.reaction}</p>
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
            <button
              type="button"
              disabled={saveLoading}
              onClick={handleSaveAllergies}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-500"
            >
              {saveLoading ? 'Saving...' : 'Save Allergies'}
            </button>
          </div>
        )}
      </section>

      <section className="mt-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Health Background</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          {[
            { key: 'chronic_conditions', label: 'Chronic Conditions' },
            { key: 'current_medications', label: 'Current Medications' },
            { key: 'past_surgeries', label: 'Past Surgeries' },
            { key: 'family_history', label: 'Family History' },
          ].map(({ key, label }) => (
            <PersonalRow
              key={key}
              label={label}
              control={
                isEditingPersonal
                  ? <input className={inputClasses} value={health[key]} onChange={(e) => handleHealthChange(key, e.target.value)} />
                  : health[key] || '—'
              }
            />
          ))}
        </div>
      </section>

      {clinicalSummary && (
        <section className="mt-10 mb-10">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Clinical Summary (Auto-synced)</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5] mb-2">Diagnoses</h3>
            {clinicalSummary.diagnoses && clinicalSummary.diagnoses.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-[#9898b0] mb-4 pl-4">
                {clinicalSummary.diagnoses.map(d => (
                  <li key={d.id}>{d.disease_name} (Code: {d.icd_10_code}) - {d.status}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 dark:text-[#606070] mb-4">No active diagnoses found.</p>
            )}

            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5] mb-2">Medications</h3>
            {clinicalSummary.medications && clinicalSummary.medications.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-[#9898b0] pl-4">
                {clinicalSummary.medications.map(m => (
                  <li key={m.id}>{m.medication_name} - {m.dosage} ({m.frequency})</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 dark:text-[#606070]">No active medications found.</p>
            )}
          </div>
        </section>
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

