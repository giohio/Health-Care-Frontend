import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { clinicalApi } from '../../api/clinical'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.notes)) return payload.notes
  return []
}

function formatDate(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function statusTone(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('active')) return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
  if (normalized.includes('resolved') || normalized.includes('completed')) return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300'
  if (normalized.includes('stopped') || normalized.includes('inactive')) return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]'
  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'
}

function isClinicalHistoryNote(note) {
  return String(note?.note_type || '').toLowerCase() !== 'summary'
}

function SectionCard({ title, subtitle, children, count }) {
  return (
    <section className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-[#252530]/60 dark:bg-[#111118]">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1c1c25]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#9898b0]">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  count: PropTypes.number.isRequired,
}

function EmptyState({ message }) {
  return <p className="py-6 text-center text-xs italic text-slate-400 dark:text-[#70708a]">{message}</p>
}

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
}

export default function MedicalHistoryTab({ patientId, refreshKey }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [diagnoses, setDiagnoses] = useState([])
  const [medications, setMedications] = useState([])
  const [notes, setNotes] = useState([])
  const [vaccinations, setVaccinations] = useState([])

  useEffect(() => {
    if (!patientId) return

    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError('')
      try {
        const [diagnosisRes, medicationRes, noteRes, vaccinationRes] = await Promise.all([
          clinicalApi.getDiagnoses(patientId),
          clinicalApi.getMedications(patientId),
          clinicalApi.getNotes(patientId),
          clinicalApi.getVaccinations(patientId),
        ])

        if (cancelled) return

        setDiagnoses(normalizeList(diagnosisRes))
        setMedications(normalizeList(medicationRes))
        setNotes(normalizeList(noteRes))
        setVaccinations(normalizeList(vaccinationRes))
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load medical history')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  const sortedNotes = useMemo(
    () => notes
      .filter(isClinicalHistoryNote)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [notes],
  )

  const sortedDiagnoses = useMemo(
    () => [...diagnoses].sort((a, b) => new Date(b.diagnosed_at || 0) - new Date(a.diagnosed_at || 0)),
    [diagnoses],
  )

  const sortedMedications = useMemo(
    () => [...medications].sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0)),
    [medications],
  )

  const sortedVaccinations = useMemo(
    () => [...vaccinations].sort((a, b) => new Date(b.date_administered || 0) - new Date(a.date_administered || 0)),
    [vaccinations],
  )

  if (!patientId) {
    return (
      <div className="rounded-3xl border border-slate-200/60 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-[#252530]/60 dark:bg-[#111118] dark:text-[#9898b0]">
        Select a patient to view medical history.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Clinical Notes" subtitle="SOAP notes and prior physician observations" count={sortedNotes.length}>
          {sortedNotes.length === 0 ? (
            <EmptyState message="No clinical notes available yet." />
          ) : (
            <div className="space-y-3">
              {sortedNotes.map((note) => (
                <article key={note.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-[#252530] dark:bg-[#1c1c25]/60">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {note.note_type || 'clinical note'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#70708a]">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-[#c8c8e0]">{note.content || '--'}</p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Diagnoses" subtitle="Active and resolved diagnoses on record" count={sortedDiagnoses.length}>
          {sortedDiagnoses.length === 0 ? (
            <EmptyState message="No diagnoses recorded yet." />
          ) : (
            <div className="space-y-3">
              {sortedDiagnoses.map((diagnosis) => (
                <article key={diagnosis.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-[#252530] dark:bg-[#1c1c25]/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{diagnosis.diagnosis_name || 'Diagnosis'}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#9898b0]">
                        ICD-10: {diagnosis.icd10_code || '--'}
                        {diagnosis.severity ? ` · Severity: ${diagnosis.severity}` : ''}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusTone(diagnosis.status)}`}>
                      {diagnosis.status || 'unknown'}
                    </span>
                  </div>
                  {diagnosis.diagnosis_detail && (
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-[#c8c8e0]">{diagnosis.diagnosis_detail}</p>
                  )}
                  <p className="mt-3 text-xs text-slate-400 dark:text-[#70708a]">
                    Diagnosed: {formatDate(diagnosis.diagnosed_at)}
                    {diagnosis.resolved_at ? ` · Resolved: ${formatDate(diagnosis.resolved_at)}` : ''}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Medications" subtitle="Prescription history and medication status" count={sortedMedications.length}>
          {sortedMedications.length === 0 ? (
            <EmptyState message="No medications prescribed yet." />
          ) : (
            <div className="space-y-3">
              {sortedMedications.map((medication) => (
                <article key={medication.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-[#252530] dark:bg-[#1c1c25]/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{medication.drug_name || 'Medication'}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#9898b0]">
                        {medication.dosage || '--'}
                        {medication.frequency ? ` · ${medication.frequency}` : ''}
                        {medication.route ? ` · ${medication.route}` : ''}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusTone(medication.status)}`}>
                      {medication.status || 'unknown'}
                    </span>
                  </div>
                  {medication.notes && (
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-[#c8c8e0]">{medication.notes}</p>
                  )}
                  <p className="mt-3 text-xs text-slate-400 dark:text-[#70708a]">
                    Start: {formatDate(medication.start_date)}
                    {medication.end_date ? ` · End: ${formatDate(medication.end_date)}` : ''}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Vaccinations" subtitle="Immunization history and next due dates" count={sortedVaccinations.length}>
          {sortedVaccinations.length === 0 ? (
            <EmptyState message="No vaccination records found." />
          ) : (
            <div className="space-y-3">
              {sortedVaccinations.map((vaccination) => (
                <article key={vaccination.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-[#252530] dark:bg-[#1c1c25]/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{vaccination.vaccine_name || 'Vaccination'}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-[#9898b0]">
                        Dose {vaccination.dose_number || 1}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-[#70708a]">{formatDate(vaccination.date_administered)}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400 dark:text-[#70708a]">
                    Next due: {formatDate(vaccination.next_due_date)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

MedicalHistoryTab.propTypes = {
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshKey: PropTypes.number,
}
