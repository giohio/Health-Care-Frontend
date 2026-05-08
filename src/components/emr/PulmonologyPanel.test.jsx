import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import PulmonologyPanel from './PulmonologyPanel'

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

// Import the mocked function after vi.mock
import { analyzeAuscultation } from '../../api/ai'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeAudioFile(name = 'test.wav', type = 'audio/wav', size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type })
}

function makeLargeAudioFile() {
  // Simulate 26 MB file via size property override
  const file = new File(['x'], 'big.wav', { type: 'audio/wav' })
  Object.defineProperty(file, 'size', { value: 26 * 1024 * 1024 })
  return file
}

function makePdfFile() {
  return new File(['%PDF-1.4'], 'report.pdf', { type: 'application/pdf' })
}

const MOCK_API_RESPONSE = {
  patient_id: 'patient-xyz',
  sound_type: 'lung_sounds',
  department: 'respiratory',
  visual_findings: {
    abnormal_sounds: ['wheeze'],
    confidence: 0.88,
    distribution: 'bilateral',
  },
  draft_text: 'Bilateral expiratory wheezing detected.',
  confidence: 0.88,
  model_versions: { synthesis: 'GroqLLM' },
  note: 'AI draft — requires physician review and approval.',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPanel(patientId = 'patient-xyz') {
  return render(<PulmonologyPanel patientId={patientId} />)
}

async function uploadFile(file) {
  const input = screen.getByTestId('audio-file-input')
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } })
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PulmonologyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Idle state ──────────────────────────────────────────────────────────────

  it('renders upload zone with file input in idle state', () => {
    renderPanel()
    expect(screen.getByText('Respiratory Sound Analysis')).toBeInTheDocument()
    expect(screen.getByTestId('audio-file-input')).toBeInTheDocument()
    expect(screen.getByText(/Drop audio file here/)).toBeInTheDocument()
  })

  // ── Uploading state ─────────────────────────────────────────────────────────

  it('shows spinner and filename while uploading', async () => {
    // Never resolves during this test
    analyzeAuscultation.mockReturnValue(new Promise(() => {}))

    renderPanel()
    await uploadFile(makeAudioFile('recording.wav'))

    expect(screen.getByRole('status', { name: 'Analyzing audio' })).toBeInTheDocument()
    expect(screen.getByText(/Analyzing/)).toBeInTheDocument()
    expect(screen.getByText('recording.wav')).toBeInTheDocument()
  })

  // ── Done state ──────────────────────────────────────────────────────────────

  it('renders result panel with findings after successful analysis', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_API_RESPONSE)

    renderPanel()
    await uploadFile(makeAudioFile())

    await waitFor(() => {
      expect(screen.getByText('Auscultation Findings')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Bilateral expiratory wheezing detected.')).toBeInTheDocument()
    expect(screen.getByTestId('ai-disclaimer')).toBeInTheDocument()
    expect(screen.getByText('New recording')).toBeInTheDocument()
  })

  // ── Error: invalid file type ────────────────────────────────────────────────

  it('shows alert for non-audio file type and does not call API', async () => {
    renderPanel()
    await uploadFile(makePdfFile())

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert.textContent).toMatch(/audio file/i)
    expect(analyzeAuscultation).not.toHaveBeenCalled()
  })

  // ── Error: file too large ────────────────────────────────────────────────────

  it('shows alert when file exceeds 25 MB and does not call API', async () => {
    renderPanel()
    await uploadFile(makeLargeAudioFile())

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert.textContent).toMatch(/25 MB/i)
    expect(analyzeAuscultation).not.toHaveBeenCalled()
  })

  // ── Error: API failure ──────────────────────────────────────────────────────

  it('shows alert with API error message when analyzeAuscultation rejects', async () => {
    analyzeAuscultation.mockRejectedValue(new Error('Server error 500'))

    renderPanel()
    await uploadFile(makeAudioFile())

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toMatch(/Server error 500/)
    })
  })

  // ── Retry flow ──────────────────────────────────────────────────────────────

  it('allows retry: first fails, second succeeds, shows result', async () => {
    analyzeAuscultation
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(MOCK_API_RESPONSE)

    renderPanel()

    // First attempt — fails
    await uploadFile(makeAudioFile())
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Second attempt — succeeds
    await uploadFile(makeAudioFile())
    await waitFor(() => {
      expect(screen.getByText('Auscultation Findings')).toBeInTheDocument()
    })
  })

  // ── Reset (New recording button) ────────────────────────────────────────────

  it('resets to upload zone when "New recording" button is clicked', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_API_RESPONSE)

    renderPanel()
    await uploadFile(makeAudioFile())

    await waitFor(() => {
      expect(screen.getByText('New recording')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('New recording'))
    })

    expect(screen.getByTestId('audio-file-input')).toBeInTheDocument()
    expect(screen.queryByText('Auscultation Findings')).not.toBeInTheDocument()
  })

  // ── Correct params ──────────────────────────────────────────────────────────

  it('calls analyzeAuscultation with correct params', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_API_RESPONSE)

    renderPanel('patient-xyz')
    const file = makeAudioFile('lungs.wav')
    await uploadFile(file)

    await waitFor(() => {
      expect(analyzeAuscultation).toHaveBeenCalledWith({
        file,
        patientId: 'patient-xyz',
        soundType: 'lung_sounds',
        department: 'respiratory',
        language: 'vi',
      })
    })
  })

  it('handles MP3 files correctly', async () => {
    analyzeAuscultation.mockResolvedValue(MOCK_API_RESPONSE)

    renderPanel('patient-abc')
    const file = makeAudioFile('recording.mp3', 'audio/mpeg')
    await uploadFile(file)

    await waitFor(() => {
      expect(analyzeAuscultation).toHaveBeenCalledWith({
        file,
        patientId: 'patient-abc',
        soundType: 'lung_sounds',
        department: 'respiratory',
        language: 'vi',
      })
    })
    expect(screen.getByText('Auscultation Findings')).toBeInTheDocument()
  })
})
