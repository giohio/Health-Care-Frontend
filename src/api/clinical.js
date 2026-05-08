import { apiFetch } from './client';

export const clinicalApi = {
  getSummary: (patientId) => 
    apiFetch(`/clinical/patients/${patientId}/summary`),

  getDiagnoses: (patientId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = `/clinical/patients/${patientId}/diagnoses`;
    return apiFetch(query ? `${path}?${query}` : path);
  },

  createDiagnosis: (patientId, data) =>
    apiFetch(`/clinical/patients/${patientId}/diagnoses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDiagnosis: (patientId, diagnosisId, data) =>
    apiFetch(`/clinical/patients/${patientId}/diagnoses/${diagnosisId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getMedications: (patientId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = `/clinical/patients/${patientId}/medications`;
    return apiFetch(query ? `${path}?${query}` : path);
  },

  createMedication: (patientId, data) => 
    apiFetch(`/clinical/patients/${patientId}/medications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMedication: (medicationId, data) => 
    apiFetch(`/clinical/medications/${medicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getNotes: (patientId) => 
    apiFetch(`/clinical/patients/${patientId}/notes`),

  createNote: (patientId, data) => 
    apiFetch(`/clinical/patients/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNote: (noteId, data) =>
    apiFetch(`/clinical/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // GET /clinical/patients/{patient_id}/vaccinations
  // Returns: [{ id, patient_id, vaccine_name, dose_number, date_administered,
  //             administered_by, notes, created_at }]
  getVaccinations: (patientId) =>
    apiFetch(`/clinical/patients/${patientId}/vaccinations`),
};
