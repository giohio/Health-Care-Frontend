export const AI_LAB_ANALYSIS = {
  cbc: {
    modelType: 'Rule-based + ML',
    confidence: 94,
    findings: [
      { name: 'Hemoglobin', value: '13.5 g/dL', range: '13.0-17.5', status: 'normal' },
      { name: 'WBC', value: '7.2 K/uL', range: '4.5-11.0', status: 'normal' },
      { name: 'Platelets', value: '142 K/uL', range: '150-400', status: 'borderline' },
      { name: 'MCV', value: '72 fL', range: '80-100', status: 'abnormal' },
    ],
    summary: 'Low MCV was detected, suggesting mild iron-deficiency anemia. Iron supplementation and repeat testing in 8 weeks are recommended.',
  },
  lipid: {
    modelType: 'Rule-based',
    confidence: 98,
    findings: [
      { name: 'Total Cholesterol', value: '210 mg/dL', range: '<200', status: 'borderline' },
      { name: 'LDL', value: '135 mg/dL', range: '<130', status: 'borderline' },
      { name: 'HDL', value: '55 mg/dL', range: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '145 mg/dL', range: '<150', status: 'normal' },
    ],
    summary: 'LDL and total cholesterol are mildly elevated. Dietary adjustment and reduced saturated fat intake are recommended.',
  },
  ecg: {
    modelType: 'CNN Time-Series',
    confidence: 91,
    description: 'Sinus rhythm is regular. Mild repolarization changes are present, with no acute critical abnormalities.',
    summary: 'Correlate with clinical symptoms and consider periodic ECG follow-up if palpitations persist.',
  },
  imaging: {
    modelType: 'CNN Imaging',
    confidence: 89,
    description: 'No clear focal lesion was identified. A few mild changes should be monitored over time.',
    summary: 'Combine these findings with clinical evaluation and medical history before making final decisions.',
  },
  default: {
    modelType: 'Hybrid Medical NLP',
    confidence: 87,
    summary: 'The AI system could not classify this into a specific analysis pattern. Please review with the treating physician.',
  },
}
