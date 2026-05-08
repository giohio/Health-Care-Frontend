import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyzeAuscultation, streamSSE } from './ai'
import { setAccessToken, clearAccessToken } from './client'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAudioFile(name = 'test.wav', type = 'audio/wav', size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type })
}

function mockFetchOk(body) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

function mockFetchFail(status, body) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

const MOCK_RESPONSE = {
  patient_id: 'p-123',
  sound_type: 'lung_sounds',
  department: 'respiratory',
  visual_findings: { abnormal_sounds: [], confidence: 0.9, distribution: 'bilateral' },
  draft_text: 'Normal breath sounds.',
  confidence: 0.9,
  model_versions: { synthesis: 'GroqLLM' },
  note: 'AI draft.',
}

function makeSseResponse(chunks) {
  const encoded = chunks.map((chunk) => new TextEncoder().encode(chunk))
  let idx = 0
  return {
    body: {
      getReader() {
        return {
          read: async () => {
            if (idx < encoded.length) {
              return { done: false, value: encoded[idx++] }
            }
            return { done: true, value: undefined }
          },
        }
      },
    },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('analyzeAuscultation', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds FormData with correct fields and calls the endpoint', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESPONSE)
    const file = makeAudioFile()

    await analyzeAuscultation({
      file,
      patientId: 'p-123',
      soundType: 'lung_sounds',
      department: 'respiratory',
      language: 'vi',
    })

    expect(fetchSpy).toHaveBeenCalledOnce()

    const [url, opts] = fetchSpy.mock.calls[0]
    expect(url).toContain('/ai/analyze-auscultation')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)

    const fd = opts.body
    expect(fd.get('patient_id')).toBe('p-123')
    expect(fd.get('sound_type')).toBe('lung_sounds')
    expect(fd.get('department')).toBe('respiratory')
    expect(fd.get('language')).toBe('vi')
    expect(fd.get('file')).toBe(file)
  })

  it('reads auth_token from getAccessToken (not a param)', async () => {
    setAccessToken('bearer-xyz')
    const fetchSpy = mockFetchOk(MOCK_RESPONSE)

    await analyzeAuscultation({
      file: makeAudioFile(),
      patientId: 'p-123',
      soundType: 'lung_sounds',
      department: 'respiratory',
    })

    const fd = fetchSpy.mock.calls[0][1].body
    expect(fd.get('auth_token')).toBe('bearer-xyz')
  })

  it('uses empty string for auth_token when no token is set', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESPONSE)

    await analyzeAuscultation({
      file: makeAudioFile(),
      patientId: 'p-123',
      soundType: 'lung_sounds',
      department: 'respiratory',
    })

    const fd = fetchSpy.mock.calls[0][1].body
    expect(fd.get('auth_token')).toBe('')
  })

  it('omits language field when not provided', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESPONSE)

    await analyzeAuscultation({
      file: makeAudioFile(),
      patientId: 'p-123',
      soundType: 'heart_sounds',
      department: 'cardiology',
    })

    const fd = fetchSpy.mock.calls[0][1].body
    expect(fd.get('language')).toBeNull()
  })

  it('throws with parsed error message on non-ok response', async () => {
    mockFetchFail(403, { detail: 'Doctor role required' })

    await expect(
      analyzeAuscultation({
        file: makeAudioFile(),
        patientId: 'p-123',
        soundType: 'lung_sounds',
        department: 'respiratory',
      })
    ).rejects.toThrow('Doctor role required')
  })

  it('returns the parsed JSON response on success', async () => {
    mockFetchOk(MOCK_RESPONSE)

    const result = await analyzeAuscultation({
      file: makeAudioFile(),
      patientId: 'p-123',
      soundType: 'lung_sounds',
      department: 'respiratory',
    })

    expect(result).toEqual(MOCK_RESPONSE)
  })
})

describe('streamSSE', () => {
  it('handles CRLF SSE blocks and emits clean session_id event', async () => {
    const response = makeSseResponse([
      'event: session_id\r\ndata: sess-123\r\n\r\ndata: Hello\r\n\r\ndata: [DONE]\r\n\r\n',
    ])

    const events = []
    const chunks = []

    await new Promise((resolve, reject) => {
      streamSSE(response, {
        onEvent: (name, data) => events.push({ name, data }),
        onChunk: (data) => chunks.push(data),
        onDone: resolve,
        onError: reject,
      })
    })

    expect(events).toEqual([{ name: 'session_id', data: 'sess-123' }])
    expect(chunks).toEqual(['Hello'])
  })

  it('supports multi-line data payloads in one event', async () => {
    const response = makeSseResponse([
      'event: specialties\n',
      'data: ["Cardiology",\n',
      'data: "Internal Medicine"]\n\n',
      'data: [DONE]\n\n',
    ])

    const events = []

    await new Promise((resolve, reject) => {
      streamSSE(response, {
        onEvent: (name, data) => events.push({ name, data }),
        onChunk: () => {},
        onDone: resolve,
        onError: reject,
      })
    })

    expect(events).toEqual([
      { name: 'specialties', data: '["Cardiology",\n"Internal Medicine"]' },
    ])
  })
})
