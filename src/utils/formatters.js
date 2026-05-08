/**
 * Shared date/time formatting utilities.
 */

/**
 * Format ISO date string (YYYY-MM-DD) to locale date.
 * @param {string} iso - "2026-04-27"
 * @param {Intl.DateTimeFormatOptions} [opts]
 */
export function formatDate(iso, opts = {}) {
  if (!iso) return ''
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts })
}

/**
 * Format time string "HH:MM:SS" to "HH:MM".
 * @param {string} time - "14:30:00"
 */
export function formatTime(time) {
  if (!time) return ''
  return time.slice(0, 5)
}

/**
 * Format a date + time ISO string to a readable label.
 * @param {string} iso - full ISO datetime
 */
export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Get relative time label ("Today", "Tomorrow", "In 3 days", "2 days ago").
 * @param {string} isoDate - "YYYY-MM-DD"
 */
export function getRelativeDayLabel(isoDate) {
  if (!isoDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${isoDate}T00:00:00`)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1) return `In ${diff} days`
  return null
}

/**
 * Get ISO date string for today (YYYY-MM-DD).
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Format currency (VND).
 * @param {number} amount
 */
export function formatCurrency(amount) {
  if (amount == null) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

/**
 * Get initials from a full name.
 * @param {string} name
 * @param {number} [max=2]
 */
export function getInitials(name, max = 2) {
  if (!name) return '?'
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
