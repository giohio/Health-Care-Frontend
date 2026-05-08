import React, { useState, useRef, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { analyzeAuscultation } from '../../api/ai'
import { clinicalApi } from '../../api/clinical'
import AiDisclaimer from '../shared/AiDisclaimer'

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h9a2 2 0 1 0-2-2" />
      <path d="M2 12h15a2 2 0 1 1-2 2" />
      <path d="M4 16h8a2 2 0 1 0-2 2" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}

function Volume2Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function VolumeXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function resultBadge(result, confidence) {
  if (result === 'abnormal') {
    return {
      className: 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
      label: 'Abnormal Sounds Detected',
    }
  }

  if (result === 'inconclusive') {
    return {
      className: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
      label: 'Inconclusive',
    }
  }

  return {
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400',
    label: `Clear · ${confidence}%`,
  }
}

function toTitle(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function soundPill(sound, detected) {
  if (!detected) {
    return 'border border-slate-100 bg-slate-50 text-slate-400 opacity-50 line-through dark:border-[#1c1c25] dark:bg-[#16161e] dark:text-[#606070]'
  }

  if (sound === 'normal') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400'
  }

  if (sound === 'wheezing' || sound === 'stridor') {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
  }

  if (sound === 'crackles' || sound === 'rhonchi') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
  }

  return 'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300'
}

const ALL_SOUNDS = ['normal', 'wheezing', 'crackles', 'rhonchi', 'stridor', 'pleural_rub']
const BAR_HEIGHTS = [12, 28, 18, 40, 24, 32, 14, 36, 20, 44, 16, 30, 22, 38, 10, 34, 26, 42, 18, 30]
const SPECTRUM_BARS = BAR_HEIGHTS.map((height, idx) => ({
  key: `h${height}-${idx + 1}`,
  height,
}))

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  )
}

function RotateCcwIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  )
}

const SOUND_NAME_MAP = {
  wheeze: 'wheezing',
  crackle: 'crackles',
  rhonchus: 'rhonchi',
  pleural: 'pleural_rub',
}

function normaliseSound(s) {
  return SOUND_NAME_MAP[s] || s
}

const LUNG_LOCATIONS = [
  'Right upper lobe',
  'Right lower lobe',
  'Left upper lobe',
  'Left lower lobe',
]

function mapLungSoundsResponse(apiRes, fileName) {
  const vf = apiRes.visual_findings || {}
  const rawAbnormal = (vf.abnormal_sounds || []).filter((s) => s && s !== 'none')
  const mappedSounds = rawAbnormal.map(normaliseSound)
  const detectedSounds = mappedSounds.length > 0 ? mappedSounds : ['normal']
  const isAbnormal = mappedSounds.length > 0
  const result = isAbnormal ? 'abnormal' : 'normal'

  const rawConf = vf.confidence ?? apiRes.confidence ?? 0
  const confidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf)

  const distribution = vf.distribution || 'bilateral'
  const lungFields = LUNG_LOCATIONS.map((location, idx) => {
    const isAffected = isAbnormal && (distribution === 'bilateral' || idx === 0)
    return {
      location,
      sound: isAffected ? mappedSounds.join(', ') || 'Abnormal sounds' : 'Normal vesicular',
      status: isAffected ? 'abnormal' : 'normal',
    }
  })

  const now = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return {
    recordingDuration: 'Uploaded',
    recordingDevice: fileName || 'Audio file',
    analyzedAt: now,
    result,
    confidence,
    detectedSounds,
    spectrogramData: { available: false, note: 'Spectrogram not available for uploaded files' },
    lungFields,
    aiSummary: apiRes.draft_text || '',
    disclaimer: apiRes.note || 'AI-assisted respiratory sound analysis. Clinical auscultation by physician is required.',
    modelName: apiRes.model_versions?.synthesis || 'AI Model',
    dataset: 'Clinical auscultation analysis',
  }
}

export default function PulmonologyPanel({ patientId, doctorId }) {
  const [status, setStatus] = useState('idle')   // 'idle' | 'uploading' | 'done' | 'error'
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [editText, setEditText] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')  // 'idle'|'saving'|'saved'|'error'
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (result) setEditText(result.aiSummary || '')
  }, [result])

  const handleFile = useCallback(async (file) => {
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (wav, mp3, ogg)')
      setStatus('error')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File exceeds 25 MB limit')
      setStatus('error')
      return
    }

    setFileName(file.name)
    setStatus('uploading')
    setError(null)

    try {
      const res = await analyzeAuscultation({
        file,
        patientId,
        soundType: 'lung_sounds',
        department: 'respiratory',
        language: 'vi',
      })
      setResult(mapLungSoundsResponse(res, file.name))
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Analysis failed. Please try again.')
    }
  }, [patientId])

  const handleInputChange = useCallback((e) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }, [handleFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [handleFile])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setFileName(null)
  }, [])

  // ── Uploading ───────────────────────────────────────────────────────────────
  if (status === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div
          role="status"
          aria-label="Analyzing audio"
          className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600 dark:border-cyan-900 dark:border-t-cyan-400"
        />
        <p className="text-sm text-slate-600 dark:text-[#9898b0]">
          Analyzing <span className="font-medium text-slate-900 dark:text-[#eeeef5]">{fileName}</span>…
        </p>
      </div>
    )
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (status === 'done' && result) {
    const badge = resultBadge(result.result, result.confidence)

    return (
      <div className="flex flex-col gap-5 pb-6">
        <header className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <span className="inline-flex h-5 w-5"><WindIcon /></span>
            </span>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Respiratory Sound Analysis</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">
                {result.recordingDuration} recording · {result.recordingDevice} · {result.analyzedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
            >
              <span className="inline-flex h-3.5 w-3.5"><RotateCcwIcon /></span>
              New recording
            </button>

            <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-3">
          {ALL_SOUNDS.map((sound) => {
            const detected = result.detectedSounds.includes(sound)
            return (
              <span key={sound} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${soundPill(sound, detected)}`}>
                <span className="inline-flex h-3.5 w-3.5">{detected ? <Volume2Icon /> : <VolumeXIcon />}</span>
                <span>{toTitle(sound)}</span>
                {detected && <span className="ml-1 text-[10px] opacity-60">Detected</span>}
              </span>
            )
          })}
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Audio Spectrogram</p>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
            <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[#050c1a]">
              {!result.spectrogramData.available && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 items-end justify-center gap-1">
                    {SPECTRUM_BARS.map((bar) => (
                      <span
                        key={bar.key}
                        className="w-1.5 rounded-sm bg-cyan-500/30 dark:bg-cyan-400/20"
                        style={{ height: `${bar.height}px` }}
                      />
                    ))}
                  </div>

                  <p className="mt-3 text-sm text-slate-600 dark:text-[#404050]">Spectrogram unavailable</p>
                  <p className="text-xs text-slate-700 dark:text-[#505060]">{result.spectrogramData.note}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
              <p className="text-[10px] font-mono text-slate-500">Duration: {result.recordingDuration}</p>
              <p className="text-[10px] italic text-slate-600">Device: {result.recordingDevice}</p>
            </div>
          </article>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Auscultation Findings</p>

          <div className="grid grid-cols-2 gap-3">
            {result.lungFields.map((field) => {
              const normal = field.status === 'normal'
              return (
                <article key={field.location} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
                        normal
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      <span className="inline-flex h-4 w-4">{normal ? <CheckCircleIcon /> : <AlertTriangleIcon />}</span>
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{field.location}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">{field.sound}</p>
                      <span
                        className={`mt-2 inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                          normal
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {normal ? 'Clear' : 'Abnormal'}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Doctor Review &amp; Save</p>
          <div className="mb-2 flex items-start gap-2 text-xs text-slate-500 dark:text-[#70708a]">
            <span className="mt-0.5 inline-flex h-3.5 w-3.5 flex-shrink-0 text-cyan-500 dark:text-cyan-400"><SparklesIcon /></span>
            <span>AI draft — review and edit before saving to patient record</span>
          </div>
          <textarea
            rows={5}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:focus:border-cyan-700 dark:focus:ring-cyan-950/40"
            placeholder="Edit AI draft before saving…"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {saveStatus === 'saved' && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved to record ✓</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Save failed — try again</span>
            )}
            <button
              type="button"
              disabled={saveStatus === 'saving' || !editText.trim()}
              onClick={async () => {
                setSaveStatus('saving')
                try {
                  await clinicalApi.createNote(patientId, {
                    doctor_id: doctorId,
                    content: editText,
                    note_type: 'auscultation',
                    is_ai_generated: true,
                  })
                  setSaveStatus('saved')
                } catch {
                  setSaveStatus('error')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              {saveStatus === 'saving' ? 'Saving…' : 'Confirm & Save'}
            </button>
          </div>
        </section>

        <AiDisclaimer
          text={result.disclaimer}
          modelName={result.modelName}
          dataset={result.dataset}
          analyzedAt={result.analyzedAt}
        />
      </div>
    )
  }

  // ── Idle / Error ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
          <span className="inline-flex h-5 w-5"><WindIcon /></span>
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Respiratory Sound Analysis</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#70708a]">Upload an auscultation recording to begin AI analysis</p>
        </div>
      </header>

      {status === 'error' && error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <span className="inline-flex h-4 w-4 flex-shrink-0"><AlertTriangleIcon /></span>
          {error}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload audio recording"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 transition ${
          dragOver
            ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-950/30'
            : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50/40 dark:border-[#252530] dark:bg-[#111118] dark:hover:border-cyan-800 dark:hover:bg-cyan-950/20'
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
          <span className="inline-flex h-6 w-6"><MicIcon /></span>
        </span>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-[#c8c8e0]">
            Drop audio file here, or <span className="text-cyan-600 dark:text-cyan-400">click to browse</span>
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#505060]">Supports wav, mp3, ogg, m4a · Max 25 MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          data-testid="audio-file-input"
          onChange={handleInputChange}
        />
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-[#404050]">
        AI model: LungSound CNN v2.2 · ICBHI Respiratory Sound Database
      </p>
    </div>
  )
}

PulmonologyPanel.propTypes = {
  patientId: PropTypes.string.isRequired,
  doctorId: PropTypes.string,
}
