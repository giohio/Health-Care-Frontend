import PropTypes from 'prop-types'
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

export default function PulmonologyPanel({ data }) {
  const badge = resultBadge(data.result, data.confidence)

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
              {data.recordingDuration} recording · {data.recordingDevice} · {data.analyzedAt}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        {ALL_SOUNDS.map((sound) => {
          const detected = data.detectedSounds.includes(sound)
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
            {!data.spectrogramData.available && (
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
                <p className="text-xs text-slate-700 dark:text-[#505060]">{data.spectrogramData.note}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
            <p className="text-[10px] font-mono text-slate-500">Duration: {data.recordingDuration}</p>
            <p className="text-[10px] italic text-slate-600">Device: {data.recordingDevice}</p>
          </div>
        </article>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">Auscultation Findings</p>

        <div className="grid grid-cols-2 gap-3">
          {data.lungFields.map((field) => {
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
        <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 dark:border-cyan-900/40 dark:bg-cyan-950/40">
          <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400">
            <SparklesIcon />
          </span>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-[#c8c8e0]">{data.aiSummary}</p>
        </div>
      </section>

      <AiDisclaimer
        text={data.disclaimer}
        modelName={data.modelName}
        dataset={data.dataset}
        analyzedAt={data.analyzedAt}
      />
    </div>
  )
}

PulmonologyPanel.propTypes = {
  data: PropTypes.shape({
    recordingDuration: PropTypes.string.isRequired,
    recordingDevice: PropTypes.string.isRequired,
    analyzedAt: PropTypes.string.isRequired,
    result: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    detectedSounds: PropTypes.arrayOf(PropTypes.string).isRequired,
    spectrogramData: PropTypes.shape({
      available: PropTypes.bool.isRequired,
      note: PropTypes.string.isRequired,
    }).isRequired,
    lungFields: PropTypes.arrayOf(PropTypes.shape({
      location: PropTypes.string.isRequired,
      sound: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })).isRequired,
    aiSummary: PropTypes.string.isRequired,
    disclaimer: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
  }).isRequired,
}
