/**
 * API unit tests — auth.js
 *
 * Verifies login, me, verifyEmail and the 401→logout-required flow
 * without touching a real server.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authApi } from '../../api/auth.js'
import { setAccessToken, clearAccessToken, getAccessToken } from '../../api/client.js'
import { makeFetchResponse } from '../helpers/mockFetch.js'

function mockFetch(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(body, status))
}

function lastCall() {
  const calls = globalThis.fetch.mock.calls
  return calls[calls.length - 1]
}

beforeEach(() => clearAccessToken())

afterEach(() => {
  clearAccessToken()
  vi.restoreAllMocks()
})

// ─── login ───────────────────────────────────────────────────────────────────

describe('authApi.login', () => {
  it('POSTs /auth/login with email and password', async () => {
    mockFetch({ access_token: 'tok-abc', user: { role: 'doctor' } })

    await authApi.login('doc@hospital.com', 'secret')

    const [url, opts] = lastCall()
    expect(url).toBe('/auth/login')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({
      email: 'doc@hospital.com',
      password: 'secret',
    })
  })

  it('stores access_token in module state after a successful login', async () => {
    mockFetch({ access_token: 'tok-xyz', user: { role: 'patient' } })

    await authApi.login('user@test.com', 'pass')

    expect(getAccessToken()).toBe('tok-xyz')
  })

  it('also handles camelCase accessToken field', async () => {
    mockFetch({ accessToken: 'tok-camel' })

    await authApi.login('a@b.com', 'p')

    expect(getAccessToken()).toBe('tok-camel')
  })
})

// ─── me ──────────────────────────────────────────────────────────────────────

describe('authApi.me', () => {
  it('GETs /auth/me with Authorization header', async () => {
    setAccessToken('bearer-token')
    mockFetch({ id: 'u-1', role: 'doctor' })

    await authApi.me()

    const [url, opts] = lastCall()
    expect(url).toBe('/auth/me')
    expect(opts.method).toBeUndefined() // GET has no explicit method in the call
    expect(opts.headers?.['Authorization']).toBe('Bearer bearer-token')
  })
})

// ─── verifyEmail ─────────────────────────────────────────────────────────────

describe('authApi.verifyEmail', () => {
  it('POSTs /auth/verify-email with email and otp', async () => {
    mockFetch({ message: 'Email verified' })

    await authApi.verifyEmail('user@example.com', '123456')

    const [url, opts] = lastCall()
    expect(url).toBe('/auth/verify-email')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ email: 'user@example.com', otp: '123456' })
  })
})

// ─── 401 → auth:logout-required ─────────────────────────────────────────────

describe('401 handling', () => {
  it('dispatches auth:logout-required when refresh also fails', async () => {
    setAccessToken('expired-token')

    // First call: the real endpoint → 401
    // Second call: refresh → 401 again
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(makeFetchResponse({ detail: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(makeFetchResponse({ detail: 'Unauthorized' }, 401))

    const events = []
    window.addEventListener('auth:logout-required', (e) => events.push(e))

    try {
      await authApi.me()
    } catch {
      // apiFetch throws after logout-required
    }

    expect(events).toHaveLength(1)
    window.removeEventListener('auth:logout-required', (e) => events.push(e))
  })
})

// ─── register ────────────────────────────────────────────────────────────────

describe('authApi.register', () => {
  it('POSTs /auth/register with email and password', async () => {
    mockFetch({ message: 'Registered' })

    await authApi.register('new@user.com', 'password123')

    const [url, opts] = lastCall()
    expect(url).toBe('/auth/register')
    expect(JSON.parse(opts.body)).toEqual({ email: 'new@user.com', password: 'password123' })
  })
})
