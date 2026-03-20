export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

export const getTimeRemaining = (targetDate) => {
  const diff = new Date(targetDate) - Date.now()
  if (diff <= 0) return 'Ready'
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  if (seconds < 60) return `${seconds}s`
  return `${minutes}m`
}
