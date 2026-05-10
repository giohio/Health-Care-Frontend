import { apiFetch } from './client'

export const patientApi = {
  // GET /patients/  — full profile + health_background of the CURRENT patient
  getProfile: () => apiFetch('/patients/'),

  // PUT /patients/profile  — backward-compat full update
  updateProfile: (body) =>
    apiFetch('/patients/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // PATCH /patients/profile  — partial update
  patchProfile: (body) =>
    apiFetch('/patients/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // PUT /patients/health  — update health_background
  updateHealth: (body) =>
    apiFetch('/patients/health', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // POST /patients/profile/photo  — multipart upload
  uploadProfilePhoto: (file) => {
    const form = new FormData()
    form.append('photo', file)
    return apiFetch('/patients/profile/photo', { method: 'POST', body: form })
  },

  getHealthSummary: () => apiFetch('/patients/health-summary'),

  // GET /patients/{patient_id}/summary — patient summary for doctor/admin
  // Returns: { full_name, date_of_birth, gender, phone_number,
  //            blood_type, allergies, chronic_conditions, vitals_latest }
  getPatientSummary: (patientId) => apiFetch(`/patients/${patientId}/summary`),

  // GET /patients/{patient_id} — basic patient info (fallback when summary fails)
  getPatient: (patientId) => apiFetch(`/patients/${patientId}`),

  // Vitals endpoints
  postVitals: (patientId, q = {}) =>
    apiFetch(`/patients/${patientId}/vitals?${new URLSearchParams(q)}`, {
      method: 'POST',
    }),

  getLatestVitals: (patientId) =>
    apiFetch(`/patients/${patientId}/vitals/latest`),

  getVitalsHistory: (patientId, q) =>
    apiFetch(`/patients/${patientId}/vitals?${new URLSearchParams(q)}`),
}
