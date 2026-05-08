import { useState, useCallback } from 'react'

/**
 * Manages booking flow state: the list of active bookings,
 * the "confirmed view" booking ID, and booking status updates.
 *
 * @param {Function} addBookingNotification - fn to inject a WS notification
 */
export function useBookingFlow(addBookingNotification) {
  const [bookings, setBookings] = useState([])
  const [activeBookingId, setActiveBookingId] = useState(null)

  const createBooking = useCallback((appt, triageSession) => {
    const bookingWithTriage = triageSession
      ? { ...appt, triage_session_id: triageSession.id, ai_referred: true, urgency_level: triageSession.urgency_level }
      : appt
    setBookings((prev) => [bookingWithTriage, ...prev])
    setActiveBookingId(appt.id)
    return bookingWithTriage
  }, [])

  const updateBookingStatus = useCallback((bookingId, status) => {
    let changedBooking = null

    setBookings((prev) => prev.map((booking) => {
      if (booking.id !== bookingId) return booking
      if (booking.status === status) return booking
      changedBooking = { ...booking, status, updatedAt: Date.now() }
      return changedBooking
    }))

    if (!changedBooking) return

    if (status === 'confirmed') {
      addBookingNotification?.(changedBooking, 'confirmed')
    }
    if (status === 'cancelled') {
      addBookingNotification?.(changedBooking, 'cancelled')
    }
  }, [addBookingNotification])

  const clearBookings = useCallback(() => {
    setBookings([])
    setActiveBookingId(null)
  }, [])

  return {
    bookings,
    activeBookingId,
    setActiveBookingId,
    createBooking,
    updateBookingStatus,
    clearBookings,
  }
}
