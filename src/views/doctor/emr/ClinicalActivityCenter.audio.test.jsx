import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ClinicalActivityCenter from './ClinicalActivityCenter'

function renderCenter(extraProps = {}) {
  const noop = vi.fn()
  return render(
    <ClinicalActivityCenter
      emrTab="results"
      setEmrTab={noop}
      labOrders={[]}
      labResults={[]}
      dataLoading={false}
      resultsSubTab="ALL"
      setResultsSubTab={noop}
      apptId="appt-1"
      patientName="Nguyen Van A"
      selectedPatient={{ id: 'patient-1', patient_id: 'patient-1' }}
      user={{ id: 'doctor-1' }}
      historyRefreshKey={0}
      onLabResultUpdate={noop}
      onNotify={noop}
      orderStep="details"
      setOrderStep={noop}
      orderPriority="routine"
      setOrderPriority={noop}
      orderNote=""
      setOrderNote={noop}
      orderedTests={[]}
      alreadyOrderedTestIds={[]}
      toggleTest={noop}
      handleSubmitOrder={noop}
      hasOrderSelection={false}
      totalSelected={0}
      LAB_TEST_GROUPS={[]}
      LAB_TESTS={[]}
      suggestLabResult={null}
      setSuggestLabResult={noop}
      suggestLabLoading={false}
      suggestLabError={null}
      handleSuggestLab={noop}
      applySuggestedTests={noop}
      labFeeMap={{}}
      {...extraProps}
    />
  )
}

describe('ClinicalActivityCenter auscultation audio', () => {
  it('does not show auscultation upload in Clinical Results before an order exists', () => {
    renderCenter()

    expect(screen.queryByText('Auscultation Result Upload')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload audio recording' })).not.toBeInTheDocument()
  })

  it('shows lung audio upload in Lab Orders only after a lung sound order exists', () => {
    renderCenter({
      emrTab: 'orders',
      labOrders: [{ id: 'order-lung', test_name: 'Lung Sound Recording', test_type: 'other' }],
    })

    expect(screen.getByText('Auscultation Result Upload')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload audio recording' })).toBeInTheDocument()
    expect(screen.getByText(/Drop audio file here/i)).toBeInTheDocument()
  })

  it('shows heart sound upload in Lab Orders only after a heart sound order exists', () => {
    renderCenter({
      emrTab: 'orders',
      labOrders: [{ id: 'order-heart', test_name: 'Heart Sound Recording', test_type: 'other' }],
    })

    expect(screen.getByText('Auscultation Result Upload')).toBeInTheDocument()
    expect(screen.getByText('Heart Sound Analysis')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload heart sound recording' })).toBeInTheDocument()
  })

  it('switches between ordered lung and heart audio uploads in Lab Orders', () => {
    renderCenter({
      emrTab: 'orders',
      labOrders: [
        { id: 'order-lung', test_name: 'Lung Sound Recording', test_type: 'other' },
        { id: 'order-heart', test_name: 'Heart Sound Recording', test_type: 'other' },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: 'Heart Sounds' }))

    expect(screen.getByText('Heart Sound Analysis')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload heart sound recording' })).toBeInTheDocument()
  })

  it('does not render the old Existing Orders block in Lab Orders', () => {
    renderCenter({
      emrTab: 'orders',
      labOrders: [{ id: 'order-cbc', test_name: 'Complete Blood Count (CBC)', test_type: 'blood_panel' }],
    })

    expect(screen.queryByText('Existing Orders')).not.toBeInTheDocument()
  })
})
