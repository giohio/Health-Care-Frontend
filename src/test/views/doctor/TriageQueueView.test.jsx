import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('../../../api/ai.js', () => ({
  getTriageSessions: vi.fn(),
  getTriageSession: vi.fn(),
  confirmTriageSession: vi.fn(),
  referInternalTriageSession: vi.fn(),
}))

vi.mock('../../../api/patient.js', () => ({
  patientApi: {
    getPatientSummary: vi.fn(),
  },
}))

import TriageQueueView from '../../../views/doctor/TriageQueueView.jsx'
import { getTriageSession, getTriageSessions } from '../../../api/ai.js'

const baseSession = {
  id: 'sess-1',
  patient_id: 'pat-1',
  patient_name: 'Nguyen Huu Kien',
  status: 'pending_review',
  suggested_department: 'General Medicine',
  urgency_level: 'Priority',
  created_at: '2026-05-10T08:40:00Z',
  messages: [
    { role: 'user', content: 'I have fever and chills' },
    { role: 'assistant', content: '[R] I recommend General Medicine.' },
  ],
}

function renderDetail(session) {
  getTriageSessions.mockResolvedValue({ sessions: [session], total: 1 })
  getTriageSession.mockResolvedValue(session)

  return render(
    <TriageQueueView
      navigateTo={vi.fn()}
      initialSessionId={session.id}
      onInitialHandled={vi.fn()}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TriageQueueView review actions', () => {
  it('does not show General Medicine referral when AI already suggested General Medicine', async () => {
    renderDetail(baseSession)

    expect(await screen.findByRole('button', { name: /confirm ai suggestion/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /refer to general medicine/i })).not.toBeInTheDocument()
    expect(screen.getByText(/already assigned to general medicine/i)).toBeInTheDocument()
  })

  it('shows General Medicine referral for non-General Medicine suggestions', async () => {
    renderDetail({
      ...baseSession,
      suggested_department: 'Cardiology',
      messages: [
        { role: 'user', content: 'I have chest pain' },
        { role: 'assistant', content: '[R] I recommend Cardiology.' },
      ],
    })

    expect(await screen.findByRole('button', { name: /refer to general medicine/i })).toBeInTheDocument()
  })
})
