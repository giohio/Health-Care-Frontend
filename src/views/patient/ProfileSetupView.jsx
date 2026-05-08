import { useState } from 'react'
import PropTypes from 'prop-types'
import { patientApi } from '../../api/patient'

const STEPS = ['Basic Info', 'Health Background']

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const BLOOD_TYPES = ['A', 'B', 'AB', 'O']

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function ProfileSetupView({ setCurrentView, onComplete, currentUser }) {
  const finish = () => {
    if (onComplete) onComplete()
    else if (setCurrentView) setCurrentView('dashboard')
  }
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Step 1: basic profile
  const [fullName, setFullName] = useState(currentUser?.name ?? '')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')

  // Step 2: health background
  const [bloodType, setBloodType] = useState('')
  const [allergies, setAllergies] = useState('')
  const [chronicConditions, setChronicConditions] = useState('')

  async function handleStep1() {
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await patientApi.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        date_of_birth: dob || undefined,
        gender: gender || undefined,
      })
      setStep(1)
    } catch (err) {
      setError(err?.message ?? 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStep2() {
    setSaving(true)
    setError(null)
    try {
      await patientApi.updateHealth({
        blood_type: bloodType || undefined,
        allergies: allergies.trim() || undefined,
        chronic_conditions: chronicConditions.trim() || undefined,
      })
      finish()
    } catch (err) {
      setError(err?.message ?? 'Failed to save health info. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150'

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#eeeef5]">Complete Your Profile</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-[#70708a]">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={(() => {
              const base = 'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 '
              if (i < step) return base + 'bg-indigo-600 text-white dark:bg-indigo-500'
              if (i === step) return base + 'border-2 border-indigo-600 bg-white text-indigo-600 dark:border-indigo-400 dark:bg-[#111118] dark:text-indigo-400'
              return base + 'border-2 border-slate-200 bg-white text-slate-400 dark:border-[#252530] dark:bg-[#111118] dark:text-[#606070]'
            })()}
            >
              {i < step ? (
                <span className="inline-flex h-4 w-4"><CheckIcon /></span>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[11px] font-medium ${i <= step ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-[#606070]'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="ps-full-name" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ps-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ps-phone" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Phone Number
              </label>
              <input
                id="ps-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 000 000 000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ps-dob" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Date of Birth
              </label>
              <input
                id="ps-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="ps-gender" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Gender
              </label>
              <select
                id="ps-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                <option value="">— Select —</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="ps-blood-type" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Blood Type
              </label>
              <select
                id="ps-blood-type"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className={inputClass}
              >
                <option value="">— Unknown —</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>Type {bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ps-allergies" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Known Allergies
              </label>
              <textarea
                id="ps-allergies"
                rows={3}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, pollen, nuts…"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="ps-chronic" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                Chronic Conditions
              </label>
              <textarea
                id="ps-chronic"
                rows={3}
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Hypertension, asthma, diabetes…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-xs text-rose-500">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(null); setStep(step - 1) }}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step === 0 ? handleStep1 : handleStep2}
            disabled={saving}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {(() => {
              if (saving) return 'Saving…'
              if (step === STEPS.length - 1) return 'Finish Setup'
              return 'Continue'
            })()}
          </button>
        </div>

        <button
          type="button"
          onClick={finish}
          className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-[#9898b0]"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

ProfileSetupView.propTypes = {
  setCurrentView: PropTypes.func,
  onComplete: PropTypes.func,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
  }),
}

ProfileSetupView.defaultProps = {
  currentUser: null,
}
