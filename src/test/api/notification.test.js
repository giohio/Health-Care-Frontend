/**
 * API unit tests — notification.js
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { notificationApi } from '../../api/notification.js'
import { setAccessToken, clearAccessToken } from '../../api/client.js'
import { makeFetchResponse } from '../helpers/mockFetch.js'

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

// ─── getAll ──────────────────────────────────────────────────────────────────

describe('notificationApi.getAll', () => {
  it('GETs /notifications/me?limit=50&offset=0 by default', async () => {
    mockFetch([])

    await notificationApi.getAll(50, 0)

    expect(lastCall()[0]).toBe('/notifications/me?limit=50&offset=0')
  })

  it('uses supplied limit and offset', async () => {
    mockFetch([])

    await notificationApi.getAll(10, 20)

    expect(lastCall()[0]).toBe('/notifications/me?limit=10&offset=20')
  })
})

// ─── getUnreadCount ──────────────────────────────────────────────────────────

describe('notificationApi.getUnreadCount', () => {
  it('GETs /notifications/unread-count', async () => {
    mockFetch({ count: 3 })

    await notificationApi.getUnreadCount()

    expect(lastCall()[0]).toBe('/notifications/unread-count')
  })
})

// ─── markRead ────────────────────────────────────────────────────────────────

describe('notificationApi.markRead', () => {
  it('PUTs /notifications/{id}/read', async () => {
    mockFetch({ success: true })

    await notificationApi.markRead('notif-99')

    const [url, opts] = lastCall()
    expect(url).toBe('/notifications/notif-99/read')
    expect(opts.method).toBe('PUT')
  })
})

// ─── markAllRead ─────────────────────────────────────────────────────────────

describe('notificationApi.markAllRead', () => {
  it('PUTs /notifications/read-all with no body', async () => {
    mockFetch({ success: true })

    await notificationApi.markAllRead()

    const [url, opts] = lastCall()
    expect(url).toBe('/notifications/read-all')
    expect(opts.method).toBe('PUT')
  })
})
