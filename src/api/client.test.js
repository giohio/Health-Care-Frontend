import { describe, it, expect, beforeEach } from 'vitest'
import { getAccessToken, setAccessToken, clearAccessToken } from './client'

describe('getAccessToken', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('returns null initially', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns the token after setAccessToken', () => {
    setAccessToken('test-token-abc')
    expect(getAccessToken()).toBe('test-token-abc')
  })

  it('returns null after clearAccessToken', () => {
    setAccessToken('some-token')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})
