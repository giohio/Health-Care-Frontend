import { apiFetch } from './client'
import { patientApi } from './patient'

// Normalize status to lowercase to match frontend enums
function normalizeAppt(appt) {
  if (!appt) return appt
  return {
    ...appt,
    status: (appt.status || '').toLowerCase(),
  }
}

// Enrich appointments with patient/doctor info when backend returns null names
async function enrichWithInfo(appts) {
  if (!appts) return appts
  const list = Array.isArray(appts) ? appts : (appts.appointments || [])
  
  const patientEnriched = await enrichWithPatientInfo(list)
  const doctorEnriched = await enrichWithDoctorInfo(patientEnriched)
  
  if (Array.isArray(appts)) return doctorEnriched
  return { ...appts, appointments: doctorEnriched }
}

async function enrichWithDoctorInfo(appts) {
  if (!Array.isArray(appts)) return appts
  const needLookup = appts.filter((a) => !a.doctor_name && a.doctor_id)
  if (needLookup.length === 0) return appts

  const nameMap = {}
  try {
    const { doctorApi } = await import('./doctor')
    const results = await Promise.allSettled(
      needLookup.map((a) => doctorApi.getDoctor(a.doctor_id))
    )
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        nameMap[needLookup[i].doctor_id] = r.value.full_name || r.value.name || 'Doctor'
      }
    })
  } catch { /* ignore */ }

  return appts.map((a) => ({
    ...a,
    doctor_name: nameMap[a.doctor_id] || a.doctor_name,
  }))
}

async function enrichWithPatientInfo(appts) {
  if (!Array.isArray(appts)) return appts
  const needLookup = appts.filter((a) => !a.patient_name && a.patient_id)
  if (needLookup.length === 0) return appts

  const nameMap = {}

  // Try summary endpoint first
  try {
    const results = await Promise.allSettled(
      needLookup.map((a) => patientApi.getPatientSummary(a.patient_id))
    )
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        const pid = needLookup[i].patient_id
        nameMap[pid] = {
          name: r.value.full_name || r.value.name || null,
          dob: r.value.date_of_birth || r.value.dob || null,
          gender: r.value.gender || null,
          blood_type: r.value.blood_type || null,
          allergies: r.value.allergies || null,
          chronic_conditions: r.value.chronic_conditions || null,
          vitals_latest: r.value.vitals_latest || null,
        }
      }
    })
  } catch { /* continue to fallback */ }

  // Fallback: try GET /patients/{id} for any missing names
  const missingPids = needLookup
    .map((a) => a.patient_id)
    .filter((pid) => !nameMap[pid]?.name)

  if (missingPids.length > 0) {
    try {
      const fallbackResults = await Promise.allSettled(
        missingPids.map((pid) => patientApi.getPatient(pid))
      )
      fallbackResults.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          const pid = missingPids[i]
          nameMap[pid] = {
            name: r.value.full_name || r.value.name || null,
            dob: r.value.date_of_birth || r.value.dob || null,
            gender: r.value.gender || null,
            blood_type: r.value.blood_type || null,
            allergies: r.value.allergies || null,
            chronic_conditions: r.value.chronic_conditions || null,
          }
        }
      })
    } catch { /* leave missing */ }
  }

  return appts.map((a) => {
    if (nameMap[a.patient_id]?.name) {
      return {
        ...a,
        patient_name: nameMap[a.patient_id].name,
        patient_dob: nameMap[a.patient_id].dob,
        patient_gender: nameMap[a.patient_id].gender,
        blood_type: nameMap[a.patient_id].blood_type,
        allergies: nameMap[a.patient_id].allergies,
        chronic_conditions: nameMap[a.patient_id].chronic_conditions,
        vitals_latest: nameMap[a.patient_id].vitals_latest,
      }
    }
    return a
  })
}

export const appointmentApi = {
  create: (body) =>
    apiFetch('/appointments/', { method: 'POST', body: JSON.stringify(body) }),

  // Self-service: returns appointments for the currently authenticated patient
  getMy: () => apiFetch('/appointments/my'),

  // GET /appointments/{id} — detail of a single appointment
  getById: (id) => apiFetch(`/appointments/${id}`),

  // GET /appointments/patient/{patient_id} — all appointments for a patient
  getByPatient: (patientId) => apiFetch(`/appointments/patient/${patientId}`),

  // GET /appointments/doctor/{doctor_id} — all appointments for a doctor
  getByDoctor: async (doctorId, q) => {
    const data = await apiFetch(`/appointments/doctor/${doctorId}?${new URLSearchParams(q || {})}`)
    const list = Array.isArray(data) ? data : (data?.appointments ?? [])
    const enriched = await enrichWithPatientInfo(list)
    return enriched.map(normalizeAppt)
  },

  getStats: (q) => apiFetch(`/appointments/stats?${new URLSearchParams(q)}`),

  getAdminStats: (q) =>
    apiFetch(`/appointments/admin/stats?${new URLSearchParams(q || {})}`),

  getAdminChartData: (q) =>
    apiFetch(`/appointments/admin/chart-data?${new URLSearchParams(q || {})}`),

  getAdminAppointments: async (q) => {
    const data = await apiFetch(`/appointments/admin/appointments?${new URLSearchParams(q || {})}`)
    return enrichWithInfo(data)
  },

  getSlots: (doctorId, q) =>
    apiFetch(`/appointments/doctor/${doctorId}/slots?${new URLSearchParams(q)}`),

  getQueue: async (doctorId, date) => {
    const d = date ?? new Date().toISOString().slice(0, 10)
    const data = await apiFetch(`/appointments/doctor/${doctorId}/queue?appointment_date=${d}`)
    const list = Array.isArray(data) ? data : (data?.appointments ?? [])
    const enriched = await enrichWithPatientInfo(list)
    return enriched.map(normalizeAppt)
  },

  // Alias: /appointments/queue/{doctor_id} (defaults to today)
  getQueueById: async (doctorId, date) => {
    const d = date ?? new Date().toISOString().slice(0, 10)
    const data = await apiFetch(`/appointments/queue/${doctorId}?appointment_date=${d}`)
    const list = Array.isArray(data) ? data : (data?.appointments ?? [])
    const enriched = await enrichWithPatientInfo(list)
    return enriched.map(normalizeAppt)
  },

  // Status transitions
  cancel: (id, reason) =>
    apiFetch(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  confirm: (id) =>
    apiFetch(`/appointments/${id}/confirm`, { method: 'PUT' }),

  decline: (id, reason, redirectDepartment) =>
    apiFetch(`/appointments/${id}/decline`, {
      method: 'PUT',
      body: JSON.stringify({
        reason,
        ...(redirectDepartment ? { redirect_department: redirectDepartment } : {}),
      }),
    }),

  start: (id) =>
    apiFetch(`/appointments/${id}/start`, { method: 'PUT' }),

  complete: (id) =>
    apiFetch(`/appointments/${id}/complete`, { method: 'PUT' }),

  noShow: (id) =>
    apiFetch(`/appointments/${id}/no-show`, { method: 'PUT' }),

  reschedule: (id, body) =>
    apiFetch(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Doctor-only: adjust duration (minutes) and optionally consultation_fee
  adjust: (id, body) =>
    apiFetch(`/appointments/${id}/adjust`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}
