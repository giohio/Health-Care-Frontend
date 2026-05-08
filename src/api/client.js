const BASE_URL = ''

let isRefreshing = false
let refreshSubscribers = []
let currentAccessToken = null

function onRefreshDone(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'ApiError'
  }
}

async function doRefresh() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  if (!res.ok) throw new ApiError('Session expired', 'UNAUTHORIZED', 401)
  const data = await res.json()
  currentAccessToken = data?.access_token || data?.accessToken || null
  return currentAccessToken
}

function buildConfig(options) {
  const isFormData = options.body instanceof FormData
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' }
  const mergedHeaders = options.headers
    ? { ...defaultHeaders, ...options.headers }
    : defaultHeaders

  return {
    credentials: 'include',
    ...options,
    headers: {
      ...mergedHeaders,
      ...(currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {}),
    },
  }
}

async function fetchWithRefresh(url, config) {
  let response = await fetch(url, config)
  if (response.status !== 401 || url.endsWith('/auth/login')) return response

  if (isRefreshing) {
    const token = await new Promise((resolve) => {
      refreshSubscribers.push(resolve)
    })
    if (!token) throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED', 401)
    const retryConfig = buildConfig(config._originalOptions || {})
    return fetch(url, retryConfig)
  }

  isRefreshing = true
  try {
    await doRefresh()
    onRefreshDone(currentAccessToken)
    const retryConfig = buildConfig(config._originalOptions || {})
    return fetch(url, retryConfig)
  } catch {
    onRefreshDone(null)
    globalThis.dispatchEvent(new CustomEvent('auth:logout-required'))
    throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED', 401)
  } finally {
    isRefreshing = false
  }
}

export function setAccessToken(token) {
  currentAccessToken = token
}

export function clearAccessToken() {
  currentAccessToken = null
}

export function getAccessToken() {
  return currentAccessToken
}

/**
 * Called on app init after cookie-based hydration to populate the in-memory token.
 * Silently no-ops if the refresh cookie is missing/expired.
 */
export async function initializeToken() {
  try {
    await doRefresh()
  } catch {
    // not logged in or refresh token expired — ignore
  }
}

function ensureJsonResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, 'HTTP_ERROR', response.status)
    }
    return false
  }
  return true
}

function handleEnvelope(body, response) {
  if (!body || typeof body !== 'object' || !('status' in body)) return undefined

  if (body.status === 'error') {
    throw new ApiError(body.message || 'An error occurred', body.code, response.status)
  }
  if (body.status === 'success') {
    if ('data' in body) return body.data
    return body
  }

  return undefined
}

function handleRawError(body, response) {
  if (response.ok) return
  let msg = `HTTP ${response.status}`
  const detail = body?.detail
  if (typeof detail === 'string') {
    msg = detail
  } else if (Array.isArray(detail) && detail.length > 0) {
    msg = detail.map((d) => d.msg || d.message || String(d)).filter(Boolean).join('; ')
  } else if (detail && typeof detail === 'object') {
    msg = detail.message || detail.msg || `HTTP ${response.status}`
  } else if (typeof body?.message === 'string') {
    msg = body.message
  }
  const code = body?.code || 'HTTP_ERROR'
  throw new ApiError(msg, code, response.status)
}

export async function apiFetch(path, options = {}) {
  const method = options.method || 'GET'
  const url = `${BASE_URL}${path}`
  const suppressErrorStatuses = new Set(options.suppressErrorStatuses || [])
  const config = buildConfig(options)
  config._originalOptions = options

  let response
  try {
    response = await fetchWithRefresh(url, config)
  } catch (err) {
    console.error(`[API] ${method} ${path} → network error:`, err.message)
    throw err
  }

  // Handle non-JSON or empty responses
  if (!ensureJsonResponse(response)) {
    if (!response.ok) console.warn(`[API] ${method} ${path} → ${response.status} (non-JSON)`)
    return null
  }

  let body
  try {
    body = await response.json()
    if (body && typeof body === 'object') {
      const newToken = body.access_token || body.accessToken || body.data?.access_token || body.data?.accessToken
      if (newToken) {
        setAccessToken(newToken)
      }
    }
  } catch (parseErr) {
    console.error(`[API] ${method} ${path} → ${response.status} JSON parse failed:`, parseErr.message)
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, 'HTTP_ERROR', response.status)
    }
    return null
  }

  // Some routes (e.g. VNPAY callback) return raw JSON without envelope
  try {
    const envelopeResult = handleEnvelope(body, response)
    if (envelopeResult !== undefined) {
      return envelopeResult
    }
  } catch (envErr) {
    if (!suppressErrorStatuses.has(response.status)) {
      console.error(`[API] ${method} ${path} → ${response.status} envelope error:`, envErr.message)
    }
    throw envErr
  }

  // Raw JSON response (no envelope)
  try {
    handleRawError(body, response)
  } catch (rawErr) {
    if (!suppressErrorStatuses.has(response.status)) {
      console.error(`[API] ${method} ${path} → ${response.status} error:`, rawErr.message)
    }
    throw rawErr
  }

  return body
}
