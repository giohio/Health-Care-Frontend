/**
 * Shared fetch-mocking utilities for API unit tests.
 * All helpers produce objects compatible with the native `Response` API
 * expected by client.js (apiFetch → fetchWithRefresh → fetch).
 */

/**
 * Build a fake JSON Response suitable for mocking `globalThis.fetch`.
 *
 * @param {*}      body    Object/array to serialise as JSON
 * @param {number} status  HTTP status code (default 200)
 */
export function makeFetchResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Build a fake SSE streaming Response.
 * `lines` is an array of raw SSE line strings; they are joined by '\n'.
 *
 * Example lines:
 *   ['event: session_id', 'data: sess-001', '', 'data: token text', '', 'data: [DONE]', '']
 */
export function makeStreamResponse(lines) {
  const text = lines.join('\n')
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

/**
 * Spy on globalThis.fetch and resolve it with a single JSON response.
 * Requires `vi` to be imported in the calling module (from 'vitest').
 * Returns the spy so callers can add further assertions.
 *
 * Usage (in a test file that already imports vi):
 *   import { vi } from 'vitest'
 *   import { spyFetch } from '../helpers/mockFetch.js'
 *   const spy = spyFetch(vi, { id: '1' })
 *   await someApiCall()
 *   expect(spy).toHaveBeenCalledWith('/some/path', ...)
 */
export function spyFetch(vi, body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(body, status))
}
