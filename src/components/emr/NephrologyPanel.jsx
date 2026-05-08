import PropTypes from 'prop-types';
import AiRiskBadge from '../shared/AiRiskBadge';
import AiDisclaimer from '../shared/AiDisclaimer';

const STATUS_STYLES = {
  normal: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300',
  low: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300',
  high: 'text-rose-700 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300',
};

const WEIGHT_STYLES = {
  high: 'text-sky-700 bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300',
  medium: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300',
  low: 'text-slate-700 bg-slate-100 dark:bg-[#1c1c25] dark:text-[#c8c8e0]',
};

function MarkerRow({ marker }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#252530] dark:bg-[#111118]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{marker.name}</h4>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
            STATUS_STYLES[marker.status] || STATUS_STYLES.normal,
          ].join(' ')}
        >
          {marker.status}
        </span>
      </div>
      <p className="mt-2 text-base font-semibold text-slate-900 dark:text-[#eeeef5]">{marker.value}</p>
      <p className="text-xs text-slate-500 dark:text-[#70708a]">Ref: {marker.referenceRange}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-[#70708a]">AI Weight</span>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
            WEIGHT_STYLES[marker.aiWeight] || WEIGHT_STYLES.low,
          ].join(' ')}
        >
          {marker.aiWeight}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-[#9898b0]">{marker.note}</p>
    </article>
  );
}

MarkerRow.propTypes = {
  marker: PropTypes.shape({
    aiWeight: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    note: PropTypes.string.isRequired,
    referenceRange: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

export default function NephrologyPanel({ data }) {
  if (!data?.available) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-[#353545] dark:bg-[#111118]">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-[#eeeef5]">Nephrology</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-[#70708a]">
          No kidney-specific AI result is available for this patient yet.
        </p>
      </section>
    );
  }

  const isLowRisk = data.riskLevel === 'low';

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#70708a]">Nephrology AI Overview</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-[#eeeef5]">{data.modelName}</h3>
            <p className="text-sm text-slate-500 dark:text-[#70708a]">{data.dataset}</p>
          </div>
          <AiRiskBadge risk={data.riskLevel} confidence={data.confidence} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Result</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{isLowRisk ? 'No CKD Detected' : 'CKD Risk Detected'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Risk Score</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{Math.round(data.riskScore * 100)}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">eGFR Category</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{data.eGFRCategory}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Albuminuria</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{data.albuminuriaCategory}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-[#9898b0]">{data.aiSummary}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Key Kidney Markers</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.keyMarkers.map((marker) => (
            <MarkerRow key={marker.name} marker={marker} />
          ))}
        </div>
      </article>

      <article className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Risk Factors Present</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#9898b0]">
            {data.riskFactorsPresent.map((factor) => (
              <li key={factor} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#1c1c25] dark:bg-[#16161e]">
                {factor}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Protective Findings</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#9898b0]">
            {data.riskFactorsAbsent.map((factor) => (
              <li key={factor} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                {factor}
              </li>
            ))}
          </ul>
        </section>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#252530] dark:bg-[#111118]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Progression Risk</p>
            <p className="text-sm font-semibold capitalize text-slate-900 dark:text-[#eeeef5]">{data.progressionRisk}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Next Screening</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{data.nextScreeningRecommended}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1c1c25] dark:bg-[#16161e]">
            <p className="text-xs text-slate-500 dark:text-[#70708a]">Ordered By</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{data.orderedBy}</p>
          </div>
        </div>
      </article>

      <AiDisclaimer
        analyzedAt={data.analyzedAt}
        modelName={data.modelName}
        dataset={data.dataset}
        text={data.disclaimer}
      />
    </section>
  );
}

NephrologyPanel.propTypes = {
  data: PropTypes.shape({
    albuminuriaCategory: PropTypes.string,
    aiSummary: PropTypes.string,
    analyzedAt: PropTypes.string,
    available: PropTypes.bool,
    confidence: PropTypes.number,
    dataset: PropTypes.string,
    disclaimer: PropTypes.string,
    eGFRCategory: PropTypes.string,
    keyMarkers: PropTypes.arrayOf(MarkerRow.propTypes.marker),
    modelName: PropTypes.string,
    nextScreeningRecommended: PropTypes.string,
    orderedBy: PropTypes.string,
    progressionRisk: PropTypes.string,
    riskFactorsAbsent: PropTypes.arrayOf(PropTypes.string),
    riskFactorsPresent: PropTypes.arrayOf(PropTypes.string),
    riskLevel: PropTypes.string,
    riskScore: PropTypes.number,
  }),
};
