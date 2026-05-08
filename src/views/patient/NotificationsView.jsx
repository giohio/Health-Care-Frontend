import { useEffect, useMemo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { notificationApi } from '../../api/notification'
import { IconCalendar, IconFlask, IconShieldAlert, IconArrowRight, IconCheck, IconCheckCheck, IconBell } from '../../icons'
import { EmptyState } from '../../components/shared/EmptyState'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'lab', label: 'Lab Results' },
]

function eventToType(eventType) {
  if (!eventType) return 'general'
  if (eventType.startsWith('appointment')) return 'appointment'
  if (eventType.startsWith('lab')) return 'lab'
  if (eventType.startsWith('payment')) return 'general'
  return 'general'
}

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const parsed = Date.parse(isoString)
  if (Number.isNaN(parsed)) return ''
  const diff = (Date.now() - parsed) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 172800) return 'Yesterday'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapApiNotification(n) {
  const type = eventToType(n.event_type)
  let navigateTo = null
  if (type === 'appointment') navigateTo = 'appointments'
  else if (type === 'lab') navigateTo = 'lab-results'

  return {
    id: n.id,
    type,
    title: n.title ?? n.event_type ?? 'Notification',
    body: n.body ?? n.message ?? '',
    time: formatRelativeTime(n.created_at),
    isRead: n.is_read ?? !!n.read_at,
    navigateTo,
  }
}

function getActionLabel(type) {
  if (type === 'appointment') return 'View Appointment'
  if (type === 'lab') return 'View Lab Result'
  if (type === 'allergy') return 'View Health Record'
  return null
}

function getTypeVisuals(type, isRead) {
  if (type === 'appointment') {
    return {
      container: `bg-indigo-50 dark:bg-indigo-950/60 ${isRead ? 'opacity-60' : ''}`,
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      icon: IconCalendar,
    }
  }

  if (type === 'lab') {
    return {
      container: `bg-amber-50 dark:bg-amber-950/50 ${isRead ? 'opacity-60' : ''}`,
      iconClass: 'text-amber-600 dark:text-amber-400',
      icon: IconFlask,
    }
  }

  if (type === 'allergy') {
    return {
      container: `bg-rose-50 dark:bg-rose-950/40 ${isRead ? 'opacity-60' : ''}`,
      iconClass: 'text-rose-600 dark:text-rose-400',
      icon: IconShieldAlert,
    }
  }

  return {
    container: `bg-slate-100 dark:bg-[#1c1c25] ${isRead ? 'opacity-60' : ''}`,
    iconClass: 'text-slate-500 dark:text-[#70708a]',
    icon: IconBell,
  }
}

export default function NotificationsView({
  setCurrentView,
  unreadCount,
  setUnreadCount,
  orderNotifications,
  setOrderNotifications,
  bookingNotifications,
  setBookingNotifications,
}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationApi.getAll(50, 0)
      const list = Array.isArray(data) ? data : (data?.notifications ?? [])
      setNotifications(list.map(mapApiNotification))
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (orderNotifications.length > 0) {
      setNotifications((prev) => [...orderNotifications.map(mapApiNotification), ...prev])
      setOrderNotifications([])
    }
  }, [orderNotifications, setOrderNotifications])

  useEffect(() => {
    if (bookingNotifications.length > 0) {
      setNotifications((prev) => [...bookingNotifications.map(mapApiNotification), ...prev])
      setBookingNotifications([])
    }
  }, [bookingNotifications, setBookingNotifications])

  const markAsRead = async (id) => {
    const target = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
      try { await notificationApi.markRead(id) } catch { /* non-critical */ }
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try { await notificationApi.markAllRead() } catch { /* non-critical */ }
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'unread') return !n.isRead
      if (activeFilter === 'appointments') return n.type === 'appointment'
      if (activeFilter === 'lab') return n.type === 'lab'
      return true
    })
  }, [activeFilter, notifications])

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Notifications</h1>
          <div className="mt-1 flex items-center gap-2">
            {unreadCount > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm text-slate-500 dark:text-[#70708a]">{unreadCount} unread</span>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-500 dark:text-[#70708a]">All caught up</span>
                <span className="inline-flex h-4 w-4 text-emerald-500"><IconCheck /></span>
              </>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="mt-2 self-start cursor-pointer text-sm font-medium text-indigo-600 transition-colors duration-150 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && <div className="api-loading mt-8"><div className="api-skeleton" /><div className="api-skeleton api-skeleton--short" /></div>}

      <div className="mb-6 mt-8">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key
            const showUnreadCount = filter.key === 'unread' && unreadCount > 0

            return (
              <button
                key={filter.key}
                type="button"
                className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                    : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                }`}
                onClick={() => setActiveFilter(filter.key)}
              >
                <span>{filter.label}</span>
                {showUnreadCount && (
                  <span className={`ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white ${
                    isActive ? 'bg-white/20 dark:bg-black/20' : 'bg-indigo-600 dark:bg-indigo-500'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={activeFilter === 'unread' ? <IconCheckCheck size={24} className="text-emerald-500 dark:text-emerald-400" /> : undefined}
          iconEmoji={activeFilter === 'all' ? '🔔' : undefined}
          title={activeFilter === 'unread' ? "You're all caught up" : 'No notifications here'}
          description={activeFilter === 'unread' ? 'No unread notifications at this time.' : 'Nothing to show for this filter.'}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((notification, index) => {
            const visuals = getTypeVisuals(notification.type, notification.isRead)
            const Icon = visuals.icon
            const actionLabel = getActionLabel(notification.type)

            return (
              <article
                key={notification.id}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 card-hover view-enter ${
                  notification.isRead
                    ? 'border-slate-100 bg-white shadow-none dark:border-[#1c1c25] dark:bg-[#0e0e15]'
                    : 'border-slate-200 bg-white shadow-[0_2px_12px_rgba(99,102,241,0.06)] dark:border-[#252530] dark:bg-[#111118] dark:shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                }`}
                style={{
                  animationDelay: `${Math.min(index * 50, 300)}ms`,
                  animationFillMode: 'both',
                }}
              >
                {/* Full-card click target — sits behind content via z-index */}
                <button
                  type="button"
                  aria-label={notification.title}
                  className="absolute inset-0 z-0 w-full cursor-pointer"
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.navigateTo) setCurrentView(notification.navigateTo)
                  }}
                />

                {/* Content layer above the button */}
                <div className="relative z-10 px-5 py-4 text-left">
                {!notification.isRead && (
                  <span className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-gradient-to-b from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400" aria-hidden="true" />
                )}

                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${visuals.container}`}>
                    <span className={`inline-flex h-5 w-5 ${visuals.iconClass}`}><Icon /></span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm ${notification.isRead ? 'font-medium text-slate-500 dark:text-[#70708a]' : 'font-semibold text-slate-900 dark:text-[#eeeef5]'}`}>
                        {notification.title}
                      </h3>

                      <div className="mt-0.5 flex flex-shrink-0 items-center gap-2">
                        <span className="text-[11px] text-slate-400 dark:text-[#505060]">{notification.time}</span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    <p className={`mt-1 text-sm leading-relaxed ${notification.isRead ? 'text-slate-400 dark:text-[#606070]' : 'text-slate-600 dark:text-[#9898b0]'}`}>
                      {notification.body}
                    </p>

                    {notification.navigateTo && actionLabel && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors duration-150 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                            setCurrentView(notification.navigateTo)
                          }}
                        >
                          <span>{actionLabel}</span>
                          <span className="inline-flex h-3 w-3"><IconArrowRight /></span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

NotificationsView.propTypes = {
  bookingNotifications: PropTypes.arrayOf(PropTypes.object),
  orderNotifications: PropTypes.arrayOf(PropTypes.object),
  setCurrentView: PropTypes.func.isRequired,
  setBookingNotifications: PropTypes.func.isRequired,
  setOrderNotifications: PropTypes.func.isRequired,
  unreadCount: PropTypes.number.isRequired,
  setUnreadCount: PropTypes.func.isRequired,
}

NotificationsView.defaultProps = {
  bookingNotifications: [],
  orderNotifications: [],
}
