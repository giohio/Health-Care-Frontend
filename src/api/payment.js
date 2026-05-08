import { apiFetch } from './client'

function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const str = query.toString()
  return str ? `?${str}` : ''
}

export const paymentApi = {
  // Kong strips /payments prefix; service route is /payments/{id}, so frontend uses double-path
  getByAppointment: (appointmentId) =>
    apiFetch(`/payments/payments/${appointmentId}`),

  // POST — generates (or re-fetches) payment URL; 404 until payment record exists
  initiatePayment: (appointmentId) =>
    apiFetch(`/payments/${appointmentId}/pay`, {
      method: 'POST',
      // Booking-confirmed flow polls this endpoint; 404 is expected until
      // appointment.payment_required event creates a payment record.
      suppressErrorStatuses: [404],
    }),

  getMy: () => apiFetch('/payments/my'),

  getHistory: (params = {}) =>
    apiFetch(`/payments/history${buildQuery(params)}`),

  getAdminHistory: (params = {}) =>
    apiFetch(`/payments/admin/history${buildQuery(params)}`),

  // Lab fee configuration (admin + doctor for reference)
  getLabFeeConfigs: () =>
    apiFetch('/payments/config/lab-fees'),

  updateLabFee: (testId, fee) =>
    apiFetch(`/payments/config/lab-fees/${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ fee }),
    }),

  // Lab order payment
  getLabPaymentUrl: (labOrderId) =>
    apiFetch(`/payments/lab-orders/${labOrderId}/pay`, {
      suppressErrorStatuses: [404],
    }),

  // Admin: mark refund as processed
  markRefunded: (paymentId) =>
    apiFetch(`/payments/${paymentId}/mark-refunded`, { method: 'POST' }),
}
