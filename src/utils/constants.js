/**
 * Shared app-wide constants that were previously magic numbers or scattered strings.
 */

// ── API ─────────────────────────────────────────────────────────────────────────
export const API_PAGE_SIZE_DEFAULT = 20
export const API_PAGE_SIZE_MAX     = 100
export const API_RETRY_ATTEMPTS    = 3
export const API_RETRY_DELAY_MS    = 1000  // base delay; exponential backoff applied

// ── UI ─────────────────────────────────────────────────────────────────────────
export const TOAST_DURATION_MS  = 4000
export const OVERDUE_THRESHOLD_MINS = 30

// ── Pagination ─────────────────────────────────────────────────────────────────
export const SCHEDULE_TIMELINE_START_HOUR = 7   // schedule starts at 7 AM
export const SCHEDULE_TIMELINE_END_HOUR   = 21  // schedule ends at 9 PM

// ── Demo credentials (dev only) ────────────────────────────────────────────────
export const DEMO_ACCOUNTS = {
  patient: { email: 'jane.doe@email.com',   password: 'patient123' },
  doctor:  { email: 'dr.chen@healthai.vn',  password: 'doctor123' },
  admin:   { email: 'admin@healthai.vn',    password: 'admin123'  },
}
