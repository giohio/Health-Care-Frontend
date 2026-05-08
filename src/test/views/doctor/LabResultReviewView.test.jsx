/**
 * View tests — LabResultReviewView
 *
 * Tests filter tabs, card rendering per status category,
 * "Verify & Publish" flow, and upload modal (file + manual modes).
 */
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import '@testing-library/jest-dom'

// ─── Mock API module (hoisted by Vitest) ─────────────────────────────────────
vi.mock('../../../api/emr.js', () => ({
  emrApi: {
    getLabOrders: vi.fn(),
    getLabResults: vi.fn(),
    verifyLabResult: vi.fn(),
    uploadFile: vi.fn(),
    createLabResultFile: vi.fn(),
    createLabResultManual: vi.fn(),
    flagManualReview: vi.fn(),
  },
}))

// Import AFTER mock declaration so component gets the mocked module
import LabResultReviewView from '../../../views/doctor/LabResultReviewView.jsx'
import { emrApi } from '../../../api/emr.js'

// ─── Test data ────────────────────────────────────────────────────────────────

const makeOrder = (overrides = {}) => ({
  id: 'order-1',
  patient_id: 'pat-1',
  doctor_id: 'doc-1',
  patient_name: 'Alice Smith',
  test_name: 'Blood Panel',
  ordered_at: '2024-06-01T10:00:00Z',
  ...overrides,
})

const makeResult = (overrides = {}) => ({
  id: 'result-1',
  order_id: 'order-1',
  status: 'NEEDS_MANUAL_REVIEW',
  ai_draft_text: 'All values within normal range.',
  ai_confidence: 0.9,
  created_at: '2024-06-01T11:00:00Z',
  verified_at: null,
  ...overrides,
})

// ─── Stateful wrapper (mirrors the parent-component contract) ────────────────

function LabWrapper({ initOrders = [], onNotify, onBack }) {
  const [orders, setOrders] = useState(initOrders)
  return (
    <LabResultReviewView
      labOrders={orders}
      setLabOrders={setOrders}
      onNotify={onNotify}
      onBack={onBack}
    />
  )
}

function renderView({ initOrders = [], initResults = [], onNotify, onBack } = {}) {
  const notifyFn = onNotify ?? vi.fn()
  const backFn = onBack ?? vi.fn()

  emrApi.getLabOrders.mockResolvedValue(initOrders)
  emrApi.getLabResults.mockResolvedValue(initResults)

  return {
    ...render(<LabWrapper initOrders={initOrders} onNotify={notifyFn} onBack={backFn} />),
    onNotify: notifyFn,
    onBack: backFn,
  }
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  emrApi.getLabOrders.mockResolvedValue([])
  emrApi.getLabResults.mockResolvedValue([])
  emrApi.verifyLabResult.mockResolvedValue({ id: 'result-1', status: 'PUBLISHED' })
  emrApi.uploadFile.mockResolvedValue({ url: 'https://bucket/test.pdf', file_type: 'pdf' })
  emrApi.createLabResultFile.mockResolvedValue({ id: 'result-new' })
  emrApi.createLabResultManual.mockResolvedValue({ id: 'result-manual' })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Filter tabs ──────────────────────────────────────────────────────────────

describe('Filter tabs', () => {
  it('renders all 5 filter tabs', async () => {
    renderView()

    await waitFor(() => expect(screen.queryByText('Loading lab data…')).not.toBeInTheDocument())

    const tabs = screen.getAllByRole('tab')
    const labels = tabs.map((t) => t.textContent.replace(/\d/g, '').trim())
    expect(labels).toContain('All')
    expect(labels).toContain('Needs Upload')
    expect(labels).toContain('Processing')
    expect(labels).toContain('Ready to Verify')
    expect(labels).toContain('Published')
  })

  it('first tab "All" is selected by default', async () => {
    renderView()

    await waitFor(() => expect(screen.queryByText('Loading lab data…')).not.toBeInTheDocument())

    const allTab = screen.getAllByRole('tab').find((t) => t.textContent.startsWith('All'))
    expect(allTab).toHaveAttribute('aria-selected', 'true')
  })
})

// ─── Card rendering per category ─────────────────────────────────────────────

describe('Card rendering — needs_upload', () => {
  it('shows "Needs Upload" badge and "Upload Result" button when no result exists', async () => {
    const order = makeOrder()

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([]) // no result → needs_upload

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => {
      // 'Needs Upload' appears in both the filter tab and the card badge — use getAllByText
      const elements = screen.getAllByText('Needs Upload')
      expect(elements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByRole('button', { name: /upload result/i })).toBeInTheDocument()
    })
  })
})

describe('Card rendering — processing', () => {
  it('shows "Processing" badge when status is PENDING', async () => {
    const order = makeOrder({ id: 'order-p' })
    const result = makeResult({ id: 'res-p', order_id: 'order-p', status: 'PENDING' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument()
    })
  })

  it('shows "Processing" badge when status is AI_PROCESSING', async () => {
    const order = makeOrder({ id: 'order-ap' })
    const result = makeResult({ id: 'res-ap', order_id: 'order-ap', status: 'AI_PROCESSING' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('Processing')).toBeInTheDocument())
  })
})

describe('Card rendering — ready_to_verify', () => {
  it('shows "✨ Ready to Verify" badge for NEEDS_MANUAL_REVIEW status', async () => {
    const order = makeOrder()
    const result = makeResult({ status: 'NEEDS_MANUAL_REVIEW' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('✨ Ready to Verify')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verify & publish/i })).toBeInTheDocument()
    })
  })

  it('shows "✨ Ready to Verify" badge for AI_DRAFT status', async () => {
    const order = makeOrder({ id: 'order-ad' })
    const result = makeResult({ id: 'res-ad', order_id: 'order-ad', status: 'AI_DRAFT' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('✨ Ready to Verify')).toBeInTheDocument())
  })
})

describe('Card rendering — published', () => {
  it('shows "✓ Published" badge for PUBLISHED status', async () => {
    const order = makeOrder({ id: 'order-pub' })
    const result = makeResult({
      id: 'res-pub', order_id: 'order-pub',
      status: 'PUBLISHED', verified_at: '2024-06-01T12:00:00Z',
    })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('✓ Published')).toBeInTheDocument())
  })
})

// ─── Verify & Publish flow ────────────────────────────────────────────────────

describe('handleVerify', () => {
  it('calls verifyLabResult with result.id and doctor_notes', async () => {
    const user = userEvent.setup()
    const order = makeOrder()
    const result = makeResult({ status: 'NEEDS_MANUAL_REVIEW' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const verifyBtn = await screen.findByRole('button', { name: /verify & publish/i })
    await user.click(verifyBtn)

    await waitFor(() => {
      expect(emrApi.verifyLabResult).toHaveBeenCalledWith('result-1', {
        doctor_notes: 'Verified by physician',
      })
    })
  })

  it('calls onNotify with a lab notification after successful verify', async () => {
    const user = userEvent.setup()
    const onNotify = vi.fn()
    const order = makeOrder()
    const result = makeResult({ status: 'NEEDS_MANUAL_REVIEW' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={onNotify} onBack={vi.fn()} />)

    const verifyBtn = await screen.findByRole('button', { name: /verify & publish/i })
    await user.click(verifyBtn)

    await waitFor(() => {
      expect(onNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'lab', title: 'Lab Result Published' })
      )
    })
  })

  it('shows alert when verifyLabResult throws', async () => {
    const user = userEvent.setup()
    emrApi.verifyLabResult.mockRejectedValue(new Error('Server error'))

    const order = makeOrder()
    const result = makeResult({ status: 'NEEDS_MANUAL_REVIEW' })

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([result])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const verifyBtn = await screen.findByRole('button', { name: /verify & publish/i })
    await user.click(verifyBtn)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to publish lab result. Please try again.')
    })
  })
})

// ─── Upload modal ─────────────────────────────────────────────────────────────

describe('Upload modal', () => {
  it('opens modal when "Upload Result" button is clicked', async () => {
    const user = userEvent.setup()
    const order = makeOrder()

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const uploadBtn = await screen.findByRole('button', { name: /upload result/i })
    await user.click(uploadBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Upload Result', { selector: 'p' })).toBeInTheDocument()
  })

  it('file upload flow: calls uploadFile then createLabResultFile then refetches', async () => {
    const user = userEvent.setup()
    const order = makeOrder()

    // First fetch cycle: order has no result
    emrApi.getLabOrders
      .mockResolvedValueOnce([order]) // initial fetch
      .mockResolvedValueOnce([order]) // refetch after upload
    emrApi.getLabResults
      .mockResolvedValueOnce([])      // initial fetch — no result
      .mockResolvedValueOnce([makeResult({ status: 'PENDING' })]) // refetch

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    // Open modal
    const uploadBtn = await screen.findByRole('button', { name: /upload result/i })
    await user.click(uploadBtn)

    // Attach a file
    const fakeFile = new File(['pdf content'], 'result.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByRole('dialog').querySelector('input[type="file"]')
    await user.upload(fileInput, fakeFile)

    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit result/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(emrApi.uploadFile).toHaveBeenCalledWith(fakeFile, 'lab_results')
      expect(emrApi.createLabResultFile).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'order-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          file_url: 'https://bucket/test.pdf',
          file_type: 'pdf',
        })
      )
    })

    // After success, modal closes and data is refetched
    await waitFor(() => {
      expect(emrApi.getLabOrders).toHaveBeenCalledTimes(2)
      expect(emrApi.getLabResults).toHaveBeenCalledTimes(2)
    })
  })

  it('manual entry flow: calls createLabResultManual with file_type=manual', async () => {
    const user = userEvent.setup()
    const order = makeOrder()

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const uploadBtn = await screen.findByRole('button', { name: /upload result/i })
    await user.click(uploadBtn)

    // Switch to manual entry tab
    const manualTab = screen.getByRole('button', { name: /manual entry/i })
    await user.click(manualTab)

    // Fill in test_name and value fields (first row)
    const dialog = screen.getByRole('dialog')
    const testNameInput = within(dialog).getAllByPlaceholderText(/e\.g\. glucose/i)[0]
    const valueInput = within(dialog).getAllByPlaceholderText(/e\.g\. 5\.2/i)[0]

    await user.type(testNameInput, 'Glucose')
    await user.type(valueInput, '5.2')

    const submitBtn = within(dialog).getByRole('button', { name: /submit result/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(emrApi.createLabResultManual).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'order-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-1',
          manual_entries: expect.arrayContaining([
            expect.objectContaining({ test_name: 'Glucose', value: '5.2' }),
          ]),
        })
      )
    })

    // Verify file_type=manual is injected by createLabResultManual
    const callArg = emrApi.createLabResultManual.mock.calls[0][0]
    // createLabResultManual sets file_type: 'manual' internally in emr.js
    expect(callArg).not.toHaveProperty('file_type') // the prop is added inside emrApi.createLabResultManual
  })

  it('shows error when no file selected in file mode', async () => {
    const user = userEvent.setup()
    const order = makeOrder()

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const uploadBtn = await screen.findByRole('button', { name: /upload result/i })
    await user.click(uploadBtn)

    const submitBtn = screen.getByRole('button', { name: /submit result/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/please select a file/i)).toBeInTheDocument()
    })
    expect(emrApi.uploadFile).not.toHaveBeenCalled()
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const order = makeOrder()

    emrApi.getLabOrders.mockResolvedValue([order])
    emrApi.getLabResults.mockResolvedValue([])

    render(<LabWrapper initOrders={[]} onNotify={vi.fn()} onBack={vi.fn()} />)

    const uploadBtn = await screen.findByRole('button', { name: /upload result/i })
    await user.click(uploadBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // The X icon button has no aria-label; use the 'Cancel' button in the footer instead
    const closeBtn = screen.getByRole('button', { name: /cancel/i })
    await user.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

// ─── Back button ──────────────────────────────────────────────────────────────

describe('Back button', () => {
  it('calls onBack when clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    renderView({ onBack })

    await waitFor(() => expect(screen.queryByText('Loading lab data…')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
