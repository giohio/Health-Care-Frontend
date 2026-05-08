import { apiFetch } from './client';

export const clinicalApi = {
  getSummary: (patientId) => 
    apiFetch(`/clinical/patients/${patientId}/summary`),

  getDiagnoses: (patientId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/clinical/patients/${patientId}/diagnoses${query ? `?${query}` : ''}`);
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
    return apiFetch(`/clinical/patients/${patientId}/medications${query ? `?${query}` : ''}`);
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
};
