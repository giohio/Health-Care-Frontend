import { useState, useCallback, useRef } from 'react'

/**
 * Wraps an async operation with loading and error states.
 *
 * @param {Function} fn - async function to execute
 * @returns {{ execute, loading, error, success }}
 *
 * @example
 * const { execute: cancelAppointment, loading, error } = useAsync(
 *   (id) => appointmentApi.cancel(id)
 * )
 */
export function useAsync(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        return await fn(...args)
      } catch (err) {
        setError(err.message || 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fn]
  )

  return { execute, loading, error }
}

/**
 * useAsync with success state that auto-resets after a delay.
 *
 * @param {Function} fn - async function
 * @param {number} successDuration - ms before success resets (default 3000)
 */
export function useAsyncWithSuccess(fn, successDuration = 3000) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const successTimer = useRef(null)

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fn(...args)
        setSuccess(true)
        clearTimeout(successTimer.current)
        successTimer.current = setTimeout(() => setSuccess(false), successDuration)
        return result
      } catch (err) {
        setError(err.message || 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fn, successDuration]
  )

  return { execute, loading, error, success }
}
