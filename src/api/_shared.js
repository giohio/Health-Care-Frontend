/**
 * Shared API configuration used across all API modules.
 * Centralizing BASE_URL ensures all requests go through the same gateway.
 *
 * In development with a reverse proxy (e.g. Vite dev server), use relative paths.
 * In production, set VITE_API_BASE_URL env variable.
 */
export const API_BASE_URL = (() => {
  // Allow per-environment override via env variable
  if (import.meta?.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  // Default: relative path (works with Vite proxy: /api → backend)
  return ''
})()

/**
 * Normalize error message from a raw HTTP response body.
 * Used by all API modules that handle non-json responses.
 */
export function parseErrorMessage(rawText, status) {
  if (!rawText) return `HTTP ${status}`
  try {
    const body = JSON.parse(rawText)
    const detail = body?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item?.msg || item?.message || String(item)).filter(Boolean).join('; ')
    }
    if (detail && typeof detail === 'object') {
      return detail.message || detail.msg || `HTTP ${status}`
    }
    if (typeof body?.message === 'string') return body.message
  } catch {
    // not JSON, return raw text
  }
  return rawText || `HTTP ${status}`
}
