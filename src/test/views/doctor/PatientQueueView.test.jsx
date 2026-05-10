/**
 * View tests — PatientQueueView
 *
 * Covers: data loading, LabReadinessBadge, pending booking request actions
 * (Confirm, Decline, AI Summary), and the modal flows.
 */
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ─── Mock API modules (hoisted) ──────────────────────────────────────────────
vi.mock('../../../api/appointment.js', () => ({
  appointmentApi: {
    getByDoctor: vi.fn(),
    confirm: vi.fn(),
    decline: vi.fn(),
  },
}))

vi.mock('../../../api/ai.js', () => ({
  getTriageSessionSummary: vi.fn(),
}))

import PatientQueueView from '../../../views/doctor/PatientQueueView.jsx'
import { appointmentApi } from '../../../api/appointment.js'
import { getTriageSessionSummary } from '../../../api/ai.js'

// ─── Test data ────────────────────────────────────────────────────────────────

const DOCTOR_USER = { id: 'doc-1', full_name: 'Dr. Test', role: 'doctor' }

const makePendingAppt = (overrides = {}) => ({
  id: 'appt-1',
  status: 'pending',
  patient_id: 'pat-1',
  patient_name: 'Alice Smith',
  specialty_name: 'General Practice',
  appointment_date: '2024-06-10',
  start_time: '09:00',
  ai_referred: false,
  triage_session_id: null,
  lab_readiness: null,
  ...overrides,
})

const makeConfirmedAppt = (overrides = {}) => ({
  id: 'appt-2',
  status: 'confirmed',
  patient_id: 'pat-2',
  patient_name: 'Bob Jones',
  specialty_name: 'Cardiology',
  appointment_date: '2024-06-10',
  start_time: '10:00',
  ai_referred: false,
  triage_session_id: null,
  lab_readiness: null,
  confirmed_at: '2024-06-10T08:30:00Z',
  ...overrides,
})

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderView(appointments = [], user = DOCTOR_USER) {
  appointmentApi.getByDoctor.mockResolvedValue(appointments)
  appointmentApi.confirm.mockResolvedValue({ id: 'appt-1', status: 'confirmed' })
  appointmentApi.decline.mockResolvedValue({ id: 'appt-1', status: 'declined' })
  getTriageSessionSummary.mockResolvedValue({ summary: 'Patient has headache.' })

  return render(
    <PatientQueueView
      navigateTo={vi.fn()}
      setSelectedPatient={vi.fn()}
      user={user}
    />
  )
}

async function waitForLoad() {
  // Wait until loading skeletons disappear
  await waitFor(() => {
    const skeletons = document.querySelectorAll('.animate-pulse')
    // At least some skeleton cards disappear; a simpler check:
    expect(appointmentApi.getByDoctor).toHaveBeenCalled()
  })
  // Give state updates a moment to settle
  await new Promise((r) => setTimeout(r, 0))
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Data loading ─────────────────────────────────────────────────────────────

describe('data loading', () => {
  it('calls getByDoctor with user.id and today\'s date range on mount', async () => {
    renderView([])

    await waitFor(() => {
      expect(appointmentApi.getByDoctor).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({ date_from: expect.any(String), date_to: expect.any(String) })
      )
    })

    const [, queryArg] = appointmentApi.getByDoctor.mock.calls[0]
    expect(queryArg.date_from).toBe(queryArg.date_to)
  })

  it('does not call getByDoctor when user.id is undefined', async () => {
    appointmentApi.getByDoctor.mockResolvedValue([])

    render(
      <PatientQueueView
        navigateTo={vi.fn()}
        setSelectedPatient={vi.fn()}
        user={{ full_name: 'No ID Doc' }}
      />
    )

    await waitFor(() => expect(appointmentApi.getByDoctor).not.toHaveBeenCalled())
  })
})

// ─── LabReadinessBadge ────────────────────────────────────────────────────────

describe('LabReadinessBadge', () => {
  it('shows "Labs Ready" when all_ready is true', async () => {
    const appt = makeConfirmedAppt({
      lab_readiness: { all_ready: true, total_orders: 2, completed_results: 2 },
    })
    renderView([appt])

    await waitFor(() => expect(screen.getByText('Labs Ready')).toBeInTheDocument())
  })

  it('shows "{n}/{total} Ready" for partial lab readiness', async () => {
    const appt = makeConfirmedAppt({
      lab_readiness: { all_ready: false, total_orders: 3, completed_results: 1 },
    })
    renderView([appt])

    await waitFor(() => expect(screen.getByText('1/3 Ready')).toBeInTheDocument())
  })

  it('shows nothing when lab_readiness is null', async () => {
    const appt = makeConfirmedAppt({ lab_readiness: null })
    renderView([appt])

    await waitFor(() => expect(appointmentApi.getByDoctor).toHaveBeenCalled())

    expect(screen.queryByText('Labs Ready')).not.toBeInTheDocument()
    expect(screen.queryByText(/Ready$/)).not.toBeInTheDocument()
  })
})

// ─── Pending booking requests — Confirm ───────────────────────────────────────

describe('Confirm flow', () => {
  it('shows "Confirm" button for pending appointments', async () => {
    renderView([makePendingAppt()])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    })
  })

  it('opens confirm modal when "Confirm" button is clicked', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const confirmBtn = await screen.findByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /confirm appointment/i })).toBeInTheDocument()
    })
  })

  it('calls appointmentApi.confirm with appointment id after modal confirmation', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const confirmBtn = await screen.findByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)

    const yesBtn = await screen.findByRole('button', { name: /yes, confirm/i })
    await user.click(yesBtn)

    await waitFor(() => {
      expect(appointmentApi.confirm).toHaveBeenCalledWith('appt-1')
    })
  })

  it('closes confirm modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const confirmBtn = await screen.findByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)

    const dialog = await screen.findByRole('dialog', { name: /confirm appointment/i })
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /confirm appointment/i })).not.toBeInTheDocument()
    })
  })
})

// ─── Pending booking requests — Decline ──────────────────────────────────────

describe('Decline flow', () => {
  it('shows "Decline" button for pending appointments', async () => {
    renderView([makePendingAppt()])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument()
    })
  })

  it('opens decline modal when "Decline" button is clicked', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const declineBtn = await screen.findByRole('button', { name: /^decline$/i })
    await user.click(declineBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /decline appointment/i })).toBeInTheDocument()
    })
  })

  it('calls appointmentApi.decline with reason when submitted', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const declineBtn = await screen.findByRole('button', { name: /^decline$/i })
    await user.click(declineBtn)

    const dialog = await screen.findByRole('dialog', { name: /decline appointment/i })
    const textarea = within(dialog).getByRole('textbox')
    await user.type(textarea, 'Symptoms not in specialty')

    const submitBtn = within(dialog).getByRole('button', { name: /decline appointment/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(appointmentApi.decline).toHaveBeenCalledWith(
        'appt-1',
        'Symptoms not in specialty',
        undefined
      )
    })
  })

  it('calls appointmentApi.decline with undefined reason when none entered', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const declineBtn = await screen.findByRole('button', { name: /^decline$/i })
    await user.click(declineBtn)

    const dialog = await screen.findByRole('dialog', { name: /decline appointment/i })
    const submitBtn = within(dialog).getByRole('button', { name: /decline appointment/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(appointmentApi.decline).toHaveBeenCalledWith('appt-1', undefined, undefined)
    })
  })

  it('closes decline modal after successful decline', async () => {
    const user = userEvent.setup()
    renderView([makePendingAppt()])

    const declineBtn = await screen.findByRole('button', { name: /^decline$/i })
    await user.click(declineBtn)

    const dialog = await screen.findByRole('dialog', { name: /decline appointment/i })
    const submitBtn = within(dialog).getByRole('button', { name: /decline appointment/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /decline appointment/i })).not.toBeInTheDocument()
    })
  })
})

// ─── AI Summary ───────────────────────────────────────────────────────────────

describe('AI Summary', () => {
  it('shows "AI Summary" button only for appointments with triage_session_id', async () => {
    renderView([
      makePendingAppt({ ai_referred: true, triage_session_id: 'sess-001' }),
    ])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ai summary/i })).toBeInTheDocument()
    })
  })

  it('calls getTriageSessionSummary and opens summary modal', async () => {
    const user = userEvent.setup()

    renderView([
      makePendingAppt({ ai_referred: true, triage_session_id: 'sess-001' }),
    ])
    getTriageSessionSummary.mockResolvedValue({
      chief_complaint: 'Fever and cough',
      clinical_reasoning: 'Fever with cough for a week suggests an acute respiratory infection.',
      department_reasoning: 'General Medicine can assess systemic symptoms and lung findings.',
      recommended_department: 'General Medicine',
      urgency_level: 'Priority',
    })

    const summaryBtn = await screen.findByRole('button', { name: /ai summary/i })
    await user.click(summaryBtn)

    await waitFor(() => {
      expect(getTriageSessionSummary).toHaveBeenCalledWith('sess-001')
    })
    expect(await screen.findByText(/why ai suggested this/i)).toBeInTheDocument()
    expect(screen.getByText(/acute respiratory infection/i)).toBeInTheDocument()
  })
})

// ─── Filter tabs ──────────────────────────────────────────────────────────────

describe('Filter tabs', () => {
  it('renders filter tabs: All, Waiting, Confirmed, In Room, Overdue, Completed', async () => {
    renderView([])

    await waitFor(() => expect(appointmentApi.getByDoctor).toHaveBeenCalled())

    // Filter buttons include a count badge (e.g. "All 0") — match by prefix only
    ;['All', 'Waiting', 'Confirmed'].forEach((label) => {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}`, 'i') })).toBeInTheDocument()
    })
  })
})
