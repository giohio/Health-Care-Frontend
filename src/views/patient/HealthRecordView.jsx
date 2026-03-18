import { useState } from 'react'
import { IconWarning } from '../../icons'

const INITIAL_PERSONAL = {
  fullName: 'Jane Doe',
  dateOfBirth: 'March 4, 1990  (Age 36)',
  gender: 'Female',
  bloodType: 'O+',
  phone: '+84 912 345 678',
  email: 'jane.doe@email.com',
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const INITIAL_ALLERGIES = [
  { id: 1, name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
  { id: 2, name: 'Seafood', severity: 'Severe', reaction: 'Hives, difficulty breathing' },
  { id: 3, name: 'Dust Mites', severity: 'Mild', reaction: 'Sneezing, watery eyes' },
]

const HISTORY_ITEMS = [
  { id: 1, date: 'February 2025', title: 'General Check-up', note: 'Routine annual examination. No abnormalities found.' },
  { id: 2, date: 'November 2024', title: 'Neurology Consultation', note: 'Referred for recurring migraines. MRI ordered.' },
  { id: 3, date: 'August 2024', title: 'Lab Tests', note: 'Full blood panel. Results within normal range.' },
  { id: 4, date: 'March 2024', title: 'General Check-up', note: 'Mild iron deficiency noted. Supplements prescribed.' },
]

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

export default function HealthRecordView() {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [personal, setPersonal] = useState(INITIAL_PERSONAL)
  const [allergies, setAllergies] = useState(INITIAL_ALLERGIES)
  const [fadingAllergyIds, setFadingAllergyIds] = useState([])

  function handlePersonalChange(key, value) {
    setPersonal((prev) => ({ ...prev, [key]: value }))
  }

  function handleAddAllergy() {
    const id = Date.now()
    setAllergies((prev) => [...prev, { id, name: '', severity: 'Moderate', reaction: '', isNew: true }])
  }

  function handleAllergyChange(id, key, value) {
    setAllergies((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function handleDeleteAllergy(id) {
    setFadingAllergyIds((prev) => [...prev, id])
    window.setTimeout(() => {
      setAllergies((prev) => prev.filter((item) => item.id !== id))
      setFadingAllergyIds((prev) => prev.filter((value) => value !== id))
    }, 220)
  }

  const inputClasses = 'w-full border-b border-indigo-300 bg-transparent pb-0.5 text-slate-900 outline-none focus:border-indigo-600 dark:border-indigo-600 dark:text-[#eeeef5] dark:focus:border-indigo-400'

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-[#eeeef5]">Health Record</h1>
      <p className="mt-1 text-sm text-slate-400 dark:text-[#606070]">Your personal medical profile and allergy information.</p>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Personal Information</p>
          <button
            type="button"
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${isEditingPersonal ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]'}`}
            onClick={() => setIsEditingPersonal((prev) => !prev)}
          >
            {isEditingPersonal ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
          <PersonalRow label="Full Name" control={isEditingPersonal ? <input className={inputClasses} value={personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} /> : personal.fullName} />
          <PersonalRow label="Date of Birth" control={isEditingPersonal ? <input className={inputClasses} value={personal.dateOfBirth} onChange={(e) => handlePersonalChange('dateOfBirth', e.target.value)} /> : personal.dateOfBirth} />
          <PersonalRow label="Gender" control={isEditingPersonal ? <input className={inputClasses} value={personal.gender} onChange={(e) => handlePersonalChange('gender', e.target.value)} /> : personal.gender} />
          <PersonalRow
            label="Blood Type"
            control={isEditingPersonal ? (
              <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]" value={personal.bloodType} onChange={(e) => handlePersonalChange('bloodType', e.target.value)}>
                {BLOOD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            ) : personal.bloodType}
          />
          <PersonalRow label="Phone" control={isEditingPersonal ? <input className={inputClasses} value={personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} /> : personal.phone} />
          <PersonalRow label="Email" control={isEditingPersonal ? <input className={inputClasses} value={personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} /> : personal.email} />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1c1c25]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Allergy Profile</p>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e] dark:hover:text-[#eeeef5]" onClick={handleAddAllergy}>+ Add Allergy</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-[#252530] dark:bg-[#111118] dark:divide-[#1c1c25]">
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

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]" role="alert" aria-live="polite">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"><IconWarning size={16} /></span>
          <p className="text-sm leading-relaxed">Severe allergies are automatically flagged to all assigned doctors before every appointment.</p>
        </div>
      </section>

      <section className="mt-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Medical History</p>

        <div className="ml-2 border-l-2 border-slate-100 pl-6 dark:border-[#252530]">
          {HISTORY_ITEMS.map((item) => (
            <div key={item.id} className="relative mb-6 last:mb-0">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-300 bg-white dark:border-[#404050] dark:bg-[#111118]" aria-hidden="true" />
              <p className="text-xs text-slate-400 dark:text-[#606070]">{item.date}</p>
              <p className="mt-0.5 text-sm font-semibold tracking-tight text-slate-900 dark:text-[#eeeef5]">{item.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
