import { apiFetch } from './client'

export const notificationApi = {
  // Kong strips single /notifications → service sees /notifications/* (NOT double-prefix)
  getAll: (limit = 50, offset = 0) =>
    apiFetch(`/notifications/me?limit=${limit}&offset=${offset}`),

  getUnreadCount: () =>
    apiFetch('/notifications/unread-count'),

  markRead: (notifId) =>
    apiFetch(`/notifications/${notifId}/read`, { method: 'PUT' }),

  markAllRead: () =>
    apiFetch('/notifications/read-all', { method: 'PUT' }),
}
