import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import CardiologyPanel from './CardiologyPanel'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../api/ai', () => ({
  analyzeAuscultation: vi.fn(),
}))

vi.mock('../../api/clinical', () => ({
  clinicalApi: {
    createNote: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../shared/AiDisclaimer', () => ({
  default: ({ text }) => <div data-testid="ai-disclaimer">{text}</div>,
}))

import { analyzeAuscultation } from '../../api/ai'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeAudioFile(name = 'heart.wav', type = 'audio/wav', size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type })
}

function makeLargeAudioFile() {
  const file = new File(['x'], 'big.wav', { type: 'audio/wav' })
  Object.defineProperty(file, 'size', { value: 26 * 1024 * 1024 })
  return file
}

function makePdfFile() {
  return new File(['%PDF-1.4'], 'report.pdf', { type: 'application/pdf' })
}

const MOCK_ECG_DATA = {
  orderedBy: 'Dr. Sarah Chen',
  analyzedAt: 'Mar 10, 2025 · 09:22 AM',
  result: 'normal_sinus',
  confidence: 97,
  heartRate: 72,
  rhythm: 'Regular',
  prInterval: '156 ms',
  qrsDuration: '88 ms',
  qtcInterval: '412 ms',
  findings: [
    { parameter: 'Rhythm', value: 'Normal sinus rhythm', status: 'normal' },
    { parameter: 'Heart Rate', value: '72 bpm', status: 'normal' },
  ],
  aiSummary: 'Normal sinus rhythm detected.',
  disclaimer: 'AI-assisted ECG interpretation.',
  modelName: 'CardioNet LSTM v3.0',
  dataset: 'ECG Heartbeat Categorization',
}

const MOCK_HEART_SOUND_RESPONSE = {
  patient_id: 'patient-xyz',
  sound_type: 'heart_sounds',
  department: 'cardiology',
  visual_findings: {
    s1_quality: 'normal',
    s2_quality: 'muffled',
    murmur_present: true,
    murmur_timing: 'systolic',
    extra_sounds: ['none'],
    confidence: 0.82,
  },
  draft_text: 'Systolic murmur detected. Physician review required.',
  confidence: 0.82,
  model_versions: { synthesis: 'GroqLLM' },
  note: 'AI draft — requires physician review and approval.',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPanel(patientId = 'patient-xyz') {
  return render(<CardiologyPanel data={MOCK_ECG_DATA} patientId={patientId} />)
}

async function uploadHeartFile(file) {
  const input = screen.getByTestId('heart-sound-input')
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } })
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CardiologyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── ECG section ─────────────────────────────────────────────────────────────

  it('renders ECG section with data', () => {
    renderPanel()
    expect(screen.getByText('ECG Analysis')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('Normal sinus rhythm')).toBeInTheDocument()
  })

  it('renders heart sound upload zone in idle state', () => {
    renderPanel()
    expect(screen.getByText('Heart Sound Analysis')).toBeInTheDocument()
    expect(screen.getByTestId('heart-sound-input')).toBeInTheDocument()
  })

  // ── Uploading state ─────────────────────────────────────────────────────────

  it('shows spinner while uploading heart sound', async () => {
    analyzeAuscultation.mockReturnValue(new Promise(() => {}))

    renderPanel()
    await uploadHeartFile(makeAudioFile())

    expect(screen.getByRole('status', { name: 'Analyzing heart sounds' })).toBeInTheDocument()
  })

  // ── Done state ──────────────────────────────────────────────────────────────

  it('renders heart sound findings after successful analysis', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_HEART_SOUND_RESPONSE)

    renderPanel()
    await uploadHeartFile(makeAudioFile())

    await waitFor(() => {
      expect(screen.getByDisplayValue('Systolic murmur detected. Physician review required.')).toBeInTheDocument()
    })

    expect(screen.getByText('S2 Quality')).toBeInTheDocument()
    expect(screen.getByText('muffled')).toBeInTheDocument()
    expect(screen.getByText('systolic')).toBeInTheDocument()
  })

  // ── Error: API failure ──────────────────────────────────────────────────────

  it('shows alert with error text when analyzeAuscultation rejects', async () => {
    analyzeAuscultation.mockRejectedValue(new Error('Service unavailable'))

    renderPanel()
    await uploadHeartFile(makeAudioFile())

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toMatch(/Service unavailable/)
    })
  })

  // ── Error: invalid file type ────────────────────────────────────────────────

  it('shows alert for non-audio file and does not call API', async () => {
    renderPanel()
    await uploadHeartFile(makePdfFile())

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(/audio file/i)
    expect(analyzeAuscultation).not.toHaveBeenCalled()
  })

  // ── Error: file too large ────────────────────────────────────────────────────

  it('shows alert when heart sound file exceeds 25 MB', async () => {
    renderPanel()
    await uploadHeartFile(makeLargeAudioFile())

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(/25 MB/i)
    expect(analyzeAuscultation).not.toHaveBeenCalled()
  })

  // ── Correct params ──────────────────────────────────────────────────────────

  it('calls analyzeAuscultation with correct heart sound params', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_HEART_SOUND_RESPONSE)

    renderPanel('patient-xyz')
    const file = makeAudioFile('cardiac.wav')
    await uploadHeartFile(file)

    await waitFor(() => {
      expect(analyzeAuscultation).toHaveBeenCalledWith({
        file,
        patientId: 'patient-xyz',
        soundType: 'heart_sounds',
        department: 'cardiology',
        language: 'vi',
      })
    })
  })

  it('handles MP3 heart sound files correctly', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_HEART_SOUND_RESPONSE)

    renderPanel('patient-789')
    const file = makeAudioFile('heartbeat.mp3', 'audio/mpeg')
    await uploadHeartFile(file)

    await waitFor(() => {
      expect(analyzeAuscultation).toHaveBeenCalledWith({
        file,
        patientId: 'patient-789',
        soundType: 'heart_sounds',
        department: 'cardiology',
        language: 'vi',
      })
    })
    expect(screen.getByDisplayValue('Systolic murmur detected. Physician review required.')).toBeInTheDocument()
  })
})
