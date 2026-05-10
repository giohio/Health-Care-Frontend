import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import PaymentReturnView from '../../../views/patient/PaymentReturnView.jsx'

describe('PaymentReturnView', () => {
  it('does not show the transaction reference id on success', () => {
    render(
      <PaymentReturnView
        status="success"
        txnRef="ba4a71de-a19f-4477-9e40-07495aed4977"
        onViewAppointments={vi.fn()}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
    expect(screen.queryByText(/transaction reference/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ba4a71de/i)).not.toBeInTheDocument()
  })

  it('calls onViewAppointments from the primary success action', async () => {
    const user = userEvent.setup()
    const onViewAppointments = vi.fn()

    render(
      <PaymentReturnView
        status="success"
        onViewAppointments={onViewAppointments}
        onRetry={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /view appointments/i }))

    expect(onViewAppointments).toHaveBeenCalledOnce()
  })
})
