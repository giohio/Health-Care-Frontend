import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { appointmentApi } from '../../api/appointment'

const DATE_RANGES = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
]

const SPECIALTY_COLORS = ['from-teal-500 to-cyan-400', 'from-indigo-500 to-violet-400', 'from-cyan-500 to-teal-400', 'from-slate-500 to-gray-400', 'from-emerald-500 to-lime-400']
const STATUS_COLORS = [
  { key: 'completed', label: 'Completed', barColor: 'bg-emerald-500 dark:bg-emerald-400' },
  { key: 'confirmed', label: 'Confirmed', barColor: 'bg-indigo-500 dark:bg-indigo-400' },
  { key: 'pending', label: 'Pending', barColor: 'bg-amber-500 dark:bg-amber-400' },
  { key: 'cancelled', label: 'Cancelled', barColor: 'bg-rose-500 dark:bg-rose-400' },
]

const EXPORT_OPTIONS = [
  {
    key: 'patient-list',
    name: 'Patient List (CSV)',
    size: '~2.4MB',
    iconTone: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    action: 'reports/patient-list',
    icon: SpreadsheetIcon,
  },
  {
    key: 'appointment-report',
    name: 'Appointment Report (PDF)',
    size: '~1.8MB',
    iconTone: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    action: 'reports/appointment-report',
    icon: FileTextIcon,
  },
  {
    key: 'revenue-report',
    name: 'Revenue Report (XLSX)',
    size: '~890KB',
    iconTone: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    action: 'reports/revenue-report',
    icon: BarChartIcon,
  },
  {
    key: 'doctor-performance',
    name: 'Doctor Performance (PDF)',
    size: '~1.2MB',
    iconTone: 'bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    action: 'reports/doctor-performance',
    icon: UserCheckIcon,
  },
  {
    key: 'db-backup',
    name: 'Full Database Backup (JSON)',
    size: '~8.2MB',
    iconTone: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
    action: 'reports/db-backup',
    icon: DatabaseIcon,
  },
]

function FileDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="12" x2="12" y2="18" />
      <polyline points="9 15 12 18 15 15" />
    </svg>
  )
}

function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SpreadsheetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="10" x2="9" y2="20" />
      <line x1="15" y1="10" x2="15" y2="20" />
    </svg>
  )
}

function FileTextIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function BarChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function UserCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  )
}

function DatabaseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
    </svg>
  )
}

function formatRangeLabel(range) {
  if (range === 'week') return 'Last 7 days'
  if (range === 'month') return 'Last 30 days'
  if (range === 'quarter') return 'Last 90 days'
  return 'Last 12 months'
}

function fmtVnd(v) {
  if (v >= 1e6) return '₫' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '₫' + (v / 1e3).toFixed(0) + 'K'
  return '₫' + v
}

function fmtTickLabel(v, maxValue) {
  const val = Math.round((v * maxValue))
  if (val >= 1e6) return '₫' + (val / 1e6).toFixed(1) + 'M'
  if (val >= 1e3) return '₫' + (val / 1e3).toFixed(0) + 'K'
  return '₫' + val
}

function createSmoothPath(points) {
  if (points.length < 2) return ''

  const start = `M ${points[0].x} ${points[0].y}`
  const curves = points.slice(1).map((point, index) => {
    const prev = points[index]
    const cx = (prev.x + point.x) / 2
    return `Q ${cx} ${prev.y}, ${point.x} ${point.y}`
  })

  return `${start} ${curves.join(' ')}`
}

export default function ReportsView({ user }) {
  const [dateRange, setDateRange] = useState('month')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [stats, setStats] = useState(null)
  const [revenuePoints, setRevenuePoints] = useState([])
  const [loading, setLoading] = useState(true)

  const downloadCSV = useCallback((filename, headers, rows) => {
    const escape = (v) => {
      const s = String(v ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replaceAll('"', '""')}"`  : s
    }
    const csvContent = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleExport = useCallback((key) => {
    switch (key) {
      case 'appointment-report': {
        const rows = (stats?.by_status ? Object.entries(stats.by_status) : []).map(([status, count]) => [status, count])
        downloadCSV(`appointment-report-${dateRange}.csv`, ['Status', 'Count'], rows)
        break
      }
      case 'revenue-report': {
        const rows = revenuePoints.map(p => [p.label, p.value])
        downloadCSV(`revenue-report-${dateRange}.csv`, ['Period', 'Revenue (VND)'], rows)
        break
      }
      case 'patient-list': {
        const specRows = (stats?.by_specialty || []).map(s => [s.specialty_name, s.count, s.revenue ?? 0])
        downloadCSV(`specialty-report-${dateRange}.csv`, ['Specialty', 'Appointments', 'Revenue (VND)'], specRows)
        break
      }
      case 'doctor-performance': {
        const rows = (stats?.by_specialty || []).map(s => [s.specialty_name, s.doctor_count ?? '', s.count, s.revenue ?? 0])
        downloadCSV(`doctor-performance-${dateRange}.csv`, ['Specialty', 'Doctors', 'Appointments', 'Revenue (VND)'], rows)
        break
      }
      case 'db-backup': {
        const payload = JSON.stringify({ exported_at: new Date().toISOString(), stats, revenue: revenuePoints }, null, 2)
        const blob = new Blob([payload], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `db-backup-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        break
      }
      default:
        break
    }
  }, [stats, revenuePoints, dateRange, downloadCSV])

  const loadData = useCallback(async (range) => {
    setLoading(true)
    try {
      const [statsRes, chartRes] = await Promise.all([
        appointmentApi.getAdminStats({ range }).catch(() => null),
        appointmentApi.getAdminChartData({ range, metric: 'revenue' }).catch(() => null),
      ])
      if (statsRes) setStats(statsRes)
      if (chartRes && Array.isArray(chartRes.data_points)) {
        setRevenuePoints(chartRes.data_points.map((p) => ({ label: p.label, value: p.value })))
      }
    } catch { /* keep current */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData(dateRange) }, [dateRange, loadData])

  const chartData = useMemo(() => {
    if (revenuePoints.length < 2) return null
    const width = 500
    const height = 160
    const paddingTop = 14
    const paddingBottom = 24
    const paddingLeft = 12
    const innerWidth = width - paddingLeft * 2
    const innerHeight = height - paddingTop - paddingBottom
    const maxValue = Math.max(...revenuePoints.map((p) => p.value), 1)

    const points = revenuePoints.map((item, index) => {
      const x = paddingLeft + (index * innerWidth) / (revenuePoints.length - 1)
      const y = paddingTop + (1 - item.value / maxValue) * innerHeight
      return { ...item, x, y }
    })

    const linePath = createSmoothPath(points)
    const areaPath = `${linePath} L ${points.at(-1).x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`

    return {
      points,
      linePath,
      areaPath,
      width,
      height,
      xLabelsY: height - 4,
      maxValue,
      yTicks: [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
          label: fmtTickLabel(frac, maxValue),
          y: paddingTop + (1 - frac) * innerHeight,
      })),
    }
  }, [revenuePoints])

  const kpiCards = useMemo(() => {
    if (!stats) return []
    const fmt = (v) => fmtVnd(v)
    return [
      { label: 'Total Appointments', value: String(stats.total_appointments ?? 0), stripe: 'bg-indigo-500', valueTone: 'text-indigo-600 dark:text-indigo-400' },
      { label: 'Completion Rate', value: `${(stats.completion_rate ?? 0).toFixed(1)}%`, stripe: 'bg-teal-500', valueTone: 'text-teal-600 dark:text-teal-400' },
      { label: 'Revenue', value: fmt(stats.total_revenue ?? 0), stripe: 'bg-amber-500', valueTone: 'text-amber-600 dark:text-amber-400' },
      { label: 'Cancellation Rate', value: `${(stats.cancellation_rate ?? 0).toFixed(1)}%`, stripe: 'bg-rose-500', valueTone: 'text-rose-600 dark:text-rose-400' },
    ]
  }, [stats])

  const statusBreakdown = useMemo(() => {
    if (!stats?.by_status) return []
    const total = Object.values(stats.by_status).reduce((s, v) => s + v, 0) || 1
    return STATUS_COLORS.map((sc) => {
      const count = stats.by_status[sc.key] ?? 0
      return { label: sc.label, count, percent: Math.round((count / total) * 100), color: sc.barColor }
    }).filter((s) => s.count > 0)
  }, [stats])

  const specialtyBreakdown = useMemo(() => {
    if (!stats?.by_specialty || stats.by_specialty.length === 0) return []
    const maxCount = Math.max(...stats.by_specialty.map((s) => s.count), 1)
    return stats.by_specialty.map((s, i) => ({
      name: s.specialty_name,
      count: s.count,
      revenue: s.revenue,
      width: Math.round((s.count / maxCount) * 100),
      avatar: SPECIALTY_COLORS[i % SPECIALTY_COLORS.length],
    }))
  }, [stats])

  return (
    <>
      <span className="sr-only">{user.name}</span>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#eeeef5]">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#9898b0]">
            {stats?.period?.date_from && stats?.period?.date_to 
              ? `${stats.period.date_from} to ${stats.period.date_to}` 
              : formatRangeLabel(dateRange)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-[#252530] dark:bg-[#111118]">
            {DATE_RANGES.map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => setDateRange(range.key)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                  dateRange === range.key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-[#9898b0] dark:hover:bg-[#1c1c25]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleExport('revenue-report')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:border-[#353545] dark:hover:bg-[#1c1c25]"
          >
            <FileDownIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !stats && (
          <p className="col-span-full py-4 text-center text-xs text-slate-400 dark:text-[#606070]">Loading…</p>
        )}
        {kpiCards.map((card) => (
          <article key={card.label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
            <div className={`h-1.5 w-full ${card.stripe}`} />
            <div className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-[#70708a]">{card.label}</p>
              <p className={`mt-2 text-3xl font-bold ${card.valueTone}`}>{card.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Revenue Trend</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">{formatRangeLabel(dateRange)}{stats ? ' · Total: ' + fmtVnd(stats.total_revenue) : ''}</p>
          </div>

          <div className="relative">
            {!chartData && (
              <p className="py-12 text-center text-xs text-slate-400 dark:text-[#606070]">{loading ? 'Loading chart…' : 'No chart data'}</p>
            )}
            {chartData && hoveredPoint !== null && (
              <div
                className="pointer-events-none absolute -top-8 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium text-white dark:bg-[#0a0a0f]"
                style={{ left: `${(chartData.points[hoveredPoint].x / chartData.width) * 100}%` }}
              >
                {chartData.points[hoveredPoint].label}: ₫{chartData.points[hoveredPoint].value.toLocaleString()}
              </div>
            )}

            {chartData && (
            <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="h-64 w-full" aria-label="Revenue trend chart">
              {chartData.yTicks.map((tick) => (
                <g key={tick.label}>
                  <line x1="24" y1={tick.y} x2="488" y2={tick.y} className="stroke-slate-200 dark:stroke-[#1c1c25]" strokeDasharray="2 3" />
                  <text x="0" y={tick.y + 4} className="fill-slate-400 text-[11px] dark:fill-[#606070]">
                    {tick.label}
                  </text>
                </g>
              ))}

              <path d={chartData.areaPath} fill="rgba(99,102,241,0.08)" />
              <path
                d={chartData.linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartData.points.map((point, index) => (
                <g key={point.label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint === index ? 6 : 4}
                    fill="#6366f1"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <title>{`${point.label}: ₫${point.value.toLocaleString()}`}</title>
                  </circle>
                  <text x={point.x} y={chartData.xLabelsY} textAnchor="middle" className="fill-slate-400 text-[11px] dark:fill-[#606070]">
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">By Specialty</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#70708a]">appointments count</p>
          </div>

          <div className="flex flex-col gap-3">
            {specialtyBreakdown.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-400 dark:text-[#606070]">{loading ? 'Loading…' : 'No data'}</p>
            )}
            {specialtyBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-5 flex-shrink-0 text-right text-sm font-bold text-slate-300 dark:text-[#404050]">#{index + 1}</span>
                <div className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-semibold text-white ${item.avatar}`}>
                  {item.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{item.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-[#70708a]">{fmtVnd(item.revenue ?? 0)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">{item.count}</span>
                  <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                    <div className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-[#eeeef5]">By Status</h2>
          {statusBreakdown.length === 0 && (
            <p className="py-4 text-center text-xs text-slate-400 dark:text-[#606070]">{loading ? 'Loading…' : 'No data'}</p>
          )}
          {statusBreakdown.map((type) => (
            <div key={type.label} className="mb-3 flex flex-col gap-1 last:mb-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700 dark:text-[#c8c8e0]">{type.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{type.count}</p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#1c1c25]">
                <div className={`h-full rounded-full ${type.color}`} style={{ width: `${type.percent}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Summary</h2>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">Total Appointments</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {typeof stats?.total_appointments === 'number' ? stats.total_appointments : (stats?.total_appointments ?? '–')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats ? fmtVnd(stats.total_revenue) : '–'}
              </p>
            </div>
            <div className="flex gap-4 border-t border-slate-100 pt-4 dark:border-[#1c1c25]">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">Completion</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats && typeof stats.completion_rate === 'number' ? `${stats.completion_rate.toFixed(1)}%` : '–'}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-[#70708a]">Cancellation</p>
                <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {stats && typeof stats.cancellation_rate === 'number' ? `${stats.cancellation_rate.toFixed(1)}%` : '–'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-[#eeeef5]">Export Data</h2>

          <div className="flex flex-col gap-2">
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleExport(option.key)}
                  className="-mx-3 flex items-center justify-between rounded-xl border-b border-slate-100 px-3 py-3 text-left transition hover:bg-slate-50 dark:border-[#1c1c25] dark:hover:bg-[#16161e] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${option.iconTone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <p className="text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{option.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#70708a]">{option.size}</p>
                    </span>
                  </div>

                  <DownloadIcon className="h-4 w-4 text-slate-400 transition-colors dark:text-[#606070]" />
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

ReportsView.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
