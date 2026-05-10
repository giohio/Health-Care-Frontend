import { apiFetch, getAccessToken } from './client'
import { API_BASE_URL, parseErrorMessage } from './_shared'

/**
 * Read an SSE stream from a fetch Response.
 * Handles named events (event: session_id, event: turn_type) in addition to plain data chunks.
 *
 * Callbacks:
 *   onChunk(text)          — plain streaming token
 *   onDone()               — received [DONE]
 *   onError(err)           — network / parse error
 *   onEvent(name, data)    — named SSE event (session_id | turn_type)
 */
export function streamSSE(response, { onChunk, onDone, onError, onEvent }) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // Returns true when the stream should stop ([DONE] received), false otherwise
  function processBlock(block) {
    if (!block.trim()) return false
    const rows = block.split(/\r?\n/)
    const eventLine = rows.find((r) => r.startsWith('event:'))
    // Collect ALL data: lines and join with \n (SSE spec allows multi-line data)
    const dataLines = rows.filter((r) => r.startsWith('data:'))
    if (dataLines.length === 0) return false

    const eventName = eventLine ? eventLine.slice(6).trim() : null
    const data = dataLines
      .map((l) => l.slice(5).replace(/^\s/, '').replace(/\r$/, ''))
      .join('\n')

    if (eventName) {
      onEvent?.(eventName, data)
    } else if (data.trim() === '[DONE]') {
      return true
    } else {
      onChunk(data)
    }
    return false
  }

  function pump() {
    return reader.read().then(({ done, value }) => {
      if (done) {
        // Flush any remaining buffered content that lacked a trailing \n\n
        if (buffer.trim()) processBlock(buffer)
        onDone?.()
        return
      }
      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split(/\r?\n\r?\n/)
      buffer = blocks.pop() // keep incomplete block

      for (const block of blocks) {
        if (processBlock(block)) { onDone?.(); return }
      }

      return pump()
    }).catch((err) => {
      if (err.name === 'AbortError') return
      onError?.(err)
    })
  }

  pump()
}

/**
 * POST /ai/symptom-check — SSE streaming triage (stateful).
 * Pass sessionId to continue an existing conversation; omit to start a new one.
 * After turn_type=recommendation, AI auto-handles booking via tool calls.
 * Returns the raw fetch Response so the caller can read the SSE stream.
 */
export async function symptomCheck({ patientId, symptoms, duration, severity, sessionId }, signal) {
  const cleanSessionId = typeof sessionId === 'string' ? sessionId.trim() : sessionId
  const body = {
    patient_id: patientId,
    symptoms,
    ...(cleanSessionId ? { session_id: cleanSessionId } : {}),
  }
  if (duration)  body.duration  = duration
  if (severity)  body.severity  = severity

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/symptom-check`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response
}

// ---------------------------------------------------------------------------
// Triage Session endpoints (no envelope — direct JSON)
// ---------------------------------------------------------------------------

/** GET /ai/triage-sessions — list sessions (patient: own; doctor/admin: all, filterable by status) */
export function getTriageSessions(params = {}) {
  const q = new URLSearchParams(params).toString()
  const qs = q ? `?${q}` : ''
  return apiFetch(`/ai/triage-sessions${qs}`)
}

/** GET /ai/triage-sessions/{id} */
export function getTriageSession(sessionId) {
  return apiFetch(`/ai/triage-sessions/${sessionId}`)
}

/** GET /ai/triage-sessions/{id}/summary — clinical summary (doctor/admin only) */
export function getTriageSessionSummary(sessionId) {
  return apiFetch(`/ai/triage-sessions/${sessionId}/summary`)
}

/** POST /ai/triage-sessions/{id}/confirm — doctor confirms AI suggestion */
export function confirmTriageSession(sessionId, notes) {
  return apiFetch(`/ai/triage-sessions/${sessionId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

/** POST /ai/triage-sessions/{id}/refer-internal — doctor redirects to General Medicine */
export function referInternalTriageSession(sessionId, notes) {
  return apiFetch(`/ai/triage-sessions/${sessionId}/refer-internal`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

/**
 * POST /ai/analyze-lab — enqueue Celery analysis job.
 * Normally called internally by the EMR service; exposed for manual re-trigger.
 */
export async function analyzeLab(params) {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/analyze-lab`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * POST /ai/summarize-emr — SSE streaming EMR summary (doctor/admin only).
 */
export async function summarizeEmr({ patientId, language } = {}, signal) {
  const body = { patient_id: patientId }
  if (language) body.language = language

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/summarize-emr`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response
}

/**
 * POST /ai/suggest-lab-tests — Lab test suggestions for doctors (doctor/admin only).
 */
export async function suggestLabTests({ symptoms, patientId, department } = {}) {
  const body = { symptoms }
  if (patientId)  body.patient_id  = patientId
  if (department) body.department = department

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/suggest-lab-tests`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response.json()
}

/**
 * POST /ai/treatment-plan — AI treatment plan from lab summary (doctor/admin only).
 * @param {{ labSummary: string, patientId?: string, symptoms?: string }} params
 * @returns {Promise<{ summary, urgency, follow_up_days, recommendations }>}
 */
export async function generateTreatmentPlan({ labSummary, patientId, symptoms } = {}) {
  const body = { lab_summary: labSummary }
  if (patientId) body.patient_id = patientId
  if (symptoms)  body.symptoms   = symptoms

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/treatment-plan`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response.json()
}

/**
 * POST /ai/lab-chat — SSE streaming Lab Q&A (stateful, session history).
 * Patient gets plain language; doctor/admin gets full clinical explanation.
 * Pass sessionId to continue an existing conversation; omit to start a new one.
 * On first call, the server emits `event: session_id` as the first SSE event — capture
 * it via onEvent('session_id', id) in streamSSE() and persist for subsequent calls.
 * @param {{ question: string, patientId?: string, department?: string, sessionId?: string }} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<Response>} raw fetch Response for streamSSE()
 */
export async function labChat({ question, patientId, department, sessionId } = {}, signal) {
  const body = { question }
  if (patientId)  body.patient_id  = patientId
  if (department) body.department  = department
  if (sessionId)  body.session_id  = sessionId

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/lab-chat`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response
}

/**
 * POST /ai/clinical-assist — SSE streaming clinical decision support (doctor/admin only, stateful).
 * Pass sessionId to continue an existing conversation; omit to start a new one.
 * On first call, the server emits `event: session_id` as the first SSE event — capture
 * it via onEvent('session_id', id) in streamSSE() and persist for subsequent calls.
 * @param {{ question: string, patientId?: string, department?: string, sessionId?: string }} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<Response>} raw fetch Response for streamSSE()
 */
export async function clinicalAssist({ question, patientId, department, sessionId } = {}, signal) {
  const body = { question }
  if (patientId)  body.patient_id  = patientId
  if (department) body.department  = department
  if (sessionId)  body.session_id  = sessionId

  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/ai/clinical-assist`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response
}

/**
 * POST /ai/speech/transcribe — Speech-to-Text (Whisper).
 * Do NOT set Content-Type — browser sets multipart boundary automatically.
 * @param {File|Blob} audioFile
 * @returns {Promise<{ text: string, language: string }>}
 */
export async function transcribeSpeech(audioFile) {
  const form = new FormData()
  form.append('file', audioFile)

  const response = await fetch(`${API_BASE_URL}/ai/speech/transcribe`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response.json()
}

/**
 * POST /ai/speech/tts — Text-to-Speech (Edge TTS).
 * @param {{ text: string, language?: string, voice?: string }} params
 * @returns {Promise<Blob>} audio/mpeg Blob — use URL.createObjectURL() to play
 */
export async function textToSpeech({ text, language, voice } = {}) {
  const body = { text }
  if (language) body.language = language
  if (voice)    body.voice    = voice

  const response = await fetch(`${API_BASE_URL}/ai/speech/tts`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text_ = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text_, response.status))
  }

  return response.blob()
}

/**
 * POST /ai/analyze-auscultation — Auscultation analysis (doctor/admin only).
 * Returns a JSON draft report synchronously (not SSE).
 * @param {{ file: File|Blob, patientId: string, soundType: string, department: string, language?: string, authToken: string }} params
 * @returns {Promise<{ patient_id, sound_type, department, findings, draft_text, confidence, disclaimer }>}
 */
export async function analyzeAuscultation({ file, patientId, soundType, department, language }) {
  const form = new FormData()
  form.append('file', file)
  form.append('patient_id', patientId)
  form.append('sound_type', soundType)
  form.append('department', department)
  form.append('auth_token', getAccessToken() || '')
  if (language) form.append('language', language)

  const response = await fetch(`${API_BASE_URL}/ai/analyze-auscultation`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parseErrorMessage(text, response.status))
  }

  return response.json()
}

/**
 * POST /ai/soap-draft — AI SOAP note draft (doctor/admin only).
 */
export async function generateSoapDraft({ patientId, triageSessionId } = {}) {
  const body = { patient_id: patientId }
  if (triageSessionId) body.triage_session_id = triageSessionId

  return apiFetch('/ai/soap-draft', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const aiApi = {
  symptomCheck,
  analyzeLab,
  summarizeEmr,
  labChat,
  clinicalAssist,
  transcribeSpeech,
  textToSpeech,
  analyzeAuscultation,
  suggestLabTests,
  generateTreatmentPlan,
  streamSSE,
  getTriageSessions,
  getTriageSession,
  confirmTriageSession,
  referInternalTriageSession,
  generateSoapDraft,

  health: () =>
    apiFetch('/ai/health'),
}
