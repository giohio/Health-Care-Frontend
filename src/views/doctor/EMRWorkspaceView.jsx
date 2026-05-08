import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { LAB_AI_ANALYSIS } from '../../data/aiAnalysis'
import { getSpecialtyTabs } from '../../data/specialtyResults'
import { formatRelativeTime } from '../../utils/formatTime'
import AiRiskBadge from '../../components/shared/AiRiskBadge'
import AiDisclaimer from '../../components/shared/AiDisclaimer'
import RadiologyPanel from '../../components/emr/RadiologyPanel'
import CardiologyPanel from '../../components/emr/CardiologyPanel'
import OphthalmologyPanel from '../../components/emr/OphthalmologyPanel'
import DermatologyPanel from '../../components/emr/DermatologyPanel'
import PulmonologyPanel from '../../components/emr/PulmonologyPanel'
import NephrologyPanel from '../../components/emr/NephrologyPanel'
import { patientApi } from '../../api/patient'
import { appointmentApi } from '../../api/appointment'
import { clinicalApi } from '../../api/clinical'
import { emrApi } from '../../api/emr'
import { APPOINTMENT_STATUS } from '../../constants/enums'

const FALLBACK_PATIENT = {
  id: 'PT-2024-0142',
  name: 'Jane Doe',
  initials: 'JD',
  age: 36,
  gender: 'Female',
  blood: 'O+',
  dob: 'Mar 4, 1990',
  phone: '+84 912 345 678',
  lastVisit: 'Feb 28, 2025',
  specialty: 'General Consultation',
  time: '10:00 AM',
  complaint: 'Persistent headache and mild fever for 2 days',
  avatar: {
    from: 'from-indigo-400',
    to: 'to-violet-500',
  },
  allergies: [
    { name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
    { name: 'Seafood', severity: 'Severe', reaction: 'Hives, swelling' },
  ],
}

const PAST_VISITS = [
  { date: 'Feb 28, 2025', type: 'General Check-up' },
  { date: 'Nov 14, 2024', type: 'Neurology Referral' },
  { date: 'Aug 3, 2024', type: 'Lab Results Review' },
]

const LAB_ROWS = [
  { test: 'CBC', date: 'Feb 28', status: 'Mild anemia pattern', aiKey: 'full-blood-panel' },
  { test: 'Lipid Profile', date: 'Feb 28', status: 'LDL elevated', aiKey: 'lipid-profile' },
  { test: 'Thyroid (TSH)', date: 'Jan 12', status: 'Within range', aiKey: 'thyroid-function' },
]

const MEDICATIONS = [
  { name: 'Metformin 500mg', dose: 'Twice daily' },
  { name: 'Lisinopril 10mg', dose: 'Once daily' },
  { name: 'Vitamin D3 1000IU', dose: 'Once daily' },
]

const SOAP_AI_NOTE = `S: Patient presents with persistent
headache (7/10 severity) and mild fever
(38.2°C) for 2 days. Headache described
as bifrontal, throbbing in nature.
Associated symptoms include mild fatigue.
No nausea, vomiting, or photophobia.
No recent travel history.

O: Temp 38.2°C, BP 118/76, HR 84bpm,
RR 16. Alert and oriented x3.
Pupils equal and reactive.
Neck supple, no meningismus.
Pharynx mildly erythematous.

A: Likely viral upper respiratory
infection with tension headache component.
Bacterial meningitis ruled out clinically.

P: 1. Paracetamol 500mg PRN for fever/pain
2. Oral hydration encouraged
3. CBC and CRP ordered to rule out
   bacterial infection
4. Return if fever > 39°C or worsening
   symptoms
5. Follow up in 3-5 days if no improvement`

const ICD_DATABASE = [
  { code: 'R51.9', desc: 'Headache, unspecified' },
  { code: 'R50.9', desc: 'Fever, unspecified' },
  { code: 'J06.9', desc: 'Acute upper respiratory infection' },
  { code: 'G43.909', desc: 'Migraine, unspecified' },
  { code: 'R41.3', desc: 'Other amnesia' },
  { code: 'J00', desc: 'Acute nasopharyngitis (common cold)' },
  { code: 'R05.9', desc: 'Cough, unspecified' },
  { code: 'R53.83', desc: 'Other fatigue' },
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus' },
  { code: 'I10', desc: 'Essential hypertension' },
  { code: 'E03.9', desc: 'Hypothyroidism, unspecified' },
  { code: 'M79.3', desc: 'Panniculitis, unspecified' },
  { code: 'Z00.00', desc: 'General adult medical examination' },
]

const NOTE_TEMPLATES = {
  soap: '',
  followup: `Follow-up Visit\n\nSymptoms progression:\n\nMedication adherence:\n\nResponse to treatment:\n\nUpdated plan:`,
  referral: `Referral Note\n\nReason for referral:\n\nRelevant findings:\n\nRequested specialty evaluation:\n\nUrgency:`,
  free: ``,
}

const LAB_TESTS = [
  {
    id: 'cbc',
    name: 'Full Blood Count (CBC)',
    desc: 'Red/white cells, platelets, hemoglobin',
    tat: '2-4 hrs',
    aiEnabled: true,
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    desc: 'Infection and inflammation marker',
    tat: '2-4 hrs',
    aiEnabled: false,
  },
  {
    id: 'glucose',
    name: 'Blood Glucose (Fasting)',
    desc: 'Diabetes screening',
    tat: '1-2 hrs',
    aiEnabled: false,
  },
  {
    id: 'liver',
    name: 'Liver Function Tests',
    desc: 'ALT, AST, bilirubin, albumin',
    tat: '4-6 hrs',
    aiEnabled: false,
  },
  {
    id: 'renal',
    name: 'Kidney Function (Renal Panel)',
    desc: 'Creatinine, urea, electrolytes',
    tat: '4-6 hrs',
    aiEnabled: true,
  },
  {
    id: 'thyroid',
    name: 'Thyroid Function (TSH/T4)',
    desc: 'Thyroid hormone levels',
    tat: '24 hrs',
    aiEnabled: false,
  },
  {
    id: 'lipid',
    name: 'Lipid Profile',
    desc: 'Cholesterol, LDL, HDL',
    tat: '4-6 hrs',
    aiEnabled: true,
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis',
    desc: 'Urine dipstick and microscopy',
    tat: '1-2 hrs',
    aiEnabled: false,
  },
]

function parseTatMinutes(tatLabel) {
  const normalized = tatLabel.replace(' hrs', '').replace(' hr', '')
  if (normalized.includes('-')) {
    const [, max] = normalized.split('-')
    return Number(max) * 60
  }
  return Number(normalized) * 60
}

function formatTatFromMinutes(minutes) {
  if (minutes < 60) return `${minutes} mins`
  const hours = Math.round((minutes / 60) * 10) / 10
  if (Number.isInteger(hours)) return `${hours}h`
  return `${hours}h`
}

function resolveResultKey(testIds) {
  if (testIds.includes('cbc')) return 'full-blood-panel'
  if (testIds.includes('lipid')) return 'lipid-profile'
  return null
}

function statusBadgeClass(status) {
  if (status === 'pending') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }

  if (status === 'processing') {
    return 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300'
  }

  if (status === 'ready') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
  }

  return 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function stepCircle(complete, current) {
  if (complete) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
        <span className="inline-flex h-3.5 w-3.5"><CheckIcon /></span>
      </span>
    )
  }

  if (current) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500" />
      </span>
    )
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 dark:border-[#252530] dark:bg-[#1c1c25]" />
  )
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function normalizeAllergies(patient) {
  if (!patient?.allergies || !Array.isArray(patient.allergies)) return FALLBACK_PATIENT.allergies

  return patient.allergies.map((item) => {
    if (typeof item === 'string') {
      const severe = item.toLowerCase().includes('severe')
      return {
        name: item.split('(')[0].trim(),
        severity: severe ? 'Severe' : 'Moderate',
        reaction: severe ? 'Needs verification' : 'Monitor response',
      }
    }

    return {
      name: item.name || 'Unknown',
      severity: item.severity || 'Moderate',
      reaction: item.reaction || 'Not specified',
    }
  })
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function FlaskConicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-3z" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.5 20.5l-7-7a4.95 4.95 0 0 1 0-7l2-2a4.95 4.95 0 0 1 7 0l7 7a4.95 4.95 0 0 1 0 7l-2 2a4.95 4.95 0 0 1-7 0z" />
      <line x1="8" y1="8" x2="16" y2="16" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ClipboardListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4.5h6" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7V6a2 2 0 0 1 2-2h1" />
      <path d="M20 7V6a2 2 0 0 0-2-2h-1" />
      <path d="M4 17v1a2 2 0 0 0 2 2h1" />
      <path d="M20 17v1a2 2 0 0 1-2 2h-1" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 19 9 5 6 12 2 12" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ScanFaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M21 7V5a2 2 0 0 0-2-2h-2" />
      <path d="M3 17v2a2 2 0 0 0 2 2h2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  )
}

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h9a2 2 0 1 0-2-2" />
      <path d="M2 12h15a2 2 0 1 1-2 2" />
      <path d="M4 16h8a2 2 0 1 0-2 2" />
    </svg>
  )
}

function DropletsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2s-6 7.2-6 11a6 6 0 1 0 12 0c0-3.8-6-11-6-11z" />
    </svg>
  )
}

function SpecialtyTabIcon({ icon, className }) {
  const iconMap = {
    Scan: ScanIcon,
    Activity: ActivityIcon,
    Eye: EyeIcon,
    ScanFace: ScanFaceIcon,
    Wind: WindIcon,
    Droplets: DropletsIcon,
  }

  const IconComponent = iconMap[icon] || ScanIcon
  return (
    <span className={`inline-flex h-3.5 w-3.5 ${className}`}>
      <IconComponent />
    </span>
  )
}

function specialtyActiveClass(key) {
  const accentMap = {
    radiology: 'border border-teal-200 bg-teal-50 font-medium text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/50 dark:text-teal-300',
    cardiology: 'border border-rose-200 bg-rose-50 font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
    ophthalmology: 'border border-violet-200 bg-violet-50 font-medium text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/50 dark:text-violet-300',
    dermatology: 'border border-pink-200 bg-pink-50 font-medium text-pink-700 dark:border-pink-900/40 dark:bg-pink-950/40 dark:text-pink-300',
    pulmonology: 'border border-cyan-200 bg-cyan-50 font-medium text-cyan-700 dark:border-cyan-800/50 dark:bg-cyan-950/50 dark:text-cyan-300',
    nephrology: 'border border-amber-200 bg-amber-50 font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
  }

  return accentMap[key] || accentMap.radiology
}

function specialtyActiveIconClass(key) {
  const iconMap = {
    radiology: 'text-teal-600 dark:text-teal-400',
    cardiology: 'text-rose-600 dark:text-rose-400',
    ophthalmology: 'text-violet-600 dark:text-violet-400',
    dermatology: 'text-pink-600 dark:text-pink-400',
    pulmonology: 'text-cyan-600 dark:text-cyan-400',
    nephrology: 'text-amber-600 dark:text-amber-400',
  }

  return iconMap[key] || iconMap.radiology
}

SpecialtyTabIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
}

function EMRTabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${
        active
          ? 'bg-slate-900 text-white dark:bg-[#eeeef5] dark:text-[#0c0c13]'
          : 'text-slate-500 hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]'
      }`}
    >
      {label}
    </button>
  )
}

EMRTabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">{children}</p>
}

SectionLabel.propTypes = {
  children: PropTypes.node.isRequired,
}

export default function EMRWorkspaceView({
  navigateTo,
  selectedPatient,
  setSelectedPatient,
  user,
  labOrders,
  setLabOrders,
  addOrderNotification,
  emrRequestedTab,
  clearEmrRequestedTab,
}) {
  const [emrTab, setEmrTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [icdCodes, setIcdCodes] = useState([{ code: 'R51.9', desc: 'Headache, unspecified' }])
  const [icdSearch, setIcdSearch] = useState('')
  const [icdResults, setIcdResults] = useState([])
  const [showIcdDropdown, setShowIcdDropdown] = useState(false)
  const [noteTemplate, setNoteTemplate] = useState('soap')
  const [lastSaved, setLastSaved] = useState('Never')

  const [orderedTests, setOrderedTests] = useState(['cbc', 'crp'])
  const [orderNote, setOrderNote] = useState('')
  const [orderStep, setOrderStep] = useState('select')
  const [submittedOrderId, setSubmittedOrderId] = useState(null)
  const [orderCounter, setOrderCounter] = useState(1)

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummaryLines, setAiSummaryLines] = useState([])
  const [aiSummaryDone, setAiSummaryDone] = useState(false)
  const [aiSummaryRunId, setAiSummaryRunId] = useState(0)
  const [aiSummaryMessage, setAiSummaryMessage] = useState('')

  const patient = useMemo(() => {
    const current = selectedPatient || {}
    const name = current.patient_name ?? current.name ?? FALLBACK_PATIENT.name
    let gender = current.patient_gender ?? current.gender ?? FALLBACK_PATIENT.gender

    if (gender === 'F') gender = 'Female'
    else if (gender === 'M') gender = 'Male'

    return {
      ...FALLBACK_PATIENT,
      ...current,
      name,
      initials: getInitials(name),
      specialty: current.specialty_name ?? current.specialty ?? current.appointmentType ?? FALLBACK_PATIENT.specialty,
      complaint: current.chief_complaint ?? current.complaint ?? FALLBACK_PATIENT.complaint,
      allergies: normalizeAllergies(current),
      avatar: current.avatar ?? FALLBACK_PATIENT.avatar,
      gender,
      age: current.patient_age ?? current.age ?? FALLBACK_PATIENT.age,
      id: current.patient_id ?? current.id ?? FALLBACK_PATIENT.id,
      time: current.start_time ?? current.time ?? FALLBACK_PATIENT.time,
    }
  }, [selectedPatient])

  const apptId = selectedPatient?.id
  const patientUserId = selectedPatient?.patient_id

  const [vitals, setVitals] = useState(null)
  const [pastVisits, setPastVisits] = useState(PAST_VISITS)
  const [activeMedications, setActiveMedications] = useState(MEDICATIONS)
  const [recentLabs, setRecentLabs] = useState(LAB_ROWS)
  const [diagnoses, setDiagnoses] = useState([])
  const [apptStatus, setApptStatus] = useState(selectedPatient?.status ?? null)
  const [statusLoading, setStatusLoading] = useState(false)

  const loadPatientData = useCallback(async () => {
    if (!patientUserId) return
    const [vitalsResult, visitsResult, summaryResult, labResult] = await Promise.allSettled([
      patientApi.getLatestVitals(patientUserId),
      appointmentApi.getByPatient(patientUserId),
      clinicalApi.getSummary(patientUserId),
      emrApi.getLabResults({ patient_id: patientUserId })
    ])
    
    if (vitalsResult.status === 'fulfilled' && vitalsResult.value) {
      setVitals(vitalsResult.value)
    }
    
    if (summaryResult.status === 'fulfilled' && summaryResult.value) {
      const { medications, vitals_latest, diagnoses: diags } = summaryResult.value
      if (vitals_latest) setVitals(vitals_latest)
      if (medications && medications.length > 0) {
        setActiveMedications(medications.map(m => ({ 
          name: m.drug_name, 
          dose: `${m.dosage || ''} - ${m.frequency || ''}`.trim() 
        })))
      }
      if (diags) setDiagnoses(diags)
    }
    
    if (labResult.status === 'fulfilled' && Array.isArray(labResult.value)) {
       const mappedLabs = labResult.value.map(l => ({
         test: `Lab Result (ID: ${l.id.substring(0, 4)})`,
         date: l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
         status: l.status,
         aiKey: null,
       }))
       setRecentLabs([...mappedLabs, ...LAB_ROWS])
    }
    
    if (visitsResult.status === 'fulfilled') {
      const list = Array.isArray(visitsResult.value)
        ? visitsResult.value
        : (visitsResult.value?.appointments ?? [])
      const completed = list
        .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED && a.id !== apptId)
        .slice(0, 5)
        .map((a) => ({ date: a.appointment_date ?? a.created_at ?? '', type: a.specialty_name ?? 'Visit', id: a.id }))
      if (completed.length > 0) setPastVisits(completed)
    }
  }, [patientUserId, apptId])

  const handleStatusTransition = useCallback(async (action) => {
    if (!apptId || statusLoading) return
    setStatusLoading(true)
    try {
      if (action === 'start') {
        await appointmentApi.start(apptId)
        setApptStatus(APPOINTMENT_STATUS.IN_PROGRESS)
      } else if (action === 'complete') {
        await appointmentApi.complete(apptId)
        setApptStatus(APPOINTMENT_STATUS.COMPLETED)
      } else if (action === 'noshow') {
        await appointmentApi.noShow(apptId)
        setApptStatus(APPOINTMENT_STATUS.NO_SHOW)
      }
    } catch { /* ignore */ } finally {
      setStatusLoading(false)
    }
  }, [apptId, statusLoading])

  useEffect(() => { loadPatientData() }, [loadPatientData])

  const severeAllergies = patient.allergies.filter((item) => item.severity.toLowerCase().includes('severe'))
  const selectedTests = LAB_TESTS.filter((test) => orderedTests.includes(test.id))
  const selectedTestNames = selectedTests.map((test) => test.name)
  const selectedMaxTatMinutes = selectedTests.length > 0
    ? Math.max(...selectedTests.map((test) => parseTatMinutes(test.tat)))
    : 0
  const selectedPatientId = selectedPatient?.id || 'PT-2024-0142'
  const patientOrders = labOrders.filter((order) => order.patientId === selectedPatientId)
  const submittedOrder = submittedOrderId
    ? labOrders.find((order) => order.id === submittedOrderId)
    : null
  const emrLabWithAi = recentLabs.map((row) => ({
    ...row,
    aiData: row.aiKey ? LAB_AI_ANALYSIS[row.aiKey] : null,
  }))
  const highRiskLab = emrLabWithAi.find((row) => row.aiData?.riskLevel === 'high')
  const clinicianName = user?.name || 'Doctor'
  const clinicianSpecialty = user?.specialty || 'General Practice'
  const patientId = selectedPatient?.id || 'PT-2024-0142'
  const specialtyTabs = getSpecialtyTabs(patientId)
  const allTabs = [
    { key: 'overview', label: 'Overview', icon: null },
    { key: 'notes', label: 'Notes', icon: null },
    { key: 'orders', label: 'Orders', icon: null },
    { key: 'ai-summary', label: 'AI Summary', icon: null },
    ...specialtyTabs,
  ]
  const baseTabs = allTabs.slice(0, 4)
  const specialtyData = specialtyTabs.find((tab) => tab.key === emrTab)?.data
  const specialtyLabel = specialtyTabs.map((tab) => tab.label).join(' · ')

  const aiSummaryTemplate = useMemo(() => {
    const patientName = selectedPatient?.name || patient.name

    return [
      `**Patient:** ${patientName}`,
      '**Age:** 45 | **Sex:** Male',
      '',
      '**Primary Diagnoses:**',
      '• Grade 2 hypertension (I10) - currently under treatment',
      '• Type 2 diabetes mellitus (E11) - suboptimal control',
      '',
      '**Current Medications:**',
      '• Amlodipine 5mg - 1 tablet daily',
      '• Metformin 500mg - twice daily after meals',
      '',
      '**Clinical Notes:**',
      '• Latest HbA1c: 7.8% (Dec 2024) - requires close follow-up',
      '• 7-day average blood pressure: 142/88 mmHg',
      '• Renal function: eGFR 72 - stage G2',
      '',
      '**AI Recommendations:**',
      '• Consider increasing Metformin dose or adding a second agent',
      '• Schedule repeat HbA1c testing in 3 months',
      '• Provide targeted nutrition counseling for diabetes management',
    ]
  }, [patient.name, selectedPatient?.name])

  const soapPlaceholder = `S: Subjective — patient complaint...\n\nO: Objective — examination findings...\n\nA: Assessment — diagnosis...\n\nP: Plan — treatment and follow-up...`

  useEffect(() => {
    if (emrRequestedTab) {
      const syncTimer = globalThis.setTimeout(() => {
        setEmrTab(emrRequestedTab)
        clearEmrRequestedTab()
      }, 0)

      return () => {
        globalThis.clearTimeout(syncTimer)
      }
    }

    return undefined
  }, [clearEmrRequestedTab, emrRequestedTab])

  useEffect(() => {
    if (aiSummaryRunId === 0) return undefined

    let cursor = 0
    let streamTimer = null

    const startTimer = globalThis.setTimeout(() => {
      streamTimer = globalThis.setInterval(() => {
        cursor += 1
        setAiSummaryLines(aiSummaryTemplate.slice(0, cursor))

        if (cursor >= aiSummaryTemplate.length) {
          globalThis.clearInterval(streamTimer)
          setAiSummaryLoading(false)
          setAiSummaryDone(true)
        }
      }, 120)
    }, 800)

    return () => {
      globalThis.clearTimeout(startTimer)
      if (streamTimer) {
        globalThis.clearInterval(streamTimer)
      }
    }
  }, [aiSummaryRunId, aiSummaryTemplate])

  const filterIcdResults = (rawValue) => {
    const value = rawValue.trim().toLowerCase()

    if (value.length < 2) {
      setIcdResults([])
      return
    }

    const results = ICD_DATABASE.filter(
      (item) => item.code.toLowerCase().includes(value) || item.desc.toLowerCase().includes(value),
    ).filter((item) => !icdCodes.some((selected) => selected.code === item.code))

    setIcdResults(results)
  }

  const handleTemplateChange = (value) => {
    setNoteTemplate(value)
    setNoteText(NOTE_TEMPLATES[value] || '')
  }

  const handleSaveNote = async () => {
    if (!patientUserId || !noteText.trim()) return;
    try {
      setLastSaved('Saving...');
      await clinicalApi.createNote(patientUserId, {
        patient_id: patientUserId,
        doctor_id: user?.id || user?.sub || 'doc-id',
        content: noteText,
        appointment_id: apptId,
        note_type: noteTemplate,
        is_ai_generated: false,
      });
      
      if (icdCodes.length > 0) {
        // Also save latest diagnosis just to show flow works
        await clinicalApi.createDiagnosis(patientUserId, {
          patient_id: patientUserId,
          doctor_id: user?.id || user?.sub || 'doc-id',
          diagnosis_name: icdCodes[0].desc,
          icd10_code: icdCodes[0].code,
          diagnosed_at: new Date().toISOString().split('T')[0],
          appointment_id: apptId,
        });
      }
      
      setLastSaved(`Today at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err) {
      console.error('Failed to save note:', err);
      setLastSaved('Error saving');
    }
  }

  const addIcdCode = (result) => {
    if (icdCodes.some((item) => item.code === result.code)) return
    setIcdCodes((prev) => [...prev, result])
    setIcdSearch('')
    setIcdResults([])
    setShowIcdDropdown(false)
  }

  const removeIcdCode = (code) => {
    setIcdCodes((prev) => prev.filter((item) => item.code !== code))
  }

  const toggleTest = (testId) => {
    setOrderedTests((prev) => (
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    ))
  }

  const applyOrderStatus = (orderId, nextStatus) => {
    setLabOrders((prev) => prev.map((order) => (
      order.id === orderId
        ? { ...order, status: nextStatus }
        : order
    )))
  }

  const handleSubmitOrder = async () => {
    let nextId = `ORD-${orderCounter}`
    
    try {
      const payload = {
        patient_id: selectedPatient?.id || 'PT-2024-0142',
        doctor_id: user?.id || 'DR-1',
        test_name: selectedTestNames.join(', '),
        test_type: 'blood_panel',
        department: 'Laboratory',
        instructions: orderNote,
        priority: 'routine'
      };

      const res = await emrApi.createLabOrder(payload);
      if (res.data?.id) {
        nextId = res.data.id;
      }
    } catch (err) {
      console.error('Failed to create lab order via API', err);
    }
    
    const orderedAt = new Date()

    const newOrder = {
      id: nextId,
      patientId: selectedPatient?.id || 'PT-2024-0142',
      patientName: selectedPatient?.name || 'Jane Doe',
      tests: [...selectedTestNames],
      orderedBy: user?.name || 'Dr. Sarah Chen',
      orderedAt,
      clinicalNote: orderNote,
      status: 'pending',
      estimatedReadyAt: new Date(orderedAt.getTime() + 30000),
      resultKey: resolveResultKey(orderedTests),
    }

    setLabOrders((prev) => [newOrder, ...prev])
    setOrderCounter((prev) => prev + 1)
    addOrderNotification(newOrder, 'submitted')

    setSubmittedOrderId(newOrder.id)
    setOrderStep('submitted')
    setOrderedTests([])
    setOrderNote('')

    globalThis.setTimeout(() => {
      applyOrderStatus(newOrder.id, 'processing')
    }, 5000)

    globalThis.setTimeout(() => {
      applyOrderStatus(newOrder.id, 'ready')
      addOrderNotification(newOrder, 'ready')
      setOrderStep('select')
      setSubmittedOrderId(null)
    }, 30000)
  }

  const handleGenerateAiSummary = () => {
    setAiSummaryLoading(true)
    setAiSummaryDone(false)
    setAiSummaryLines([])
    setAiSummaryMessage('')
    setAiSummaryRunId((prev) => prev + 1)
  }

  const handleCopySummary = async () => {
    const text = aiSummaryLines.join('\n')

    if (!text) return

    try {
      await globalThis.navigator.clipboard.writeText(text)
      setAiSummaryMessage('Summary copied to clipboard')
    } catch {
      setAiSummaryMessage('Copy is not available in this browser')
    }
  }

  const handleSaveSummary = () => {
    const text = aiSummaryLines.join('\n')
    if (!text) return

    setNoteText((prev) => {
      const prefix = prev.trim().length > 0 ? `${prev}\n\n` : ''
      return `${prefix}[AI Medical Summary]\n${text}`
    })

    setAiSummaryMessage('Saved to notes (mock)')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('patient-queue')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]"
            aria-label="Back to patient queue"
          >
            <span className="inline-flex h-4 w-4"><ArrowLeftIcon /></span>
          </button>

          <span className="h-5 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

          <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">EMR Workspace</span>
          <span className="text-sm text-slate-300 dark:text-[#404050]">/</span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{patient.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 p-1 dark:border-[#252530]">
            {baseTabs.map((tab) => (
              <EMRTabButton
                key={tab.key}
                active={emrTab === tab.key}
                label={tab.label}
                onClick={() => setEmrTab(tab.key)}
              />
            ))}
          </div>

          {specialtyTabs.length > 0 && <span className="mx-2 h-5 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />}

          {specialtyTabs.length > 0 && (
            <div className="flex items-center gap-1">
              {specialtyTabs.map((tab) => {
                const active = emrTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setEmrTab(tab.key)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-all duration-150 ${
                      active
                        ? specialtyActiveClass(tab.key)
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-[#70708a] dark:hover:bg-[#1c1c25] dark:hover:text-[#c8c8e0]'
                    }`}
                  >
                    <SpecialtyTabIcon
                      icon={tab.icon}
                      className={active ? specialtyActiveIconClass(tab.key) : 'text-slate-400 dark:text-[#606070]'}
                    />
                    <span>{tab.label}</span>
                    {!active && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-teal-400 dark:bg-teal-500" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const isWaiting = apptStatus === APPOINTMENT_STATUS.PENDING || apptStatus === APPOINTMENT_STATUS.WAITING
            const inProgress = apptStatus === APPOINTMENT_STATUS.IN_PROGRESS
            if (isWaiting) {
              return (
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => handleStatusTransition('start')}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
                >
                  Start Consultation
                </button>
              )
            }
            if (inProgress) {
              return (
                <>
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatusTransition('complete')}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => handleStatusTransition('noshow')}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-150 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  >
                    No Show
                  </button>
                </>
              )
            }
            return null
          })()}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <span className="inline-flex h-3.5 w-3.5"><SaveIcon /></span>
            <span>Save Note</span>
          </button>

          <button
            type="button"
            onClick={() => setEmrTab('orders')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            <span className="inline-flex h-3.5 w-3.5"><FlaskConicalIcon /></span>
            <span>Order Labs</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-5 dark:border-[#252530] dark:bg-[#0e0e15]">
          {severeAllergies.length > 0 && (
            <div className="mb-5 rounded-xl border border-rose-300 border-l-4 border-l-rose-500 bg-rose-50 px-4 py-4 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 text-rose-600 dark:text-rose-400"><ShieldAlertIcon /></span>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300">Allergy Alert</span>
              </div>

              <div className="flex flex-col gap-2">
                {severeAllergies.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-100/60 px-3 py-2 dark:border-rose-900/40 dark:bg-rose-950/50">
                    <span className="text-sm font-bold text-rose-800 dark:text-rose-200">{item.name}</span>
                    <span className="text-right text-xs text-rose-600 dark:text-rose-400">{item.severity} · {item.reaction}</span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[11px] italic text-rose-500 dark:text-rose-400">Verify before prescribing any medication</p>
            </div>
          )}

          <SectionLabel>Patient</SectionLabel>

          <div className="mb-4 mt-3 flex items-center gap-3">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${patient.avatar.from} ${patient.avatar.to}`}>
              {patient.initials}
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{patient.name}</span>
              <span className="block text-xs text-slate-500 dark:text-[#70708a]">{patient.age} · {patient.gender} · {patient.blood}</span>
              <span className="block text-[11px] text-slate-400 dark:text-[#606070]">{patient.id}</span>
            </span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#16161e]">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">DOB</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.dob}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#16161e]">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Blood</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.blood}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#16161e]">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.phone}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#16161e]">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Last Visit</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{patient.lastVisit}</p>
            </div>
          </div>

          <SectionLabel>Current Visit</SectionLabel>
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/40 dark:bg-indigo-950/40">
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{patient.specialty}</p>
            <p className="mt-0.5 text-xs text-indigo-500 dark:text-indigo-400">Today · {patient.time}</p>
            <p className="mt-2 border-t border-indigo-100 pt-2 text-xs italic text-slate-600 dark:border-indigo-900/40 dark:text-[#9898b0]">"{patient.complaint}"</p>
          </div>

          <SectionLabel>Recent Visits</SectionLabel>
          <div className="mt-3 flex flex-col gap-2">
            {pastVisits.map((visit) => (
              <button
                key={visit.date ?? visit.id}
                type="button"
                onClick={() => setSelectedPatient(patient)}
                className="-mx-2 flex items-center justify-between rounded-lg border-b border-slate-100 px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:border-[#1c1c25] dark:hover:bg-[#16161e]"
              >
                <span>
                  <span className="block text-xs text-slate-400 dark:text-[#606070]">{visit.date}</span>
                  <span className="block text-xs font-medium text-slate-700 dark:text-[#c8c8e0]">{visit.type}</span>
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400">View</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto bg-[#f8fafc] px-6 py-5 dark:bg-[#08080f]">
          {emrTab === 'overview' && (
            <div>
              {highRiskLab && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 border-l-4 border-l-rose-500 bg-rose-50 px-5 py-4 dark:border-rose-900/50 dark:bg-rose-950/30">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400"><AlertTriangleIcon /></span>

                  <div>
                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">AI has flagged high-risk findings</p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                      Lipid Profile shows elevated LDL ({highRiskLab.aiData.confidence}% confidence). Review recommended before next consultation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEmrTab('orders')}
                    className="self-start rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                  >
                    View Labs →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div className="mb-3 border-b border-slate-100 pb-2 dark:border-[#1c1c25]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Vitals · {vitals ? `Recorded ${vitals.recorded_at ?? 'recently'}` : 'Last recorded'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-[#16161e]">
                    <p className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{vitals?.blood_pressure ?? '–'}</p>
                    <p className="text-xs text-slate-400 dark:text-[#606070]">mmHg</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Blood Pressure</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-[#16161e]">
                    <p className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{vitals?.temperature ?? '–'}</p>
                    <p className="text-xs text-slate-400 dark:text-[#606070]">°{vitals?.temp_unit ?? 'C'}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Temperature</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-[#16161e]">
                    <p className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{vitals?.heart_rate ?? '–'}</p>
                    <p className="text-xs text-slate-400 dark:text-[#606070]">bpm</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Heart Rate</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-[#16161e]">
                    <p className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">{vitals?.respiratory_rate ?? '–'}</p>
                    <p className="text-xs text-slate-400 dark:text-[#606070]">rpm</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Respiratory</p>
                  </div>
                </div>
              </article>

              {specialtyTabs.length > 0 && (
                <article className="col-span-2 flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 dark:border-teal-900/40 dark:bg-teal-950/30">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-4 w-4 text-teal-600 dark:text-teal-400">
                      <ScanIcon />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Specialty imaging results available</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{specialtyLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {specialtyTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setEmrTab(tab.key)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:border-teal-400 dark:border-teal-800/50 dark:bg-[#111118] dark:text-teal-300"
                      >
                        <SpecialtyTabIcon icon={tab.icon} className="text-teal-600 dark:text-teal-400" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              )}

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div className="mb-3 border-b border-slate-100 pb-2 dark:border-[#1c1c25]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Active Medications</p>
                </div>

                <div>
                  {activeMedications.map((medication, i) => (
                    <div key={`${medication.name}-${i}`} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0 dark:border-[#1c1c25]">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <span className="inline-flex h-4 w-4"><PillIcon /></span>
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{medication.name}</span>
                        <span className="block text-xs text-slate-500 dark:text-[#70708a]">{medication.dose}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#1c1c25]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Recent Lab Results</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => setEmrTab('orders')}
                  >
                    Order New →
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#252530]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-[#16161e]">
                      <tr>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Test</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Date</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Status</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">AI Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emrLabWithAi.map((row) => (
                        <tr key={row.test} className="border-t border-slate-100 dark:border-[#1c1c25]">
                          <td className="px-3 py-2 text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{row.test}</td>
                          <td className="px-3 py-2 text-sm text-slate-500 dark:text-[#70708a]">{row.date}</td>
                          <td className="px-3 py-2 text-sm text-slate-600 dark:text-[#9898b0]">{row.status}</td>
                          <td className="px-3 py-2 text-sm">
                            {row.aiData ? (
                              <AiRiskBadge
                                riskLevel={row.aiData.riskLevel}
                                confidence={row.aiData.confidence}
                                compact
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-[#404050]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
              </div>
            </div>
          )}

          {emrTab === 'notes' && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-[#252530] dark:bg-[#111118]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-[#70708a]">Template:</span>
                  {[
                    { key: 'soap', label: 'SOAP' },
                    { key: 'followup', label: 'Follow-up' },
                    { key: 'referral', label: 'Referral' },
                    { key: 'free', label: 'Free' },
                  ].map((template) => {
                    const active = noteTemplate === template.key
                    return (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() => handleTemplateChange(template.key)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                          active
                            ? 'bg-slate-900 text-white dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-[#252530] dark:text-[#70708a] dark:hover:bg-[#1c1c25]'
                        }`}
                      >
                        {template.label}
                      </button>
                    )
                  })}
                </div>

                <span className="h-4 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

                <div className="flex items-center gap-1">
                  {['B', 'I', 'U'].map((mark) => (
                    <button
                      key={mark}
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:text-[#70708a] dark:hover:bg-[#1c1c25]"
                      aria-label={`Format ${mark}`}
                    >
                      {mark}
                    </button>
                  ))}
                </div>

                <span className="h-4 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

                <button
                  type="button"
                  onClick={() => setNoteText(SOAP_AI_NOTE)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/70"
                >
                  <span className="inline-flex h-3.5 w-3.5"><SparklesIcon /></span>
                  <span>AI Assist</span>
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={noteTemplate === 'soap' && noteText === '' ? soapPlaceholder : ''}
                className="min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:placeholder:text-[#505060] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              />

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#70708a]">
                <span>Author: {clinicianName}</span>
                <span>Specialty: {clinicianSpecialty}</span>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Diagnoses (ICD-10)</p>

                <div className="mb-3 mt-2 flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#606070]">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      value={icdSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setIcdSearch(value)
                        setShowIcdDropdown(value.length > 1)
                        filterIcdResults(value)
                      }}
                      onBlur={() => {
                        globalThis.setTimeout(() => setShowIcdDropdown(false), 120)
                      }}
                      onFocus={() => {
                        if (icdSearch.length > 1) setShowIcdDropdown(true)
                      }}
                      placeholder="Search ICD-10 codes..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                    />

                    {showIcdDropdown && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-[#252530] dark:bg-[#18181f] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {icdResults.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-slate-500 dark:text-[#70708a]">No results</p>
                        ) : (
                          icdResults.map((result) => (
                            <button
                              key={result.code}
                              type="button"
                              onClick={() => addIcdCode(result)}
                              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 last:border-0 dark:border-[#1c1c25] dark:hover:bg-[#16161e]"
                            >
                              <span className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {result.code}
                              </span>
                              <span className="text-sm text-slate-700 dark:text-[#c8c8e0]">{result.desc}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {icdCodes.map((item) => (
                    <span key={item.code} className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 dark:border-indigo-800/50 dark:bg-indigo-950/50">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">{item.code}</span>
                      <span className="text-xs text-slate-600 dark:text-[#9898b0]">{item.desc}</span>
                      <button
                        type="button"
                        onClick={() => removeIcdCode(item.code)}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 transition-colors hover:bg-indigo-200 hover:text-indigo-600 dark:hover:bg-indigo-900"
                        aria-label={`Remove ${item.code}`}
                      >
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-[#606070]">Last saved: {lastSaved}</span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteText('')
                      setIcdCodes([])
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                  >
                    Discard
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    <span className="inline-flex h-3.5 w-3.5"><SaveIcon /></span>
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {emrTab === 'orders' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <style>{`@keyframes progress { 0% { width: 60%; } 50% { width: 80%; } 100% { width: 60%; } }`}</style>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Order Lab Tests</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                      Select tests and submit order for {selectedPatient?.name || 'Jane Doe'}
                    </p>
                  </div>
                  {orderedTests.length > 0 && (
                    <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {orderedTests.length} selected
                    </span>
                  )}
                </div>

                {orderStep === 'submitted' && submittedOrder ? (
                  <div className="py-10 text-center">
                    <div className="relative mx-auto mb-6 h-16 w-16">
                      <span className="ring-pulse absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800/50" />
                      <span className="absolute inset-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60" />
                      <span className="absolute inset-4 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
                        <span className="inline-flex h-4 w-4"><CheckIcon /></span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Order Submitted Successfully</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">
                      Results for {submittedOrder.patientName} will be ready in ~30s
                    </p>

                    <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left dark:border-[#252530] dark:bg-[#111118]">
                      <div className="flex flex-col gap-3">
                        {[
                          {
                            key: 'received',
                            title: 'Order Received',
                            sub: '(Just now)',
                            complete: true,
                            current: false,
                          },
                          {
                            key: 'processing',
                            title: 'Processing in Lab',
                            sub: '(~25 seconds)',
                            complete: submittedOrder.status === 'ready',
                            current: submittedOrder.status === 'processing' || submittedOrder.status === 'pending',
                          },
                          {
                            key: 'ready',
                            title: 'Results Ready',
                            sub: 'Patient will be notified',
                            complete: submittedOrder.status === 'ready',
                            current: submittedOrder.status === 'ready',
                          },
                        ].map((step, index) => (
                          <div key={step.key}>
                            <div className="flex items-center gap-3">
                              {stepCircle(step.complete, step.current)}

                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{step.title}</p>
                                <p className="text-xs text-slate-400 dark:text-[#606070]">{step.sub}</p>
                              </div>
                            </div>

                            {index < 2 && (
                              <span className={`ml-3 mt-1.5 block h-4 w-0.5 ${step.complete ? 'bg-indigo-300 dark:bg-indigo-700' : 'bg-slate-200 dark:bg-[#252530]'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOrderStep('select')}
                      className="mt-6 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                    >
                      Order Another Test
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      {LAB_TESTS.map((test) => {
                        const selected = orderedTests.includes(test.id)
                        return (
                          <button
                            key={test.id}
                            type="button"
                            onClick={() => toggleTest(test.id)}
                            className={`card-hover relative cursor-pointer overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${selected ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/30' : 'border-slate-200 bg-white dark:border-[#252530] dark:bg-[#111118]'}`}
                          >
                            <span className="flex items-start gap-3">
                              <span className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 rounded-md transition-all duration-150 ${selected ? 'items-center justify-center border border-indigo-600 bg-indigo-600 text-white' : 'border-2 border-slate-300 dark:border-[#404050]'}`}>
                                {selected && <span className="inline-flex h-3 w-3"><CheckIcon /></span>}
                              </span>

                              <span>
                                <span className="block text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{test.name}</span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-[#70708a]">{test.desc}</span>

                                <span className="mt-2 flex items-center gap-3">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-[#1c1c25] dark:text-[#70708a]">
                                    <span className="inline-flex h-3 w-3"><ClockIcon /></span>
                                    {test.tat}
                                  </span>

                                  {test.aiEnabled && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400">
                                      <span className="inline-flex h-3 w-3">
                                        <SparklesIcon />
                                      </span>
                                      <span>AI Analysis</span>
                                    </span>
                                  )}
                                </span>
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Clinical Note</p>
                    <textarea
                      rows={3}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Reason for ordering, relevant symptoms..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                    />

                    {orderedTests.length > 0 && (
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all duration-200 dark:border-[#252530] dark:bg-[#111118]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Order Summary</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {selectedTests.map((test) => (
                                <span key={test.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-[#1c1c25] dark:text-[#c8c8e0]">
                                  {test.name}
                                  <button
                                    type="button"
                                    className="inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-rose-500"
                                    onClick={() => toggleTest(test.id)}
                                  >
                                    <XIcon />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center text-xs font-medium text-slate-700 dark:text-[#c8c8e0]">
                              <span className="mr-1 inline-flex h-3.5 w-3.5 text-slate-400"><ClockIcon /></span>
                              Ready in ~{formatTatFromMinutes(selectedMaxTatMinutes)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#1c1c25]">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-[#c8c8e0]">
                            <span className="inline-flex h-4 w-4 text-slate-400"><EyeIcon /></span>
                            {selectedPatient?.name || 'Jane Doe'} · {selectedPatient?.id || 'PT-2024-0142'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-[#70708a]">
                            Today · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {patient.allergies?.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 border-t border-rose-100 pt-3 dark:border-rose-900/40">
                            <span className="inline-flex h-4 w-4 text-rose-500"><ShieldAlertIcon /></span>
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                              Allergy alert on file — verify before prescribing any medication alongside tests
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setOrderedTests([])
                              setOrderNote('')
                            }}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                          >
                            Clear All
                          </button>
                          <button
                            type="button"
                            disabled={orderedTests.length === 0}
                            onClick={handleSubmitOrder}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                          >
                            <span className="inline-flex h-4 w-4"><FlaskConicalIcon /></span>
                            <span>Submit Order →</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </article>

              <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Order History</p>

                {patientOrders.length === 0 ? (
                  <div className="py-10 text-center">
                    <span className="mx-auto mb-3 inline-flex h-8 w-8 text-slate-300 dark:text-[#404050]"><ClipboardListIcon /></span>
                    <p className="text-sm text-slate-400 dark:text-[#606070]">No orders yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {patientOrders.map((order) => (
                      <article key={order.id} className="rounded-xl border border-slate-200 px-4 py-4 dark:border-[#252530]">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[10px] font-mono text-slate-400 dark:text-[#606070]">{order.id}</p>
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(order.status)}`}>
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                            )}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {order.tests.map((test) => (
                            <span key={`${order.id}-${test}`} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                              {test}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#1c1c25]">
                          <span className="text-[11px] text-slate-400 dark:text-[#606070]">{formatRelativeTime(order.orderedAt)}</span>
                          {order.status === 'ready' && (
                            <button
                              type="button"
                              onClick={() => setEmrTab('overview')}
                              className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              View Results →
                            </button>
                          )}
                        </div>

                        {(order.status === 'pending' || order.status === 'processing') && (
                          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                            <span
                              className={`block h-full rounded-full ${order.status === 'pending' ? 'w-1/4 bg-amber-400' : 'w-2/3 bg-indigo-500'}`}
                              style={order.status === 'processing' ? { animation: 'progress 2s ease infinite' } : undefined}
                            />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          )}

          {emrTab === 'ai-summary' && (
            <div className="mx-auto max-w-3xl">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-[#eeeef5]">🤖 AI Medical Summary</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">
                      Auto-generated from patient records, visit history, and lab results
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                    Beta
                  </span>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={aiSummaryLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    {aiSummaryLoading ? (
                      <>
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        <span>Analyzing clinical records...</span>
                      </>
                    ) : (
                      <span>Summarize Patient</span>
                    )}
                  </button>
                </div>

                {(aiSummaryLoading || aiSummaryLines.length > 0) && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#252530] dark:bg-[#16161e]">
                    <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-[#c8c8e0]">{aiSummaryLines.join('\n')}</pre>
                  </div>
                )}

                {aiSummaryDone && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#c8c8e0] dark:hover:bg-[#1c1c25]"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSummary}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      Save to Notes
                    </button>
                    {aiSummaryMessage && <span className="text-xs text-emerald-600 dark:text-emerald-400">{aiSummaryMessage}</span>}
                  </div>
                )}

                <div className="mt-5">
                  <AiDisclaimer
                    text="AI summary is for reference only and does not replace physician clinical judgment."
                    modelName="HealthAI Summary v0.9"
                    dataset="EMR + Labs + Visit Timeline"
                    analyzedAt="Just now"
                  />
                </div>
              </article>
            </div>
          )}

          {emrTab === 'radiology' && specialtyData && <RadiologyPanel data={specialtyData} />}

          {emrTab === 'cardiology' && specialtyData && <CardiologyPanel data={specialtyData} />}

          {emrTab === 'ophthalmology' && specialtyData && <OphthalmologyPanel data={specialtyData} />}

          {emrTab === 'dermatology' && specialtyData && <DermatologyPanel data={specialtyData} />}

          {emrTab === 'pulmonology' && specialtyData && <PulmonologyPanel data={specialtyData} />}

          {emrTab === 'nephrology' && specialtyData && <NephrologyPanel data={specialtyData} />}
        </section>
      </div>
    </div>
  )
}

EMRWorkspaceView.propTypes = {
  addOrderNotification: PropTypes.func.isRequired,
  clearEmrRequestedTab: PropTypes.func,
  emrRequestedTab: PropTypes.string,
  labOrders: PropTypes.arrayOf(
    PropTypes.shape({
      estimatedReadyAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      id: PropTypes.string,
      orderedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      patientId: PropTypes.string,
      status: PropTypes.string,
      tests: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
  navigateTo: PropTypes.func.isRequired,
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    patient_id: PropTypes.string,
    patient_name: PropTypes.string,
    patient_age: PropTypes.number,
    patient_gender: PropTypes.string,
    status: PropTypes.string,
    name: PropTypes.string,
    initials: PropTypes.string,
    age: PropTypes.number,
    gender: PropTypes.string,
    specialty_name: PropTypes.string,
    specialty: PropTypes.string,
    chief_complaint: PropTypes.string,
    complaint: PropTypes.string,
    start_time: PropTypes.string,
    time: PropTypes.string,
    avatar: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
    }),
    allergies: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({
            name: PropTypes.string,
            severity: PropTypes.string,
            reaction: PropTypes.string,
          }),
        ]),
      ),
    ]),
  }),
  setSelectedPatient: PropTypes.func.isRequired,
  setLabOrders: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

EMRWorkspaceView.defaultProps = {
  clearEmrRequestedTab: () => {},
  emrRequestedTab: null,
  selectedPatient: null,
  user: null,
}
