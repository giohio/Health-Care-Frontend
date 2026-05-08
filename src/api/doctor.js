import { apiFetch } from './client'

export const doctorApi = {
  // Specialties
  getSpecialties: () => apiFetch('/doctors/specialties'),
  createSpecialty: (body) =>
    apiFetch('/doctors/specialties', { method: 'POST', body: JSON.stringify(body) }),

  // Doctor profile
  getDoctor: (userId) => apiFetch(`/doctors/${userId}`),
  createDoctor: (body) =>
    apiFetch('/doctors/', { method: 'POST', body: JSON.stringify(body) }),
  updateDoctor: (userId, body) =>
    apiFetch(`/doctors/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
  setAutoConfirm: (body) =>
    apiFetch('/doctors/me/auto-confirm', { method: 'PUT', body: JSON.stringify(body) }),
  getDoctorsBySpecialty: (specialtyId) =>
    apiFetch(`/doctors/specialty/${specialtyId}`),
  searchAvailable: (q) =>
    apiFetch(`/doctors/search/available?${new URLSearchParams(q)}`),

  // Schedule
  getSchedule: (doctorId) => apiFetch(`/doctors/${doctorId}/schedule`),
  setSchedule: (doctorId, body) =>
    apiFetch(`/doctors/${doctorId}/schedule`, { method: 'PUT', body: JSON.stringify(body) }),
  getScheduleEnhanced: (doctorId, date) =>
    apiFetch(`/doctors/${doctorId}/schedule-enhanced?date=${date}`),

  // Availability
  setAvailability: (doctorId, q) =>
    apiFetch(`/doctors/${doctorId}/availability?${new URLSearchParams(q)}`, { method: 'POST' }),
  getAvailability: (doctorId) =>
    apiFetch(`/doctors/${doctorId}/availability`),

  // Days off
  addDayOff: (doctorId, q) =>
    apiFetch(`/doctors/${doctorId}/days-off?${new URLSearchParams(q)}`, { method: 'POST' }),
  removeDayOff: (doctorId, offDate) =>
    apiFetch(`/doctors/${doctorId}/days-off/${offDate}`, { method: 'DELETE' }),

  // Services
  getServices: (doctorId) => apiFetch(`/doctors/${doctorId}/services`),
  addService: (doctorId, q) =>
    apiFetch(`/doctors/${doctorId}/services?${new URLSearchParams(q)}`, { method: 'POST' }),
  updateService: (doctorId, svcId, q) =>
    apiFetch(`/doctors/${doctorId}/services/${svcId}?${new URLSearchParams(q)}`, { method: 'PUT' }),
  deleteService: (doctorId, svcId) =>
    apiFetch(`/doctors/${doctorId}/services/${svcId}`, { method: 'DELETE' }),

  // Ratings
  submitRating: (doctorId, q) =>
    apiFetch(`/doctors/${doctorId}/ratings?${new URLSearchParams(q)}`, { method: 'POST' }),
  getRatings: (doctorId, q) =>
    apiFetch(`/doctors/${doctorId}/ratings?${new URLSearchParams(q)}`),

  // Health check
  health: () => apiFetch('/doctors/health'),

  // Convenience: load all doctors across all specialties
  getAllDoctors: async () => {
    const specialties = await apiFetch('/doctors/specialties')
    if (!Array.isArray(specialties) || specialties.length === 0) return { doctors: [], specialties: [] }
    const results = await Promise.allSettled(
      specialties.map((s) => apiFetch(`/doctors/specialty/${s.id}`)),
    )
    const seen = new Set()
    const doctors = results
      .filter((r) => r.status === 'fulfilled' && Array.isArray(r.value))
      .flatMap((r, i) => r.value.map((d) => ({ ...d, specialty_name: specialties[i].name })))
      .filter((d) => {
        if (seen.has(d.user_id)) return false
        seen.add(d.user_id)
        return true
      })
    return { doctors, specialties }
  },
}
