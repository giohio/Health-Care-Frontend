/**
 * API unit tests — emr.js
 *
 * Verifies that every emrApi function sends the correct HTTP method, URL, and
 * request body.  All tests mock globalThis.fetch; no real network calls occur.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { emrApi } from '../../api/emr.js'
import { setAccessToken, clearAccessToken } from '../../api/client.js'
import { makeFetchResponse } from '../helpers/mockFetch.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function mockFetch(body = {}, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(body, status))
}

function lastCall() {
  const calls = globalThis.fetch.mock.calls
  return calls[calls.length - 1]
}

// ─── setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  setAccessToken('test-token')
})

afterEach(() => {
  clearAccessToken()
  vi.restoreAllMocks()
})

// ─── createLabResultFile ─────────────────────────────────────────────────────

describe('emrApi.createLabResultFile', () => {
  it('POSTs to /lab-results with exactly the 6 required fields', async () => {
    mockFetch({ id: 'result-1', status: 'PENDING' })

    await emrApi.createLabResultFile({
      order_id: 'ord-1',
      patient_id: 'pat-1',
      doctor_id: 'doc-1',
      file_url: 'https://bucket/file.pdf',
      file_type: 'pdf',
      notes: 'some note',
    })

    const [url, opts] = lastCall()
    expect(url).toBe('/lab-results')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({
      order_id: 'ord-1',
      patient_id: 'pat-1',
      doctor_id: 'doc-1',
      file_url: 'https://bucket/file.pdf',
      file_type: 'pdf',
      notes: 'some note',
    })
  })

  it('omits notes field when undefined', async () => {
    mockFetch({ id: 'result-2', status: 'PENDING' })

    await emrApi.createLabResultFile({
      order_id: 'ord-1',
      patient_id: 'pat-1',
      doctor_id: 'doc-1',
      file_url: 'https://bucket/file.pdf',
      file_type: 'pdf',
    })

    const body = JSON.parse(lastCall()[1].body)
    // notes is explicitly destructured as undefined → should NOT appear in body
    expect('notes' in body ? body.notes : undefined).toBeUndefined()
  })
})

// ─── createLabResultManual ───────────────────────────────────────────────────

describe('emrApi.createLabResultManual', () => {
  it('POSTs to /lab-results with file_type="manual" and manual_entries', async () => {
    mockFetch({ id: 'result-3', status: 'NEEDS_MANUAL_REVIEW' })

    const entries = [
      { test_name: 'Glucose', value: '5.2', unit: 'mmol/L', reference_range: '3.9-6.1' },
    ]

    await emrApi.createLabResultManual({
      order_id: 'ord-2',
      patient_id: 'pat-2',
      doctor_id: 'doc-2',
      manual_entries: entries,
      notes: 'Manual entry',
    })

    const [url, opts] = lastCall()
    expect(url).toBe('/lab-results')
    expect(opts.method).toBe('POST')

    const body = JSON.parse(opts.body)
    expect(body.file_type).toBe('manual')
    expect(body.manual_entries).toEqual(entries)
    expect(body.order_id).toBe('ord-2')
    expect(body.patient_id).toBe('pat-2')
    expect(body.doctor_id).toBe('doc-2')
  })

  it('does NOT include file_url in manual mode', async () => {
    mockFetch({ id: 'result-4' })

    await emrApi.createLabResultManual({
      order_id: 'ord-3',
      patient_id: 'pat-3',
      doctor_id: 'doc-3',
      manual_entries: [{ test_name: 'WBC', value: '5.0' }],
    })

    const body = JSON.parse(lastCall()[1].body)
    expect(body).not.toHaveProperty('file_url')
  })
})

// ─── verifyLabResult ─────────────────────────────────────────────────────────

describe('emrApi.verifyLabResult', () => {
  it('PATCHes /lab-results/{id}/verify with the supplied data body', async () => {
    mockFetch({ id: 'result-5', status: 'PUBLISHED' })

    await emrApi.verifyLabResult('result-5', { doctor_notes: 'Verified by physician' })

    const [url, opts] = lastCall()
    expect(url).toBe('/lab-results/result-5/verify')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ doctor_notes: 'Verified by physician' })
  })

  it('sends empty body when no data supplied', async () => {
    mockFetch({ id: 'result-6', status: 'PUBLISHED' })

    await emrApi.verifyLabResult('result-6')

    const body = JSON.parse(lastCall()[1].body)
    expect(body).toEqual({})
  })
})

// ─── flagManualReview ────────────────────────────────────────────────────────

describe('emrApi.flagManualReview', () => {
  it('PATCHes /lab-results/{id}/flag-manual', async () => {
    mockFetch({ id: 'result-7', status: 'NEEDS_MANUAL_REVIEW' })

    await emrApi.flagManualReview('result-7')

    const [url, opts] = lastCall()
    expect(url).toBe('/lab-results/result-7/flag-manual')
    expect(opts.method).toBe('PATCH')
  })
})

// ─── uploadFile ──────────────────────────────────────────────────────────────

describe('emrApi.uploadFile', () => {
  it('POSTs to /upload as multipart with file and context fields', async () => {
    mockFetch({ url: 'https://bucket/uploaded.pdf', file_type: 'pdf' })

    const fakeFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' })
    await emrApi.uploadFile(fakeFile, 'lab_results')

    const [url, opts] = lastCall()
    expect(url).toBe('/upload')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    expect(opts.body.get('file')).toBe(fakeFile)
    expect(opts.body.get('context')).toBe('lab_results')
  })

  it('sends no Content-Type header so the browser sets multipart boundary', async () => {
    mockFetch({ url: 'https://bucket/img.jpg', file_type: 'image' })

    const fakeFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await emrApi.uploadFile(fakeFile)

    const { headers } = lastCall()[1]
    // When body is FormData, buildConfig() skips the JSON Content-Type header
    expect(headers?.['Content-Type']).toBeUndefined()
  })
})

// ─── getLabOrders ────────────────────────────────────────────────────────────

describe('emrApi.getLabOrders', () => {
  it('GETs /lab-orders with no query string when params is empty', async () => {
    mockFetch([])

    await emrApi.getLabOrders({})

    expect(lastCall()[0]).toBe('/lab-orders')
  })

  it('appends query params when supplied', async () => {
    mockFetch([])

    await emrApi.getLabOrders({ patient_id: 'p-1', status: 'pending' })

    const url = lastCall()[0]
    expect(url).toContain('patient_id=p-1')
    expect(url).toContain('status=pending')
  })
})

// ─── getLabResults ───────────────────────────────────────────────────────────

describe('emrApi.getLabResults', () => {
  it('GETs /lab-results', async () => {
    mockFetch([])

    await emrApi.getLabResults({})

    expect(lastCall()[0]).toBe('/lab-results')
  })
})
