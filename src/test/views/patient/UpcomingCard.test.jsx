import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import UpcomingCard from '../../../views/patient/AppointmentsView/UpcomingCard.jsx'

vi.mock('../../../api/payment.js', () => ({
  paymentApi: {
    initiatePayment: vi.fn(),
  },
}))

const baseAppointment = {
  id: 'appt-1',
  doctor_name: 'Doctor',
  specialty_name: 'General Medicine',
  appointment_date: '2026-05-14',
  start_time: '07:30:00',
  end_time: '08:00:00',
}

function renderCard(appt) {
  return render(
    <UpcomingCard
      appt={{ ...baseAppointment, ...appt }}
      onReschedule={vi.fn()}
      onCancel={vi.fn()}
    />
  )
}

describe('UpcomingCard', () => {
  it('does not show Pay Now for a paid appointment waiting for confirmation', () => {
    renderCard({
      status: 'pending',
      effectiveStatus: 'pending',
      payment_status: 'paid',
    })

    expect(screen.getByText('Pending Confirmation')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pay now/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reschedule/i })).toBeInTheDocument()
  })

  it('shows Pay Now only when the effective status is pending_payment and payment is not paid', () => {
    renderCard({
      status: 'pending_payment',
      effectiveStatus: 'pending_payment',
      payment_status: 'processing',
    })

    expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument()
  })
})
