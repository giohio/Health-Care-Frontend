import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import TreatmentPlanPanel from '../../components/emr/TreatmentPlanPanel'
import { patientApi } from '../../api/patient'
import { appointmentApi } from '../../api/appointment'
import { clinicalApi } from '../../api/clinical'
import { emrApi } from '../../api/emr'
import { summarizeEmr, clinicalAssist, streamSSE, suggestLabTests } from '../../api/ai'
import { APPOINTMENT_STATUS, LAB_RESULT_STATUS, ORDER_PRIORITY, TEST_TYPE } from '../../constants/enums'
import AiMessageContent from '../../components/shared/AiMessageContent'
import { IconUsers, IconCalendar, IconSearch } from '../../icons'

// DEMO_DATA — These constants are for development/preview only.
// Do not display real patient data without backend verification.
const FALLBACK_PATIENT = {
  id: 'PT-2024-0142',
  name: 'Selected Patient',
  initials: 'SP',
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

const SOAP_SECTIONS_CONFIG = [
  { key: 's', letter: 'S', label: 'Subjective', subtitle: "Patient's complaint", color: 'indigo', placeholder: 'Chief complaint, pain level, duration, and symptoms as described by the patient...' },
  { key: 'o', letter: 'O', label: 'Objective', subtitle: 'Examination findings', color: 'teal', placeholder: 'Vital signs, physical exam findings, and observable clinical data...' },
  { key: 'a', letter: 'A', label: 'Assessment', subtitle: 'Clinical diagnosis', color: 'amber', placeholder: 'Working diagnosis, differential diagnoses, and clinical impression...' },
  { key: 'p', letter: 'P', label: 'Plan', subtitle: 'Treatment & follow-up', color: 'emerald', placeholder: 'Treatment plan, medications, investigations, and follow-up schedule...' },
]

const SOAP_QUICK_CHIPS = {
  s: ['Patient reports worsening pain', 'Pain scale 7/10', 'Onset 2 days ago', 'No nausea or vomiting', 'Fever reported', 'Associated fatigue'],
  o: ['Alert and oriented ×3', 'No acute distress', 'Vitals stable', 'Pupils equal and reactive', 'Lungs clear to auscultation', 'No lymphadenopathy'],
  a: ['Consistent with viral infection', 'Rule out bacterial cause', 'Likely tension headache', 'Differential: migraine', 'Labs pending confirmation'],
  p: ['Paracetamol 500mg PRN', 'Continue current medications', 'Follow up in 1 week', 'Refer to specialist', 'CBC and CRP ordered', 'Patient education given'],
}

const LAB_TESTS = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    desc: 'WBC, RBC, Hemoglobin, Hematocrit, Platelets',
    tat: '2-4 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    desc: 'Infection and inflammation marker',
    tat: '2-4 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'glucose',
    name: 'Blood Glucose (Fasting)',
    desc: 'Diabetes screening',
    tat: '1-2 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    desc: 'Average blood glucose over the last 2-3 months',
    tat: '4-6 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'liver',
    name: 'Liver Function Tests',
    desc: 'ALT, AST, bilirubin, albumin',
    tat: '4-6 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'renal',
    name: 'Kidney Function (Renal Panel)',
    desc: 'Creatinine, urea, electrolytes',
    tat: '4-6 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'thyroid',
    name: 'Thyroid Function (TSH/T4)',
    desc: 'Thyroid hormone levels',
    tat: '24 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'lipid',
    name: 'Lipid Profile',
    desc: 'Cholesterol, LDL, HDL',
    tat: '4-6 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis',
    desc: 'Urine dipstick and microscopy',
    tat: '1-2 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.URINE,
  },
  {
    id: 'xray_abdominal',
    name: 'Abdominal X-Ray',
    desc: 'Bowel pattern, calcifications, masses',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'xray_skull',
    name: 'Skull X-Ray',
    desc: 'Fractures, sinuses, bony structures',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'xray_spine',
    name: 'Spine X-Ray',
    desc: 'Vertebral alignment, disc spaces',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
]

const LAB_TEST_GROUPS = [
  { key: 'hematology',  label: 'Hematology',            color: 'rose',  testIds: ['cbc', 'crp'] },
  { key: 'metabolic',   label: 'Metabolic & Endocrine', color: 'amber', testIds: ['glucose', 'hba1c', 'thyroid', 'lipid'] },
  { key: 'hepatorenal', label: 'Hepatorenal',           color: 'teal',  testIds: ['liver', 'renal'] },
  { key: 'urine',       label: 'Urinalysis',            color: 'sky',   testIds: ['urinalysis'] },
  { key: 'radiology',   label: 'Radiology & Imaging',   color: 'indigo',testIds: ['xray_abdominal', 'xray_skull', 'xray_spine'] },
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

function normalizeTestName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function isActiveLabOrder(order) {
  const status = String(order?.status || '').toUpperCase()
  return !['CANCELLED', 'CANCELED', 'DELETED'].includes(status)
}

function resolveResultKey(testIds) {
  if (testIds.includes('cbc')) return 'full-blood-panel'
  if (testIds.includes('lipid')) return 'lipid-profile'
  return null
}

function statusBadgeClass(status) {
  if (status === LAB_RESULT_STATUS.PENDING || status === 'pending') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }
  if (status === LAB_RESULT_STATUS.AI_PROCESSING || status === 'processing') {
    return 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300'
  }
  if (status === LAB_RESULT_STATUS.AI_DRAFT) {
    return 'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300'
  }
  if (status === LAB_RESULT_STATUS.DOCTOR_REVIEW) {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }
  if (status === LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW) {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  }
  if (status === LAB_RESULT_STATUS.PUBLISHED || status === 'ready') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
  }
  return 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function statusBadgeLabel(status) {
  const labels = {
    [LAB_RESULT_STATUS.PENDING]:             'Pending',
    [LAB_RESULT_STATUS.AI_PROCESSING]:       'AI Processing',
    [LAB_RESULT_STATUS.AI_DRAFT]:            'AI Draft',
    [LAB_RESULT_STATUS.DOCTOR_REVIEW]:       'Needs Review',
    [LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW]: 'Manual Review',
    [LAB_RESULT_STATUS.PUBLISHED]:           'Published',
    pending:    'Pending',
    processing: 'Processing',
    ready:      'Ready',
  }
  return labels[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ') : '')
}

function isActiveStatus(status) {
  return [
    'pending', LAB_RESULT_STATUS.PENDING,
    'processing', LAB_RESULT_STATUS.AI_PROCESSING,
    LAB_RESULT_STATUS.AI_DRAFT,
    LAB_RESULT_STATUS.DOCTOR_REVIEW,
    LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW,
  ].includes(status)
}

function orderProgressClass(status) {
  if (status === LAB_RESULT_STATUS.PENDING || status === 'pending') return 'w-1/4 bg-amber-400'
  if (status === LAB_RESULT_STATUS.AI_PROCESSING || status === 'processing') return 'w-1/2 bg-indigo-500'
  if (status === LAB_RESULT_STATUS.AI_DRAFT) return 'w-2/3 bg-violet-500'
  if (status === LAB_RESULT_STATUS.DOCTOR_REVIEW) return 'w-3/4 bg-amber-500'
  if (status === LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW) return 'w-3/4 bg-rose-400'
  return 'w-full bg-emerald-500'
}

function priorityActiveClass(color) {
  if (color === 'amber') return 'border-amber-500 bg-amber-500 text-white'
  if (color === 'rose') return 'border-rose-600 bg-rose-600 text-white'
  return 'border-slate-600 bg-slate-600 text-white dark:border-slate-400 dark:bg-slate-500'
}

function priorityInactiveClass(color) {
  if (color === 'amber') return 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/20'
  if (color === 'rose') return 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/20'
  return 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]'
}

function groupLabelClass(color) {
  if (color === 'rose')  return 'text-rose-600 dark:text-rose-400'
  if (color === 'amber') return 'text-amber-600 dark:text-amber-400'
  if (color === 'teal')  return 'text-teal-600 dark:text-teal-400'
  if (color === 'sky')   return 'text-sky-600 dark:text-sky-400'
  return 'text-slate-600 dark:text-[#9898b0]'
}

function groupDotClass(color) {
  if (color === 'rose')  return 'bg-rose-400 dark:bg-rose-500'
  if (color === 'amber') return 'bg-amber-400 dark:bg-amber-500'
  if (color === 'teal')  return 'bg-teal-400 dark:bg-teal-500'
  if (color === 'sky')   return 'bg-sky-400 dark:bg-sky-500'
  return 'bg-slate-400 dark:bg-[#505060]'
}

function groupBadgeClass(color) {
  if (color === 'rose')  return 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
  if (color === 'amber') return 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
  if (color === 'teal')  return 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50'
  if (color === 'sky')   return 'bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50'
  return 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#1c1c25] dark:text-[#9898b0] dark:border-[#252530]'
}

function groupHeaderBg(color) {
  if (color === 'rose')  return 'bg-rose-50/60 border-b border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30'
  if (color === 'amber') return 'bg-amber-50/60 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30'
  if (color === 'teal')  return 'bg-teal-50/60 border-b border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30'
  if (color === 'sky')   return 'bg-sky-50/60 border-b border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/30'
  return 'bg-slate-50 border-b border-slate-100 dark:bg-[#16161e] dark:border-[#1c1c25]'
}

function groupCardBorder(color) {
  if (color === 'rose')  return 'border-rose-200/80 dark:border-rose-900/40'
  if (color === 'amber') return 'border-amber-200/80 dark:border-amber-900/40'
  if (color === 'teal')  return 'border-teal-200/80 dark:border-teal-900/40'
  if (color === 'sky')   return 'border-sky-200/80 dark:border-sky-900/40'
  return 'border-slate-200 dark:border-[#252530]'
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
    .split(/\s+/)
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

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
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

function IconClock() {
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

function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
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

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

const SIDEBAR_NAV = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboardIcon },
  { key: 'notes', label: 'Notes', icon: FileTextIcon },
  { key: 'orders', label: 'Orders', icon: FlaskConicalIcon },
  { key: 'results', label: 'Results', icon: ClipboardListIcon },
  { key: 'ai-summary', label: 'AI Tools', icon: BotIcon },
]

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

function getApptStatusLabel(status) {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'waiting') return 'Waiting'
  if (status === 'pending') return 'Scheduled'
  return status ?? 'Unknown'
}

function getApptStatusBadgeCls(status) {
  if (status === 'in_progress') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
  if (status === 'waiting' || status === 'pending') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  return 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]'
}

function extractSoapSection(text, re) {
  const m = re.exec(text)
  return m ? m[1].trim() : ''
}

function buildPatient(selectedPatient) {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [patientNavOpen, setPatientNavOpen] = useState(false)
  const [navFilter, setNavFilter] = useState('all') // 'all' | 'confirmed' | 'in-room'
  const [resultsSubTab, setResultsSubTab] = useState('lab-results')
  const [noteText, setNoteText] = useState('')
  const [icdCodes, setIcdCodes] = useState([{ code: 'R51.9', desc: 'Headache, unspecified' }])
  const [icdSearch, setIcdSearch] = useState('')
  const [icdResults, setIcdResults] = useState([])
  const [showIcdDropdown, setShowIcdDropdown] = useState(false)
  const [noteTemplate, setNoteTemplate] = useState('soap')
  const [lastSaved, setLastSaved] = useState('Never')
  const [savedNoteId, setSavedNoteId] = useState(null)

  const [orderedTests, setOrderedTests] = useState(['cbc', 'crp'])
  const [orderNote, setOrderNote] = useState('')
  const [orderStep, setOrderStep] = useState('details')
  const [submittedOrderId, setSubmittedOrderId] = useState(null)
  const [submittedOrderCount, setSubmittedOrderCount] = useState(1)
  const [orderCounter, setOrderCounter] = useState(1)
  const [orderPriority, setOrderPriority] = useState(ORDER_PRIORITY.ROUTINE)
  const [labFee, setLabFee] = useState(0)
  const [customTests, setCustomTests] = useState([])

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummaryLines, setAiSummaryLines] = useState([])
  const [aiSummaryDone, setAiSummaryDone] = useState(false)
  const [aiSummaryMessage, setAiSummaryMessage] = useState('')
  const [summaryLanguage, setSummaryLanguage] = useState('vi')
  const [caQuestion, setCaQuestion] = useState('')
  const [caLines, setCaLines] = useState([])
  const [caLoading, setCaLoading] = useState(false)
  const [suggestLabLoading, setSuggestLabLoading] = useState(false)
  const [suggestLabResult, setSuggestLabResult] = useState(null)
  const [suggestLabError, setSuggestLabError] = useState(null)
  const [soapSections, setSoapSections] = useState({ s: '', o: '', a: '', p: '' })
  const [activeSoapSection, setActiveSoapSection] = useState('s')

  // Appointment gate (shown when no patient is selected)
  const [gateLoading] = useState(false)
  const [gateAppointments, setGateAppointments] = useState([])

  // Lab result submission modal
  const [labResultModalOpen, setLabResultModalOpen] = useState(false)
  const [labResultTargetOrder, setLabResultTargetOrder] = useState(null)
  const [labResultTab, setLabResultTab] = useState('file')
  const [labResultSubmitting, setLabResultSubmitting] = useState(false)
  const [labResultToast, setLabResultToast] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [labResultNotes, setLabResultNotes] = useState('')
  const [manualRows, setManualRows] = useState([{ id: crypto.randomUUID(), test_name: '', value: '', unit: '', reference_range: '', flag: 'N' }])
  const [manualRowsError, setManualRowsError] = useState(false)

  const patient = useMemo(() => buildPatient(selectedPatient), [selectedPatient])

  const apptId = selectedPatient?.id
  const patientUserId = selectedPatient?.patient_id

  const [vitals, setVitals] = useState(null)
  const [pastVisits, setPastVisits] = useState([])
  const [activeMedications, setActiveMedications] = useState([])
  const [recentLabs, setRecentLabs] = useState([])
  const [apptStatus, setApptStatus] = useState(selectedPatient?.status ?? null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Holistic AI analysis state
  const [holisticSummary, setHolisticSummary] = useState(null)
  const [holisticModalOpen, setHolisticModalOpen] = useState(false)
  const holisticPollRef = useRef(null)

  const processSummaryResult = useCallback((value) => {
    const { medications, vitals_latest } = value
    if (vitals_latest) setVitals(vitals_latest)
    if (medications && medications.length > 0) {
      setActiveMedications(medications.map(m => ({
        name: m.drug_name,
        dose: `${m.dosage || ''} - ${m.frequency || ''}`.trim()
      })))
    }
  }, [])

  const processLabResult = useCallback((value) => {
    const mappedLabs = value.map(l => ({
      test: l.test_name || `Lab Result (${l.id.substring(0, 4)})`,
      date: (() => {
        const ts = l.ordered_at || l.created_at
        return ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
      })(),
      status: l.status,
      aiKey: null,
      aiSummary: null,
    }))
    if (mappedLabs.length > 0) setRecentLabs(mappedLabs)
  }, [])

  const processVisitsResult = useCallback((value) => {
    const list = Array.isArray(value) ? value : (value?.appointments ?? [])
    const completed = list
      .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED && a.id !== apptId)
      .slice(0, 5)
      .map((a) => ({ date: a.appointment_date ?? a.created_at ?? '', type: a.specialty_name ?? 'Visit', id: a.id }))
    setPastVisits(completed)
  }, [apptId])

  const loadPatientData = useCallback(async () => {
    if (!patientUserId) return
    // Reset holistic summary when loading a new patient
    setHolisticSummary(null)
    setHolisticModalOpen(false)
    if (holisticPollRef.current) {
      globalThis.clearInterval(holisticPollRef.current)
      holisticPollRef.current = null
    }
    const [vitalsResult, visitsResult, summaryResult, labResult, labResultsResult, notesResult] = await Promise.allSettled([
      patientApi.getLatestVitals(patientUserId),
      appointmentApi.getByPatient(patientUserId),
      clinicalApi.getSummary(patientUserId),
      emrApi.getLabOrders({ patient_id: patientUserId }),
      emrApi.getLabResults({ patient_id: patientUserId }),
      clinicalApi.getNotes(patientUserId),
    ])

    if (vitalsResult.status === 'fulfilled' && vitalsResult.value) setVitals(vitalsResult.value)
    if (summaryResult.status === 'fulfilled' && summaryResult.value) processSummaryResult(summaryResult.value)

    // Build order_id → result status map from submitted lab results
    const resultByOrderId = {}
    if (labResultsResult.status === 'fulfilled' && Array.isArray(labResultsResult.value)) {
      for (const r of labResultsResult.value) {
        if (r.order_id) resultByOrderId[String(r.order_id)] = r.status
      }
      // Feed real result data (with status) into recent-labs sidebar
      processLabResult(labResultsResult.value)
    }

    if (labResult.status === 'fulfilled' && Array.isArray(labResult.value)) {
      // If we didn't get lab results, still populate recent-labs from orders (no status)
      if (labResultsResult.status !== 'fulfilled' || !Array.isArray(labResultsResult.value)) {
        processLabResult(labResult.value)
      }
      // Hydrate the Orders tab — upsert: add new orders, update status of existing ones
      const apiOrders = labResult.value.map((l) => ({
        id: l.id,
        patientId: patientUserId,
        patientName: l.patient_name || '',
        tests: [l.test_name],
        orderedBy: l.doctor_id || '',
        orderedAt: new Date(l.ordered_at || l.created_at || Date.now()),
        clinicalNote: l.instructions || '',
        priority: l.priority || ORDER_PRIORITY.ROUTINE,
        status: resultByOrderId[String(l.id)] || LAB_RESULT_STATUS.PENDING,
        tatMinutes: 0,
        estimatedReadyAt: null,
        resultKey: null,
      }))
      setLabOrders((prev) => {
        const prevIds = new Set(prev.map((o) => String(o.id)))
        // Update status of orders already in state
        const updated = prev.map((o) => {
          const realStatus = resultByOrderId[String(o.id)]
          return realStatus ? { ...o, status: realStatus } : o
        })
        // Add orders from API not yet in state
        const incoming = apiOrders.filter((o) => !prevIds.has(String(o.id)))
        return incoming.length > 0 ? [...incoming, ...updated] : updated
      })
    }
    if (visitsResult.status === 'fulfilled') processVisitsResult(visitsResult.value)

    // Pre-fill doctor note from last saved note (only when textarea is empty)
    if (notesResult.status === 'fulfilled' && Array.isArray(notesResult.value) && notesResult.value.length > 0) {
      const sorted = [...notesResult.value].sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )
      const latest = sorted[0]
      setSavedNoteId(latest.id || null)
      setNoteText((prev) => {
        if (prev.trim()) return prev // don’t overwrite in-progress edits
        return latest.content || ''
      })
      if (latest.note_type === 'soap' && latest.content) {
        const lines = latest.content.split(/\n\n+/)
        const sections = { s: '', o: '', a: '', p: '' }
        lines.forEach((block) => {
          const m = block.match(/^([SOAP]):\s*/i)
          if (m) sections[m[1].toLowerCase()] = block.replace(/^[SOAP]:\s*/i, '')
        })
        if (Object.values(sections).some(Boolean)) setSoapSections(sections)
      }
      if (latest.created_at) {
        setLastSaved(
          `${new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — last saved`
        )
      }
    } else {
      setSavedNoteId(null)
    }
  }, [patientUserId, processSummaryResult, processLabResult, processVisitsResult, setLabOrders])

  const handleStatusTransition = useCallback(async (action) => {
    if (!apptId || statusLoading) return
    setStatusLoading(true)
    try {
      if (action === 'start') {
        await appointmentApi.start(apptId)
        setApptStatus(APPOINTMENT_STATUS.IN_PROGRESS)
      } else if (action === 'complete') {
        // Apply doctor's saved defaults (duration + fee) before completing
        const storedDuration = localStorage.getItem('doctor-default-duration')
        const storedFee      = localStorage.getItem('doctor-consultation-fee')
        const adjustBody = {}
        if (storedDuration) adjustBody.duration_minutes = Number(storedDuration)
        if (storedFee)      adjustBody.consultation_fee  = Number(storedFee)
        if (Object.keys(adjustBody).length > 0) {
          try { await appointmentApi.adjust(apptId, adjustBody) } catch { /* non-fatal */ }
        }
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

  useEffect(() => {
    return () => {
      if (readinessIntervalRef.current) {
        globalThis.clearInterval(readinessIntervalRef.current)
      }
      if (holisticPollRef.current) {
        globalThis.clearInterval(holisticPollRef.current)
      }
    }
  }, [])

  const severeAllergies = patient.allergies.filter((item) => item.severity.toLowerCase().includes('severe'))
  const alreadyOrderedTestNames = useMemo(() => {
    const names = new Set()
    labOrders.forEach((order) => {
      if (!isActiveLabOrder(order)) return
      if (apptId && String(order.appointment_id || '') !== String(apptId)) return
      if (order.test_name) names.add(normalizeTestName(order.test_name))
      if (Array.isArray(order.tests)) {
        order.tests.forEach((name) => names.add(normalizeTestName(name)))
      }
    })
    return names
  }, [apptId, labOrders])
  const alreadyOrderedTestIds = useMemo(
    () => LAB_TESTS
      .filter((test) => alreadyOrderedTestNames.has(normalizeTestName(test.name)))
      .map((test) => test.id),
    [alreadyOrderedTestNames],
  )
  const alreadyOrderedTestIdSet = useMemo(() => new Set(alreadyOrderedTestIds), [alreadyOrderedTestIds])
  const selectedTests = LAB_TESTS.filter((test) => orderedTests.includes(test.id))
  const selectedMaxTatMinutes = selectedTests.length > 0
    ? Math.max(...selectedTests.map((test) => parseTatMinutes(test.tat)))
    : 0
  const selectedPatientId = selectedPatient?.id || 'PT-2024-0142'
  const validCustomTests = customTests.filter((ct) => ct.test_name.trim())
  const hasOrderSelection = orderedTests.length > 0 || validCustomTests.length > 0
  const totalSelected = orderedTests.length + validCustomTests.length
  const patientOrders = labOrders.filter(
    (order) => order.patientId === selectedPatientId || order.patientId === patientUserId,
  )
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
  const resultsSubTabData = specialtyTabs.find((tab) => tab.key === resultsSubTab)?.data

  const aiSummaryAbortRef = useRef(null)
  const caAbortRef = useRef(null)
  const caSessionRef = useRef(null) // persists clinical-assist session_id across turns
  const readinessIntervalRef = useRef(null)
  const customTestCounterRef = useRef(0)
  const csvImportRef = useRef(null)

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

  // Cleanup abort controllers on unmount
  useEffect(() => () => {
    aiSummaryAbortRef.current?.abort()
    caAbortRef.current?.abort()
  }, [])

  // Load today's appointments for patient navigator
  useEffect(() => {
    if (!user?.id) return
    appointmentApi.getByDoctor(user.id, { date_from: new Date().toISOString().slice(0, 10), date_to: new Date().toISOString().slice(0, 10) })
      .then((data) => setGateAppointments(Array.isArray(data) ? data : (data?.appointments ?? [])))
      .catch(() => setGateAppointments([]))
  }, [user?.id])

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

  const parseSoapNote = (text) => ({
    s: extractSoapSection(text, /S:\s*([\s\S]*?)(?=\n\nO:|$)/),
    o: extractSoapSection(text, /O:\s*([\s\S]*?)(?=\n\nA:|$)/),
    a: extractSoapSection(text, /A:\s*([\s\S]*?)(?=\n\nP:|$)/),
    p: extractSoapSection(text, /P:\s*([\s\S]*?)$/),
  })

  const handleTemplateChange = (value) => {
    if (value === 'soap') {
      if (noteText.trim() && noteText.includes('S:')) {
        setSoapSections(parseSoapNote(noteText))
      }
    } else {
      // Compose soapSections back to noteText when leaving SOAP mode
      const composed = [
        soapSections.s ? `S: ${soapSections.s}` : '',
        soapSections.o ? `O: ${soapSections.o}` : '',
        soapSections.a ? `A: ${soapSections.a}` : '',
        soapSections.p ? `P: ${soapSections.p}` : '',
      ].filter(Boolean).join('\n\n')
      if (composed) setNoteText(composed)
      else setNoteText(NOTE_TEMPLATES[value] || '')
    }
    setNoteTemplate(value)
    setActiveSoapSection('s')
  }

  const appendToSection = (sectionKey, chip) => {
    setSoapSections((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] ? `${prev[sectionKey]}\n${chip}` : chip,
    }))
  }

  const buildNoteContent = useCallback(() => {
    if (noteTemplate === 'soap') {
      return [
        soapSections.s ? `S: ${soapSections.s}` : '',
        soapSections.o ? `O: ${soapSections.o}` : '',
        soapSections.a ? `A: ${soapSections.a}` : '',
        soapSections.p ? `P: ${soapSections.p}` : '',
      ].filter(Boolean).join('\n\n')
    }
    return noteText
  }, [noteTemplate, noteText, soapSections])

  const handleSaveNote = async () => {
    const contentToSave = buildNoteContent()
    if (!patientUserId || !contentToSave.trim()) return;
    try {
      setLastSaved('Saving...');
      if (savedNoteId) {
        await clinicalApi.updateNote(savedNoteId, { content: contentToSave })
      } else {
        const created = await clinicalApi.createNote(patientUserId, {
          patient_id: patientUserId,
          doctor_id: user?.id || user?.sub || 'doc-id',
          content: contentToSave,
          appointment_id: apptId,
          note_type: noteTemplate,
          is_ai_generated: false,
        })
        if (created?.id) setSavedNoteId(created.id)
      }

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

  // Auto-save: debounce 3 s after the user stops typing
  useEffect(() => {
    const content = buildNoteContent()
    if (!patientUserId || !content.trim()) return
    const timer = setTimeout(() => {
      handleSaveNote()
    }, 3000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteText, soapSections, patientUserId])

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
    if (alreadyOrderedTestIdSet.has(testId)) return
    setOrderedTests((prev) => (
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    ))
  }

  const handleSubmitOrder = async () => {
    // Build one object per test so each gets its own LabOrder and upload slot
    const allTestObjects = [
      ...selectedTests.map((t) => ({
        name: t.name,
        testType: t.testType,
        tatMinutes: parseTatMinutes(t.tat),
        testId: t.id,
      })),
      ...validCustomTests.map((ct) => ({
        name: ct.test_name,
        testType: ct.testType || TEST_TYPE.OTHER,
        tatMinutes: 0,
        testId: null,
      })),
    ]
    if (allTestObjects.length === 0) return

    const orderedAt = new Date()
    const newOrders = []

    for (let i = 0; i < allTestObjects.length; i++) {
      const testObj = allTestObjects[i]
      let nextId = `ORD-${orderCounter + i}`
      try {
        const res = await emrApi.createLabOrder({
          patient_id: patientUserId || selectedPatient?.id || 'PT-2024-0142',
          doctor_id: user?.id || 'DR-1',
          appointment_id: apptId || undefined,
          test_name: testObj.name,
          test_type: testObj.testType,
          department: selectedPatient?.specialty_name || user?.specialty || 'internal_medicine',
          instructions: orderNote || undefined,
          priority: orderPriority,
          // fee only on first order to avoid charging the patient N times
          fee: i === 0 ? labFee || 0 : 0,
        })
        if (res?.id || res?.data?.id) {
          nextId = res?.id || res?.data?.id
        }
      } catch (err) {
        console.error('Failed to create lab order via API', err)
      }

      newOrders.push({
        id: nextId,
        patientId: patientUserId || selectedPatientId,
        patientName: selectedPatient?.patient_name || selectedPatient?.name || patient.name,
        tests: [testObj.name],
        orderedBy: clinicianName,
        orderedAt,
        clinicalNote: orderNote,
        priority: orderPriority,
        status: LAB_RESULT_STATUS.PENDING,
        tatMinutes: testObj.tatMinutes,
        estimatedReadyAt: new Date(orderedAt.getTime() + testObj.tatMinutes * 60000),
        resultKey: testObj.testId ? resolveResultKey([testObj.testId]) : null,
      })
    }

    setLabOrders((prev) => [...newOrders, ...prev])
    setOrderCounter((prev) => prev + newOrders.length)
    newOrders.forEach((o) => addOrderNotification(o, 'submitted'))
    setSubmittedOrderId(newOrders[0].id)
    setSubmittedOrderCount(newOrders.length)
    setOrderStep('submitted')
    setOrderedTests([])
    setOrderNote('')
    setOrderPriority(ORDER_PRIORITY.ROUTINE)
    setLabFee(0)
    setCustomTests([])

    if (readinessIntervalRef.current) {
      globalThis.clearInterval(readinessIntervalRef.current)
    }
    const pollApptId = apptId
    if (pollApptId) {
      readinessIntervalRef.current = globalThis.setInterval(async () => {
        try {
          const readiness = await emrApi.getLabOrderReadiness(pollApptId)
          if (Array.isArray(readiness?.results) && readiness.results.length > 0) {
            const statusMap = Object.fromEntries(
              readiness.results.map((r) => [r.order_id, r.status]),
            )
            updateOrderStatuses(statusMap)
          }
          if (readiness?.all_ready) {
            globalThis.clearInterval(readinessIntervalRef.current)
            readinessIntervalRef.current = null
            // Begin polling for holistic summary (AI is processing)
            startHolisticSummaryPoll(pollApptId)
          }
        } catch { /* ignore polling errors */ }
      }, 10000)
    }
  }

  const startHolisticSummaryPoll = useCallback((appointmentId) => {
    if (!appointmentId) return
    if (holisticPollRef.current) globalThis.clearInterval(holisticPollRef.current)
    setHolisticSummary((prev) => (prev?.status === 'DONE' ? prev : null))

    holisticPollRef.current = globalThis.setInterval(async () => {
      try {
        const summary = await emrApi.getAppointmentLabSummary(appointmentId)
        if (summary?.status === 'DONE' || summary?.status === 'FAILED') {
          setHolisticSummary(summary)
          globalThis.clearInterval(holisticPollRef.current)
          holisticPollRef.current = null
        } else if (summary) {
          setHolisticSummary(summary)
        }
      } catch { /* ignore */ }
    }, 8000)
  }, [])

  const handleGenerateAiSummary = () => {
    setAiSummaryLoading(true)
    setAiSummaryDone(false)
    setAiSummaryLines([])
    setAiSummaryMessage('')

    // Abort previous stream
    aiSummaryAbortRef.current?.abort()
    const controller = new AbortController()
    aiSummaryAbortRef.current = controller

    const pid = patientUserId
    if (!pid) {
      setAiSummaryLoading(false)
      setAiSummaryLines(['No patient selected. Please open a patient record first.'])
      setAiSummaryDone(true)
      return
    }
    let accumulated = ''

    summarizeEmr({ patientId: pid, language: summaryLanguage }, controller.signal)
      .then((response) => {
        streamSSE(response, {
          onChunk: (chunk) => {
            accumulated += chunk
            setAiSummaryLines(accumulated.split('\n'))
          },
          onDone: () => {
            setAiSummaryLoading(false)
            setAiSummaryDone(true)
          },
          onError: () => {
            if (controller.signal.aborted) return
            setAiSummaryLoading(false)
            setAiSummaryDone(true)
            if (!accumulated) {
              setAiSummaryLines(['Could not generate summary. Please try again.'])
            }
          },
        })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setAiSummaryLoading(false)
        setAiSummaryDone(true)
        setAiSummaryLines([err?.message || 'Failed to generate AI summary. Please try again.'])
      })
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

    setAiSummaryMessage('Appended to note editor')
  }

  const handleClinicalAssist = async () => {
    const q = caQuestion.trim()
    if (!q || caLoading) return
    setCaLoading(true)
    setCaLines([])
    caAbortRef.current?.abort()
    const ctrl = new AbortController()
    caAbortRef.current = ctrl
    let buf = ''
    try {
      const response = await clinicalAssist(
        {
          question: q,
          patientId: patientUserId,
          sessionId: caSessionRef.current || undefined,  // continue existing session
        },
        ctrl.signal
      )
      streamSSE(response, {
        onEvent: (name, data) => {
          // Capture session_id on first call to persist conversation history
          if (name === 'session_id') caSessionRef.current = data.trim()
        },
        onChunk: (chunk) => { buf += chunk; setCaLines(buf.split('\n')) },
        onDone: () => setCaLoading(false),
        onError: () => { if (!ctrl.signal.aborted) setCaLoading(false) },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCaLines([err?.message || 'Failed to generate clinical assist response.'])
        setCaLoading(false)
      }
    }
  }

  const handleSuggestLab = async () => {
    if (suggestLabLoading) return
    const symptoms = soapSections.s || orderNote || ''
    if (!symptoms.trim()) {
      setSuggestLabError('Please add symptoms or a clinical note (SOAP — S field) before requesting suggestions.')
      return
    }
    setSuggestLabLoading(true)
    setSuggestLabResult(null)
    setSuggestLabError(null)
    try {
      const data = await suggestLabTests({
        symptoms: symptoms.trim(),
        patientId: patientUserId || undefined,
      })
      setSuggestLabResult(data)
    } catch (err) {
      setSuggestLabError(err?.message || 'Failed to get lab suggestions.')
    } finally {
      setSuggestLabLoading(false)
    }
  }

  const handleSubmitLabResult = async () => {
    if (!labResultTargetOrder || labResultSubmitting) return
    setLabResultSubmitting(true)
    setLabResultToast(null)
    try {
      const patId = selectedPatient?.patient_id || selectedPatient?.id || 'PT-2024-0142'
      const docId = user?.id || user?.sub || 'DR-1'
      if (labResultTab === 'file') {
        if (!selectedFile) {
          setLabResultToast({ type: 'error', message: 'Please select a file to upload.' })
          return
        }
        const uploadRes = await emrApi.uploadFile(selectedFile)
        await emrApi.createLabResult({
          order_id: labResultTargetOrder.id,
          patient_id: patId,
          doctor_id: docId,
          file_url: uploadRes.url,
          file_type: uploadRes.file_type || 'pdf',
          notes: labResultNotes || undefined,
        })
      } else {
        const rowsWithName = manualRows.filter((r) => r.test_name.trim())
        if (rowsWithName.length === 0 || rowsWithName.some((r) => !r.value.trim())) {
          setManualRowsError(true)
          setLabResultToast({ type: 'error', message: 'Please fill in Test Name and Value for each entry.' })
          return
        }
        await emrApi.createLabResult({
          order_id: labResultTargetOrder.id,
          patient_id: patId,
          doctor_id: docId,
          file_url: null,
          file_type: 'manual',
          manual_entries: rowsWithName,
          notes: labResultNotes || undefined,
        })
      }
      setLabResultToast({ type: 'success', message: 'Result submitted successfully.' })
      globalThis.setTimeout(() => {
        setLabResultModalOpen(false)
        setLabResultToast(null)
        setSelectedFile(null)
        setLabResultNotes('')
        setManualRows([{ test_name: '', value: '', unit: '', reference_range: '', flag: 'N' }])
        setManualRowsError(false)
        setLabResultTargetOrder(null)
      }, 1500)
    } catch (err) {
      setLabResultToast({ type: 'error', message: err?.message || 'Failed to submit result.' })
    } finally {
      setLabResultSubmitting(false)
    }
  }

  const patchManualRow = useCallback((idx, field, value) => {
    setManualRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }, [])

  const removeManualRow = useCallback((idx) => {
    setManualRows((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  // Parse a CSV text into manualRows (header row required)
  const handleImportCSV = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // reset so the same file can be re-imported if needed
    e.target.value = ''
    const text = await file.text()
    // Split into non-empty lines
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) return

    // Parse a single CSV line respecting quoted fields
    const parseLine = (line) => {
      const fields = []
      let current = ''
      let inQuote = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
          if (inQuote && line[i + 1] === '"') { current += '"'; i++ }
          else inQuote = !inQuote
        } else if (ch === ',' && !inQuote) {
          fields.push(current.trim())
          current = ''
        } else {
          current += ch
        }
      }
      fields.push(current.trim())
      return fields
    }

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim().replaceAll(' ', '_'))

    // Flexible header aliases
    const colIdx = (aliases) => {
      for (const alias of aliases) {
        const idx = headers.indexOf(alias)
        if (idx !== -1) return idx
      }
      return -1
    }

    const nameCol  = colIdx(['test_name', 'name', 'test', 'parameter', 'chỉ_số', 'indicator'])
    const valCol   = colIdx(['value', 'result', 'kết_quả', 'giá_trị', 'amount'])
    const unitCol  = colIdx(['unit', 'units', 'đơn_vị', 'uom'])
    const refCol   = colIdx(['reference_range', 'ref_range', 'reference range', 'ref range', 'normal_range', 'normal range', 'khoảng_tham_chiếu'])
    const flagCol  = colIdx(['flag', 'abnormal', 'cờ', 'status'])

    if (nameCol === -1 || valCol === -1) {
      alert('CSV must have at least "test_name" and "value" columns')
      return
    }

    const VALID_FLAGS = new Set(['N', 'H', 'L', 'C'])
    const imported = lines.slice(1).map((line) => {
      const cols = parseLine(line)
      const rawFlag = flagCol === -1 ? 'N' : (cols[flagCol] || '').toUpperCase()
      return {
        id: crypto.randomUUID(),
        test_name:       cols[nameCol]  || '',
        value:           cols[valCol]   || '',
        unit:            unitCol === -1  ? '' : (cols[unitCol]  || ''),
        reference_range: refCol  === -1  ? '' : (cols[refCol]   || ''),
        flag:            VALID_FLAGS.has(rawFlag) ? rawFlag : 'N',
      }
    }).filter((r) => r.test_name)

    if (imported.length > 0) {
      setManualRows((prev) => {
        // If only one blank placeholder row, replace it; otherwise append
        const isBlank = prev.length === 1 && !prev[0].test_name.trim() && !prev[0].value.trim()
        return isBlank ? imported : [...prev, ...imported]
      })
    }
  }, [])

  const patchCustomTest = useCallback((id, field, value) => {
    setCustomTests((prev) => prev.map((ct) => ct.id === id ? { ...ct, [field]: value } : ct))
  }, [])

  const removeCustomTest = useCallback((id) => {
    setCustomTests((prev) => prev.filter((ct) => ct.id !== id))
  }, [])

  const updateOrderStatuses = useCallback((statusMap) => {
    setLabOrders((prev) =>
      prev.map((order) =>
        statusMap[order.id] ? { ...order, status: statusMap[order.id] } : order,
      ),
    )
  }, [setLabOrders])

  function addCustomTest() {
    customTestCounterRef.current += 1
    setCustomTests((prev) => [
      ...prev,
      { id: `ct-${customTestCounterRef.current}`, test_name: '', testType: TEST_TYPE.BLOOD_PANEL },
    ])
  }

  if (!selectedPatient) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 dark:border-[#252530] dark:bg-[#111118]">
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
        </div>

        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#f8fafc] p-6 dark:bg-[#08080f]">
          <div className="w-full max-w-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">Select a Patient</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Choose a patient from today's appointments to open the EMR workspace.</p>
            </div>

            {(() => {
              if (gateLoading) {
                return (
                  <div className="flex justify-center py-16">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
                  </div>
                )
              }
              if (gateAppointments.length === 0) {
                return (
                  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-[#252530] dark:bg-[#111118]">
                    <p className="text-sm text-slate-500 dark:text-[#70708a]">No appointments scheduled for today.</p>
                    <button
                      type="button"
                      onClick={() => navigateTo('patient-queue')}
                      className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                    >
                      Go to Patient Queue
                    </button>
                  </div>
                )
              }
              return (
                <div className="flex flex-col gap-3">
                  {gateAppointments.map((appt, ai) => {
                    const name = appt.patient_name ?? appt.name ?? 'Unknown Patient'
                    const statusLabel = getApptStatusLabel(appt.status)
                    const statusBadgeCls = getApptStatusBadgeCls(appt.status)
                    return (
                      <button
                        key={appt.id ?? `ga-${ai}`}
                        type="button"
                        onClick={() => setSelectedPatient(appt)}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition-all hover:border-indigo-300 hover:shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:hover:border-indigo-700"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">
                            {name.split(/\s+/).slice(0, 2).map((n) => n[0] ?? '').join('')}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{name}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{appt.specialty_name ?? 'General'} · {appt.start_time ?? appt.appointment_date ?? ''}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeCls}`}>
                          {statusLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50/50 dark:bg-[#08080f]/50">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('patient-queue')}
            className="group relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 shadow-sm ring-1 ring-slate-200/50 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-md hover:ring-indigo-200/80 dark:bg-[#1c1c25]/80 dark:text-[#70708a] dark:ring-[#252530]/50 dark:hover:bg-[#252530] dark:hover:text-indigo-400 dark:hover:ring-indigo-900/50"
            aria-label="Back to patient queue"
          >
            <span className="inline-flex h-4 w-4 transition-transform group-hover:-translate-x-0.5"><ArrowLeftIcon /></span>
          </button>

          <span className="h-5 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">EMR Workspace</span>
          <span className="text-sm text-slate-300 dark:text-[#404050]">/</span>
          <button
            type="button"
            onClick={() => setPatientNavOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-[13px] font-bold text-indigo-700 shadow-[0_2px_8px_-4px_rgba(99,102,241,0.2)] transition-all hover:bg-white hover:shadow-md hover:-translate-y-px dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
          >
            <span className="inline-flex h-3.5 w-3.5"><UsersIcon /></span>{' '}
            All Patients
            <span className="rounded-full bg-indigo-200 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">{gateAppointments.length}</span>
          </button>
        </div>

        {apptStatus && (
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getApptStatusBadgeCls(apptStatus)}`}>
            {getApptStatusLabel(apptStatus)}
          </span>
        )}

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
            onClick={() => navigateTo('doctor-chat')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 1 1 18-5z" /></svg>
            <span>AI Chat</span>
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

      {/* Patient Navigator Drawer */}
      {patientNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setPatientNavOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 right-0 top-14 z-50 flex w-80 flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#252530]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Today's Patients</h3>
                <p className="text-xs text-slate-500 dark:text-[#70708a]">{gateAppointments.length} appointments</p>
              </div>
              <button
                type="button"
                onClick={() => setPatientNavOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#606070] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]"
                aria-label="Close patient navigator"
              >
                <span className="inline-flex h-4 w-4"><XIcon /></span>
              </button>
            </div>

            {/* Nav filters */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-2 dark:border-[#1c1c25]">
              {[
                { key: 'all', label: 'All' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'in-room', label: 'In Room' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setNavFilter(f.key)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    navFilter === f.key
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-50 dark:text-[#70708a] dark:hover:bg-[#16161e]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Patient list */}
            <div className="flex-1 overflow-y-auto py-2">
              {gateAppointments.filter((a) => {
                if (navFilter === 'all') return true
                if (navFilter === 'confirmed') return a.status === APPOINTMENT_STATUS.CONFIRMED || a.status === APPOINTMENT_STATUS.PENDING
                if (navFilter === 'in-room') return a.status === APPOINTMENT_STATUS.IN_PROGRESS
                return true
              }).length === 0 && (
                <p className="px-5 py-8 text-center text-xs text-slate-400 dark:text-[#606070]">
                  No {navFilter} patients
                </p>
              )}
              {gateAppointments.filter((a) => {
                if (navFilter === 'all') return true
                if (navFilter === 'confirmed') return a.status === APPOINTMENT_STATUS.CONFIRMED || a.status === APPOINTMENT_STATUS.PENDING
                if (navFilter === 'in-room') return a.status === APPOINTMENT_STATUS.IN_PROGRESS
                return true
              }).map((appt, ai) => {
                const name = appt.patient_name ?? appt.name ?? 'Unknown'
                const isActive = appt.id === selectedPatient?.id
                let sLabel = 'Waiting'
                let sCls = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                if (appt.status === APPOINTMENT_STATUS.CONFIRMED || appt.status === APPOINTMENT_STATUS.PENDING) { sLabel = 'Confirmed'; sCls = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' }
                else if (appt.status === APPOINTMENT_STATUS.IN_PROGRESS) { sLabel = 'In Room'; sCls = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' }
                else if (appt.status === APPOINTMENT_STATUS.COMPLETED) { sLabel = 'Done'; sCls = 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]' }
                const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() || '').join('')
                let gradFrom = 'from-slate-300'
                let gradTo = 'to-slate-400'
                if (isActive) { gradFrom = 'from-indigo-500'; gradTo = 'to-violet-600' }
                else if (appt.status === APPOINTMENT_STATUS.IN_PROGRESS) { gradFrom = 'from-emerald-400'; gradTo = 'to-teal-500' }
                else if (appt.status === APPOINTMENT_STATUS.CONFIRMED || appt.status === APPOINTMENT_STATUS.PENDING) { gradFrom = 'from-blue-400'; gradTo = 'to-indigo-500' }
                return (
                  <button
                    key={appt.id ?? `nav-${ai}`}
                    type="button"
                    onClick={() => { setSelectedPatient(appt); setPatientNavOpen(false) }}
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-[#16161e]'
                    }`}
                  >
                    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradFrom} ${gradTo} text-xs font-bold text-white`}>
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-[#eeeef5]'}`}>{name}</p>
                      <p className="text-xs text-slate-400 dark:text-[#606070]">{appt.start_time ?? ''} · {appt.specialty_name ?? 'General'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCls}`}>{sLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Patient Banner */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/60 px-6 py-3.5 backdrop-blur-xl dark:border-[#252530]/60 dark:bg-[#0e0e15]/60 z-10 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br text-[16px] font-extrabold text-white shadow-sm ring-1 ring-slate-100 dark:ring-[#252530] ${patient.avatar.from} ${patient.avatar.to}`}>
              {patient.initials}
            </span>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white">{patient.name}</p>
              <p className="font-mono text-xs text-slate-400 dark:text-[#606070]">{patient.id}</p>
            </div>
          </div>

          <span className="h-10 w-px bg-slate-200/80 dark:bg-[#252530]" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600 dark:text-[#a0a0b8]">
            <span className="flex items-center gap-1.5"><span className="inline-flex h-3.5 w-3.5 opacity-60"><IconUsers /></span>{patient.age} · {patient.gender}</span>
            <span className="flex items-center gap-1.5"><span className="inline-flex h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />{patient.blood}</span>
            <span className="flex items-center gap-1.5"><span className="inline-flex h-3.5 w-3.5 opacity-60"><IconCalendar /></span>DOB {patient.dob}</span>
            <span className="flex items-center gap-1.5"><span className="inline-flex h-3.5 w-3.5 opacity-60"><IconSearch /></span>{patient.phone}</span>
          </div>

          <span className="h-10 w-px bg-slate-200/80 hidden lg:block dark:bg-[#252530]" aria-hidden="true" />

          <div className="hidden items-center gap-2 lg:flex">
            {severeAllergies.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-3 py-1.5 shadow-[0_2px_10px_-4px_rgba(244,63,94,0.15)] dark:border-rose-900/40 dark:bg-rose-950/20">
                <span className="inline-flex h-4 w-4 animate-pulse text-rose-500 dark:text-rose-400"><ShieldAlertIcon /></span>
                {severeAllergies.map((item, ai) => (
                  <span key={item.name ?? `allergy-${ai}`} className="rounded-[10px] bg-rose-200/50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 ml-auto flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50/80 px-3 py-1.5 font-bold tracking-tight text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200/50 dark:bg-indigo-950/30 dark:text-indigo-300 dark:ring-indigo-800/40">
            {patient.specialty}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-[#70708a]">
            Today <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-[#404050]" /> {patient.time}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-0">
        {/* Sidebar Navigation */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} group flex shrink-0 flex-col border-r border-slate-200/80 bg-white/40 backdrop-blur-3xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] hover:bg-white/80 dark:border-[#252530]/80 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/90 z-20`}>
          <nav className="flex flex-1 flex-col gap-1.5 p-3">
            {SIDEBAR_NAV.map((item) => {
              const isActive = emrTab === item.key
              const NavIcon = item.icon
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setEmrTab(item.key)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`relative overflow-hidden flex items-center gap-3.5 rounded-[14px] px-3.5 py-3 text-left text-[14px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-[0_2px_10px_-4px_rgba(99,102,241,0.2)] ring-1 ring-inset ring-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20'
                      : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 hover:shadow-sm dark:text-[#8a8aa0] dark:hover:bg-[#1c1c25]/50 dark:hover:text-[#eeeef5]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-[4px] bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.6)] dark:bg-indigo-500" />
                  )}
                  <span className={`inline-flex h-5 w-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover/btn:scale-110'}`}>
                    <NavIcon />
                  </span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          <div className="border-t border-slate-200/80 p-3 dark:border-[#252530]/80">
            <button
               type="button"
               onClick={() => setSidebarCollapsed((prev) => !prev)}
               className="flex w-full items-center justify-center rounded-[12px] bg-slate-100/50 py-2.5 text-slate-500 transition-all hover:bg-slate-200/50 hover:text-slate-900 active:scale-95 dark:bg-[#1c1c25]/50 dark:text-[#70708a] dark:hover:bg-[#252530]/50 dark:hover:text-white"
               aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
             >
              <span className="inline-flex h-4 w-4">
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </span>
            </button>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto bg-[#f8fafc] px-6 py-5 dark:bg-[#08080f]">
          {emrTab === 'overview' && (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              {/* Left Column - 60% */}
              <div className="flex-1 space-y-5">
                {highRiskLab && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 border-l-4 border-l-rose-500 bg-rose-50 px-5 py-4 dark:border-rose-900/50 dark:bg-rose-950/30">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400"><AlertTriangleIcon /></span>
                    <div>
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">AI has flagged high-risk findings</p>
                      <p className="mt-1 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                        Lipid Profile shows elevated LDL ({highRiskLab.aiData.confidence}% confidence). Review recommended before next consultation.
                      </p>
                    </div>
                    <button type="button" onClick={() => setEmrTab('results')} className="self-start rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700">
                      View Results →
                    </button>
                  </div>
                )}

                {/* Chief Complaint */}
                <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Chief Complaint</p>
                  </div>
                  <p className="text-[15px] font-medium leading-relaxed italic text-slate-800 dark:text-[#eeeef5]">
                    {patient.complaint}
                  </p>
                </div>

                {/* Vitals */}
                <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Vitals <span className="opacity-60 font-normal tracking-normal lowercase ml-1">· {vitals ? `recorded ${vitals.recorded_at ?? 'recently'}` : 'last recorded'}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { val: vitals?.blood_pressure ?? '–', unit: 'mmHg', label: 'Blood Pressure' },
                      { val: vitals?.temperature ?? '–', unit: `°${vitals?.temp_unit ?? 'C'}`, label: 'Temperature' },
                      { val: vitals?.heart_rate ?? '–', unit: 'bpm', label: 'Heart Rate' },
                      { val: vitals?.respiratory_rate ?? '–', unit: 'rpm', label: 'Respiratory' },
                      { val: vitals?.spo2 ?? '–', unit: '%', label: 'SpO2' },
                      { val: vitals?.weight ? `${vitals.weight} kg` : '–', unit: '', label: 'Weight' },
                      { val: vitals?.height ? `${vitals.height} cm` : '–', unit: '', label: 'Height' },
                      { val: vitals?.bmi ? vitals.bmi.toFixed(1) : '–', unit: '', label: 'BMI' },
                    ].map((item) => (
                      <div key={item.label} className="group flex flex-col rounded-[14px] border border-slate-200/40 bg-slate-50/50 px-4 py-3 transition-all hover:bg-white hover:border-slate-300/60 dark:border-[#252530]/40 dark:bg-[#0e0e15]/40 dark:hover:bg-[#1c1c25]/60 dark:hover:border-[#252530]/80">
                        <span className="text-[20px] font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors dark:text-[#eeeef5] dark:group-hover:text-indigo-400">{item.val}<span className="ml-1 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{item.unit}</span></span>
                        <span className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-[#70708a]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Visits + Active Medications - 2 col inside left */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                    <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Past Visits</p>
                    </div>
                    <div className="space-y-3">
                      {pastVisits.slice(0, 3).map((visit, i) => (
                        <div key={`${visit.type}-${visit.date || i}`} className="flex items-center gap-3 text-xs w-full">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shrink-0 shadow-sm">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-[#eeeef5] truncate">{visit.type}</span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-[#606070]">{visit.date}</span>
                          </div>
                        </div>
                      ))}
                      {pastVisits.length === 0 && <p className="text-xs text-slate-400 dark:text-[#606070]">No past visits recorded.</p>}
                    </div>
                  </div>

                  <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                    <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Active Medications</p>
                    </div>
                    <div className="space-y-3">
                      {activeMedications.slice(0, 3).map((med) => (
                        <div key={med.name} className="flex items-start gap-3 text-xs">
                          <span className="mt-1 flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-[#eeeef5]">{med.name}</span>
                            {med.dose && <span className="text-[10px] font-medium text-slate-400 dark:text-[#606070]">{med.dose}</span>}
                          </div>
                        </div>
                      ))}
                      {activeMedications.length === 0 && <p className="text-xs text-slate-400 dark:text-[#606070]">No active medications.</p>}
                    </div>
                  </div>
                </div>

                {/* Specialty Tabs */}
                {(() => {
                  const specialtyTabs = getSpecialtyTabs(patient.specialty)
                  if (!specialtyTabs || specialtyTabs.length === 0) return null
                  return (
                    <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                      <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Specialty Tools</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {specialtyTabs.map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setResultsSubTab(tab.key)}
                            className="flex items-center gap-1.5 rounded-[12px] border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-100 hover:shadow-md dark:border-teal-800/50 dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-950/50"
                          >
                            <SpecialtyTabIcon icon={tab.icon} className="text-teal-600 dark:text-teal-400" />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Right Column - 40% */}
              <div className="w-full space-y-5 lg:w-96 lg:shrink-0">
                {/* Lab Results */}
                <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                  <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Recent Lab Results</p>
                      <button type="button" onClick={() => setEmrTab('results')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">View All →</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recentLabs.slice(0, 3).map((lab, i) => {
                      const labStatusLow = lab.status?.toLowerCase() || ''
                      let labBadgeCls = 'bg-slate-200/60 text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300/50 dark:bg-[#252530]/60 dark:text-[#9898b0] dark:ring-[#303040]/50'
                      if (labStatusLow.includes('elevated') || labStatusLow.includes('abnormal') || labStatusLow.includes('low') || labStatusLow.includes('high')) {
                        labBadgeCls = 'bg-amber-100/80 text-amber-700 shadow-sm ring-1 ring-inset ring-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50'
                      } else if (labStatusLow.includes('normal') || labStatusLow.includes('within')) {
                        labBadgeCls = 'bg-emerald-100/80 text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50'
                      }
                      return (
                      <div key={`${lab.test}-${i}`} className="flex items-center justify-between rounded-[14px] border border-slate-200/40 bg-slate-50/50 px-4 py-3 transition-all hover:bg-white hover:border-slate-300/60 dark:border-[#252530]/40 dark:bg-[#0e0e15]/40 dark:hover:bg-[#1c1c25]/60 dark:hover:border-[#252530]/80">
                        <div>
                          <p className="text-[13px] font-bold text-slate-800 dark:text-[#eeeef5]">{lab.test}</p>
                          <p className="text-[11px] font-medium text-slate-400 dark:text-[#606070]">{lab.date}</p>
                        </div>
                        <span className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${labBadgeCls}`}>
                          {lab.status?.slice(0, 20) || 'DONE'}
                        </span>
                      </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick AI Summary */}
                <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                  <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] flex items-center gap-1.5 font-extrabold uppercase tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
                        <span className="inline-flex"><IconSparkle size={12} className="text-violet-500 dark:text-violet-400" /></span>{' '}
                        AI Clinical Assistant
                      </p>
                      <button type="button" onClick={() => setEmrTab('ai-summary')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">Full →</button>
                    </div>
                  </div>
                  {aiSummaryLoading && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[#70708a] bg-slate-50/50 dark:bg-[#1c1c25]/30 p-3 rounded-[12px]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent dark:border-indigo-400" />{' '}
                      Generating summary...
                    </div>
                  )}
                  {!aiSummaryLoading && aiSummaryLines.length > 0 && (
                    <div className="space-y-2">
                      {aiSummaryLines.slice(0, 3).map((line, i) => (
                        <div key={`ai-${line.slice(0, 20)}-${i}`} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500/50 dark:bg-indigo-400/50" />
                          <p className="text-[13px] leading-relaxed text-slate-700 dark:text-[#eeeef5]">{line}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!aiSummaryLoading && aiSummaryLines.length === 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider dark:text-[#606070] uppercase">Language</span>
                        <div className="flex bg-slate-100/80 p-0.5 rounded-[8px] dark:bg-[#1c1c25]/80 ring-1 ring-inset ring-slate-200/50 dark:ring-[#252530]/50">
                          <button
                            type="button"
                            onClick={() => setSummaryLanguage('vi')}
                            className={`rounded-[6px] px-2.5 py-1 text-[10px] font-bold transition-all shadow-sm ${summaryLanguage === 'vi' ? 'bg-white text-indigo-600 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:bg-[#252530] dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-[#7070a0] dark:hover:text-[#eeeef5] shadow-none'}`}
                          >VI</button>
                          <button
                            type="button"
                            onClick={() => setSummaryLanguage('en')}
                            className={`rounded-[6px] px-2.5 py-1 text-[10px] font-bold transition-all shadow-sm ${summaryLanguage === 'en' ? 'bg-white text-indigo-600 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:bg-[#252530] dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-[#7070a0] dark:hover:text-[#eeeef5] shadow-none'}`}
                          >EN</button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAiSummary}
                        className="w-full rounded-[12px] border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-indigo-100/50 px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:from-indigo-100 hover:to-indigo-200/50 hover:shadow dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-indigo-500/5 dark:text-indigo-300 dark:hover:from-indigo-500/20 dark:hover:to-indigo-500/10"
                      >
                        Generate Summary
                      </button>
                      <p className="text-center text-[10px] text-slate-400 dark:text-[#606070] italic">Powered by AI · Clinical decision support</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-[20px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white/80 dark:border-[#252530]/60 dark:bg-[#111118]/60 dark:hover:bg-[#111118]/80 dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]">
                  <div className="mb-4 border-b border-slate-200/60 pb-3 dark:border-[#252530]/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:text-[#70708a]">Quick Actions</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => setEmrTab('notes')} className="w-full rounded-[12px] border border-slate-200/60 bg-white/40 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 border-b-2 active:border-b dark:border-[#252530]/60 dark:bg-[#1c1c25]/30 dark:text-[#9898b0] dark:hover:bg-[#252530]/60 dark:hover:text-[#eeeef5]">
                      Open Clinical Notes
                    </button>
                    <button type="button" onClick={() => setEmrTab('orders')} className="w-full rounded-[12px] border border-slate-200/60 bg-white/40 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 border-b-2 active:border-b dark:border-[#252530]/60 dark:bg-[#1c1c25]/30 dark:text-[#9898b0] dark:hover:bg-[#252530]/60 dark:hover:text-[#eeeef5]">
                      Order Lab Tests
                    </button>
                    <button type="button" onClick={() => setEmrTab('ai-summary')} className="w-full rounded-[12px] border border-slate-200/60 bg-white/40 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 border-b-2 active:border-b dark:border-[#252530]/60 dark:bg-[#1c1c25]/30 dark:text-[#9898b0] dark:hover:bg-[#252530]/60 dark:hover:text-[#eeeef5]">
                      AI Clinical Assist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {emrTab === 'notes' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-[#252530] dark:bg-[#111118]">
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
                  onClick={() => {
                    if (noteTemplate === 'soap') setSoapSections(parseSoapNote(SOAP_AI_NOTE))
                    else setNoteText(SOAP_AI_NOTE)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/70"
                >
                  <span className="inline-flex h-3.5 w-3.5"><SparklesIcon /></span>
                  <span>AI Assist</span>
                </button>
              </div>

              {/* SOAP interactive editor */}
              {noteTemplate === 'soap' ? (
                <>
                  {/* Completion bar */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#252530] dark:bg-[#111118]">
                    <span className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">Completion</span>
                    <div className="flex flex-1 gap-1.5">
                      {SOAP_SECTIONS_CONFIG.map((sec) => {
                        const filled = !!soapSections[sec.key].trim()
                        const barCls = { indigo: 'bg-indigo-500', teal: 'bg-teal-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' }
                        return (
                          <div key={sec.key} className="flex-1">
                            <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${filled ? barCls[sec.color] : 'bg-slate-200 dark:bg-[#252530]'}`} />
                            <p className={`mt-1 text-center text-[9px] font-bold uppercase tracking-widest transition-colors ${filled ? 'text-slate-500 dark:text-[#70708a]' : 'text-slate-300 dark:text-[#404050]'}`}>{sec.letter}</p>
                          </div>
                        )
                      })}
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-500 dark:text-[#70708a]">
                      {SOAP_SECTIONS_CONFIG.filter((s) => !!soapSections[s.key].trim()).length}/4
                    </span>
                  </div>

                  {/* Section accordion cards */}
                  <div className="flex flex-col gap-3">
                    {SOAP_SECTIONS_CONFIG.map((sec) => {
                      const isActive = activeSoapSection === sec.key
                      const hasContent = !!soapSections[sec.key].trim()
                      const wordCount = hasContent ? soapSections[sec.key].trim().split(/\s+/).length : 0
                      const preview = soapSections[sec.key].split('\n')[0].slice(0, 60)
                      const overflows = soapSections[sec.key].split('\n')[0].length > 60

                      const cls = {
                        indigo: {
                          border: 'border-l-indigo-400 dark:border-l-indigo-600',
                          activeBg: 'bg-indigo-50/50 dark:bg-indigo-950/10',
                          letter: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
                          label: 'text-indigo-700 dark:text-indigo-300',
                          chip: 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800/50 dark:text-indigo-400 dark:hover:bg-indigo-950/40',
                          focus: 'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50',
                        },
                        teal: {
                          border: 'border-l-teal-400 dark:border-l-teal-600',
                          activeBg: 'bg-teal-50/50 dark:bg-teal-950/10',
                          letter: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
                          label: 'text-teal-700 dark:text-teal-300',
                          chip: 'border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800/50 dark:text-teal-400 dark:hover:bg-teal-950/40',
                          focus: 'focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:border-teal-500 dark:focus:ring-teal-950/50',
                        },
                        amber: {
                          border: 'border-l-amber-400 dark:border-l-amber-600',
                          activeBg: 'bg-amber-50/50 dark:bg-amber-950/10',
                          letter: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
                          label: 'text-amber-700 dark:text-amber-300',
                          chip: 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-950/40',
                          focus: 'focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:border-amber-500 dark:focus:ring-amber-950/50',
                        },
                        emerald: {
                          border: 'border-l-emerald-400 dark:border-l-emerald-600',
                          activeBg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
                          letter: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
                          label: 'text-emerald-700 dark:text-emerald-300',
                          chip: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40',
                          focus: 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950/50',
                        },
                      }[sec.color]

                      return (
                        <article key={sec.key} className={`overflow-hidden rounded-2xl border border-l-4 border-slate-200 transition-all duration-200 dark:border-[#252530] ${cls.border}`}>
                          {/* Card header */}
                          <button
                            type="button"
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? cls.activeBg : 'bg-white hover:bg-slate-50/70 dark:bg-[#111118] dark:hover:bg-[#16161e]'}`}
                            onClick={() => setActiveSoapSection(isActive ? null : sec.key)}
                          >
                            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${cls.letter}`}>{sec.letter}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold ${cls.label}`}>{sec.label}</span>
                                <span className="text-[11px] text-slate-400 dark:text-[#606070]">·</span>
                                <span className="text-[11px] text-slate-500 dark:text-[#70708a]">{sec.subtitle}</span>
                                {hasContent && <span className="ml-auto shrink-0 text-[10px] font-semibold text-slate-400 dark:text-[#505060]">{wordCount}w</span>}
                                {hasContent && <span className="inline-flex h-3.5 w-3.5 shrink-0 text-emerald-500"><CheckIcon /></span>}
                              </div>
                              <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-[#606070]">
                                {!hasContent && 'Not yet filled — click to expand'}
                                {hasContent && !overflows && preview}
                                {hasContent && overflows && `${preview}…`}
                              </p>
                            </div>
                            <span className={`inline-flex h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-[#606070] ${isActive ? 'rotate-180' : ''}`}><ChevronDownIcon /></span>
                          </button>

                          {/* Expanded content */}
                          {isActive && (
                            <div className={`border-t border-slate-100 px-4 pb-4 pt-3 dark:border-[#1c1c25] ${cls.activeBg}`}>
                              <textarea
                                rows={5}
                                value={soapSections[sec.key]}
                                onChange={(e) => setSoapSections((prev) => ({ ...prev, [sec.key]: e.target.value }))}
                                placeholder={sec.placeholder}
                                className={`w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 dark:border-[#252530] dark:bg-[#0e0e15] dark:text-[#c8c8e0] dark:placeholder:text-[#505060] ${cls.focus}`}
                              />
                              <div className="mt-2.5">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Quick add</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {SOAP_QUICK_CHIPS[sec.key].map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => appendToSection(sec.key, chip)}
                                      className={`rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium transition-all hover:-translate-y-px hover:shadow-sm dark:bg-[#111118] ${cls.chip}`}
                                    >
                                      + {chip}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </>
              ) : (
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Start typing your note..."
                  className="min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:placeholder:text-[#505060] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                />
              )}

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
                      setSoapSections({ s: '', o: '', a: '', p: '' })
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

              <div className="flex flex-col gap-4 lg:col-span-2">

                {/* ── Wizard step indicator ── */}
                {orderStep !== 'submitted' && (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                    {[
                      { key: 'details', label: 'Order Details', num: 1 },
                      { key: 'tests',   label: 'Select Tests',  num: 2 },
                      { key: 'review',  label: 'Review',        num: 3 },
                    ].flatMap((ws, i, arr) => {
                      const STEPS = ['details', 'tests', 'review']
                      const curIdx = STEPS.indexOf(orderStep)
                      const wsIdx  = STEPS.indexOf(ws.key)
                      const done   = wsIdx < curIdx
                      const active = wsIdx === curIdx
                      let indicatorCls = 'border-2 border-slate-200 bg-white text-slate-400 dark:border-[#353545] dark:bg-[#111118] dark:text-[#505060]'
                      if (done) indicatorCls = 'bg-indigo-600 text-white'
                      else if (active) indicatorCls = 'border-2 border-indigo-500 bg-white text-indigo-600 dark:bg-[#111118]'

                      let textCls = 'text-slate-400 dark:text-[#505060]'
                      if (active) textCls = 'text-slate-900 dark:text-[#eeeef5]'
                      else if (done) textCls = 'text-indigo-600 dark:text-indigo-400'

                      const items = [
                        <button
                          key={ws.key}
                          type="button"
                          onClick={() => { if (done) setOrderStep(ws.key) }}
                          className={`flex items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${indicatorCls}`}>
                            {done ? <span className="inline-flex h-3 w-3"><CheckIcon /></span> : ws.num}
                          </span>
                          <span className={`hidden text-sm font-medium sm:block ${textCls}`}>
                            {ws.label}
                          </span>
                        </button>,
                      ]
                      if (i < arr.length - 1) {
                        items.push(
                          <span key={`sep-${ws.key}`} className={`h-px flex-1 ${wsIdx < curIdx ? 'bg-indigo-300 dark:bg-indigo-700' : 'bg-slate-200 dark:bg-[#252530]'}`} />,
                        )
                      }
                      return items
                    })}
                  </div>
                )}

                {/* ── Step content ── */}
                {orderStep === 'submitted' && submittedOrder && (
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                    <div className="py-6 text-center">
                      <div className="relative mx-auto mb-6 h-16 w-16">
                        <span className="ring-pulse absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800/50" />
                        <span className="absolute inset-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60" />
                        <span className="absolute inset-4 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
                          <span className="inline-flex h-4 w-4"><CheckIcon /></span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Order Submitted Successfully</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">
                        {submittedOrder.patientName} — {submittedOrderCount > 1 ? `${submittedOrderCount} orders` : '1 order'} tracking automatically
                      </p>

                      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left dark:border-[#252530] dark:bg-[#111118]">
                        <div className="flex flex-col gap-3">
                          {[
                            { key: 'received',   title: 'Order Received',     sub: '(Just now)',                          complete: true,                                                                                                                                                                                                                                          current: false },
                            { key: 'processing', title: 'Processing in Lab',  sub: '(Status updates automatically)',      complete: [LAB_RESULT_STATUS.AI_DRAFT, LAB_RESULT_STATUS.DOCTOR_REVIEW, LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW, LAB_RESULT_STATUS.PUBLISHED, 'ready'].includes(submittedOrder.status), current: [LAB_RESULT_STATUS.PENDING, 'pending', LAB_RESULT_STATUS.AI_PROCESSING, 'processing'].includes(submittedOrder.status) },
                            { key: 'ready',      title: 'Results Ready',       sub: 'Patient will be notified',           complete: [LAB_RESULT_STATUS.PUBLISHED, 'ready'].includes(submittedOrder.status),                                                                                                                                                                      current: [LAB_RESULT_STATUS.AI_DRAFT, LAB_RESULT_STATUS.DOCTOR_REVIEW, LAB_RESULT_STATUS.NEEDS_MANUAL_REVIEW].includes(submittedOrder.status) },
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
                        onClick={() => setOrderStep('details')}
                        className="mt-6 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                      >
                        Order Another Test
                      </button>
                    </div>
                  </article>

                )}
                {orderStep === 'details' && (
                  /* ── Step 1: Order Details ── */
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                    <div className="mb-5">
                      <p className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Order Details</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                        Set priority and add a clinical note for {patient.name}
                      </p>
                    </div>

                    <div className="mb-5">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Priority</p>
                      <div className="flex gap-2">
                        {[
                          { value: ORDER_PRIORITY.ROUTINE, label: 'Routine', color: 'slate' },
                          { value: ORDER_PRIORITY.URGENT,  label: 'Urgent',  color: 'amber' },
                          { value: ORDER_PRIORITY.STAT,    label: 'STAT',    color: 'rose'  },
                        ].map(({ value, label, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setOrderPriority(value)}
                            className={`rounded-xl border px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${orderPriority === value ? priorityActiveClass(color) : priorityInactiveClass(color)}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Clinical Note</p>
                      <textarea
                        rows={4}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Reason for ordering, relevant symptoms..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                      />
                    </div>

                    <div className="mb-6">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Lab Fee (VND)</p>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={labFee}
                        onChange={(e) => setLabFee(Number(e.target.value))}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                      />
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-[#505060]">Enter &gt; 0 to trigger VNPay payment for the patient</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOrderStep('tests')}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                      >
                        Select Tests →
                      </button>
                    </div>
                  </article>

                )}
                {orderStep === 'tests' && (
                  /* ── Step 2: Select Tests ── */
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {LAB_TEST_GROUPS.map((group) => {
                        const groupTests = LAB_TESTS.filter((t) => group.testIds.includes(t.id))
                        const selectedInGroup = groupTests.filter((t) => orderedTests.includes(t.id)).length
                        return (
                          <article
                            key={group.key}
                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-[#111118] ${groupCardBorder(group.color)}`}
                          >
                            <div className={`flex items-center justify-between px-4 py-3 ${groupHeaderBg(group.color)}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${groupDotClass(group.color)}`} />
                                <span className={`text-sm font-semibold ${groupLabelClass(group.color)}`}>{group.label}</span>
                              </span>
                              {selectedInGroup > 0 && (
                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${groupBadgeClass(group.color)}`}>
                                  {selectedInGroup} selected
                                </span>
                              )}
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
                              {groupTests.map((test) => {
                                const selected = orderedTests.includes(test.id)
                                const alreadyOrdered = alreadyOrderedTestIdSet.has(test.id)
                                return (
                                  <button
                                    key={test.id}
                                    type="button"
                                    onClick={() => !alreadyOrdered && toggleTest(test.id)}
                                    disabled={alreadyOrdered}
                                    className={`w-full px-4 py-3 text-left transition-colors duration-150 ${
                                      selected
                                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                                        : alreadyOrdered
                                          ? 'cursor-not-allowed bg-slate-50/70 opacity-60 dark:bg-[#15151d]'
                                          : 'hover:bg-slate-50 dark:hover:bg-[#16161e]'
                                    }`}
                                  >
                                    <span className="flex items-start gap-3">
                                      <span
                                        className={`mt-0.5 inline-flex flex-shrink-0 items-center justify-center rounded transition-all duration-150 ${selected ? 'border border-indigo-600 bg-indigo-600 text-white' : alreadyOrdered ? 'border border-slate-300 bg-slate-100 text-slate-400 dark:border-[#353545] dark:bg-[#20202a]' : 'border-2 border-slate-300 dark:border-[#404050]'}`}
                                        style={{ minWidth: '1.125rem', minHeight: '1.125rem', width: '1.125rem', height: '1.125rem' }}
                                      >
                                        {selected && <span className="inline-flex h-2.5 w-2.5"><CheckIcon /></span>}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className={`block text-sm font-semibold leading-snug ${selected ? 'text-indigo-700 dark:text-indigo-300' : alreadyOrdered ? 'text-slate-400 dark:text-[#606070]' : 'text-slate-900 dark:text-[#eeeef5]'}`}>
                                          {test.name}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-[#70708a]">{test.desc}</span>
                                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                                          {alreadyOrdered && (
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-[#20202a] dark:text-[#70708a]">
                                              Ordered
                                            </span>
                                          )}
                                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-[#1c1c25] dark:text-[#70708a]">
                                            <span className="inline-flex h-2.5 w-2.5"><IconClock /></span>
                                            {test.tat}
                                          </span>
                                          {test.aiEnabled && (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400">
                                              <span className="inline-flex h-2.5 w-2.5"><SparklesIcon /></span>
                                              <span>AI</span>
                                            </span>
                                          )}
                                        </span>
                                      </span>
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </article>
                        )
                      })}
                    </div>

                    <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 shadow-sm dark:border-[#353545] dark:bg-[#111118]">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Custom Tests</p>
                      {customTests.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {customTests.map((ct) => (
                            <div key={ct.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={ct.test_name}
                                onChange={(e) => patchCustomTest(ct.id, 'test_name', e.target.value)}
                                placeholder="Custom test name"
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:focus:border-indigo-500"
                              />
                              <select
                                value={ct.testType}
                                onChange={(e) => patchCustomTest(ct.id, 'testType', e.target.value)}
                                className="shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#9898b0]"
                              >
                                <option value={TEST_TYPE.BLOOD_PANEL}>Blood Panel</option>
                                <option value={TEST_TYPE.URINE}>Urine</option>
                                <option value={TEST_TYPE.IMAGING}>Imaging</option>
                                <option value={TEST_TYPE.ECG}>ECG</option>
                                <option value={TEST_TYPE.OTHER}>Other</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeCustomTest(ct.id)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                                aria-label="Remove custom test"
                              >
                                <span className="inline-flex h-4 w-4"><XIcon /></span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={addCustomTest}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-[#353545] dark:text-[#70708a] dark:hover:border-indigo-600 dark:hover:text-indigo-400"
                      >
                        + Add Custom Test
                      </button>
                    </article>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                      <button
                        type="button"
                        onClick={() => setOrderStep('details')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                      >
                        ← Back
                      </button>
                      <div className="flex items-center gap-3">
                        {hasOrderSelection && (
                          <span className="text-xs text-slate-500 dark:text-[#70708a]">
                            {totalSelected} test{totalSelected === 1 ? '' : 's'} selected
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={!hasOrderSelection}
                          onClick={() => setOrderStep('review')}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                          Review Order →
                        </button>
                      </div>
                    </div>
                  </>

                )}
                {orderStep === 'review' && (
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Review Order</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                          {patient.name} · {selectedPatient?.id || selectedPatient?.patient_id || 'PT-2024-0142'}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#c8c8e0]">
                        <span className="inline-flex h-3.5 w-3.5 text-slate-400"><IconClock /></span>
                        Ready in ~{formatTatFromMinutes(selectedMaxTatMinutes)}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-[#1c1c25]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Priority</span>
                      <span className={`rounded-xl border px-3 py-1 text-xs font-semibold ${priorityActiveClass(
                        (() => {
                          if (orderPriority === ORDER_PRIORITY.URGENT) return 'amber'
                          if (orderPriority === ORDER_PRIORITY.STAT) return 'rose'
                          return 'slate'
                        })()
                      )}`}>
                        {(() => {
                          if (orderPriority === ORDER_PRIORITY.URGENT) return 'Urgent'
                          if (orderPriority === ORDER_PRIORITY.STAT) return 'STAT'
                          return 'Routine'
                        })()}
                      </span>
                    </div>

                    {/* Clinical note */}
                    {orderNote.trim() && (
                      <div className="mb-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-[#1c1c25]">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Clinical Note</p>
                        <p className="text-sm text-slate-700 dark:text-[#c8c8e0]">{orderNote}</p>
                      </div>
                    )}

                    {/* Selected tests grouped */}
                    <div className="mb-3 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Tests Ordered</p>
                      {LAB_TEST_GROUPS.map((group) => {
                        const testsInGroup = LAB_TESTS.filter((t) => group.testIds.includes(t.id) && orderedTests.includes(t.id))
                        if (testsInGroup.length === 0) return null
                        return (
                          <div key={group.key} className={`overflow-hidden rounded-xl border ${groupCardBorder(group.color)}`}>
                            <div className={`flex items-center gap-2 px-3 py-2 ${groupHeaderBg(group.color)}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${groupDotClass(group.color)}`} />
                              <span className={`text-xs font-semibold ${groupLabelClass(group.color)}`}>{group.label}</span>
                            </div>
                            {testsInGroup.map((test) => (
                              <div key={test.id} className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5 dark:border-[#1c1c25]">
                                <span className="text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{test.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 dark:text-[#606070]">{test.tat}</span>
                                  {test.aiEnabled && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400">
                                      <span className="inline-flex h-2.5 w-2.5"><SparklesIcon /></span> AI
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                      {validCustomTests.map((ct) => (
                        <div key={ct.id} className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 px-3 py-2.5 dark:border-[#353545]">
                          <span className="text-sm text-slate-700 dark:text-[#c8c8e0]">{ct.test_name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-[#606070]">Custom</span>
                        </div>
                      ))}
                    </div>

                    {/* Today row */}
                    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-[#1c1c25]">
                      <span className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-[#c8c8e0]">
                        <span className="inline-flex h-4 w-4 text-slate-400"><EyeIcon /></span>
                        {patient.name} · {selectedPatient?.id || selectedPatient?.patient_id || 'PT-2024-0142'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-[#70708a]">
                        Today · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Allergy alert */}
                    {patient.allergies?.length > 0 && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/10">
                        <span className="inline-flex h-4 w-4 text-rose-500"><ShieldAlertIcon /></span>
                        <p className="text-xs text-rose-600 dark:text-rose-400">
                          Allergy alert on file — verify before prescribing any medication alongside tests
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderStep('tests')}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
                      >
                        ← Edit Tests
                      </button>
                      <button
                        type="button"
                        disabled={!hasOrderSelection}
                        onClick={handleSubmitOrder}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                      >
                        <span className="inline-flex h-4 w-4"><FlaskConicalIcon /></span>
                        <span>Submit Order →</span>
                      </button>
                    </div>
                  </article>
                )}
              </div>

              <aside className="flex flex-col gap-4 rounded-2xl">
                {/* AI Suggest Lab Tests */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <span className="inline-flex h-4 w-4"><IconSparkle size={14} /></span>
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">AI Lab Suggestions</p>
                  </div>
                  <p className="mb-3 text-[11px] text-slate-500 dark:text-[#70708a]">
                    Get AI-recommended lab tests based on the patient's symptoms or clinical notes.
                  </p>
                  <button
                    type="button"
                    disabled={suggestLabLoading}
                    onClick={handleSuggestLab}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    {suggestLabLoading
                      ? <><span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> Analyzing…</>
                      : 'Suggest Lab Tests'
                    }
                  </button>
                  {suggestLabError && (
                    <p className="mt-2 text-[11px] text-rose-500 dark:text-rose-400">{suggestLabError}</p>
                  )}
                  {suggestLabResult && (
                    <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm dark:border-[#252530] dark:bg-[#111118]">
                      {suggestLabResult.suggestions?.length > 0 ? (
                        <>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-[#505060]">Recommended Tests</p>
                          <ul className="flex flex-col gap-1.5">
                            {suggestLabResult.suggestions.map((t) => (
                              <li key={t.test_name} className="flex items-start gap-2 text-xs text-slate-700 dark:text-[#c8c8e0]">
                                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                                <span>
                                  <span className="font-medium">{t.test_name}</span>
                                  {t.priority && t.priority !== 'ROUTINE' && (
                                    <span className={`ml-1.5 rounded px-1 py-0.5 text-[10px] font-semibold ${t.priority === 'STAT' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'}`}>{t.priority}</span>
                                  )}
                                  {t.reason && <span className="block text-[10px] text-slate-400 dark:text-[#606070]">{t.reason}</span>}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-[#70708a]">{suggestLabResult.message || 'No specific suggestions returned.'}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order History */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Order History</p>
                  {holisticSummary?.status === 'DONE' && (
                    <button
                      onClick={() => setHolisticModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Full Analysis
                    </button>
                  )}
                  {holisticSummary?.status === 'PROCESSING' && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
                      Holistic Analysis Running…
                    </span>
                  )}
                </div>

                {patientOrders.length === 0 ? (
                  <div className="py-10 text-center">
                    <span className="mx-auto mb-3 inline-flex h-8 w-8 text-slate-300 dark:text-[#404050]"><ClipboardListIcon /></span>
                    <p className="text-sm text-slate-400 dark:text-[#606070]">No orders yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {patientOrders.map((order, oi) => (
                      <article key={order.id ?? `order-${oi}`} className="rounded-xl border border-slate-200 px-4 py-4 dark:border-[#252530]">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(order.status)}`}>
                            {isActiveStatus(order.status) && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                            )}
                            {statusBadgeLabel(order.status)}
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
                          {(order.status === 'ready' || order.status === LAB_RESULT_STATUS.PUBLISHED) ? (
                            <button
                              type="button"
                              onClick={() => setEmrTab('overview')}
                              className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              View Results →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setManualRowsError(false)
                                setLabResultTargetOrder(order)
                                setLabResultTab('file')
                                setSelectedFile(null)
                                setLabResultNotes('')
                                setManualRows([{ test_name: '', value: '', unit: '', reference_range: '', flag: 'N' }])
                                setLabResultModalOpen(true)
                              }}
                              className="text-[11px] font-medium text-teal-600 hover:underline dark:text-teal-400"
                            >
                              Add Result
                            </button>
                          )}
                        </div>

                        {isActiveStatus(order.status) && (
                          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                            <span
                              className={`block h-full rounded-full ${orderProgressClass(order.status)}`}
                              style={['processing', LAB_RESULT_STATUS.AI_PROCESSING].includes(order.status) ? { animation: 'progress 2s ease infinite' } : undefined}
                            />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
                </div>
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
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-[#7070a0]">Language:</span>
                    <button
                      type="button"
                      onClick={() => setSummaryLanguage('vi')}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${summaryLanguage === 'vi' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'}`}
                    >
                      VI
                    </button>
                    <button
                      type="button"
                      onClick={() => setSummaryLanguage('en')}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${summaryLanguage === 'en' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'}`}
                    >
                      EN
                    </button>
                  </div>
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
                    <AiMessageContent text={aiSummaryLines.join('\n')} />
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

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-[#eeeef5]">🔬 Clinical Decision Support</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Ask a clinical question — AI will reference guidelines and this patient's records</p>
                </div>
                <div className="mt-5 flex gap-2">
                  <textarea
                    rows={2}
                    value={caQuestion}
                    onChange={(e) => setCaQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClinicalAssist() } }}
                    placeholder="e.g. Male 65 yo, ST elevation on ECG — differential diagnosis?"
                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={handleClinicalAssist}
                    disabled={!caQuestion.trim() || caLoading}
                    className="self-end rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    {caLoading ? (
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    ) : 'Ask'}
                  </button>
                </div>
                {caLines.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#252530] dark:bg-[#16161e]">
                    <AiMessageContent text={caLines.join('\n')} />
                  </div>
                )}
              </article>
            </div>
          )}

          {emrTab === 'results' && (
            <div className="space-y-4">
              {/* Results sub-navigation */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-[#252530] dark:bg-[#111118]">
                <button
                  type="button"
                  onClick={() => setResultsSubTab('lab-results')}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                    resultsSubTab === 'lab-results'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                  }`}
                >
                  Lab Results
                </button>
                {specialtyTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setResultsSubTab(tab.key)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                      resultsSubTab === tab.key
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-[#70708a] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                    }`}
                  >
                    <SpecialtyTabIcon icon={tab.icon} className={resultsSubTab === tab.key ? 'text-white' : specialtyActiveIconClass(tab.key)} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Lab Results sub-tab */}
              {resultsSubTab === 'lab-results' && (
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Lab Results</p>
                    <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" onClick={() => setEmrTab('orders')}>
                      Order New →
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#252530]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-[#16161e]">
                        <tr>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Test</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Date</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">Status</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">AI Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emrLabWithAi.map((row, ri) => (
                          <tr key={row.test ?? `lab-row-${ri}`} className="border-t border-slate-100 dark:border-[#1c1c25]">
                            <td className="px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-[#c8c8e0]">{row.test}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-500 dark:text-[#70708a]">{row.date}</td>
                            <td className="px-3 py-2.5 text-sm text-slate-600 dark:text-[#9898b0]">{row.status}</td>
                            <td className="px-3 py-2.5 text-sm">
                              {row.aiData ? (
                                <AiRiskBadge riskLevel={row.aiData.riskLevel} confidence={row.aiData.confidence} compact />
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
              )}

              {/* AI Treatment Plan — shown when a lab result with AI summary is available */}
              {resultsSubTab === 'lab-results' && recentLabs.some((r) => r.aiSummary) && (() => {
                const latestWithSummary = recentLabs.find((r) => r.aiSummary)
                return (
                  <TreatmentPlanPanel
                    key={latestWithSummary.test}
                    labSummary={latestWithSummary.aiSummary}
                    patientId={patientUserId || undefined}
                  />
                )
              })()}

              {/* Specialty panel sub-tabs */}
              {resultsSubTab === 'pulmonology'
                ? <PulmonologyPanel patientId={selectedPatient?.patient_id || ''} doctorId={user?.id || user?.sub || ''} />
                : resultsSubTabData && (
                  <>
                    {resultsSubTab === 'radiology'     && <RadiologyPanel data={resultsSubTabData} />}
                    {resultsSubTab === 'cardiology'    && <CardiologyPanel data={resultsSubTabData} patientId={selectedPatient?.patient_id || ''} doctorId={user?.id || user?.sub || ''} />}
                    {resultsSubTab === 'ophthalmology' && <OphthalmologyPanel data={resultsSubTabData} />}
                    {resultsSubTab === 'dermatology'   && <DermatologyPanel data={resultsSubTabData} />}
                    {resultsSubTab === 'nephrology'    && <NephrologyPanel data={resultsSubTabData} />}
                  </>
                )
              }
            </div>
          )}
        </section>
      </div>

      {/* Holistic AI Analysis Modal */}
      {holisticModalOpen && holisticSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#111118]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#252530]">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">
                  🔬 Holistic Visit Analysis
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-[#606070]">
                  AI-synthesized cross-test analysis — for physician review only
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHolisticModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#252530]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {holisticSummary.status === 'FAILED' ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  <AiMessageContent text={holisticSummary.ai_holistic_text || 'Holistic analysis could not be completed. Please review individual results manually.'} />
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <AiMessageContent text={holisticSummary.ai_holistic_text || ''} />
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-[#252530]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-slate-400 dark:text-[#606070]">
                  ⚠️ AI-generated draft — does not constitute a final diagnosis or clinical order.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await globalThis.navigator.clipboard.writeText(holisticSummary.ai_holistic_text || '')
                      } catch { /* ignore */ }
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = holisticSummary.ai_holistic_text || ''
                      if (!text) return
                      setNoteText((prev) => {
                        const prefix = prev.trim().length > 0 ? `${prev}\n\n` : ''
                        return `${prefix}[AI Holistic Analysis]\n${text}`
                      })
                      setHolisticModalOpen(false)
                    }}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  >
                    Save to Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Submission Modal */}
      {labResultModalOpen && labResultTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#111118]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#252530]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Submit Lab Result</p>
                {Array.isArray(labResultTargetOrder.tests) && labResultTargetOrder.tests.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {labResultTargetOrder.tests.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setLabResultModalOpen(false); setLabResultToast(null); setManualRowsError(false) }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#70708a] dark:hover:bg-[#1c1c25] dark:hover:text-[#c8c8e0]"
                aria-label="Close"
              >
                <span className="inline-flex h-4 w-4"><XIcon /></span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#252530]">
              {[{ key: 'file', label: 'File Upload' }, { key: 'manual', label: 'Manual Entry' }].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setLabResultTab(t.key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    labResultTab === t.key
                      ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
              {labResultTab === 'file' ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
                      Result File <span className="text-rose-500">*</span>
                    </p>
                    <label htmlFor="lab-file-input" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-[#353545] dark:bg-[#16161e] dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20">
                      <span className="inline-flex h-8 w-8 text-slate-400 dark:text-[#606070]"><FlaskConicalIcon /></span>
                      <span className="text-sm font-medium text-slate-600 dark:text-[#9898b0]">
                        {selectedFile ? selectedFile.name : 'Click to select a file'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-[#606070]">PDF, PNG, JPG, JPEG · max 20 MB</span>
                      <input
                        id="lab-file-input"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="lab-notes-file" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Notes (optional)</label>
                    <textarea
                      id="lab-notes-file"
                      rows={3}
                      value={labResultNotes}
                      onChange={(e) => setLabResultNotes(e.target.value)}
                      placeholder="Additional notes about the result..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#252530]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#16161e]">
                        <tr>
                          {['Test Name *', 'Value *', 'Unit', 'Ref. Range', 'Flag', ''].map((h) => (
                            <th key={h} className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 dark:text-[#606070]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {manualRows.map((row, idx) => (
                          <tr key={row.id || `row-${idx}`} className="border-t border-slate-100 dark:border-[#1c1c25]">
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.test_name}
                                onChange={(e) => patchManualRow(idx, 'test_name', e.target.value)}
                                placeholder="e.g. Hemoglobin"
                                className={`w-full rounded-lg border px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:bg-[#0e0e15] dark:text-[#c8c8e0] ${manualRowsError && !row.test_name.trim() ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-[#252530]'}`}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.value}
                                onChange={(e) => patchManualRow(idx, 'value', e.target.value)}
                                placeholder="e.g. 12.5"
                                className={`w-full rounded-lg border px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:bg-[#0e0e15] dark:text-[#c8c8e0] ${manualRowsError && row.test_name.trim() && !row.value.trim() ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-[#252530]'}`}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => patchManualRow(idx, 'unit', e.target.value)}
                                placeholder="g/dL"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#0e0e15] dark:text-[#c8c8e0]"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.reference_range}
                                onChange={(e) => patchManualRow(idx, 'reference_range', e.target.value)}
                                placeholder="12–16"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#0e0e15] dark:text-[#c8c8e0]"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={row.flag}
                                onChange={(e) => patchManualRow(idx, 'flag', e.target.value)}
                                className="rounded-lg border border-slate-200 px-1 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#0e0e15] dark:text-[#c8c8e0]"
                              >
                                <option value="N">N</option>
                                <option value="H">H</option>
                                <option value="L">L</option>
                                <option value="C">C</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              {manualRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeManualRow(idx)}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                                >
                                  <span className="inline-flex h-3.5 w-3.5"><XIcon /></span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManualRows((prev) => [...prev, { id: crypto.randomUUID(), test_name: '', value: '', unit: '', reference_range: '', flag: 'N' }])}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-[#353545] dark:text-[#9898b0] dark:hover:border-indigo-600 dark:hover:text-indigo-400"
                    >
                      + Add Row
                    </button>

                    {/* CSV import */}
                    <button
                      type="button"
                      onClick={() => csvImportRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-teal-300 px-3 py-2 text-xs font-medium text-teal-600 transition-colors hover:border-teal-500 hover:bg-teal-50 dark:border-teal-700/60 dark:text-teal-400 dark:hover:border-teal-500 dark:hover:bg-teal-950/20"
                    >
                      ↑ Import CSV
                    </button>
                    <input
                      ref={csvImportRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="sr-only"
                      onChange={handleImportCSV}
                    />
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-[#606070]">
                      CSV header: test_name, value, unit, reference_range, flag
                    </span>
                  </div>
                  <div>
                    <label htmlFor="lab-notes-manual" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Notes (optional)</label>
                    <textarea
                      id="lab-notes-manual"
                      rows={2}
                      value={labResultNotes}
                      onChange={(e) => setLabResultNotes(e.target.value)}
                      placeholder="Additional clinical notes..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Toast */}
            {labResultToast && (
              <div className={`mx-5 mb-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
                labResultToast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}>
                {labResultToast.message}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-[#252530]">
              <button
                type="button"
                onClick={() => { setLabResultModalOpen(false); setLabResultToast(null); setManualRowsError(false) }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitLabResult}
                disabled={labResultSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                {labResultSubmitting ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Result</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
    id: PropTypes.string,
    sub: PropTypes.string,
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
