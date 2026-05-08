import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { clinicalApi } from '../../../api/clinical'
import { appointmentApi } from '../../../api/appointment'
import { emrApi } from '../../../api/emr'
import { aiApi } from '../../../api/ai'
import { paymentApi } from '../../../api/payment'
import { APPOINTMENT_STATUS, ORDER_PRIORITY } from '../../../constants/enums'

import PatientContextSidebar from './PatientContextSidebar'
import ClinicalActivityCenter from './ClinicalActivityCenter'
import SoapNoteEditor from './SoapNoteEditor'
import { SOAP_SECTIONS_CONFIG, LAB_TESTS, LAB_TEST_GROUPS, ICD_DATABASE, SOAP_AI_NOTE, DEFAULT_LAB_PRICES } from './EmrData'
import { resolveSuggestedTestIds } from './labSuggestionMapping'

export default function EMRWorkspace({
  navigateTo,
  user,
  selectedPatient,
  emrRequestedTab,
  clearEmrRequestedTab,
}) {
  // --- State ---
  const [emrTab, setEmrTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [apptStatus, setApptStatus] = useState(selectedPatient?.status || null)
  
  // Note State
  const [noteTemplate, setNoteTemplate] = useState('soap')
  const [noteText, setNoteText] = useState('')
  const [soapSections, setSoapSections] = useState({ s: '', o: '', a: '', p: '' })
  const [activeSoapSection, setActiveSoapSection] = useState('s')
  const [icdSearch, setIcdSearch] = useState('')
  const [icdResults, setIcdResults] = useState([])
  const [showIcdDropdown, setShowIcdDropdown] = useState(false)
  const [icdCodes, setIcdCodes] = useState([])
  const [lastSaved, setLastSaved] = useState('Not saved')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Results State
  const [resultsSubTab, setResultsSubTab] = useState('ALL')
  
  // Real lab data
  const [labOrders, setLabOrders] = useState([])
  const [labResults, setLabResults] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  
  // Order State
  const [orderStep, setOrderStep] = useState('details')
  const [orderPriority, setOrderPriority] = useState(ORDER_PRIORITY.ROUTINE)
  const [orderNote, setOrderNote] = useState('')
  const [orderedTests, setOrderedTests] = useState([])
  const [labFeeMap, setLabFeeMap] = useState(DEFAULT_LAB_PRICES) // {test_id: fee}
  const customTests = []
  const [suggestLabResult, setSuggestLabResult] = useState(null)
  const [suggestLabLoading, setSuggestLabLoading] = useState(false)
  const [suggestLabError, setSuggestLabError] = useState(null)

  // Mock Vitals
  const vitals = {
    blood_pressure: '118/76',
    temperature: '38.2',
    heart_rate: '84',
    spo2: '98'
  }

  // --- Helpers ---
  // Normalize patient: PatientQueueView passes raw booking (has `patient_name`),
  // ScheduleView passes a mapped object (has `name`). Unify to always have `name`.
  const _rawPatient = selectedPatient
  const _resolvedName = _rawPatient?.name ?? _rawPatient?.patient_name ?? null
  const patient = _rawPatient
    ? {
        ..._rawPatient,
        name: _resolvedName,
        initials: _rawPatient.initials
          ?? (_resolvedName
            ? _resolvedName.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            : '?'),
      }
    : { name: 'No Patient Selected', initials: '??', avatar: { from: 'from-slate-400', to: 'to-slate-600' }, allergies: [] }
  const explicitPatientId = patient.patient_id ?? null
  const patientUserId = explicitPatientId ?? (patient.appointment_id ? patient.id : null)
  const apptId = patient.appointment_id ?? (explicitPatientId && patient.id !== explicitPatientId ? patient.id : null)

  const severeAllergies = patient.allergies ? patient.allergies.filter((item) => item.severity?.toLowerCase().includes('severe')) : []
  
  // Fetch real lab data for this patient
  const fetchLabData = useCallback(() => {
    if (!patientUserId) return
    setDataLoading(true)
    Promise.allSettled([
      emrApi.getLabOrders({ patient_id: patientUserId }),
      emrApi.getLabResults({ patient_id: patientUserId }),
    ])
      .then(([ordersResult, resultsResult]) => {
        if (ordersResult.status === 'fulfilled') {
          setLabOrders(Array.isArray(ordersResult.value) ? ordersResult.value : [])
        } else {
          setLabOrders([])
          console.error('Failed to load lab orders for EMR Workspace:', {
            err: ordersResult.reason,
            patientUserId,
            apptId,
            selectedPatient,
          })
        }

        if (resultsResult.status === 'fulfilled') {
          setLabResults(Array.isArray(resultsResult.value) ? resultsResult.value : [])
        } else {
          setLabResults([])
          console.error('Failed to load lab results for EMR Workspace:', {
            err: resultsResult.reason,
            patientUserId,
            apptId,
            selectedPatient,
          })
        }
      })
      .finally(() => setDataLoading(false))
  }, [apptId, patientUserId, selectedPatient])

  useEffect(() => {
    fetchLabData()
  }, [fetchLabData])

  // Poll every 8 s while any result is still being processed by AI
  const hasProcessing = useMemo(
    () => labResults.some((r) => ['PENDING', 'AI_PROCESSING', 'PROCESSING', 'QUEUED'].includes(String(r.status || '').toUpperCase())),
    [labResults]
  )
  const pollingRef = useRef(null)
  useEffect(() => {
    if (!hasProcessing) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
      return undefined
    }
    if (pollingRef.current) return undefined
    pollingRef.current = setInterval(() => {
      if (patientUserId) {
        Promise.allSettled([
          emrApi.getLabOrders({ patient_id: patientUserId }),
          emrApi.getLabResults({ patient_id: patientUserId }),
        ])
          .then(([ordersResult, resultsResult]) => {
            if (ordersResult.status === 'fulfilled') {
              setLabOrders(Array.isArray(ordersResult.value) ? ordersResult.value : [])
            }
            if (resultsResult.status === 'fulfilled') {
              setLabResults(Array.isArray(resultsResult.value) ? resultsResult.value : [])
            }
          })
          .catch(() => {})
      }
    }, 8000)
    return () => { clearInterval(pollingRef.current); pollingRef.current = null }
  }, [hasProcessing, patientUserId])

  // Auto-switch to requested tab (e.g. navigated from LabResultReview)
  useEffect(() => {
    if (emrRequestedTab) {
      setEmrTab(emrRequestedTab)
      clearEmrRequestedTab?.()
    }
  }, [emrRequestedTab, clearEmrRequestedTab])

  // Fetch lab fee configuration from backend
  useEffect(() => {
    paymentApi.getLabFeeConfigs()
      .then(configs => {
        if (Array.isArray(configs)) {
          const map = {}
          configs.forEach(c => { map[c.test_id] = c.fee })
          setLabFeeMap(prev => ({ ...prev, ...map })) // merge with fallback
        }
      })
      .catch(() => {}) // keep DEFAULT_LAB_PRICES if error
  }, [])

  // --- Handlers ---
  const handleSuggestLab = async () => {
    if (suggestLabLoading) return
    const symptoms = soapSections.s || orderNote || ''
    if (!symptoms.trim()) {
      setSuggestLabError('Please add symptoms or a clinical note (SOAP — S field) before requesting suggestions.')
      return
    }
    setSuggestLabLoading(true)
    setSuggestLabResult(null)
    setSuggestLabError(null)
    try {
      const data = await aiApi.suggestLabTests({
        symptoms: symptoms.trim(),
        patientId: patientUserId || undefined,
      })
      setSuggestLabResult(data)
    } catch (err) {
      setSuggestLabError(err?.message || 'Failed to get lab suggestions.')
    } finally {
      setSuggestLabLoading(false)
    }
  }

  const applySuggestedTests = (testNames) => {
    const idsToAdd = resolveSuggestedTestIds(testNames, LAB_TESTS, orderedTests)
    if (idsToAdd.length > 0) {
      setOrderedTests((prev) => [...prev, ...idsToAdd])
      setOrderStep('tests')
    }
    setSuggestLabResult(null)
  }

  const handleStatusTransition = async (action) => {
    try {
      if (action === 'start') {
        await appointmentApi.start(apptId)
        setApptStatus(APPOINTMENT_STATUS.IN_PROGRESS)
      } else if (action === 'complete') {
        await appointmentApi.complete(apptId)
        setApptStatus(APPOINTMENT_STATUS.COMPLETED)
      } else if (action === 'confirm') {
        await appointmentApi.confirm(apptId)
        setApptStatus(APPOINTMENT_STATUS.CONFIRMED)
      }
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleSaveNote = useCallback(async () => {
    const contentToSave = noteTemplate === 'soap' 
      ? Object.entries(soapSections).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n\n')
      : noteText
      
    if (!patientUserId || !contentToSave.trim()) return

    try {
      setLastSaved('Saving...')
      const res = await clinicalApi.createNote(patientUserId, {
        content: contentToSave,
        note_type: noteTemplate,
        appointment_id: apptId || undefined,
        doctor_id: user?.id
      })
      console.log('Saved note ID:', res.id)
      setLastSaved(`Saved at ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      console.error('Save failed:', { err, patientUserId, apptId, selectedPatient })
      setLastSaved('Error saving')
    }
  }, [noteTemplate, soapSections, noteText, patientUserId, apptId, selectedPatient, user])

  const filterIcdResults = (query) => {
    const q = query.toLowerCase()
    setIcdResults(ICD_DATABASE.filter(item => item.code.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)))
  }

  const addIcdCode = (code) => {
    if (!icdCodes.find(c => c.code === code.code)) {
      setIcdCodes([...icdCodes, code])
    }
    setIcdSearch('')
    setShowIcdDropdown(false)
  }

  const removeIcdCode = (code) => {
    setIcdCodes(icdCodes.filter(c => c.code !== code))
  }

  const toggleTest = (id) => {
    setOrderedTests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmitOrder = async () => {
    try {
      const selectedTests = LAB_TESTS.filter(t => orderedTests.includes(t.id))
      
      if (selectedTests.length === 0) return

      await Promise.all(selectedTests.map(test => 
        emrApi.createLabOrder({
          patient_id: patientUserId,
          doctor_id: user?.id,
          appointment_id: apptId,
          test_name: test.name,
          test_type: test.testType,
          department: user?.specialty || 'internal_medicine',
          instructions: orderNote,
          priority: orderPriority,
          fee: labFeeMap[test.id] ?? 0, // NEW: from API, fallback to 0
        })
      ))

      setOrderStep('submitted')
      fetchLabData()
    } catch (err) {
      console.error('Order failed', err)
    }
  }

  // Guard: no patient selected
  if (!selectedPatient) {
    return (
      <div className="flex h-screen w-full flex-col bg-[#f8fafc] dark:bg-[#08080f]">
        {/* Minimal header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#0e0e15]/80">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-indigo-600 dark:bg-[#1c1c25] dark:text-[#70708a] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white">EMR Workspace</span>
        </header>

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-indigo-500 dark:text-indigo-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">No patient selected</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Please select a patient from the queue or your appointments before opening EMR Workspace.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigateTo('queue')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Go to Patient Queue
            </button>
            <button
              onClick={() => navigateTo('schedule')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-slate-300 dark:hover:bg-[#1c1c25] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              View Schedule
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#f8fafc] dark:bg-[#08080f] overflow-hidden">
      {/* Header Context */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#0e0e15]/80 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-indigo-600 dark:bg-[#1c1c25] dark:text-[#70708a]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white">EMR Workspace</span>
          <span className="text-slate-300 dark:text-[#404050]">/</span>
          <span className="text-sm font-bold text-indigo-600">{patient.name}</span>
        </div>

        <div className="flex items-center gap-2">
           {apptStatus === APPOINTMENT_STATUS.IN_PROGRESS ? (
             <button
               onClick={() => handleStatusTransition('complete')}
               className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
             >
               Complete Session
             </button>
           ) : apptStatus === APPOINTMENT_STATUS.CONFIRMED ? (
             <button
                onClick={() => handleStatusTransition('start')}
                className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all active:scale-95"
             >
                Start Consultation
             </button>
           ) : apptStatus === APPOINTMENT_STATUS.PENDING ? (
             <button
                onClick={() => handleStatusTransition('confirm')}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
             >
                Confirm Appointment
             </button>
           ) : apptStatus === APPOINTMENT_STATUS.COMPLETED ? (
             <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-500 dark:bg-[#1c1c25] dark:text-[#70708a]">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Session Completed
             </div>
           ) : (
             <div className="rounded-xl bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-400 dark:bg-[#111118] dark:text-[#505060]">
                {apptStatus?.toUpperCase() || 'NO STATUS'}
             </div>
           )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Pane 1: Context — collapsible */}
        <PatientContextSidebar
          patient={patient}
          vitals={vitals}
          activeMedications={[]}
          severeAllergies={severeAllergies}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />

        {/* Pane 2: Activity — flex-1 with inner max-width for large screens */}
        <ClinicalActivityCenter
          emrTab={emrTab}
          setEmrTab={setEmrTab}
          labOrders={labOrders}
          labResults={labResults}
          dataLoading={dataLoading}
          resultsSubTab={resultsSubTab}
          setResultsSubTab={setResultsSubTab}
          apptId={apptId}
          patientName={patient.name}
          onLabResultUpdate={fetchLabData}
          orderStep={orderStep}
          setOrderStep={setOrderStep}
          orderPriority={orderPriority}
          setOrderPriority={setOrderPriority}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
          orderedTests={orderedTests}
          toggleTest={toggleTest}
          customTests={customTests}
          addCustomTest={() => {}}
          removeCustomTest={() => {}}
          patchCustomTest={() => {}}
          handleSubmitOrder={handleSubmitOrder}
          hasOrderSelection={orderedTests.length > 0}
          totalSelected={orderedTests.length}
          LAB_TEST_GROUPS={LAB_TEST_GROUPS}
          LAB_TESTS={LAB_TESTS}
          ORDER_PRIORITY={ORDER_PRIORITY}
          submittedOrderId={null}
          submittedOrder={null}
          submittedOrderCount={0}
          formatTatFromMinutes={(m) => `${m}m`}
          selectedMaxTatMinutes={0}
          selectedPatient={patient}
          suggestLabResult={suggestLabResult}
          setSuggestLabResult={setSuggestLabResult}
          suggestLabLoading={suggestLabLoading}
          labFeeMap={labFeeMap}
          suggestLabError={suggestLabError}
          setSuggestLabError={setSuggestLabError}
          handleSuggestLab={handleSuggestLab}
          applySuggestedTests={applySuggestedTests}
        />

        {/* Pane 3: Note Editor — fixed but wider on large screens */}
        <SoapNoteEditor
          soapSections={soapSections}
          setSoapSections={setSoapSections}
          activeSoapSection={activeSoapSection}
          setActiveSoapSection={setActiveSoapSection}
          noteTemplate={noteTemplate}
          setNoteTemplate={setNoteTemplate}
          handleTemplateChange={setNoteTemplate}
          noteText={noteText}
          setNoteText={setNoteText}
          icdSearch={icdSearch}
          setIcdSearch={setIcdSearch}
          icdResults={icdResults}
          showIcdDropdown={showIcdDropdown}
          setShowIcdDropdown={setShowIcdDropdown}
          icdCodes={icdCodes}
          addIcdCode={addIcdCode}
          removeIcdCode={removeIcdCode}
          filterIcdResults={filterIcdResults}
          handleSaveNote={handleSaveNote}
          lastSaved={lastSaved}
          clinicianName={user?.name || 'Doctor'}
          clinicianSpecialty="General Practice"
          isAiGenerating={isAiGenerating}
          onAiAssist={async () => {
            if (isAiGenerating) return
            setIsAiGenerating(true)
            setLastSaved('Generating AI Draft...')
            try {
              const draft = await aiApi.generateSoapDraft({
                patientId: patientUserId,
                triageSessionId: patient.triage_session_id
              })
              setSoapSections({
                s: draft.s || '',
                o: draft.o || '',
                a: draft.a || '',
                p: draft.p || ''
              })
              setLastSaved('AI Draft generated')
            } catch (err) {
              console.error('AI Draft failed:', err)
              setLastSaved('AI Draft failed')
            } finally {
              setIsAiGenerating(false)
            }
          }}

        />
      </div>
    </div>
  )
}

EMRWorkspace.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  user: PropTypes.object,
  selectedPatient: PropTypes.object,
  setSelectedPatient: PropTypes.func,
  labOrders: PropTypes.array,
  setLabOrders: PropTypes.func,
  emrRequestedTab: PropTypes.string,
  clearEmrRequestedTab: PropTypes.func,
}
