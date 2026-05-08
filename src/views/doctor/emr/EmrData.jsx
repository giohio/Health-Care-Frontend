import { TEST_TYPE } from '../../../constants/enums'

export const SOAP_SECTIONS_CONFIG = [
  { key: 's', letter: 'S', label: 'Subjective', color: 'indigo', placeholder: 'Patient reports symptoms, history of present illness...', chips: ['Headache', 'Fever', 'Fatigue', 'Nausea'] },
  { key: 'o', letter: 'O', label: 'Objective', color: 'teal', placeholder: 'Physical exam findings, vitals, lab results...', chips: ['Clear lungs', 'Normal heart rate', 'Stable vitals'] },
  { key: 'a', letter: 'A', label: 'Assessment', color: 'amber', placeholder: 'Clinical impression, differential diagnosis...', chips: ['Viral URI', 'Migraine', 'Anemia pattern'] },
  { key: 'p', letter: 'P', label: 'Plan', color: 'emerald', placeholder: 'Treatment, medications, follow-up, orders...', chips: ['Paracetamol', 'Rest', 'Follow-up in 3 days'] },
]

export const LAB_TESTS = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    desc: 'WBC, RBC, Hemoglobin, Hematocrit, Platelets',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.BLOOD_PANEL,
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    desc: 'Inflammatory marker',
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
    desc: 'Urine glucose, ketones, protein, and microscopy',
    tat: '1-2 hrs',
    aiEnabled: false,
    testType: TEST_TYPE.URINE,
  },
  {
    id: 'xray_chest',
    name: 'Chest X-Ray',
    desc: 'Lungs, heart, mediastinum',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'xray_abdominal',
    name: 'Abdominal X-Ray',
    desc: 'Bowel gas pattern, calcifications, and acute abdominal findings',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'xray_skull',
    name: 'Skull X-Ray',
    desc: 'Skull fractures and bony abnormalities',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'xray_spine',
    name: 'Spine X-Ray',
    desc: 'Vertebral alignment and degenerative changes',
    tat: '1-2 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'ct_chest',
    name: 'Chest CT Scan',
    desc: 'Detailed thoracic imaging for lung and mediastinal pathology',
    tat: '4-8 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'ct_brain',
    name: 'Brain CT Scan',
    desc: 'Acute intracranial bleed, stroke, and mass screening',
    tat: '4-8 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'mri_brain',
    name: 'Brain MRI',
    desc: 'High-resolution neuroimaging for structural brain disorders',
    tat: '12-24 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
  {
    id: 'ultrasound_abdomen',
    name: 'Abdominal Ultrasound',
    desc: 'Liver, gallbladder, kidneys, pancreas, and abdominal fluid assessment',
    tat: '2-4 hrs',
    aiEnabled: true,
    testType: TEST_TYPE.IMAGING,
  },
]

export const LAB_TEST_GROUPS = [
  { key: 'hematology',  label: 'Hematology',            color: 'rose',  testIds: ['cbc', 'crp'] },
  { key: 'metabolic',   label: 'Metabolic & Endocrine', color: 'amber', testIds: ['glucose', 'hba1c', 'lipid'] },
  { key: 'hepatorenal', label: 'Hepatorenal',           color: 'teal',  testIds: ['liver', 'renal'] },
  { key: 'urine',       label: 'Urinalysis',            color: 'sky',   testIds: ['urinalysis'] },
  {
    key: 'radiology',
    label: 'Radiology & Imaging',
    color: 'indigo',
    testIds: [
      'xray_chest',
      'xray_abdominal',
      'xray_skull',
      'xray_spine',
      'ct_chest',
      'ct_brain',
      'mri_brain',
      'ultrasound_abdomen',
    ],
  },
]

export const ICD_DATABASE = [
  { code: 'R51.9', desc: 'Headache, unspecified' },
  { code: 'R50.9', desc: 'Fever, unspecified' },
  { code: 'J06.9', desc: 'Acute upper respiratory infection' },
  { code: 'G43.909', desc: 'Migraine, unspecified' },
]

export const SOAP_AI_NOTE = `S: Patient presents with persistent
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

/**
 * Fallback lab fee prices (in VND) — used when API hasn't loaded yet.
 * These are fetched from the backend and updated via admin panel.
 * If API call fails, these defaults are used.
 */
export const DEFAULT_LAB_PRICES = {
  cbc: 150000,
  crp: 120000,
  glucose: 80000,
  hba1c: 180000,
  liver: 220000,
  renal: 200000,
  lipid: 180000,
  urinalysis: 90000,
  xray_chest: 250000,
  xray_abdominal: 250000,
  xray_skull: 250000,
  xray_spine: 280000,
  ct_chest: 800000,
  ct_brain: 900000,
  mri_brain: 1500000,
  ultrasound_abdomen: 350000,
}
