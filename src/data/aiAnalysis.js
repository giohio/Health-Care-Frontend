export const LAB_AI_ANALYSIS = {
  'full-blood-panel': {
    modelName: 'CBC Analyzer v2.1',
    modelType: 'XGBoost',
    dataset: 'Complete Blood Count',
    confidence: 91,
    riskLevel: 'moderate',
    riskScore: 0.62,
    primaryFlag: 'Mild iron deficiency anemia',
    flags: [
      {
        marker: 'Hemoglobin',
        value: '11.2 g/dL',
        status: 'low',
        severity: 'mild',
        aiNote: 'Below threshold. Consistent with iron deficiency pattern.',
      },
      {
        marker: 'Hematocrit',
        value: '34.1%',
        status: 'low',
        severity: 'mild',
        aiNote: 'Mildly reduced, correlates with hemoglobin finding.',
      },
      {
        marker: 'WBC',
        value: '6.8 K/uL',
        status: 'normal',
        severity: null,
        aiNote: 'Within normal range. No infection markers detected.',
      },
    ],
    recommendation:
      'Consider iron supplementation and dietary review. ' +
      'Follow-up CBC recommended in 4–6 weeks.',
    disclaimer:
      'AI analysis is for clinical decision support only. ' +
      'Results must be reviewed by a qualified physician.',
  },

  'lipid-profile': {
    modelName: 'Cardio Risk Model v1.8',
    modelType: 'Random Forest',
    dataset: 'NHANES Cardiovascular',
    confidence: 87,
    riskLevel: 'high',
    riskScore: 0.78,
    primaryFlag: 'Elevated LDL - cardiovascular risk',
    flags: [
      {
        marker: 'LDL Cholesterol',
        value: '148 mg/dL',
        status: 'high',
        severity: 'significant',
        aiNote: 'Above recommended threshold of 130 mg/dL.',
      },
      {
        marker: 'Total Cholesterol',
        value: '212 mg/dL',
        status: 'borderline',
        severity: 'mild',
        aiNote: 'Borderline high. Monitoring recommended.',
      },
      {
        marker: 'HDL',
        value: '52 mg/dL',
        status: 'normal',
        severity: null,
        aiNote: 'Acceptable protective cholesterol level.',
      },
    ],
    recommendation:
      'Dietary modification advised. Consider statin therapy ' +
      'if lifestyle changes are insufficient after 3 months.',
    disclaimer:
      'AI analysis is for clinical decision support only. ' +
      'Results must be reviewed by a qualified physician.',
  },

  'thyroid-function': {
    modelName: 'Thyroid Classifier v1.2',
    modelType: 'SVM',
    dataset: 'NHANES Endocrine Panel',
    confidence: 96,
    riskLevel: 'low',
    riskScore: 0.12,
    primaryFlag: 'Thyroid function within normal range',
    flags: [],
    recommendation: 'No action required. Routine monitoring as scheduled.',
    disclaimer:
      'AI analysis is for clinical decision support only. ' +
      'Results must be reviewed by a qualified physician.',
  },

  'vitamin-iron': {
    modelName: 'CBC Analyzer v2.1',
    modelType: 'XGBoost',
    dataset: 'Complete Blood Count',
    confidence: 89,
    riskLevel: 'moderate',
    riskScore: 0.55,
    primaryFlag: 'Mild iron deficiency detected',
    flags: [
      {
        marker: 'Serum Iron',
        value: '42 mcg/dL',
        status: 'low',
        severity: 'mild',
        aiNote: 'Below normal range. Iron supplementation may be needed.',
      },
    ],
    recommendation:
      'Iron supplement prescribed. Re-check in 8 weeks.',
    disclaimer:
      'AI analysis is for clinical decision support only. ' +
      'Results must be reviewed by a qualified physician.',
  },
}

export const getRiskConfig = (riskLevel) => {
  switch (riskLevel) {
    case 'high':
      return {
        label: 'High Risk',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-900/50',
        text: 'text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-500',
        barColor: '#f43f5e',
      }
    case 'moderate':
      return {
        label: 'Moderate',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-900/50',
        text: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-400',
        barColor: '#f59e0b',
      }
    case 'low':
      return {
        label: 'Low Risk',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        barColor: '#10b981',
      }
    default:
      return {
        label: 'Pending',
        bg: 'bg-slate-100 dark:bg-[#1c1c25]',
        border: 'border-slate-200 dark:border-[#252530]',
        text: 'text-slate-500 dark:text-[#70708a]',
        dot: 'bg-slate-300',
        barColor: '#94a3b8',
      }
  }
}