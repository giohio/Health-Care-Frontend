export const PATIENT_SPECIALTY_RESULTS = {
  'PT-2024-0142': {
    radiology: {
      available: true,
      type: 'chest-xray',
      modelName: 'ChestNet ResNet-50',
      dataset: 'Chest X-Ray (Pneumonia)',
      analyzedAt: 'Mar 10, 2025 · 09:14 AM',
      orderedBy: 'Dr. Sarah Chen',
      imageUrl: null,
      result: 'normal',
      confidence: 94,
      findings: [
        {
          region: 'Right lung field',
          status: 'normal',
          note: 'Clear. No consolidation or effusion detected.',
        },
        {
          region: 'Left lung field',
          status: 'normal',
          note: 'Clear. No abnormalities detected.',
        },
        {
          region: 'Cardiac silhouette',
          status: 'normal',
          note: 'Normal size and contour.',
        },
        {
          region: 'Costophrenic angles',
          status: 'normal',
          note: 'Sharp bilaterally.',
        },
      ],
      aiSummary:
        'No evidence of pneumonia or significant ' +
        'pulmonary pathology. Lung fields appear ' +
        'clear with normal vascular markings.',
      disclaimer:
        'AI-assisted analysis. Must be reviewed ' +
        'and confirmed by a radiologist.',
    },

    cardiology: {
      available: true,
      type: 'ecg',
      modelName: 'CardioNet LSTM v3.0',
      dataset: 'ECG Heartbeat Categorization',
      analyzedAt: 'Mar 10, 2025 · 09:22 AM',
      orderedBy: 'Dr. Sarah Chen',
      result: 'normal_sinus',
      confidence: 97,
      heartRate: 72,
      rhythm: 'Regular',
      prInterval: '156 ms',
      qrsDuration: '88 ms',
      qtcInterval: '412 ms',
      findings: [
        {
          parameter: 'Rhythm',
          value: 'Normal sinus rhythm',
          status: 'normal',
        },
        {
          parameter: 'Heart Rate',
          value: '72 bpm',
          status: 'normal',
        },
        {
          parameter: 'PR Interval',
          value: '156 ms',
          status: 'normal',
        },
        {
          parameter: 'QRS Duration',
          value: '88 ms',
          status: 'normal',
        },
        {
          parameter: 'QTc Interval',
          value: '412 ms',
          status: 'normal',
        },
      ],
      aiSummary:
        'Normal sinus rhythm detected. No arrhythmia ' +
        'or conduction abnormalities identified. ' +
        'Heart rate within normal range.',
      disclaimer:
        'AI-assisted ECG interpretation. ' +
        'Clinical correlation required.',
    },

    ophthalmology: {
      available: true,
      type: 'retinal-scan',
      modelName: 'RetinaNet APTOS v2.0',
      dataset: 'APTOS 2019 Blindness Detection',
      analyzedAt: 'Jan 22, 2025 · 11:05 AM',
      orderedBy: 'Dr. Linh Nguyen',
      imageUrl: null,
      gradingScale: 'ETDRS / APTOS 5-level',
      drGrade: 0,
      confidence: 96,
      result: 'no_dr',
      gradeLabels: [
        { grade: 0, label: 'No DR', color: 'emerald' },
        { grade: 1, label: 'Mild', color: 'teal' },
        { grade: 2, label: 'Moderate', color: 'amber' },
        { grade: 3, label: 'Severe', color: 'orange' },
        { grade: 4, label: 'Proliferative', color: 'rose' },
      ],
      findings: [
        {
          feature: 'Microaneurysms',
          present: false,
          note: 'None detected',
        },
        {
          feature: 'Hemorrhages',
          present: false,
          note: 'None detected',
        },
        {
          feature: 'Hard Exudates',
          present: false,
          note: 'None detected',
        },
        {
          feature: 'Neovascularization',
          present: false,
          note: 'None detected',
        },
        {
          feature: 'Optic Disc',
          present: true,
          note: 'Normal appearance, clear margins',
        },
      ],
      aiSummary:
        'No diabetic retinopathy detected. ' +
        'Retinal vasculature and optic disc ' +
        'appear normal. Recommended follow-up ' +
        'in 12 months as per diabetic screening protocol.',
      disclaimer:
        'AI-assisted retinal grading using APTOS dataset. ' +
        'Results require confirmation by an ophthalmologist.',
    },

    dermatology: {
      available: true,
      type: 'dermoscopy',
      modelName: 'DermNet MobileNet v1.5',
      dataset: 'HAM10000 Skin Cancer',
      analyzedAt: 'Mar 5, 2025 · 14:30 PM',
      orderedBy: 'Dr. Sarah Chen',
      imageUrl: null,
      bodyLocation: 'Left forearm',
      topPrediction: 'nv',
      confidence: 88,
      classProbabilities: [
        {
          code: 'nv',
          label: 'Melanocytic nevi (mole)',
          probability: 0.88,
          riskLevel: 'low',
        },
        {
          code: 'bkl',
          label: 'Benign keratosis',
          probability: 0.07,
          riskLevel: 'low',
        },
        {
          code: 'mel',
          label: 'Melanoma',
          probability: 0.03,
          riskLevel: 'high',
        },
        {
          code: 'df',
          label: 'Dermatofibroma',
          probability: 0.01,
          riskLevel: 'low',
        },
        {
          code: 'bcc',
          label: 'Basal cell carcinoma',
          probability: 0.01,
          riskLevel: 'high',
        },
      ],
      lesionMetrics: {
        asymmetry: 'Low',
        border: 'Regular',
        color: 'Uniform brown',
        diameter: '~4mm',
        evolution: 'Stable (reported by patient)',
      },
      aiSummary:
        'Lesion most consistent with benign melanocytic ' +
        'nevi (common mole). Low probability of malignancy. ' +
        'ABCDE criteria show no high-risk features. ' +
        'Routine monitoring recommended.',
      disclaimer:
        'AI dermoscopy analysis using HAM10000 dataset. ' +
        'Biopsy is the gold standard for definitive diagnosis.',
    },

    pulmonology: {
      available: true,
      type: 'respiratory-sound',
      modelName: 'LungSound CNN v2.2',
      dataset: 'ICBHI Respiratory Sound Database',
      analyzedAt: 'Mar 10, 2025 · 09:35 AM',
      orderedBy: 'Dr. Sarah Chen',
      recordingDuration: '12.4s',
      recordingDevice: 'Digital stethoscope',
      result: 'normal',
      confidence: 82,
      detectedSounds: ['normal'],
      lungFields: [
        {
          location: 'Right upper lobe',
          sound: 'Normal vesicular',
          status: 'normal',
        },
        {
          location: 'Right lower lobe',
          sound: 'Normal vesicular',
          status: 'normal',
        },
        {
          location: 'Left upper lobe',
          sound: 'Normal vesicular',
          status: 'normal',
        },
        {
          location: 'Left lower lobe',
          sound: 'Normal vesicular',
          status: 'normal',
        },
      ],
      spectrogramData: {
        available: false,
        note: 'Connect audio device to generate spectrogram',
      },
      aiSummary:
        'Normal breath sounds detected across all lung ' +
        'fields. No wheezing, crackles, or rhonchi ' +
        'identified. Auscultation findings are consistent ' +
        'with normal respiratory function.',
      disclaimer:
        'AI-assisted respiratory sound analysis. ' +
        'Clinical auscultation by physician is required.',
    },
    nephrology: {
      available: true,
      type: 'ckd-prediction',
      modelName: 'KidneyRisk XGBoost v1.4',
      dataset: 'Chronic Kidney Disease (CKD)',
      analyzedAt: 'Mar 10, 2025 · 10:15 AM',
      orderedBy: 'Dr. Sarah Chen',
      ckdStage: null,
      riskLevel: 'low',
      riskScore: 0.14,
      confidence: 89,
      result: 'no_ckd',
      eGFR: 87,
      eGFRCategory: 'G2',
      albuminuriaCategory: 'A1',
      keyMarkers: [
        {
          name: 'Serum Creatinine',
          value: '0.82 mg/dL',
          referenceRange: '0.5–1.1 mg/dL',
          status: 'normal',
          aiWeight: 'high',
          note: 'Primary CKD marker. Within normal range.',
        },
        {
          name: 'eGFR',
          value: '87 mL/min/1.73m²',
          referenceRange: '≥ 60 mL/min/1.73m²',
          status: 'normal',
          aiWeight: 'high',
          note: 'Mildly reduced but no CKD pattern detected.',
        },
        {
          name: 'Blood Urea Nitrogen',
          value: '14 mg/dL',
          referenceRange: '7–20 mg/dL',
          status: 'normal',
          aiWeight: 'medium',
          note: 'Normal. No uremic accumulation.',
        },
        {
          name: 'Urine Albumin-Creatinine',
          value: '18 mg/g',
          referenceRange: '< 30 mg/g',
          status: 'normal',
          aiWeight: 'high',
          note: 'A1 category. No significant albuminuria.',
        },
        {
          name: 'Potassium',
          value: '4.1 mEq/L',
          referenceRange: '3.5–5.0 mEq/L',
          status: 'normal',
          aiWeight: 'medium',
          note: 'Normal. No electrolyte imbalance.',
        },
        {
          name: 'Hemoglobin',
          value: '11.2 g/dL',
          referenceRange: '12.0–16.0 g/dL',
          status: 'low',
          aiWeight: 'low',
          note: 'Mildly reduced. Not CKD-related anemia pattern.',
        },
      ],
      riskFactorsPresent: ['Diabetes mellitus', 'Mild anemia'],
      riskFactorsAbsent: ['Hypertension', 'Proteinuria', 'Family history of CKD'],
      progressionRisk: 'low',
      aiSummary:
        'No chronic kidney disease detected. eGFR and ' +
        'creatinine levels are within acceptable range. ' +
        'Mild anemia present but pattern is inconsistent ' +
        'with CKD-related anemia. Diabetes mellitus is a ' +
        'risk factor — annual renal function monitoring ' +
        'is recommended.',
      nextScreeningRecommended: '12 months',
      disclaimer:
        'AI-assisted CKD risk assessment using 25-feature ' +
        'clinical model. Requires physician interpretation ' +
        'alongside full clinical context.',
    },
  },
}

export const getSpecialtyTabs = (patientId) => {
  const results = PATIENT_SPECIALTY_RESULTS[patientId]
  if (!results) return []

  const tabs = []
  if (results.radiology?.available) {
    tabs.push({
      key: 'radiology',
      label: 'Radiology',
      icon: 'Scan',
      data: results.radiology,
    })
  }

  if (results.cardiology?.available) {
    tabs.push({
      key: 'cardiology',
      label: 'Cardiology',
      icon: 'Activity',
      data: results.cardiology,
    })
  }

  if (results.ophthalmology?.available) {
    tabs.push({
      key: 'ophthalmology',
      label: 'Ophthalmology',
      icon: 'Eye',
      data: results.ophthalmology,
    })
  }

  if (results.dermatology?.available) {
    tabs.push({
      key: 'dermatology',
      label: 'Dermatology',
      icon: 'ScanFace',
      data: results.dermatology,
    })
  }

  if (results.pulmonology?.available) {
    tabs.push({
      key: 'pulmonology',
      label: 'Pulmonology',
      icon: 'Wind',
      data: results.pulmonology,
    })
  }

  if (results.nephrology?.available) {
    tabs.push({
      key: 'nephrology',
      label: 'Nephrology',
      icon: 'Droplets',
      data: results.nephrology,
    })
  }

  return tabs
}
