import { useState, useCallback, useRef, useEffect } from 'react'
import { notificationApi } from '../api/notification'
import { connectWebSocket } from '../api/websocket'

/**
 * Manages notification state and WebSocket subscription.
 *
 * @param {string|null} userId
 * @param {Function|null} onAppointmentCreated - called with notification when patient receives booking confirmation
 * @returns {{ unreadCount, setUnreadCount, notifications, addNotification, clearNotifications, loadingUnread }}
 */
export function useNotificationStream(userId, onAppointmentCreated) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loadingUnread, setLoadingUnread] = useState(false)

  // Fetch initial unread count after login
  useEffect(() => {
    if (!userId) return
    setLoadingUnread(true)
    notificationApi.getUnreadCount()
      .then((data) => setUnreadCount(data?.count ?? 0))
      .catch(() => {})
      .finally(() => setLoadingUnread(false))
  }, [userId])

  // Connect WebSocket and keep subscription alive while userId is stable
  useEffect(() => {
    if (!userId) return undefined

    const disconnect = connectWebSocket(userId, (message) => {
      if (message?.event !== 'notification.new' || !message?.data) return
      const notification = message.data
      setUnreadCount((c) => c + 1)
      setNotifications((prev) => [notification, ...prev])

      if (notification?.event_type === 'appointment.created_patient') {
        onAppointmentCreated?.(notification)
      }
    })

    return disconnect
  }, [userId, onAppointmentCreated])

  /** Inject a locally-created notification (e.g. from lab order submission). */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((c) => c + 1)
  }, [])

  /** Clear all notifications (used on logout). */
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    unreadCount,
    setUnreadCount,
    notifications,
    addNotification,
    clearNotifications,
    loadingUnread,
  }
}
