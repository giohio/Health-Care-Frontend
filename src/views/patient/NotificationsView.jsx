import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function FlaskConicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.7-2.8 7.9-7 9-4.2-1.1-7-4.3-7-9V6l7-3z" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 17H5a2 2 0 0 1-2-2c0-1.3.8-2.3 1.8-3.3C5.7 10.9 6 9.8 6 8.6a6 6 0 1 1 12 0c0 1.2.3 2.3 1.2 3.1 1 .9 1.8 2 1.8 3.3a2 2 0 0 1-2 2h-4" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CheckCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 13 5 17 10 12" />
      <polyline points="7 13 11 17 23 5" />
    </svg>
  )
}

function BellOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.6 3.1A6 6 0 0 1 18 8.6c0 1.2.3 2.3 1.2 3.1 1 .9 1.8 2 1.8 3.3a2 2 0 0 1-2 2h-8" />
      <path d="M5.4 5.6A6 6 0 0 0 6 8.6c0 1.2-.3 2.3-1.2 3.1-1 .9-1.8 2-1.8 3.3a2 2 0 0 0 2 2h7" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'lab', label: 'Lab Results' },
]

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'lab',
    title: 'New Lab Result Available',
    body: 'Your Full Blood Panel results from Mar 10 are ready. One value requires attention.',
    time: '2 hours ago',
    isRead: false,
    navigateTo: 'lab-results',
  },
  {
    id: 2,
    type: 'lab',
    title: 'New Lab Result Available',
    body: 'Your Lipid Profile results from Mar 10 are ready. LDL levels are above recommended range.',
    time: '2 hours ago',
    isRead: false,
    navigateTo: 'lab-results',
  },
  {
    id: 3,
    type: 'appointment',
    title: 'Appointment Confirmed',
    body: 'Your appointment with Dr. Sarah Chen on Mar 19 at 10:00 AM has been confirmed.',
    time: 'Yesterday',
    isRead: false,
    navigateTo: 'appointments',
  },
  {
    id: 4,
    type: 'appointment',
    title: 'Appointment Reminder',
    body: 'Reminder: You have a consultation with Dr. Marcus Reid tomorrow at 2:30 PM.',
    time: '2 days ago',
    isRead: true,
    navigateTo: 'appointments',
  },
  {
    id: 5,
    type: 'allergy',
    title: 'Allergy Profile Updated',
    body: 'Your allergy file has been reviewed and confirmed by Dr. Sarah Chen before your last visit.',
    time: 'Mar 8, 2025',
    isRead: true,
    navigateTo: 'health-record',
  },
  {
    id: 6,
    type: 'general',
    title: 'Welcome to HealthAI Portal',
    body: 'Your patient profile is complete. You can now book appointments and view your health records.',
    time: 'Mar 1, 2025',
    isRead: true,
    navigateTo: null,
  },
]

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
      icon: CalendarIcon,
    }
  }

  if (type === 'lab') {
    return {
      container: `bg-amber-50 dark:bg-amber-950/50 ${isRead ? 'opacity-60' : ''}`,
      iconClass: 'text-amber-600 dark:text-amber-400',
      icon: FlaskConicalIcon,
    }
  }

  if (type === 'allergy') {
    return {
      container: `bg-rose-50 dark:bg-rose-950/40 ${isRead ? 'opacity-60' : ''}`,
      iconClass: 'text-rose-600 dark:text-rose-400',
      icon: ShieldAlertIcon,
    }
  }

  return {
    container: `bg-slate-100 dark:bg-[#1c1c25] ${isRead ? 'opacity-60' : ''}`,
    iconClass: 'text-slate-500 dark:text-[#70708a]',
    icon: BellIcon,
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
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  useEffect(() => {
    if (orderNotifications.length > 0) {
      setNotifications((prev) => [
        ...orderNotifications,
        ...prev,
      ])
      setOrderNotifications([])
    }
  }, [orderNotifications, setOrderNotifications])

  useEffect(() => {
    if (bookingNotifications.length > 0) {
      setNotifications((prev) => [
        ...bookingNotifications,
        ...prev,
      ])
      setBookingNotifications([])
    }
  }, [bookingNotifications, setBookingNotifications])

  const markAsRead = (id) => {
    const target = notifications.find((n) => n.id === id)

    setNotifications((prev) => prev.map((n) => (
      n.id === id ? { ...n, isRead: true } : n
    )))

    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const filtered = useMemo(() => notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.isRead
    if (activeFilter === 'appointments') return n.type === 'appointment'
    if (activeFilter === 'lab') return n.type === 'lab'
    return true
  }), [activeFilter, notifications])

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
                <span className="inline-flex h-4 w-4 text-emerald-500"><CheckIcon /></span>
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

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#1c1c25]">
            {activeFilter === 'unread' ? (
              <span className="inline-flex h-6 w-6 text-emerald-500 dark:text-emerald-400"><CheckCheckIcon /></span>
            ) : (
              <span className="inline-flex h-6 w-6 text-slate-400 dark:text-[#606070]"><BellOffIcon /></span>
            )}
          </div>
          <p className="mt-1 text-base font-semibold text-slate-700 dark:text-[#c8c8e0]">
            {activeFilter === 'unread' ? "You're all caught up" : 'No notifications here'}
          </p>
          <p className="mt-1.5 text-sm text-slate-400 dark:text-[#606070]">
            {activeFilter === 'unread' ? 'No unread notifications at this time.' : 'Nothing to show for this filter.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((notification, index) => {
            const visuals = getTypeVisuals(notification.type, notification.isRead)
            const Icon = visuals.icon
            const actionLabel = getActionLabel(notification.type)

            return (
              <button
                key={notification.id}
                type="button"
                className={`relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all duration-300 card-hover view-enter ${
                  notification.isRead
                    ? 'border-slate-100 bg-white shadow-none dark:border-[#1c1c25] dark:bg-[#0e0e15]'
                    : 'border-slate-200 bg-white shadow-[0_2px_12px_rgba(99,102,241,0.06)] dark:border-[#252530] dark:bg-[#111118] dark:shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                }`}
                style={{
                  animationDelay: `${Math.min(index * 50, 300)}ms`,
                  animationFillMode: 'both',
                }}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.navigateTo) {
                    setCurrentView(notification.navigateTo)
                  }
                }}
              >
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
                          <span className="inline-flex h-3 w-3"><ArrowRightIcon /></span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </button>
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
