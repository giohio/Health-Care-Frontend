import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Generic async data-fetching hook.
 * Re-runs when deps change (similar to useEffect).
 *
 * @param {Function|null} fetcher  - async function that returns data
 * @param {Array} deps            - dependency array (triggers re-fetch when changed)
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data, loading, error, refetch } = useApi(
 *   () => appointmentApi.getMy(),
 *   [patientId]
 * )
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(fetcher != null)
  const [error, setError] = useState(null)
  const cancelled = useRef(false)

  const load = useCallback(async () => {
    if (!fetcher) return
    cancelled.current = false
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (!cancelled.current) setData(result)
    } catch (err) {
      if (!cancelled.current) setError(err.message || 'An error occurred')
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    load()
    return () => { cancelled.current = true }
  }, [load])

  return { data, loading, error, refetch: load }
}

/**
 * useApiEffect: alias for useApi (useEffect-style).
 * Keeps backward compatibility for existing code.
 */
export { useApi as useApiEffect }
