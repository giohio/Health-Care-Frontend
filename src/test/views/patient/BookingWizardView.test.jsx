/**
 * View tests — BookingWizardView
 *
 * Covers the 3-step wizard: specialty/doctor selection, date/time selection,
 * confirmation step, and the appointmentApi.create call.
 */
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ─── Mock API modules ─────────────────────────────────────────────────────────
vi.mock('../../../api/doctor.js', () => ({
  doctorApi: {
    getSpecialties: vi.fn(),
    getDoctorsBySpecialty: vi.fn(),
    getSchedule: vi.fn(),
  },
}))

vi.mock('../../../api/appointment.js', () => ({
  appointmentApi: {
    getSlots: vi.fn(),
    create: vi.fn(),
  },
}))

import BookingWizardView from '../../../views/patient/BookingWizardView.jsx'
import { doctorApi } from '../../../api/doctor.js'
import { appointmentApi } from '../../../api/appointment.js'

// ─── Test data ────────────────────────────────────────────────────────────────

const PATIENT_USER = { id: 'pat-1', full_name: 'Jane Patient', role: 'patient' }

const SPECIALTIES = [
  { id: 'spec-1', name: 'Cardiology' },
  { id: 'spec-2', name: 'Neurology' },
]

const DOCTORS = [
  { user_id: 'doc-1', full_name: 'Alice Nguyen', title: 'MD', experience_years: 8, average_rating: 4.7 },
  { user_id: 'doc-2', full_name: 'Bob Tran', title: 'MD', experience_years: 5, average_rating: 4.2 },
]

const SLOTS = {
  slots: [
    { start_time: '09:00:00', is_available: true },
    { start_time: '10:00:00', is_available: true },
    { start_time: '11:00:00', is_available: false },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWizard(extraProps = {}) {
  return render(
    <BookingWizardView
      setCurrentView={vi.fn()}
      onSubmitBooking={vi.fn()}
      currentUser={PATIENT_USER}
      {...extraProps}
    />
  )
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

// The slot-loading effect uses setTimeout(fn, 0) to defer showing the loading skeleton.
// In tests, mockResolvedValue resolves as a microtask (before the macrotask timer fires),
// which causes the timer to reset slotsLoading back to true AFTER slots have loaded.
// Fix: make setTimeout(fn, 0) calls synchronous so they fire before the mock resolves.
//
// Slot availability also depends on current time: slots at 09:00/10:00 would be marked
// 'past' if tests run after those hours. Fix: fake Date to midnight so isPast is never true
// (since the component's 'today' won't match the real today from DAYS[] built at load time).
let _originalSetTimeout

beforeEach(() => {
  // Only fake Date (not setTimeout/setInterval) to control slot isPast checks
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2024-01-15T00:30:00.000Z'))

  // Make setTimeout(fn, 0) synchronous so it fires before mockResolvedValue microtasks
  _originalSetTimeout = globalThis.setTimeout
  globalThis.setTimeout = (fn, delay, ...args) => {
    if (delay === 0 || delay === undefined) {
      fn(...args)
      return 0
    }
    return _originalSetTimeout.call(globalThis, fn, delay, ...args)
  }

  doctorApi.getSpecialties.mockResolvedValue(SPECIALTIES)
  doctorApi.getDoctorsBySpecialty.mockResolvedValue(DOCTORS)
  doctorApi.getSchedule.mockResolvedValue([]) // empty → no day restrictions
  appointmentApi.getSlots.mockResolvedValue(SLOTS)
  appointmentApi.create.mockResolvedValue({ id: 'appt-new', status: 'pending' })
})

afterEach(() => {
  globalThis.setTimeout = _originalSetTimeout
  vi.useRealTimers()
  vi.clearAllMocks()
})

// ─── Step 1 — Specialty & Doctor ─────────────────────────────────────────────

describe('Step 1 — Specialty & Doctor', () => {
  it('renders 3-step stepper labels', async () => {
    renderWizard()

    await waitFor(() => expect(doctorApi.getSpecialties).toHaveBeenCalled())

    expect(screen.getByText('Specialty & Doctor')).toBeInTheDocument()
    expect(screen.getByText('Date & Time')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('loads and displays specialties from API', async () => {
    renderWizard()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cardiology/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /neurology/i })).toBeInTheDocument()
    })
  })

  it('loads and displays doctors after specialty is loaded', async () => {
    renderWizard()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dr\. alice nguyen/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dr\. bob tran/i })).toBeInTheDocument()
    })
  })

  it('marks first specialty as selected by default (aria-pressed=true)', async () => {
    renderWizard()

    await waitFor(() => {
      const cardiologyBtn = screen.getByRole('button', { name: /cardiology/i })
      expect(cardiologyBtn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('clicking a specialty changes selection', async () => {
    const user = userEvent.setup()
    renderWizard()

    await waitFor(() => expect(screen.getByRole('button', { name: /neurology/i })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /neurology/i }))

    expect(screen.getByRole('button', { name: /neurology/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /cardiology/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('"Continue to Date & Time" button is enabled when doctor and specialty are selected', async () => {
    renderWizard()

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /continue to date & time/i })
      expect(btn).not.toBeDisabled()
    })
  })

  it('navigates to step 2 when Continue is clicked', async () => {
    const user = userEvent.setup()
    renderWizard()

    await waitFor(() => expect(screen.getByRole('button', { name: /continue to date & time/i })).not.toBeDisabled())

    await user.click(screen.getByRole('button', { name: /continue to date & time/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /review booking/i })).toBeInTheDocument()
    })
  })
})

// ─── Step 2 — Date & Time ─────────────────────────────────────────────────────

describe('Step 2 — Date & Time', () => {
  async function advanceToStep2() {
    const user = userEvent.setup()
    renderWizard()

    await waitFor(() => expect(screen.getByRole('button', { name: /continue to date & time/i })).not.toBeDisabled())
    await user.click(screen.getByRole('button', { name: /continue to date & time/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /review booking/i })).toBeInTheDocument())
    return user
  }

  it('loads time slots from appointmentApi.getSlots', async () => {
    await advanceToStep2()

    await waitFor(() => {
      expect(appointmentApi.getSlots).toHaveBeenCalled()
    })
  })

  it('displays available time slot buttons', async () => {
    await advanceToStep2()

    await waitFor(() => {
      // First 2 slots are available — should appear as clickable buttons
      expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '10:00' })).toBeInTheDocument()
    })
  })

  it('"Review Booking" is disabled when no time slot selected', async () => {
    // Override slots to return nothing available
    appointmentApi.getSlots.mockResolvedValue({ slots: [] })

    await advanceToStep2()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /review booking/i })).toBeDisabled()
    })
  })

  it('navigates to step 3 when Review Booking is clicked with a slot selected', async () => {
    const user = await advanceToStep2()

    await waitFor(() => expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument())

    // Select the first slot if not already selected
    await user.click(screen.getByRole('button', { name: '09:00' }))
    await user.click(screen.getByRole('button', { name: /review booking/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm booking/i })).toBeInTheDocument()
    })
  })
})

// ─── Step 3 — Confirmation ────────────────────────────────────────────────────

describe('Step 3 — Confirmation', () => {
  async function advanceToStep3() {
    const user = userEvent.setup()
    renderWizard()

    // Step 1 → Step 2
    await waitFor(() => expect(screen.getByRole('button', { name: /continue to date & time/i })).not.toBeDisabled())
    await user.click(screen.getByRole('button', { name: /continue to date & time/i }))

    // Step 2: select a slot → Step 3
    await waitFor(() => expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '09:00' }))
    await user.click(screen.getByRole('button', { name: /review booking/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /confirm booking/i })).toBeInTheDocument())
    return user
  }

  it('shows booking summary with doctor, specialty, date, and time', async () => {
    await advanceToStep3()

    expect(screen.getByText('Doctor')).toBeInTheDocument()
    expect(screen.getByText(/dr\. alice nguyen/i)).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('09:00:00')).toBeInTheDocument()
  })

  it('calls appointmentApi.create with correct fields when Confirm Booking is clicked', async () => {
    const onSubmitBooking = vi.fn()
    const user = userEvent.setup()

    render(
      <BookingWizardView
        setCurrentView={vi.fn()}
        onSubmitBooking={onSubmitBooking}
        currentUser={PATIENT_USER}
      />
    )

    // Navigate to step 3
    await waitFor(() => expect(screen.getByRole('button', { name: /continue to date & time/i })).not.toBeDisabled())
    await user.click(screen.getByRole('button', { name: /continue to date & time/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '09:00' }))
    await user.click(screen.getByRole('button', { name: /review booking/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /confirm booking/i })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => {
      expect(appointmentApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          doctor_id: 'doc-1',
          specialty_id: 'spec-1',
          start_time: '09:00:00',
          patient_id: 'pat-1',
        })
      )
    })

    expect(onSubmitBooking).toHaveBeenCalledWith(
      { id: 'appt-new', status: 'pending' },
      undefined // no triageSession
    )
  })

  it('shows error message when appointmentApi.create fails', async () => {
    appointmentApi.create.mockRejectedValue(new Error('Time slot no longer available'))
    const user = await advanceToStep3()

    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => {
      expect(screen.getByText(/time slot no longer available/i)).toBeInTheDocument()
    })
  })

  it('"Change Details" button returns to step 1', async () => {
    const user = await advanceToStep3()

    await user.click(screen.getByRole('button', { name: /change details/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to date & time/i })).toBeInTheDocument()
    })
  })
})

// ─── AI Triage integration ────────────────────────────────────────────────────

describe('AI Triage referral', () => {
  it('pre-selects matching specialty when triageSession.suggested_department is provided', async () => {
    // Override specialties to include Neurology as the match for the triage suggestion
    doctorApi.getSpecialties.mockResolvedValue([
      { id: 'spec-1', name: 'Cardiology' },
      { id: 'spec-n', name: 'Neurology' },
    ])
    doctorApi.getDoctorsBySpecialty.mockResolvedValue(DOCTORS)

    renderWizard({
      triageSession: {
        id: 'triage-1',
        suggested_department: 'Neurology',
        urgency_level: 'low',
      },
    })

    await waitFor(() => {
      const neurologyBtn = screen.getByRole('button', { name: /neurology/i })
      expect(neurologyBtn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('shows AI Recommended Specialty banner when triageSession is present', async () => {
    renderWizard({
      triageSession: { id: 'triage-1', suggested_department: 'Cardiology', urgency_level: 'low' },
    })

    await waitFor(() => {
      expect(screen.getByText('AI Recommended Specialty')).toBeInTheDocument()
    })
  })
})
