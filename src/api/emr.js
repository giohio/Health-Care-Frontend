import { apiFetch } from './client';

export const emrApi = {
  // Lab Orders
  createLabOrder: (data) => 
    apiFetch('/lab-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLabOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/lab-orders${query ? `?${query}` : ''}`);
  },

  // Lab Results
  createLabResult: (data) => 
    apiFetch('/lab-results', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLabResults: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/lab-results${query ? `?${query}` : ''}`);
  },

  verifyLabResult: (id, data = {}) => 
    apiFetch(`/lab-results/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  flagManualReview: (id, data = {}) => 
    apiFetch(`/lab-results/${id}/flag-manual`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
