/**
 * API unit tests — appointment.js
 *
 * Focuses on status-transition endpoints (confirm, decline) and the
 * getByDoctor query-string construction.  enrichWithPatientInfo is not tested
 * here because it depends on patientApi; integration of that path belongs to
 * an E2E test.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setAccessToken, clearAccessToken } from '../../api/client.js'
import { makeFetchResponse } from '../helpers/mockFetch.js'

// Mock patientApi so enrichWithPatientInfo never makes real network calls
vi.mock('../../api/patient.js', () => ({
  patientApi: {
    getPatientSummary: vi.fn().mockResolvedValue(null),
    getPatient: vi.fn().mockResolvedValue(null),
  },
}))

// Import AFTER mock declaration (Vitest hoists vi.mock automatically)
const { appointmentApi } = await import('../../api/appointment.js')

function mockFetch(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(body, status))
}

function lastCall() {
  return globalThis.fetch.mock.calls.at(-1)
}

beforeEach(() => setAccessToken('test-token'))

afterEach(() => {
  clearAccessToken()
  vi.restoreAllMocks()
})

// ─── confirm ─────────────────────────────────────────────────────────────────

describe('appointmentApi.confirm', () => {
  it('PUTs /appointments/{id}/confirm with no body', async () => {
    mockFetch({ id: 'appt-1', status: 'confirmed' })

    await appointmentApi.confirm('appt-1')

    const [url, opts] = lastCall()
    expect(url).toBe('/appointments/appt-1/confirm')
    expect(opts.method).toBe('PUT')
    // No body should be sent
    expect(opts.body).toBeUndefined()
  })
})

// ─── decline ─────────────────────────────────────────────────────────────────

describe('appointmentApi.decline', () => {
  it('PUTs /appointments/{id}/decline with reason and redirect_department', async () => {
    mockFetch({ id: 'appt-2', status: 'declined' })

    await appointmentApi.decline('appt-2', 'Symptoms not in specialty', 'Cardiology')

    const [url, opts] = lastCall()
    expect(url).toBe('/appointments/appt-2/decline')
    expect(opts.method).toBe('PUT')

    const body = JSON.parse(opts.body)
    expect(body.reason).toBe('Symptoms not in specialty')
    expect(body.redirect_department).toBe('Cardiology')
  })

  it('omits redirect_department when not provided', async () => {
    mockFetch({ id: 'appt-3', status: 'declined' })

    await appointmentApi.decline('appt-3', 'Patient request', undefined)

    const body = JSON.parse(lastCall()[1].body)
    expect(body.reason).toBe('Patient request')
    expect(body).not.toHaveProperty('redirect_department')
  })

  it('sends empty object body when no reason or redirect supplied', async () => {
    mockFetch({ id: 'appt-4', status: 'declined' })

    await appointmentApi.decline('appt-4', undefined, undefined)

    // JSON.stringify({ reason: undefined }) → "{}" (undefined props are stripped)
    const body = JSON.parse(lastCall()[1].body)
    expect(body).toEqual({})
  })
})

// ─── getByDoctor ──────────────────────────────────────────────────────────────

describe('appointmentApi.getByDoctor', () => {
  it('GETs /appointments/doctor/{id} with query params', async () => {
    // Return an array with patient_name pre-set so enrichment is skipped
    mockFetch([
      { id: 'a-1', status: 'PENDING', patient_id: 'p-1', patient_name: 'Alice' },
    ])

    await appointmentApi.getByDoctor('doc-1', { date_from: '2024-01-01', date_to: '2024-01-01' })

    const url = lastCall()[0]
    expect(url).toContain('/appointments/doctor/doc-1')
    expect(url).toContain('date_from=2024-01-01')
    expect(url).toContain('date_to=2024-01-01')
  })

  it('normalises status to lowercase', async () => {
    mockFetch([{ id: 'a-2', status: 'PENDING', patient_name: 'Bob', patient_id: 'p-2' }])

    const result = await appointmentApi.getByDoctor('doc-1', {})

    expect(result[0].status).toBe('pending')
  })
})
