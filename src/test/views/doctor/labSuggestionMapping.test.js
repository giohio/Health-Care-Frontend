import { describe, it, expect } from 'vitest'

import { LAB_TESTS } from '../../../views/doctor/emr/EmrData'
import { resolveSuggestedTestIds } from '../../../views/doctor/emr/labSuggestionMapping'

describe('resolveSuggestedTestIds', () => {
  it('maps diabetes and urine aliases to canonical test IDs', () => {
    const suggested = ['A1c', 'Urine analysis', 'C-reactive protein']
    const result = resolveSuggestedTestIds(suggested, LAB_TESTS, [])

    expect(result).toEqual(['hba1c', 'urinalysis', 'crp'])
  })

  it('skips tests already selected and still applies remaining aliases', () => {
    const suggested = ['HbA1c', 'Blood Glucose', 'CBC']
    const result = resolveSuggestedTestIds(suggested, LAB_TESTS, ['hba1c'])

    expect(result).toEqual(['glucose', 'cbc'])
  })

  it('falls back to name similarity matching for canonical suggestions', () => {
    const suggested = ['Kidney Function (Renal Panel)', 'Lipid Profile']
    const result = resolveSuggestedTestIds(suggested, LAB_TESTS, [])

    expect(result).toEqual(['renal', 'lipid'])
  })

  it('maps imaging aliases to expanded radiology test IDs', () => {
    const suggested = ['Chest CT', 'MRI Brain', 'Abdominal ultrasound', 'Chest X Ray']
    const result = resolveSuggestedTestIds(suggested, LAB_TESTS, [])

    expect(result).toEqual(['ct_chest', 'mri_brain', 'ultrasound_abdomen', 'xray_chest'])
  })
})
