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
    const path = '/lab-orders' + (query ? `?${query}` : '');
    return apiFetch(path);
  },

  getLabOrderReadiness: (appointmentId) =>
    apiFetch(`/lab-orders/${appointmentId}/readiness`),

  // Lab Order Templates
  createLabOrderTemplate: (data) =>
    apiFetch('/lab-orders/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLabOrderTemplates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = '/lab-orders/templates' + (query ? `?${query}` : '');
    return apiFetch(path);
  },

  deleteLabOrderTemplate: (templateId) =>
    apiFetch(`/lab-orders/templates/${templateId}`, { method: 'DELETE' }),

  deleteLabOrder: (orderId) =>
    apiFetch(`/lab-orders/${orderId}`, { method: 'DELETE' }),

  createLabOrdersFromTemplate: (data) =>
    apiFetch('/lab-orders/from-template', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Lab Results
  // Generic — caller supplies full body
  createLabResult: (data) =>
    apiFetch('/lab-results', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Mode A — file-based: requires file_url + file_type; triggers async AI pipeline
  // data shape: { order_id, patient_id, doctor_id, file_url, file_type: 'pdf'|'png'|'jpg', notes? }
  createLabResultFile: ({ order_id, patient_id, doctor_id, file_url, file_type, notes }) =>
    apiFetch('/lab-results', {
      method: 'POST',
      body: JSON.stringify({ order_id, patient_id, doctor_id, file_url, file_type, notes }),
    }),

  // Mode B — manual entry: no file needed; result goes to DOCTOR_REVIEW immediately (no AI queue)
  // data shape: { order_id, patient_id, doctor_id, manual_entries: [{ test_name, value, unit?, reference_range?, interpretation? }], notes? }
  createLabResultManual: ({ order_id, patient_id, doctor_id, manual_entries, notes }) =>
    apiFetch('/lab-results', {
      method: 'POST',
      body: JSON.stringify({ order_id, patient_id, doctor_id, file_type: 'manual', manual_entries, notes }),
    }),

  getLabResults: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = '/lab-results' + (query ? `?${query}` : '');
    return apiFetch(path);
  },

  getLabResult: (id) => apiFetch(`/lab-results/${id}`),

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

  retryLabResultAi: (resultId) =>
    apiFetch(`/lab-results/${resultId}/retry-ai`, { method: 'POST' }),

  downloadLabResultPDF: async (resultId) => {
    const response = await fetch(`/lab-results/${resultId}/pdf`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(text || `HTTP ${response.status}`)
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const disposition = response.headers.get('Content-Disposition') || ''
    const filenameMatch = /filename="?([^";\n]+)"?/.exec(disposition)
    a.download = filenameMatch ? filenameMatch[1] : `lab-result-${resultId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  uploadFile: async (file, context = 'lab_results') => {
    const formData = new FormData()
    formData.append('file', file)
    if (context) formData.append('context', context)
    return apiFetch('/upload', {
      method: 'POST',
      body: formData,
    })
  },

  getAppointmentLabSummary: (appointmentId) =>
    apiFetch(`/appointments/${appointmentId}/lab-summary`),

  reviewHolisticSummary: (appointmentId, doctorConclusion) =>
    apiFetch(`/appointments/${appointmentId}/lab-summary/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_conclusion: doctorConclusion }),
    }),

  triggerHolisticSummary: (appointmentId) =>
    apiFetch(`/appointments/${appointmentId}/lab-summary/trigger`, {
      method: 'POST',
    }),
};
