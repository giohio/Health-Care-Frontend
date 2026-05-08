export function resolveSuggestedTestIds(testNames, labTests, orderedTests = []) {
  if (!Array.isArray(testNames) || testNames.length === 0) return []

  const aliasMap = {
    hba1c: 'hba1c',
    a1c: 'hba1c',
    'glycated hemoglobin': 'hba1c',
    'haemoglobin a1c': 'hba1c',
    'hemoglobin a1c': 'hba1c',
    urinalysis: 'urinalysis',
    'urine analysis': 'urinalysis',
    'urine routine': 'urinalysis',
    'fasting glucose': 'glucose',
    'blood glucose': 'glucose',
    cbc: 'cbc',
    'complete blood count': 'cbc',
    crp: 'crp',
    'c-reactive protein': 'crp',
    'chest x-ray': 'xray_chest',
    'chest x ray': 'xray_chest',
    'abdominal x-ray': 'xray_abdominal',
    'abdominal x ray': 'xray_abdominal',
    'skull x-ray': 'xray_skull',
    'skull x ray': 'xray_skull',
    'spine x-ray': 'xray_spine',
    'spine x ray': 'xray_spine',
    'chest ct': 'ct_chest',
    'ct chest': 'ct_chest',
    'brain ct': 'ct_brain',
    'ct brain': 'ct_brain',
    'brain mri': 'mri_brain',
    'mri brain': 'mri_brain',
    'abdominal ultrasound': 'ultrasound_abdomen',
    'ultrasound abdomen': 'ultrasound_abdomen',
  }

  const selectedSet = new Set(orderedTests)
  const idsToAdd = new Set()

  testNames.forEach((name) => {
    const normalized = String(name || '').toLowerCase().trim()
    if (!normalized) return

    const aliasId = Object.entries(aliasMap).find(([key]) => normalized.includes(key))?.[1]
    if (aliasId && !selectedSet.has(aliasId)) {
      idsToAdd.add(aliasId)
      return
    }

    const match = labTests.find(
      (test) => test.name.toLowerCase().includes(normalized) || normalized.includes(test.name.toLowerCase()),
    )
    if (match && !selectedSet.has(match.id)) {
      idsToAdd.add(match.id)
    }
  })

  return Array.from(idsToAdd)
}
