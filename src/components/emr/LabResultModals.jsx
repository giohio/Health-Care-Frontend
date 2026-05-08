/**
 * LabResultModals — shared modal components for lab result review workflow.
 *
 * Exports:
 *   AiDraftRenderer   — renders structured AI draft text
 *   UploadModal       — file upload or manual entry for a lab order
 *   VerifyModal       — review AI draft and publish result
 *   HolisticSummaryModal — polling modal for appointment-level AI summary
 *   formatDateLabel   — utility for consistent date display
 *   parseAiDraft      — cleans raw AI draft text / parses JSON findings arrays
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { emrApi } from '../../api/emr'
import {
  stripAiWarning,
  parseAiDraft,
  detectPriority,
  patientLabel,
  testLabel,
} from './labResultUtils'

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

// formatDateLabel is now imported from ./labResultUtils

// Shared parsing and status utilities are imported from ./labResultUtils

const PRIORITY_STYLES = {
  urgent:   { bg: 'bg-rose-50 dark:bg-rose-950/30',    border: 'border-rose-300 dark:border-rose-700/50',    text: 'text-rose-700 dark:text-rose-400',    dot: 'bg-rose-500',   label: 'URGENT'   },
  high:     { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-700/50', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', label: 'HIGH'     },
  moderate: { bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-700/40',  text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500',  label: 'MODERATE' },
  low:      { bg: 'bg-green-50 dark:bg-green-950/30',   border: 'border-green-200 dark:border-green-700/40',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500',  label: 'LOW'      },
}

function PriorityBadge({ ps, priority }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${ps.bg} ${ps.border}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${ps.dot} ${priority === 'urgent' ? 'animate-pulse' : ''}`} />
      <span className={`text-xs font-bold tracking-widest uppercase ${ps.text}`}>Priority: {ps.label}</span>
    </div>
  )
}
PriorityBadge.propTypes = { ps: PropTypes.object.isRequired, priority: PropTypes.string.isRequired }

function InlineText({ text }) {
  const parts = text.split(/(\*{1,2}[^*]+\*{1,2})/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="font-semibold text-slate-800 dark:text-[#dddde8]">{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i} className="italic">{part.slice(1, -1)}</em>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
InlineText.propTypes = { text: PropTypes.string.isRequired }

function AiSection({ section }) {
  const lines = section.body.split('\n').filter((l) => l.trim())
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#7070a0]">
        {section.num}. {section.title}
      </p>
      <ul className="space-y-1">
        {lines.map((line, i) => {
          const clean = line.replace(/^\*\s+/, '').trim()
          if (!clean) return null
          const isBullet = /^\*/.test(line.trim())
          return (
            <li key={i} className={`flex gap-1.5 text-[13px] leading-snug text-slate-600 dark:text-[#b8b8cc] ${isBullet ? 'pl-1' : ''}`}>
              {isBullet && <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />}
              <span><InlineText text={clean} /></span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
AiSection.propTypes = { section: PropTypes.object.isRequired }

/**
 * AiDraftRenderer — renders structured AI draft text with priority badge and sections.
 * @param {string}  text      — raw AI draft string
 * @param {boolean} collapsed — if true, shows only the first section
 */
export function AiDraftRenderer({ text, fileType, collapsed = false }) {
  if (!text) {
    if (fileType === 'manual') {
      return <p className="text-xs italic opacity-60 text-amber-600 dark:text-amber-400">Manual entries submitted — AI analysis pending. Use &quot;Retry AI&quot; to trigger.</p>
    }
    return <p className="text-xs italic opacity-60 text-slate-500">AI draft is ready for physician verification.</p>
  }

  let parsedData = null;
  try {
    parsedData = JSON.parse(text);
  } catch {
    // not JSON
  }

  if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === 'object') {
    return (
      <div className="my-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/50">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">Test Name</th>
              <th className="px-3 py-2 font-medium">Value</th>
              <th className="px-3 py-2 font-medium">Flag</th>
              <th className="px-3 py-2 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
            {parsedData.map((item, idx) => (
              <tr key={idx} className={item.flag && item.flag.toLowerCase() !== 'normal' ? 'bg-orange-50/50 dark:bg-orange-500/5' : ''}>
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{item.test_name || item.name || '-'}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center ${(item.flag && item.flag.toLowerCase() !== 'normal') ? 'font-bold text-orange-600 dark:text-orange-400' : ''}`}>
                    {item.value || '-'} {item.unit || ''}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {item.flag ? (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                      item.flag.toLowerCase() === 'high' || item.flag.toLowerCase() === 'low' || item.flag.toLowerCase() === 'abnormal'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {item.flag}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {(item.reference_low !== undefined || item.reference_high !== undefined) 
                    ? `${item.reference_low ?? ''} - ${item.reference_high ?? ''} ${item.unit || ''}`
                    : (item.reference_range || '-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const stripped = stripAiWarning(text)

  const priority = detectPriority(stripped)
  const ps = priority ? PRIORITY_STYLES[priority] : null

  const sectionRe = /(?:^|\n)\*?\*?(\d+)\.\s+([^\n*]+)\*?\*?\n([\s\S]*?)(?=(?:\n\*?\*?\d+\.)|$)/g
  const sections = []
  let m
  while ((m = sectionRe.exec(stripped)) !== null) {
    const title = m[2].replace(/\*+/g, '').trim()
    const body = m[3].trim()
    if (/priority\s*level/i.test(title)) continue
    sections.push({ num: m[1], title, body })
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-1">
        {ps && <PriorityBadge ps={ps} priority={priority} />}
        <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-[#b8b8cc]">{stripped}</p>
      </div>
    )
  }

  const visibleSections = collapsed ? sections.slice(0, 1) : sections
  return (
    <div className="space-y-3">
      {ps && <PriorityBadge ps={ps} priority={priority} />}
      {visibleSections.map((sec) => <AiSection key={sec.num} section={sec} />)}
    </div>
  )
}
AiDraftRenderer.propTypes = { text: PropTypes.string, collapsed: PropTypes.bool }

// ---------------------------------------------------------------------------
// Icons (local — no external dep)
// ---------------------------------------------------------------------------

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// UploadModal
// ---------------------------------------------------------------------------

const EMPTY_ROW = () => ({ _id: crypto.randomUUID(), test_name: '', value: '', unit: '', reference_range: '' })
const FIELD_PLACEHOLDER = { test_name: 'e.g. Glucose', value: 'e.g. 5.2', unit: 'mmol/L', reference_range: '3.9–6.1' }

// Parse a CSV text into row objects compatible with manual entry
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return []
  // Detect if first line is a header (contains any known column names)
  const KNOWN_HEADERS = ['test_name', 'test', 'name', 'value', 'result', 'unit', 'reference_range', 'ref', 'range']
  const firstLower = lines[0].toLowerCase()
  const hasHeader = KNOWN_HEADERS.some((h) => firstLower.includes(h))
  const dataLines = hasHeader ? lines.slice(1) : lines

  // Detect delimiter
  const delim = lines[0].includes('\t') ? '\t' : ','

  // Map header positions
  let colMap = { test_name: 0, value: 1, unit: 2, reference_range: 3 }
  if (hasHeader) {
    const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase().replace(/["']/g, ''))
    const find = (...keys) => keys.reduce((acc, k) => acc !== -1 ? acc : headers.indexOf(k), -1)
    const ti = find('test_name', 'test', 'name', 'parameter')
    const vi = find('value', 'result', 'result_value')
    const ui = find('unit', 'units')
    const ri = find('reference_range', 'ref_range', 'range', 'normal_range', 'ref')
    if (ti !== -1) colMap.test_name = ti
    if (vi !== -1) colMap.value = vi
    if (ui !== -1) colMap.unit = ui
    if (ri !== -1) colMap.reference_range = ri
  }

  return dataLines
    .map((line) => {
      const cols = line.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ''))
      return {
        _id: crypto.randomUUID(),
        test_name: cols[colMap.test_name] ?? '',
        value: cols[colMap.value] ?? '',
        unit: cols[colMap.unit] ?? '',
        reference_range: cols[colMap.reference_range] ?? '',
      }
    })
    .filter((r) => r.test_name || r.value)
}

export function UploadModal({ order, onClose, onSuccess }) {
  const [mode, setMode] = useState('file')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileNotes, setFileNotes] = useState('')
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)
  const [rows, setRows] = useState([EMPTY_ROW()])
  const [manualNotes, setManualNotes] = useState('')
  // CSV mode state
  const [csvFileName, setCsvFileName] = useState(null)
  const [csvRows, setCsvRows] = useState([])
  const [csvNotes, setCsvNotes] = useState('')

  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCsv(ev.target.result)
      if (parsed.length === 0) { setError('No data rows found in CSV.'); return }
      setCsvRows(parsed)
    }
    reader.readAsText(file)
  }

  const updateCsvRow = (idx, field, val) =>
    setCsvRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  const removeCsvRow = (idx) => setCsvRows((prev) => prev.filter((_, i) => i !== idx))

  const handleCsvSubmit = async () => {
    const validRows = csvRows.filter((r) => r.test_name.trim() && r.value.trim())
    if (validRows.length === 0) { setError('No valid rows (test name + value required).'); return }
    setUploading(true); setError(null)
    try {
      await emrApi.createLabResultManual({
        order_id: order.id,
        patient_id: order.patient_id || order.patientId,
        doctor_id: order.doctor_id,
        manual_entries: validRows.map((r) => ({
          test_name: r.test_name.trim(),
          value: r.value.trim(),
          ...(r.unit.trim() ? { unit: r.unit.trim() } : {}),
          ...(r.reference_range.trim() ? { reference_range: r.reference_range.trim() } : {}),
        })),
        notes: csvNotes || undefined,
      })
      onSuccess()
    } catch (err) {
      console.error('CSV Submit Error:', err)
      setError(err?.message || 'Submission failed. Please check your data and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => { setSelectedFile(e.target.files?.[0] || null); setError(null) }

  const handleFileSubmit = async () => {
    if (!selectedFile) { setError('Please select a file.'); return }
    setUploading(true); setError(null)
    try {
      const uploadRes = await emrApi.uploadFile(selectedFile, 'lab_results')
      const fileUrl = uploadRes?.url || uploadRes?.data?.url
      const fileType = uploadRes?.file_type || uploadRes?.data?.file_type || 'other'
      if (!fileUrl) throw new Error('Upload successful but server did not return a file URL.')
      
      await emrApi.createLabResultFile({
        order_id: order.id,
        patient_id: order.patient_id || order.patientId,
        doctor_id: order.doctor_id,
        file_url: fileUrl,
        file_type: fileType,
        notes: fileNotes || undefined,
      })
      onSuccess()
    } catch (err) {
      console.error('File Upload/Submit Error:', err)
      setError(err?.message || 'Upload failed. Please check your connection and file size.')
    } finally {
      setUploading(false)
    }
  }

  const updateRow = (idx, field, val) =>
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  const addRow = () => setRows((prev) => [...prev, EMPTY_ROW()])
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx))

  const handleManualSubmit = async () => {
    const validRows = rows.filter((r) => r.test_name.trim() && r.value.trim())
    if (validRows.length === 0) { setError('Add at least one test with name and value.'); return }
    setUploading(true); setError(null)
    try {
      await emrApi.createLabResultManual({
        order_id: order.id,
        patient_id: order.patient_id || order.patientId,
        doctor_id: order.doctor_id,
        manual_entries: validRows.map((r) => ({
          test_name: r.test_name.trim(),
          value: r.value.trim(),
          ...(r.unit.trim() ? { unit: r.unit.trim() } : {}),
          ...(r.reference_range.trim() ? { reference_range: r.reference_range.trim() } : {}),
        })),
        notes: manualNotes || undefined,
      })
      onSuccess()
    } catch (err) {
      console.error('Manual Submit Error:', err)
      setError(err?.message || 'Submission failed. Please check your entries.')
    } finally {
      setUploading(false)
    }
  }

  return createPortal(
    <dialog
      open
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full border-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25]">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Upload Result</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#7070a0]">{testLabel(order)} — {patientLabel(order)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c1c25]">
            <span className="inline-flex h-4 w-4"><XIcon /></span>
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-100 px-6 py-3 dark:border-[#1c1c25]">
          {[['file', 'File Upload'], ['csv', 'CSV Import'], ['manual', 'Manual Entry']].map(([m, label]) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null) }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="px-6 py-4">
          {mode === 'file' && (
            <div className="space-y-4">
              <div>
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
                {selectedFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#252530] dark:bg-[#16161e]">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedFile(null); fileInputRef.current.value = '' }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252530]">
                      <span className="inline-flex h-4 w-4"><XIcon /></span>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-[#252530] dark:hover:border-indigo-700">
                    <span className="inline-flex h-8 w-8"><UploadIcon /></span>
                    <span className="text-sm font-medium">Click to select file</span>
                    <span className="text-xs">PDF, PNG, JPG supported</span>
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="um-file-notes" className="mb-1 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Notes (optional)</label>
                <textarea id="um-file-notes" value={fileNotes} onChange={(e) => setFileNotes(e.target.value)} rows={2}
                  placeholder="Additional notes…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060]" />
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_1fr_72px_96px_28px] gap-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#505060]">
                <span>Test name *</span><span>Value *</span><span>Unit</span><span>Ref range</span><span />
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {rows.map((row, idx) => (
                  <div key={row._id} className="grid grid-cols-[1fr_1fr_72px_96px_28px] gap-1.5">
                    {['test_name', 'value', 'unit', 'reference_range'].map((field) => (
                      <input key={field} value={row[field]} onChange={(e) => updateRow(idx, field, e.target.value)}
                        placeholder={FIELD_PLACEHOLDER[field]}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060]"
                        aria-label={field.replace('_', ' ')} />
                    ))}
                    <button type="button" onClick={() => removeRow(idx)} disabled={rows.length === 1}
                      className="flex items-center justify-center rounded-lg p-1 text-slate-300 hover:text-rose-400 disabled:opacity-30 dark:text-[#505060]" aria-label="Remove row">
                      <span className="inline-flex h-4 w-4"><TrashIcon /></span>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-indigo-300 hover:text-indigo-500 dark:border-[#252530]">
                <span className="inline-flex h-3.5 w-3.5"><PlusIcon /></span> Add row
              </button>
              <div>
                <label htmlFor="um-manual-notes" className="mb-1 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Notes (optional)</label>
                <textarea id="um-manual-notes" value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} rows={2}
                  placeholder="Additional notes…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060]" />
              </div>
            </div>
          )}

          {mode === 'csv' && (
            <div className="space-y-3">
              <input ref={csvInputRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCsvFileChange} />
              {csvRows.length === 0 ? (
                <button type="button" onClick={() => csvInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-[#252530] dark:hover:border-indigo-700">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18" />
                  </svg>
                  <span className="text-sm font-medium">Click to select CSV file</span>
                  <span className="text-xs">CSV or TSV — columns: test_name, value, unit, reference_range</span>
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600 dark:text-[#9898b0]">{csvFileName} — {csvRows.length} rows</p>
                    <button type="button" onClick={() => { setCsvRows([]); setCsvFileName(null); csvInputRef.current && (csvInputRef.current.value = '') }}
                      className="text-xs text-slate-400 hover:text-rose-500">Clear</button>
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_72px_96px_28px] gap-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#505060]">
                    <span>Test name</span><span>Value</span><span>Unit</span><span>Ref range</span><span />
                  </div>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {csvRows.map((row, idx) => (
                      <div key={row._id} className="grid grid-cols-[1fr_1fr_72px_96px_28px] gap-1.5">
                        {['test_name', 'value', 'unit', 'reference_range'].map((field) => (
                          <input key={field} value={row[field]} onChange={(e) => updateCsvRow(idx, field, e.target.value)}
                            placeholder={FIELD_PLACEHOLDER[field]}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060]"
                            aria-label={field.replace('_', ' ')} />
                        ))}
                        <button type="button" onClick={() => removeCsvRow(idx)}
                          className="flex items-center justify-center rounded-lg p-1 text-slate-300 hover:text-rose-400 dark:text-[#505060]" aria-label="Remove row">
                          <span className="inline-flex h-4 w-4"><TrashIcon /></span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-[#9898b0]">Notes (optional)</label>
                <textarea value={csvNotes} onChange={(e) => setCsvNotes(e.target.value)} rows={2}
                  placeholder="Additional notes…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060]" />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-[#1c1c25]">
          <button type="button" onClick={onClose} disabled={uploading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#252530] dark:text-[#9898b0]">
            Cancel
          </button>
          <button type="button"
            onClick={mode === 'file' ? handleFileSubmit : mode === 'csv' ? handleCsvSubmit : handleManualSubmit}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {uploading && <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />}
            {uploading ? 'Uploading…' : 'Submit Result'}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

UploadModal.propTypes = {
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// VerifyModal
// ---------------------------------------------------------------------------

export function VerifyModal({ order, result, onClose, onConfirm }) {
  const [interpretation, setInterpretation] = useState(
    parseAiDraft(result.ai_draft_text || result.aiDraft || ''),
  )
  const [doctorNotes, setDoctorNotes] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setPublishing(true)
    setError(null)
    try {
      await onConfirm({ interpretation, doctorNotes })
    } catch (err) {
      setError(err?.message || 'Failed to publish. Please try again.')
      setPublishing(false)
    }
  }

  const entries = result.manual_entries || result.manualEntries || []

  return createPortal(
    <dialog
      open
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full border-0"
      onClick={(e) => e.target === e.currentTarget && !publishing && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && !publishing && onClose()}
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118] flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25] shrink-0">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Review &amp; Publish</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#7070a0]">{testLabel(order)} — {patientLabel(order)}</p>
          </div>
          <button type="button" onClick={onClose} disabled={publishing}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-[#1c1c25]">
            <span className="inline-flex h-4 w-4"><XIcon /></span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {result.ai_confidence != null && (
            <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 dark:border-indigo-800/40 dark:bg-indigo-950/30">
              <span className="text-sm">✨</span>
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                AI confidence: {Math.round(result.ai_confidence * 100)}%
              </p>
            </div>
          )}

          {(result.required_specialty || String(result.status || '').toUpperCase() === 'NEEDS_MANUAL_REVIEW') && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-700/40 dark:bg-amber-950/30">
              <span className="mt-0.5 text-sm">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {result.required_specialty
                    ? `Specialist review required — ${result.required_specialty}`
                    : 'Low AI confidence — manual review recommended'}
                </p>
                <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-500/70">Please verify all values carefully before publishing.</p>
              </div>
            </div>
          )}

          {entries.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#505060]">Lab Values</p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 dark:border-[#1c1c25] dark:bg-[#16161e] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#1c1c25] text-slate-400 dark:text-[#505060]">
                      <th className="px-3 py-2 text-left font-semibold">Test</th>
                      <th className="px-3 py-2 text-left font-semibold">Value</th>
                      <th className="px-3 py-2 text-left font-semibold">Unit</th>
                      <th className="px-3 py-2 text-left font-semibold">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={e.test_name || i} className="border-b border-slate-100 dark:border-[#1c1c25] last:border-0">
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-[#c8c8e0]">{e.test_name || '—'}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-[#c8c8e0]">{e.value || '—'}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-[#7070a0]">{e.unit || '—'}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-[#7070a0]">{e.reference_range || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(result.ai_draft_text || result.aiDraft) && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#505060]">AI Analysis</p>
              <AiDraftRenderer text={result.ai_draft_text || result.aiDraft} />
            </div>
          )}

          <div>
            <label htmlFor="vm-interpretation" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
              Doctor&apos;s Interpretation{' '}
              <span className="ml-2 font-normal text-slate-400 dark:text-[#505060]">— edit before publishing</span>
            </label>
            <textarea id="vm-interpretation" rows={6} value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="No AI draft available — enter interpretation manually."
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-950/10 dark:text-[#c8c8e0] dark:placeholder-[#505060] dark:focus:ring-indigo-900/40 resize-none" />
          </div>

          <div>
            <label htmlFor="vm-notes" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">
              Doctor&apos;s Notes{' '}
              <span className="ml-2 font-normal text-slate-400 dark:text-[#505060]">— optional</span>
            </label>
            <textarea id="vm-notes" rows={3} value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Additional clinical notes or recommendations…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-indigo-400 focus:outline-none dark:border-[#252530] dark:bg-[#16161e] dark:text-[#c8c8e0] dark:placeholder-[#505060] resize-none" />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-[#1c1c25] shrink-0">
          <button type="button" onClick={onClose} disabled={publishing}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#252530] dark:text-[#9898b0]">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {publishing && <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />}
            {publishing ? 'Publishing…' : 'Verify & Publish'}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

VerifyModal.propTypes = {
  order: PropTypes.object.isRequired,
  result: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// HolisticSummaryModal
// ---------------------------------------------------------------------------

export function HolisticSummaryModal({ appointmentId, patientName, onClose }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conclusion, setConclusion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const pollRef = useRef(null)

  const fetchSummary = useCallback(async () => {
    try {
      const data = await emrApi.getAppointmentLabSummary(appointmentId)
      setSummary(data)
      setError(null)
      const status = (data?.status || '').toUpperCase()
      if (status === 'DONE' || status === 'FAILED') {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    } catch (err) {
      if (err?.status === 404 || String(err?.message).includes('404')) {
        setSummary({ status: 'NOT_STARTED' })
        setError(null)
      } else {
        setError('Could not load holistic summary. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [appointmentId])

  useEffect(() => {
    fetchSummary()
    pollRef.current = setInterval(fetchSummary, 5000)
    return () => clearInterval(pollRef.current)
  }, [fetchSummary])

  const handleSubmitConclusion = useCallback(async () => {
    if (!conclusion.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await emrApi.reviewHolisticSummary(appointmentId, conclusion.trim())
      setSummary(updated)
      setConclusion('')
    } catch {
      setSubmitError('Failed to save conclusion. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [appointmentId, conclusion])

  const status = (summary?.status || '').toUpperCase()
  const isNotStarted = status === 'NOT_STARTED'
  const isPending = status === 'PENDING' || status === 'PROCESSING'
  const isDone = status === 'DONE'
  const hasConclusion = !!summary?.doctor_conclusion

  const handleForceTrigger = async () => {
    setLoading(true)
    try {
      await emrApi.triggerHolisticSummary(appointmentId)
      fetchSummary()
    } catch (err) {
      setError(err?.message || 'Failed to trigger holistic summary. Please ensure at least one test is published.')
      setLoading(false)
    }
  }

  return createPortal(
    <dialog
      open
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full border-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#252530] dark:bg-[#111118] flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#1c1c25] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Holistic Summary</p>
              <p className="text-xs text-slate-400 dark:text-[#7070a0]">{patientName} — all lab results combined</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-[#1c1c25]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-400 dark:text-[#7070a0]">
              <span className="inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-violet-400 border-r-transparent" />
              <p className="text-sm">Loading holistic analysis…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-800/40 dark:bg-rose-950/30">
              <span className="text-base">⚠️</span>
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          {!loading && !error && isNotStarted && (
            <div className="flex flex-col items-center justify-center gap-5 py-14">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-[#c8c8e0]">Summary Not Generated</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-[#7070a0]">
                  Holistic summary generates automatically when all ordered tests are completed.
                  If some tests were skipped or not uploaded, you can manually trigger it for the published results.
                </p>
              </div>
              <button
                type="button"
                onClick={handleForceTrigger}
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 shadow-sm"
              >
                Generate Summary
              </button>
            </div>
          )}

          {!loading && !error && isPending && (
            <div className="flex flex-col items-center justify-center gap-5 py-14">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-20" />
                <span className="inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-violet-500 border-r-transparent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-[#c8c8e0]">AI is analysing all results…</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-[#7070a0]">This usually takes 15–30 seconds. Results will appear automatically.</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 0.3, 0.6].map((d) => (
                  <span key={d} className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && status === 'FAILED' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-700/40 dark:bg-amber-950/30">
              <p className="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-300">⚠️ AI Analysis Incomplete</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                The holistic analysis could not complete automatically. Please review each individual result and form your own clinical impression.
              </p>
              {summary?.ai_holistic_text && (
                <div className="mt-4"><AiDraftRenderer text={summary.ai_holistic_text} /></div>
              )}
            </div>
          )}

          {!loading && !error && isDone && summary?.ai_holistic_text && (
            <div className="space-y-5">
              <div>
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 dark:border-violet-700/40 dark:bg-violet-950/30">
                  <span className="text-sm">🧬</span>
                  <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                    AI Holistic Analysis — cross-result synthesis across all published lab tests for this visit.
                    <span className="ml-1 font-normal text-violet-600/80 dark:text-violet-400/70">Physician review required before clinical action.</span>
                  </p>
                </div>
                <AiDraftRenderer text={summary.ai_holistic_text} />
              </div>

              {/* Doctor conclusion section */}
              <div className="border-t border-slate-100 pt-5 dark:border-[#1c1c25]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#7070a0]">
                  Physician Conclusion
                </p>

                {hasConclusion ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-700/40 dark:bg-emerald-950/30">
                    <p className="mb-1 text-xs text-emerald-600 dark:text-emerald-400">
                      Reviewed — {summary.reviewed_at ? new Date(summary.reviewed_at).toLocaleString() : ''}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-[#c8c8e0] whitespace-pre-wrap">{summary.doctor_conclusion}</p>
                    <button
                      type="button"
                      onClick={() => { setConclusion(summary.doctor_conclusion); }}
                      className="mt-2 text-xs text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Edit conclusion
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-[#7070a0]">No physician conclusion yet. Add yours below.</p>
                )}

                {(!hasConclusion || conclusion) && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      placeholder="Enter your clinical conclusion, management plan, or additional notes…"
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-[#2a2a35] dark:bg-[#1c1c25] dark:text-[#c8c8e0] dark:placeholder-[#7070a0] dark:focus:border-violet-500 dark:focus:ring-violet-900/30"
                    />
                    {submitError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400">{submitError}</p>
                    )}
                    <div className="flex justify-end gap-2">
                      {conclusion && (
                        <button
                          type="button"
                          onClick={() => { setConclusion(''); setSubmitError(null); }}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-[#2a2a35] dark:bg-[#111118] dark:text-[#7070a0]"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSubmitConclusion}
                        disabled={!conclusion.trim() || submitting}
                        className="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {submitting ? 'Saving…' : 'Save Conclusion'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-[#1c1c25] shrink-0">
          <p className="text-xs text-slate-400">
            {summary?.total_results != null ? `Based on ${summary.total_results} published result${summary.total_results !== 1 ? 's' : ''}` : ''}
          </p>
          <button type="button" onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-[#2a2a35] dark:bg-[#1c1c25] dark:text-[#a0a0c0] dark:hover:bg-[#252530]">
            Close
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

HolisticSummaryModal.propTypes = {
  appointmentId: PropTypes.string.isRequired,
  patientName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}
