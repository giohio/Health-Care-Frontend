/**
 * View tests — NotificationsView
 *
 * Covers: initial load, filter tabs, markAsRead on click,
 * markAllAsRead button, and type-based filtering.
 */
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ─── Mock API module ──────────────────────────────────────────────────────────
vi.mock('../../../api/notification.js', () => ({
  notificationApi: {
    getAll: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    getUnreadCount: vi.fn(),
  },
}))

import NotificationsView from '../../../views/patient/NotificationsView.jsx'
import { notificationApi } from '../../../api/notification.js'

// ─── Test data (mimics raw API notification objects) ──────────────────────────

const makeApiNotif = (overrides = {}) => ({
  id: 'notif-1',
  event_type: 'appointment_confirmed',
  title: 'Appointment Confirmed',
  body: 'Your appointment has been confirmed.',
  is_read: false,
  created_at: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
  ...overrides,
})

// ─── Default props ────────────────────────────────────────────────────────────

function makeDefaultProps(overrides = {}) {
  return {
    setCurrentView: vi.fn(),
    unreadCount: 0,
    setUnreadCount: vi.fn(),
    orderNotifications: [],
    setOrderNotifications: vi.fn(),
    bookingNotifications: [],
    setBookingNotifications: vi.fn(),
    ...overrides,
  }
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  notificationApi.getAll.mockResolvedValue([])
  notificationApi.markRead.mockResolvedValue({ success: true })
  notificationApi.markAllRead.mockResolvedValue({ success: true })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Initial load ─────────────────────────────────────────────────────────────

describe('initial load', () => {
  it('calls notificationApi.getAll(50, 0) on mount', async () => {
    render(<NotificationsView {...makeDefaultProps()} />)

    await waitFor(() => {
      expect(notificationApi.getAll).toHaveBeenCalledWith(50, 0)
    })
  })

  it('renders notifications returned from API', async () => {
    const notif = makeApiNotif({ title: 'Your Appointment Was Confirmed' })
    notificationApi.getAll.mockResolvedValue([notif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 1 })} />)

    await waitFor(() => {
      expect(screen.getByText('Your Appointment Was Confirmed')).toBeInTheDocument()
    })
  })

  it('handles API response as {notifications: [...]} shape', async () => {
    const notif = makeApiNotif({ title: 'Lab Result Ready', event_type: 'lab_result_published' })
    notificationApi.getAll.mockResolvedValue({ notifications: [notif], unread_count: 1 })

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 1 })} />)

    await waitFor(() => {
      expect(screen.getByText('Lab Result Ready')).toBeInTheDocument()
    })
  })

  it('shows "No notifications here" when list is empty', async () => {
    notificationApi.getAll.mockResolvedValue([])

    render(<NotificationsView {...makeDefaultProps()} />)

    await waitFor(() => {
      expect(screen.getByText('No notifications here')).toBeInTheDocument()
    })
  })
})

// ─── Filter tabs ──────────────────────────────────────────────────────────────

describe('filter tabs', () => {
  it('renders All, Unread, Appointments, Lab Results filter tabs', async () => {
    render(<NotificationsView {...makeDefaultProps()} />)

    await waitFor(() => expect(notificationApi.getAll).toHaveBeenCalled())

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^unread/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^lab results$/i })).toBeInTheDocument()
  })

  it('filters to only appointment notifications when "Appointments" tab is active', async () => {
    const user = userEvent.setup()

    const apptNotif = makeApiNotif({
      id: 'n-1', event_type: 'appointment_confirmed', title: 'Appt Confirmed',
    })
    const labNotif = makeApiNotif({
      id: 'n-2', event_type: 'lab_result_published', title: 'Lab Ready',
    })
    notificationApi.getAll.mockResolvedValue([apptNotif, labNotif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 2 })} />)

    await waitFor(() => {
      expect(screen.getByText('Appt Confirmed')).toBeInTheDocument()
      expect(screen.getByText('Lab Ready')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^appointments$/i }))

    expect(screen.getByText('Appt Confirmed')).toBeInTheDocument()
    expect(screen.queryByText('Lab Ready')).not.toBeInTheDocument()
  })

  it('filters to only lab notifications when "Lab Results" tab is active', async () => {
    const user = userEvent.setup()

    const apptNotif = makeApiNotif({
      id: 'n-3', event_type: 'appointment_confirmed', title: 'Appt Confirmed',
    })
    const labNotif = makeApiNotif({
      id: 'n-4', event_type: 'lab_result_published', title: 'Lab Ready',
    })
    notificationApi.getAll.mockResolvedValue([apptNotif, labNotif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 2 })} />)

    await waitFor(() => expect(screen.getByText('Lab Ready')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^lab results$/i }))

    expect(screen.queryByText('Appt Confirmed')).not.toBeInTheDocument()
    expect(screen.getByText('Lab Ready')).toBeInTheDocument()
  })

  it('filters to only unread notifications when "Unread" tab is active', async () => {
    const user = userEvent.setup()

    const unread = makeApiNotif({ id: 'n-5', title: 'New Appointment', is_read: false })
    const read = makeApiNotif({ id: 'n-6', title: 'Old Lab Result', is_read: true })
    notificationApi.getAll.mockResolvedValue([unread, read])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 1 })} />)

    await waitFor(() => expect(screen.getByText('New Appointment')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^unread/i }))

    expect(screen.getByText('New Appointment')).toBeInTheDocument()
    expect(screen.queryByText('Old Lab Result')).not.toBeInTheDocument()
  })
})

// ─── markAsRead ────────────────────────────────────────────────────────────────

describe('markAsRead', () => {
  it('calls notificationApi.markRead when an unread notification is clicked', async () => {
    const user = userEvent.setup()
    const notif = makeApiNotif({ id: 'notif-click', title: 'Click Me', is_read: false })
    notificationApi.getAll.mockResolvedValue([notif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 1 })} />)

    await waitFor(() => expect(screen.getByText('Click Me')).toBeInTheDocument())

    // The full-card button has aria-label equal to the notification title
    const cardBtn = screen.getByRole('button', { name: /click me/i })
    await user.click(cardBtn)

    await waitFor(() => {
      expect(notificationApi.markRead).toHaveBeenCalledWith('notif-click')
    })
  })

  it('does not call markRead when notification is already read', async () => {
    const user = userEvent.setup()
    const notif = makeApiNotif({ id: 'notif-read', title: 'Already Read', is_read: true })
    notificationApi.getAll.mockResolvedValue([notif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 0 })} />)

    await waitFor(() => expect(screen.getByText('Already Read')).toBeInTheDocument())

    const cardBtn = screen.getByRole('button', { name: /already read/i })
    await user.click(cardBtn)

    await waitFor(() => expect(notificationApi.getAll).toHaveBeenCalled())
    expect(notificationApi.markRead).not.toHaveBeenCalled()
  })
})

// ─── markAllAsRead ─────────────────────────────────────────────────────────────

describe('markAllAsRead', () => {
  it('shows "Mark all as read" button only when unreadCount > 0', async () => {
    const { rerender } = render(<NotificationsView {...makeDefaultProps({ unreadCount: 0 })} />)

    await waitFor(() => expect(notificationApi.getAll).toHaveBeenCalled())

    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument()

    rerender(<NotificationsView {...makeDefaultProps({ unreadCount: 3 })} />)

    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument()
  })

  it('calls notificationApi.markAllRead when "Mark all as read" is clicked', async () => {
    const user = userEvent.setup()
    const notif = makeApiNotif({ id: 'notif-all', title: 'Test Notif', is_read: false })
    notificationApi.getAll.mockResolvedValue([notif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 1 })} />)

    await waitFor(() => expect(screen.getByText('Test Notif')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /mark all as read/i }))

    await waitFor(() => {
      expect(notificationApi.markAllRead).toHaveBeenCalled()
    })
  })

  it('calls setUnreadCount(0) after markAllAsRead', async () => {
    const user = userEvent.setup()
    const setUnreadCount = vi.fn()
    const notif = makeApiNotif({ id: 'notif-clear', title: 'Clear Me', is_read: false })
    notificationApi.getAll.mockResolvedValue([notif])

    render(<NotificationsView {...makeDefaultProps({ unreadCount: 2, setUnreadCount })} />)

    await waitFor(() => expect(screen.getByText('Clear Me')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /mark all as read/i }))

    await waitFor(() => {
      expect(setUnreadCount).toHaveBeenCalledWith(0)
    })
  })
})
