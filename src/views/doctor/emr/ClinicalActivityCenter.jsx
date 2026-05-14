import { useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { FlaskConicalIcon, ActivityIcon, SparkleIcon, ClipboardListIcon, ClockIcon, SparklesIcon, CheckIcon } from './EmrIcons'
import MedicalHistoryTab from '../../../components/emr/MedicalHistoryTab'
import TreatmentPlanPanel from '../../../components/emr/TreatmentPlanPanel'
import CardiologyPanel from '../../../components/emr/CardiologyPanel'
import PulmonologyPanel from '../../../components/emr/PulmonologyPanel'
import { emrApi } from '../../../api/emr'
import { normalizeStatus } from '../../../components/emr/labResultUtils'
import { PATIENT_SPECIALTY_RESULTS } from '../../../data/specialtyResults'
import {
  UploadModal,
  VerifyModal,
  HolisticSummaryModal,
  AiDraftRenderer,
} from '../../../components/emr/LabResultModals'

export default function ClinicalActivityCenter({
  emrTab,
  setEmrTab,
  labOrders,
  labResults,
  dataLoading,
  resultsSubTab,
  setResultsSubTab,
  // new context props
  apptId,
  patientName,
  selectedPatient,
  user,
  historyRefreshKey,
  onLabResultUpdate,
  onNotify,
  // order wizard props
  orderStep,
  setOrderStep,
  orderPriority,
  setOrderPriority,
  orderNote,
  setOrderNote,
  orderedTests,
  alreadyOrderedTestIds = [],
  toggleTest,
  handleSubmitOrder,
  hasOrderSelection,
  totalSelected,
  LAB_TEST_GROUPS,
  LAB_TESTS,
  suggestLabResult,
  setSuggestLabResult,
  suggestLabLoading,
  suggestLabError,
  handleSuggestLab,
  applySuggestedTests,
  labFeeMap = {}, // NEW: for cost display
}) {
  // ─── local modal state ───────────────────────────────────────────────────
  const [verifyModal, setVerifyModal] = useState(null)   // { order, result }
  const [uploadModal, setUploadModal] = useState(null)   // order object
  const [holisticOpen, setHolisticOpen] = useState(false)
  const [verifyingId, setVerifyingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // order to confirm-delete
  const [deletingId, setDeletingId] = useState(null)
  const [printSlipOpen, setPrintSlipOpen] = useState(false)
  const [printSlipTestIds, setPrintSlipTestIds] = useState([])
  const [auscultationTab, setAuscultationTab] = useState('lung')

  function formatSlipDate(value) {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('vi-VN')
  }

  function slipVisitDate() {
    return formatSlipDate(
      selectedPatient?.start_time
      || selectedPatient?.appointment_date
      || selectedPatient?.date
      || selectedPatient?.scheduled_at
    ) || ''
  }

  function slipDoctorName() {
    return selectedPatient?.doctor_name || selectedPatient?.doctorName || selectedPatient?.clinician_name || 'Doctor'
  }

  // ─── handlers ────────────────────────────────────────────────────────────
  async function handleVerify({ interpretation, doctorNotes }) {
    const { order, result } = verifyModal
    setVerifyingId(result.id)
    await emrApi.verifyLabResult(result.id, {
      doctor_interpretation: interpretation,
      doctor_notes: doctorNotes || undefined,
      order_id: order.id,
    })
    setVerifyModal(null)
    setVerifyingId(null)
    onLabResultUpdate?.()
  }

  function handleUploadSuccess() {
    setUploadModal(null)
    onLabResultUpdate?.()
  }

  function openPrintSlip() {
    setPrintSlipTestIds(orderedTests)
    setPrintSlipOpen(true)
  }

  function togglePrintSlipTest(testId) {
    setPrintSlipTestIds((prev) => (
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    ))
  }

  function handlePrintSlips(testIds = printSlipTestIds) {
    const testsToPrint = testIds
      .map((testId) => LAB_TESTS.find((test) => test.id === testId))
      .filter(Boolean)
    if (testsToPrint.length === 0) return

    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

    const patientLabel = patientName || selectedPatient?.name || selectedPatient?.patient_name || 'Patient'
    const visitDate = slipVisitDate()
    const doctorName = slipDoctorName()
    const createdAt = new Date().toLocaleString('vi-VN')
    const testRows = testsToPrint.map((test, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(test.name)}</strong><br><span>${escapeHtml(test.desc || '')}</span></td>
        <td>${escapeHtml(test.testType || '')}</td>
        <td>${escapeHtml(test.tat || '')}</td>
      </tr>
    `).join('')

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Lab Order Slip</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111827; padding-bottom: 14px; }
            .title { font-size: 22px; font-weight: 800; letter-spacing: .02em; margin: 0; }
            .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-top: 18px; font-size: 13px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
            .value { min-height: 20px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #4b5563; }
            td span { color: #6b7280; font-size: 12px; }
            .blank { min-height: 38px; border: 1px dashed #9ca3af; margin-top: 6px; padding: 8px; }
            .footer { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; font-size: 12px; }
            .signature { border-top: 1px solid #9ca3af; padding-top: 8px; text-align: center; margin-top: 56px; }
            @media print { body { margin: 18mm; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">LAB ORDER SLIP</h1>
              <div class="subtitle">For patient guidance and lab intake reference</div>
            </div>
            <div style="text-align:right">
              <div class="label">Printed at</div>
              <div>${escapeHtml(createdAt)}</div>
            </div>
          </div>
          <div class="grid">
            <div><div class="label">Patient</div><div class="value">${escapeHtml(patientLabel)}</div></div>
            <div><div class="label">Visit date</div><div class="value">${escapeHtml(visitDate)}</div></div>
            <div><div class="label">Order priority</div><div class="value">${escapeHtml(String(orderPriority || 'routine').toUpperCase())}</div></div>
            <div><div class="label">Requested by</div><div class="value">${escapeHtml(doctorName)}</div></div>
            <div><div class="label">Destination / Room</div><div class="value">&nbsp;</div></div>
          </div>
          <table>
            <thead>
              <tr><th style="width:48px">#</th><th>Test</th><th style="width:140px">Type</th><th style="width:120px">Est. TAT</th></tr>
            </thead>
            <tbody>${testRows}</tbody>
          </table>
          <div style="margin-top:20px">
            <div class="label">Clinical note / instructions</div>
            <div class="blank">${escapeHtml(orderNote || '')}</div>
          </div>
          <div style="margin-top:16px">
            <div class="label">Lab location / additional directions</div>
            <div class="blank">&nbsp;</div>
          </div>
          <div class="footer">
            <div class="signature">Ordering doctor</div>
            <div class="signature">Lab staff</div>
          </div>
          <button class="no-print" onclick="window.print()" style="margin-top:24px;padding:10px 16px;font-weight:700">Print</button>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>`

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  function printExistingOrders(orders) {
    const printableOrders = orders.filter(Boolean)
    if (printableOrders.length === 0) return

    const pseudoTests = printableOrders.map((order) => ({
      id: order.id,
      name: order.test_name || 'Lab Order',
      desc: order.instructions || '',
      testType: order.test_type || '',
      tat: '',
    }))

    const previousOrderPriority = orderPriority
    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

    const patientLabel = patientName || selectedPatient?.name || selectedPatient?.patient_name || 'Patient'
    const visitDate = slipVisitDate()
    const doctorName = slipDoctorName()
    const createdAt = new Date().toLocaleString('vi-VN')
    const testRows = pseudoTests.map((test, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(test.name)}</strong><br><span>${escapeHtml(test.desc || '')}</span></td>
        <td>${escapeHtml(test.testType || '')}</td>
        <td>${escapeHtml(test.tat || '')}</td>
      </tr>
    `).join('')

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Lab Order Slip</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111827; padding-bottom: 14px; }
            .title { font-size: 22px; font-weight: 800; letter-spacing: .02em; margin: 0; }
            .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-top: 18px; font-size: 13px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
            .value { min-height: 20px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #4b5563; }
            td span { color: #6b7280; font-size: 12px; }
            .blank { min-height: 38px; border: 1px dashed #9ca3af; margin-top: 6px; padding: 8px; }
            .footer { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; font-size: 12px; }
            .signature { border-top: 1px solid #9ca3af; padding-top: 8px; text-align: center; margin-top: 56px; }
            @media print { body { margin: 18mm; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">LAB ORDER SLIP</h1>
              <div class="subtitle">For patient guidance and lab intake reference</div>
            </div>
            <div style="text-align:right">
              <div class="label">Printed at</div>
              <div>${escapeHtml(createdAt)}</div>
            </div>
          </div>
          <div class="grid">
            <div><div class="label">Patient</div><div class="value">${escapeHtml(patientLabel)}</div></div>
            <div><div class="label">Visit date</div><div class="value">${escapeHtml(visitDate)}</div></div>
            <div><div class="label">Order priority</div><div class="value">${escapeHtml(String(previousOrderPriority || 'routine').toUpperCase())}</div></div>
            <div><div class="label">Requested by</div><div class="value">${escapeHtml(doctorName)}</div></div>
            <div><div class="label">Destination / Room</div><div class="value">&nbsp;</div></div>
          </div>
          <table>
            <thead>
              <tr><th style="width:48px">#</th><th>Test</th><th style="width:140px">Type</th><th style="width:120px">Est. TAT</th></tr>
            </thead>
            <tbody>${testRows}</tbody>
          </table>
          <div style="margin-top:16px">
            <div class="label">Lab location / additional directions</div>
            <div class="blank">&nbsp;</div>
          </div>
          <div class="footer">
            <div class="signature">Ordering doctor</div>
            <div class="signature">Lab staff</div>
          </div>
          <button class="no-print" onclick="window.print()" style="margin-top:24px;padding:10px 16px;font-weight:700">Print</button>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>`

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  async function handleDeleteOrder(order) {
    setDeletingId(order.id)
    try {
      await emrApi.deleteLabOrder(order.id)
      setDeleteConfirm(null)
      onLabResultUpdate?.()
      onNotify?.({ type: 'success', message: `Lab order "${order.test_name || 'Lab Order'}" deleted.` })
    } catch (err) {
      if (err?.status === 404) {
        // Order no longer exists on backend — treat as already deleted and sync state
        setDeleteConfirm(null)
        onLabResultUpdate?.()
        onNotify?.({ type: 'success', message: `Lab order "${order.test_name || 'Lab Order'}" deleted.` })
      } else {
        onNotify?.({ type: 'error', message: 'Could not delete the order. Please try again.' })
      }
    } finally {
      setDeletingId(null)
    }
  }

  const suggestedTestNames = Array.isArray(suggestLabResult?.suggested_tests)
    ? suggestLabResult.suggested_tests
    : Array.isArray(suggestLabResult?.suggestions)
      ? suggestLabResult.suggestions
          .map((item) => (typeof item === 'string' ? item : item?.test_name))
          .filter(Boolean)
      : []
  const alreadyOrderedTestIdSet = new Set(alreadyOrderedTestIds)
  const resultOrderIds = new Set(labResults.map((r) => r.order_id))
  const awaitingUploadOrders = labOrders.filter((order) => !resultOrderIds.has(order.id))
  const resultFilterTabs = [
    { key: 'ALL', label: 'All', count: labResults.length + awaitingUploadOrders.length },
    { key: 'AWAITING_UPLOAD', label: 'Awaiting Upload', count: awaitingUploadOrders.length },
    { key: 'PUBLISHED', label: 'Published', count: labResults.filter((r) => r.status === 'PUBLISHED').length },
    { key: 'DOCTOR_REVIEW', label: 'Doctor Review', count: labResults.filter((r) => r.status === 'DOCTOR_REVIEW').length },
    { key: 'AI_DRAFT', label: 'AI Draft', count: labResults.filter((r) => r.status === 'AI_DRAFT').length },
    { key: 'PENDING', label: 'Pending', count: labResults.filter((r) => r.status === 'PENDING').length },
  ]
  const patientId = selectedPatient?.patient_id || selectedPatient?.id || ''
  const doctorId = user?.id || user?.sub || selectedPatient?.doctor_id || ''
  const cardiologyData = selectedPatient?.specialtyResults?.cardiology
    || selectedPatient?.specialty_results?.cardiology
    || PATIENT_SPECIALTY_RESULTS['PT-2024-0142'].cardiology
  const isLungSoundOrder = (order) => /lung sound|respiratory sound/i.test(order?.test_name || '')
  const isHeartSoundOrder = (order) => /heart sound|cardiac auscultation/i.test(order?.test_name || '')
  const awaitingLungSoundOrder = awaitingUploadOrders.find(isLungSoundOrder)
  const awaitingHeartSoundOrder = awaitingUploadOrders.find(isHeartSoundOrder)

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#08080f] scrollbar-hide">
      <div className="mx-auto max-w-5xl px-6 py-5">
      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-1 rounded-2xl bg-white/50 p-1.5 shadow-sm dark:bg-[#111118]/50">
        {[
          { key: 'overview', label: 'Patient Overview', icon: ActivityIcon },
          { key: 'history', label: 'Medical History', icon: ClipboardListIcon },
          { key: 'results', label: 'Clinical Results', icon: SparkleIcon },
          { key: 'orders', label: 'Lab Orders', icon: FlaskConicalIcon },
        ].map((tab) => {
          const active = emrTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setEmrTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                active ? 'bg-white text-indigo-600 shadow-md dark:bg-[#1c1c25] dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-[#505060] dark:hover:text-[#8a8aa0]'
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <tab.icon />
              </span>
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-6">
        {emrTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Lab Orders Card */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-[#252530]/60 dark:bg-[#111118]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Recent Lab Orders</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {labOrders.length} total
                </span>
              </div>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : labOrders.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400 italic">No lab orders found for this patient.</p>
              ) : (
                <div className="space-y-3">
                  {labOrders.slice(0, 6).map((order) => (
                    <div key={order.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#1c1c25]">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-400 dark:text-[#70708a]">
                          <FlaskConicalIcon />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-[#eeeef5]">{order.test_name}</p>
                        <p className="text-xs text-slate-400">
                          {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('vi-VN') : '—'}
                          {order.priority && order.priority !== 'routine' && (
                            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              {order.priority.toUpperCase()}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => printExistingOrders([order])}
                        className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-indigo-800/50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                      >
                        Print
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Published Results Summary */}
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-900/30 dark:bg-indigo-950/10">
              <div className="mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <SparklesIcon />
                </span>
                <h3 className="text-sm font-bold">AI Clinical Insights</h3>
              </div>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : (() => {
                const published = labResults.filter((r) => r.status === 'PUBLISHED')
                if (published.length === 0) {
                  return <p className="text-xs text-slate-500 italic">No published results yet. AI insights will appear once lab results are verified and published.</p>
                }
                const latest = published[0]
                return (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-[#a0a0b8]">
                      Latest: <span className="font-bold text-slate-800 dark:text-[#eeeef5]">{latest.order_id ? labOrders.find(o => o.id === latest.order_id)?.test_name || 'Lab Result' : 'Lab Result'}</span>
                      {latest.published_at && (
                        <span className="ml-2 text-slate-400">
                          · {new Date(latest.published_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </p>
                    {latest.published_text && (
                      <div className="rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900/50 dark:bg-[#111118]">
                        <p className="line-clamp-4 text-xs text-slate-700 dark:text-[#c8c8e0]">{latest.published_text}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400">{published.length} published result{published.length > 1 ? 's' : ''} total</p>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {emrTab === 'history' && (
          <MedicalHistoryTab patientId={selectedPatient?.patient_id || selectedPatient?.id} refreshKey={historyRefreshKey} />
        )}

        {emrTab === 'results' && (
          <div className="space-y-4">
            {/* AI Holistic Summary button */}
            {apptId && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setHolisticOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                  </svg>
                  AI Holistic Summary
                </button>
              </div>
            )}

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {resultFilterTabs.map((tab) => {
                const active = resultsSubTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setResultsSubTab(tab.key)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-[11px] font-bold transition-all ${
                      active ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#70708a]'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                )
              })}
            </div>

            {/* Results list */}
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : (() => {
              if (resultsSubTab === 'AWAITING_UPLOAD') {
                if (awaitingUploadOrders.length === 0) {
                  return (
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-8 text-center shadow-sm dark:border-[#252530]/60 dark:bg-[#111118]">
                      <p className="text-sm text-slate-400 italic">No lab orders are awaiting upload.</p>
                    </div>
                  )
                }
                return (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => printExistingOrders(awaitingUploadOrders)}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-300"
                      >
                        Print All Awaiting Upload
                      </button>
                    </div>
                    {awaitingUploadOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#111118]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800 dark:text-[#eeeef5]">{order.test_name || 'Lab Order'}</p>
                            <p className="text-xs text-slate-400">
                              {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('vi-VN') : '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => printExistingOrders([order])}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
                            >
                              Print Slip
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadModal(order)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700/50 dark:bg-indigo-950/30 dark:text-indigo-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                              </svg>
                              Upload Result
                            </button>
                            <button
                              type="button"
                              title="Delete this order"
                              onClick={() => setDeleteConfirm(order)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-[#404050] dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
              const filtered = resultsSubTab === 'ALL' ? labResults : labResults.filter((r) => r.status === resultsSubTab)
              if (filtered.length === 0) {
                return (
                  <div className="rounded-3xl border border-slate-200/60 bg-white p-8 text-center shadow-sm dark:border-[#252530]/60 dark:bg-[#111118]">
                    <p className="text-sm text-slate-400 italic">No results found for this filter.</p>
                  </div>
                )
              }
              const statusColors = {
                PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                DOCTOR_REVIEW: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
                AI_DRAFT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
                AI_PROCESSING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
                PENDING: 'bg-slate-100 text-slate-500 dark:bg-[#1c1c25] dark:text-[#70708a]',
                NEEDS_MANUAL_REVIEW: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
              }
              return (
                <div className="space-y-4">
                  {filtered.map((result) => {
                    const order = labOrders.find((o) => o.id === result.order_id) || {}
                    const category = normalizeStatus(result.status)
                    const isVerifying = verifyingId === result.id
                    const isManual = result.file_type === 'manual'
                    const hasAiDraft = !!result.ai_draft_text
                    return (
                      <div key={result.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-[#252530]/60 dark:bg-[#111118]">
                        {/* Header row */}
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-[#eeeef5]">
                              {order.test_name || 'Lab Result'}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {result.published_at
                                ? `Published ${new Date(result.published_at).toLocaleDateString('vi-VN')}`
                                : result.created_at
                                ? `Created ${new Date(result.created_at).toLocaleDateString('vi-VN')}`
                                : '—'}
                              {isManual && <span className="ml-2 rounded-full border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:border-[#252530]">Manual</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${statusColors[result.status] || statusColors.PENDING}`}>
                              {result.status.replace(/_/g, ' ')}
                            </span>
                            {result.status !== 'PUBLISHED' && (
                              <button
                                type="button"
                                title="Delete this order"
                                onClick={() => {
                                  const ord = labOrders.find((o) => o.id === result.order_id) || { id: result.order_id, test_name: order.test_name }
                                  setDeleteConfirm(ord)
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-[#404050] dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content based on category */}
                        {category === 'ready_to_verify' && (
                          hasAiDraft ? (
                            <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">AI Draft</p>
                              <AiDraftRenderer text={result.ai_draft_text} fileType={result.file_type} collapsed />
                            </div>
                          ) : (
                            <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                {isManual ? 'Awaiting AI Analysis' : 'AI Draft Unavailable'}
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                {isManual
                                  ? 'Manual entries were submitted but AI has not yet processed them. Upload again to rerun with updated source data.'
                                  : 'AI analysis did not produce a draft. Upload again to rerun with updated source data, or review and publish manually.'}
                              </p>
                            </div>
                          )
                        )}

                        {category === 'published' && result.published_text && (
                          <div className="mb-3">
                            <AiDraftRenderer text={result.published_text} fileType={result.file_type} collapsed={false} />
                          </div>
                        )}

                        {category === 'processing' && (
                          <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-950/20">
                            <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-500 border-r-transparent shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">AI is processing this result…</p>
                          </div>
                        )}

                        {result.doctor_notes && (
                          <p className="mb-3 text-xs italic text-slate-400">Note: {result.doctor_notes}</p>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          {category === 'ready_to_verify' && (
                            <button
                              type="button"
                              disabled={isVerifying}
                              onClick={() => setVerifyModal({ order, result })}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                            >
                              {isVerifying && <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent" />}
                              Review &amp; Publish
                            </button>
                          )}

                          {(category === 'processing' || category === 'ready_to_verify') && result.id && (
                            <button
                              type="button"
                              onClick={() => setUploadModal({ ...order, replaceResultId: result.id })}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                              Upload again
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Unmatched orders (no result yet) — needs_upload */}
            {resultsSubTab === 'ALL' && (() => {
              if (awaitingUploadOrders.length === 0) return null
              return (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Awaiting Upload</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => printExistingOrders(awaitingUploadOrders)}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-300"
                    >
                      Print All Awaiting Upload
                    </button>
                  </div>
                  {awaitingUploadOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#111118]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-[#eeeef5]">{order.test_name || 'Lab Order'}</p>
                          <p className="text-xs text-slate-400">
                            {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString('vi-VN') : '—'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => printExistingOrders([order])}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
                          >
                            Print Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadModal(order)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700/50 dark:bg-indigo-950/30 dark:text-indigo-400 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                            </svg>
                            Upload Result
                          </button>
                          <button
                            type="button"
                            title="Delete this order"
                            onClick={() => setDeleteConfirm(order)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-[#404050] dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {emrTab === 'orders' && (
          <div className="space-y-6">
             {(awaitingLungSoundOrder || awaitingHeartSoundOrder) && (
               <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-[#252530] dark:bg-[#111118]">
                 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                   <div>
                     <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Auscultation Result Upload</h3>
                     <p className="mt-1 text-xs text-slate-400">Upload heart or lung sound recordings after the matching auscultation order is created.</p>
                   </div>
                   {awaitingLungSoundOrder && awaitingHeartSoundOrder && (
                     <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-[#252530] dark:bg-[#16161e]">
                       {[
                         { key: 'lung', label: 'Lung Sounds' },
                         { key: 'heart', label: 'Heart Sounds' },
                       ].map((tab) => (
                         <button
                           key={tab.key}
                           type="button"
                           onClick={() => setAuscultationTab(tab.key)}
                           className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                             auscultationTab === tab.key
                               ? 'bg-white text-indigo-600 shadow-sm dark:bg-[#252530] dark:text-indigo-300'
                               : 'text-slate-500 hover:text-slate-700 dark:text-[#70708a] dark:hover:text-[#c8c8e0]'
                           }`}
                         >
                           {tab.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 {awaitingLungSoundOrder && (!awaitingHeartSoundOrder || auscultationTab === 'lung') ? (
                   <PulmonologyPanel patientId={patientId} doctorId={doctorId} />
                 ) : (
                   <CardiologyPanel data={cardiologyData} patientId={patientId} doctorId={doctorId} />
                 )}
               </section>
             )}

             {/* Order Wizard content extracted from EMRWorkspaceView */}
             {/* Simplified for brevity in this component extraction, but preserving core flow */}
             <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-[#252530] dark:bg-[#111118]">
                {orderStep === 'details' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">1. Order Details</h3>
                      <button
                        onClick={handleSuggestLab}
                        disabled={suggestLabLoading}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {suggestLabLoading ? (
                          <span className="h-2 w-2 animate-spin rounded-full border border-indigo-600 border-t-transparent" />
                        ) : (
                          <SparklesIcon className="h-3 w-3" />
                        )}
                        Suggest via AI
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</label>
                          <div className="flex gap-2">
                             {['Routine', 'Urgent', 'STAT'].map((p) => (
                               <button
                                 key={p}
                                 onClick={() => setOrderPriority(p.toLowerCase())}
                                 className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                                   orderPriority === p.toLowerCase() ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40' : 'border-slate-200 text-slate-500 dark:border-[#252530]'
                                 }`}
                               >
                                 {p}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinical Reason</label>
                       <textarea
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          placeholder="Why is this test being ordered?..."
                          className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#1c1c25]/50 dark:text-[#eeeef5]"
                       />
                    </div>

                    {suggestLabError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        {suggestLabError}
                      </div>
                    )}

                    {suggestLabResult && (
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100">AI Suggested Tests</span>
                          </div>
                          <button onClick={() => setSuggestLabResult(null)} className="text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          Based on patient symptoms and clinical history, AI suggests these tests. Apply to pre-select them, then review before continuing.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTestNames.map((name, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-white dark:bg-[#1a1a25] text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                              {name}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => { applySuggestedTests(suggestedTestNames); setOrderStep('tests'); }}
                          disabled={suggestedTestNames.length === 0}
                          className="w-full py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          Apply &amp; Select Tests
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end">
                       <button onClick={() => setOrderStep('tests')} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Next: Select Tests →</button>
                    </div>
                  </div>
                )}

                {orderStep === 'tests' && (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">2. Select Tests</h3>
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={handleSuggestLab}
                              disabled={suggestLabLoading}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {suggestLabLoading ? (
                                <span className="h-2 w-2 animate-spin rounded-full border border-indigo-600 border-t-transparent" />
                              ) : (
                                <SparklesIcon className="h-3 w-3" />
                              )}
                              Suggest via AI
                            </button>
                            <span className="text-xs font-bold text-indigo-600">{totalSelected} Selected</span>
                         </div>
                      </div>

                      {suggestLabError && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          {suggestLabError}
                        </div>
                      )}

                      {suggestLabResult && (
                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <SparklesIcon className="h-4 w-4 text-indigo-600" />
                              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100">AI Suggested Tests</span>
                            </div>
                            <button onClick={() => setSuggestLabResult(null)} className="text-slate-400 hover:text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            Based on patient symptoms and clinical history, AI suggests these tests.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTestNames.map((name, idx) => (
                              <span key={idx} className="text-[10px] font-bold bg-white dark:bg-[#1a1a25] text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                {name}
                              </span>
                            ))}
                          </div>
                          <button 
                            onClick={() => applySuggestedTests(suggestedTestNames)}
                            disabled={suggestedTestNames.length === 0}
                            className="w-full py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Apply Suggestions
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {LAB_TEST_GROUPS.map((group) => (
                           <div key={group.key} className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</p>
                              <div className="grid gap-2">
                                 {LAB_TESTS.filter(t => group.testIds.includes(t.id)).map(test => {
                                    const selected = orderedTests.includes(test.id)
                                    const alreadyOrdered = alreadyOrderedTestIdSet.has(test.id)
                                    return (
                                       <button
                                          key={test.id}
                                          onClick={() => !alreadyOrdered && toggleTest(test.id)}
                                          disabled={alreadyOrdered}
                                          className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                                             selected
                                               ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                               : alreadyOrdered
                                                 ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60 dark:border-[#252530] dark:bg-[#15151d]'
                                                 : 'border-slate-100 hover:border-slate-200 dark:border-[#252530]'
                                          }`}
                                       >
                                          <span className={`text-xs font-bold ${selected ? 'text-indigo-700 dark:text-indigo-300' : alreadyOrdered ? 'text-slate-400 dark:text-[#606070]' : 'text-slate-700 dark:text-[#c8c8e0]'}`}>{test.name}</span>
                                          {alreadyOrdered ? (
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-[#20202a] dark:text-[#70708a]">
                                              Ordered
                                            </span>
                                          ) : selected && (
                                            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                                              <CheckIcon />
                                            </span>
                                          )}
                                       </button>
                                    )
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="flex justify-between pt-4">
                        <button onClick={() => setOrderStep('details')} className="text-sm font-bold text-slate-500">← Back</button>
                        <button onClick={() => setOrderStep('review')} disabled={!hasOrderSelection} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">Next: Review Order →</button>
                     </div>
                  </div>
                )}

                {orderStep === 'review' && (
                  <div className="space-y-6">
                     <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">3. Review Order</h3>
                     <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-[#252530] dark:bg-[#1c1c25]/50">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 dark:border-[#252530]/50">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Summary</span>
                           <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">{orderPriority}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                           {orderedTests.map(id => (
                              <div key={id} className="flex items-center justify-between text-xs">
                                 <span className="font-bold text-slate-700 dark:text-[#c8c8e0]">{LAB_TESTS.find(t => t.id === id)?.name}</span>
                                 <span className="text-slate-400">{LAB_TESTS.find(t => t.id === id)?.tat}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex justify-between pt-4">
                        <button onClick={() => setOrderStep('tests')} className="text-sm font-bold text-slate-500">← Back</button>
                        <button onClick={handleSubmitOrder} className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Confirm & Submit Order</button>
                     </div>
                  </div>
                )}

                {orderStep === 'submitted' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    {/* Cost summary */}
                    {orderedTests.length > 0 && (
                      <div className="mb-8 w-full max-w-sm rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                          Estimated Cost
                        </p>
                        <div className="mt-3 space-y-2">
                          {orderedTests.map(testId => {
                            const test = LAB_TESTS.find(t => t.id === testId)
                            const fee = labFeeMap[testId] ?? 0
                            return (
                              <div key={testId} className="flex justify-between text-sm">
                                <span className="text-slate-700 dark:text-slate-300">{test?.name}</span>
                                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 border-t border-indigo-200 pt-3 flex justify-between font-semibold dark:border-indigo-800">
                          <span className="text-slate-800 dark:text-indigo-200">Total</span>
                          <span className="text-indigo-700 dark:text-indigo-300">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              orderedTests.reduce((sum, testId) => sum + (labFeeMap[testId] ?? 0), 0)
                            )}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400">
                          Patient will be notified to complete payment via VNPAY
                        </p>
                      </div>
                    )}

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <span className="flex h-8 w-8 items-center justify-center">
                        <CheckIcon />
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Submitted Successfully</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-[#70708a]">
                      Your lab orders have been sent to the laboratory system.<br />
                      The patient will be notified to proceed with sample collection.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      {orderedTests.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePrintSlips(orderedTests)}
                            className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                          >
                            Print All Slips
                          </button>
                          <button
                            type="button"
                            onClick={openPrintSlip}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0]"
                          >
                            Choose Tests to Print
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setOrderStep('details')}
                        className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                      >
                        Create Another Order
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
      </div>

      {/* ─── Modals ─────────────────────────────────────────── */}
      {uploadModal && (
        <UploadModal
          order={uploadModal}
          resultId={uploadModal.replaceResultId || null}
          onClose={() => setUploadModal(null)}
          onSuccess={handleUploadSuccess}
        />
      )}
      {verifyModal && (
        <VerifyModal
          order={verifyModal.order}
          result={verifyModal.result}
          onClose={() => setVerifyModal(null)}
          onConfirm={handleVerify}
        />
      )}
      {holisticOpen && apptId && (
        <HolisticSummaryModal
          appointmentId={String(apptId)}
          patientName={patientName || 'Patient'}
          onClose={() => setHolisticOpen(false)}
        />
      )}

      {printSlipOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#eeeef5]">Print Lab Order Slip</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">Select tests to include in the printed slip.</p>
              </div>
              <button
                type="button"
                onClick={() => setPrintSlipOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1c1c25]"
                aria-label="Close print slip dialog"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {orderedTests.map((testId) => {
                const test = LAB_TESTS.find((item) => item.id === testId)
                if (!test) return null
                const checked = printSlipTestIds.includes(testId)
                return (
                  <label
                    key={testId}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      checked
                        ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#252530] dark:bg-[#16161e] dark:hover:bg-[#1c1c25]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePrintSlipTest(testId)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-bold text-slate-800 dark:text-[#eeeef5]">{test.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-[#70708a]">{test.desc || test.tat}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => setPrintSlipTestIds(orderedTests)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
              >
                Select All
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrintSlipOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={printSlipTestIds.length === 0}
                  onClick={() => handlePrintSlips()}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Print Selected
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1c1c25] dark:ring-1 dark:ring-white/5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <h2 className="mb-1.5 text-lg font-bold text-slate-800 dark:text-[#ececf0]">Delete Lab Order</h2>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-[#8888aa]">
                  Are you sure you want to permanently delete the order for{' '}
                  <strong className="font-semibold text-slate-700 dark:text-[#c8c8e0]">{deleteConfirm.test_name || 'this lab order'}</strong>?
                  <br className="hidden sm:block" /> This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#2a2a35] dark:bg-[#1c1c25] dark:text-[#a0a0c0] dark:hover:bg-[#252530]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirm.id}
                onClick={() => handleDeleteOrder(deleteConfirm)}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === deleteConfirm.id
                  ? <><span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> Deleting…</>
                  : 'Yes, delete it'
                }
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  )
}

ClinicalActivityCenter.propTypes = {
  emrTab: PropTypes.string.isRequired,
  setEmrTab: PropTypes.func.isRequired,
  labOrders: PropTypes.array,
  labResults: PropTypes.array,
  dataLoading: PropTypes.bool,
  resultsSubTab: PropTypes.string,
  setResultsSubTab: PropTypes.func,
  apptId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  patientName: PropTypes.string,
  user: PropTypes.object,
  onLabResultUpdate: PropTypes.func,
  onNotify: PropTypes.func,
  orderStep: PropTypes.string,
  setOrderStep: PropTypes.func,
  orderPriority: PropTypes.string,
  setOrderPriority: PropTypes.func,
  orderNote: PropTypes.string,
  setOrderNote: PropTypes.func,
  orderedTests: PropTypes.array,
  alreadyOrderedTestIds: PropTypes.array,
  toggleTest: PropTypes.func,
  customTests: PropTypes.array,
  addCustomTest: PropTypes.func,
  removeCustomTest: PropTypes.func,
  patchCustomTest: PropTypes.func,
  handleSubmitOrder: PropTypes.func,
  hasOrderSelection: PropTypes.bool,
  totalSelected: PropTypes.number,
  LAB_TEST_GROUPS: PropTypes.array,
  LAB_TESTS: PropTypes.array,
  ORDER_PRIORITY: PropTypes.object,
  submittedOrderId: PropTypes.string,
  submittedOrder: PropTypes.object,
  submittedOrderCount: PropTypes.number,
  formatTatFromMinutes: PropTypes.func,
  selectedMaxTatMinutes: PropTypes.number,
  setSelectedMaxTatMinutes: PropTypes.func,
  selectedPatient: PropTypes.object,
  historyRefreshKey: PropTypes.number,
  suggestLabResult: PropTypes.object,
  setSuggestLabResult: PropTypes.func,
  suggestLabLoading: PropTypes.bool,
  suggestLabError: PropTypes.string,
  setSuggestLabError: PropTypes.func,
  handleSuggestLab: PropTypes.func,
  applySuggestedTests: PropTypes.func,
  labFeeMap: PropTypes.object, // NEW: map of test_id -> fee
}
