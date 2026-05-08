import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { AlertTriangleIcon } from './EmrIcons'
import { summarizeEmr, streamSSE } from '../../../api/ai'
import AiMessageContent from '../../../components/shared/AiMessageContent'

export default function PatientContextSidebar({ patient, vitals, activeMedications, severeAllergies, sidebarCollapsed, onToggleCollapse }) {
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryLines, setSummaryLines] = useState([])
  const [summaryDone, setSummaryDone] = useState(false)
  const [summaryMessage, setSummaryMessage] = useState('')
  const [summaryLanguage, setSummaryLanguage] = useState('vi')
  const abortRef = useRef(null)

  const patientId = patient?.patient_id || patient?.id

  const handleSummarize = () => {
    if (!patientId) return
    setSummaryLoading(true)
    setSummaryDone(false)
    setSummaryLines([])
    setSummaryMessage('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    let accumulated = ''
    summarizeEmr({ patientId, language: summaryLanguage }, controller.signal)
      .then((response) => {
        streamSSE(response, {
          onChunk: (chunk) => {
            accumulated += chunk
            setSummaryLines(accumulated.split('\n'))
          },
          onDone: () => { setSummaryLoading(false); setSummaryDone(true) },
          onError: () => {
            if (controller.signal.aborted) return
            setSummaryLoading(false)
            setSummaryDone(true)
            if (!accumulated) setSummaryLines(['Could not generate summary. Please try again.'])
          },
        })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setSummaryLoading(false)
        setSummaryDone(true)
        setSummaryLines([err?.message || 'Failed to generate summary.'])
      })
  }

  const handleCopySummary = async () => {
    const text = summaryLines.join('\n')
    if (!text) return
    try {
      await globalThis.navigator.clipboard.writeText(text)
      setSummaryMessage('Copied to clipboard')
    } catch {
      setSummaryMessage('Copy not available')
    }
  }
  return (
    <aside className={`${sidebarCollapsed ? 'w-16' : 'w-72 xl:w-80 2xl:w-88'} flex shrink-0 flex-col border-r border-slate-200/80 bg-white/40 backdrop-blur-3xl transition-all duration-300 dark:border-[#252530]/80 dark:bg-[#0e0e15]/60 z-20 overflow-y-auto overflow-x-hidden scrollbar-hide relative`}>

      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/80 bg-white shadow-md text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:border-[#252530] dark:bg-[#111118] dark:hover:text-indigo-400 transition-all"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
          {sidebarCollapsed
            ? <polyline points="9 18 15 12 9 6" />
            : <polyline points="15 18 9 12 15 6" />
          }
        </svg>
      </button>

      {!sidebarCollapsed && (
        <div className="flex flex-col gap-5 p-5">
          {/* Patient Identity */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br text-xl font-black text-white shadow-lg ring-4 ring-white dark:ring-[#1a1a24] ${patient.avatar?.from ?? 'from-indigo-400'} ${patient.avatar?.to ?? 'to-violet-600'}`}>
              {patient.initials ?? patient.name?.[0] ?? '?'}
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{patient.name}</h2>
            
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                {patient.age ? `${patient.age}Y` : '–'} · {patient.gender ?? '–'}
              </span>
              {patient.blood && (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">{patient.blood}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-[#252530]" />

          {/* Vitals Quick View */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Current Vitals</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'BP', val: vitals?.blood_pressure ?? '–', unit: 'mmHg', color: 'text-rose-500' },
                { label: 'Temp', val: vitals?.temperature ?? '–', unit: '°C', color: 'text-amber-500' },
                { label: 'HR', val: vitals?.heart_rate ?? '–', unit: 'bpm', color: 'text-indigo-500' },
                { label: 'SpO₂', val: vitals?.spo2 ?? '–', unit: '%', color: 'text-emerald-500' },
              ].map((v) => (
                <div key={v.label} className="rounded-xl border border-slate-200/60 bg-white/60 p-2.5 dark:border-[#252530]/60 dark:bg-[#111118]/60">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-[#606070]">{v.label}</p>
                  <p className={`text-sm font-black dark:text-[#eeeef5] ${v.color}`}>{v.val}<span className="ml-0.5 text-[9px] font-medium text-slate-400 dark:text-[#505060]">{v.unit}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* High Alert Allergies */}
          {severeAllergies.length > 0 && (
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="mb-2 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="h-3.5 w-3.5"><AlertTriangleIcon /></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Severe Allergies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {severeAllergies.map((a) => (
                  <span key={a.name} className="rounded-lg bg-rose-200/50 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">{a.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Active Medications */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Active Medications</p>
            <div className="space-y-1.5">
              {activeMedications.map((med) => (
                <div key={med.name} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/30 p-2 dark:border-[#1c1c25] dark:bg-[#111118]/30">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#eeeef5]">{med.name}</p>
                    <p className="text-[9px] text-slate-400">{med.dose}</p>
                  </div>
                </div>
              ))}
              {activeMedications.length === 0 && <p className="text-xs text-slate-400 italic">None recorded</p>}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-[#252530]" />

          {/* AI Patient Summary */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 to-white/30 p-4 shadow-sm dark:border-indigo-900/30 dark:from-[#13131f]/80 dark:to-[#0e0e15]/50">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /><circle cx="18" cy="8" r="4" fill="currentColor" stroke="none" /><path d="M16 8h4M18 6v4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                AI Summary
              </p>

              {/* Language toggle grouped nicely */}
              <div className="flex rounded-lg bg-indigo-100/50 p-0.5 ring-1 ring-indigo-200/50 dark:bg-[#1a1a2e] dark:ring-indigo-900/50">
                {['vi', 'en'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSummaryLanguage(lang)}
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase transition-all ${summaryLanguage === lang ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white' : 'text-slate-500 hover:text-indigo-600 dark:text-[#70708a] dark:hover:text-indigo-300'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {!(summaryLoading || summaryLines.length > 0) ? (
              <div className="flex flex-col items-center justify-center py-3 text-center">
                <p className="mb-3 text-xs text-slate-500 dark:text-[#70708a]">Generate a quick overview of patient history, recent labs, and notes.</p>
                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={!patientId}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] bg-[-100%_0] transition-all duration-700 group-hover:bg-[100%_0]" />
                  <span className="relative z-10">Summarize Patient</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="relative rounded-xl border border-indigo-100 bg-white/60 p-3 text-xs shadow-inner dark:border-[#2a2a3e] dark:bg-[#111118]/80">
                  {summaryLoading && summaryLines.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-4 opacity-70">
                      <svg className="mb-2 h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-[#70708a] animate-pulse">Analyzing EMR records...</span>
                    </div>
                  )}
                  {summaryLines.length > 0 && (
                    <div className="relative z-10 max-h-[300px] overflow-y-auto scrollbar-hide text-slate-700 dark:text-[#c8c8e0]">
                       <AiMessageContent text={summaryLines.join('\n')} />
                       {summaryLoading && (
                         <div className="mt-2 flex items-center gap-1.5 opacity-50">
                           <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500"></div>
                           <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: '0.1s' }}></div>
                           <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: '0.2s' }}></div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {summaryDone && (
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#9898b0] dark:hover:bg-[#1c1c25] dark:hover:text-indigo-400"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    )}
                    {summaryMessage && <span className="animate-in fade-in slide-in-from-left-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{summaryMessage}</span>}
                  </div>
                  <button
                     type="button"
                     onClick={handleSummarize}
                     disabled={summaryLoading}
                     className={`rounded-full p-1.5 transition-colors ${summaryLoading ? 'text-slate-400 dark:text-[#505060]' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:text-[#70708a] dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300'}`}
                     title={summaryDone ? "Regenerate Summary" : "Stop Generation"}
                  >
                     {summaryLoading ? (
                       <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                     ) : (
                       <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/></svg>
                     )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {sidebarCollapsed && (
        <div className="flex flex-col items-center gap-5 py-8 mt-4">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br text-xs font-black text-white flex items-center justify-center ${patient.avatar?.from ?? 'from-indigo-400'} ${patient.avatar?.to ?? 'to-violet-600'}`}>
            {patient.initials ?? patient.name?.[0] ?? '?'}
          </div>
          {severeAllergies.length > 0 && <span className="h-2 w-2 rounded-full bg-rose-500" title="Severe Allergy Alert" />}
          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Medications" />
        </div>
      )}
    </aside>
  )
}

PatientContextSidebar.propTypes = {
  patient: PropTypes.object.isRequired,
  vitals: PropTypes.object,
  activeMedications: PropTypes.array,
  severeAllergies: PropTypes.array,
  sidebarCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
}
