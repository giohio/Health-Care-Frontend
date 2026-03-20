import PropTypes from 'prop-types'

const WEEKLY_APPOINTMENTS = [
  { day: 'Mon', value: 18 },
  { day: 'Tue', value: 22 },
  { day: 'Wed', value: 24, isToday: true },
  { day: 'Thu', value: 20 },
  { day: 'Fri', value: 26 },
  { day: 'Sat', value: 12 },
  { day: 'Sun', value: 5 },
]

const SPECIALTIES = [
  { label: 'General Practice', percent: 45, color: '#6366f1', dotClass: 'bg-indigo-500' },
  { label: 'Neurology', percent: 22, color: '#14b8a6', dotClass: 'bg-teal-500' },
  { label: 'Cardiology', percent: 18, color: '#f59e0b', dotClass: 'bg-amber-500' },
  { label: 'Other', percent: 15, color: '#e2e8f0', dotClass: 'bg-slate-300 dark:bg-[#252530]' },
]

const REGISTRATIONS = [
  {
    name: 'Tran Thi Mai',
    role: 'Patient',
    date: 'Mar 19',
    initials: 'TM',
    avatar: 'from-rose-500 to-orange-400',
  },
  {
    name: 'Nguyen Duc Anh',
    role: 'Patient',
    date: 'Mar 18',
    initials: 'NA',
    avatar: 'from-indigo-500 to-blue-400',
  },
  {
    name: 'Dr. Pham Linh',
    role: 'Doctor',
    date: 'Mar 17',
    initials: 'PL',
    avatar: 'from-teal-500 to-cyan-400',
  },
  {
    name: 'Le Van Thanh',
    role: 'Patient',
    date: 'Mar 17',
    initials: 'LT',
    avatar: 'from-amber-500 to-orange-400',
  },
  {
    name: 'Bui Thi Hoa',
    role: 'Patient',
    date: 'Mar 16',
    initials: 'BH',
    avatar: 'from-fuchsia-500 to-rose-400',
  },
]

const UPCOMING_APPOINTMENTS = [
  { time: '10:00', patient: 'Jane Doe', doctor: 'Dr. Chen', type: 'Consultation', accent: 'bg-indigo-400' },
  { time: '10:30', patient: 'Minh Tran', doctor: 'Dr. Chen', type: 'Follow-up', accent: 'bg-rose-400' },
  { time: '11:00', patient: 'Linh Pham', doctor: 'Dr. Chen', type: 'First Visit', accent: 'bg-teal-400' },
  { time: '14:00', patient: 'Thu Le', doctor: 'Dr. Reid', type: 'Vaccination', accent: 'bg-amber-400' },
  { time: '14:30', patient: 'Bao Nguyen', doctor: 'Dr. Reid', type: 'Lab Review', accent: 'bg-slate-400' },
]

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function TrendingDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  )
}

function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="13" x2="12" y2="18" />
      <line x1="9.5" y1="15.5" x2="14.5" y2="15.5" />
    </svg>
  )
}

function BarChart3Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function Settings2Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}

function firstName(name) {
  return name.split(' ')[0] || name
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-[#252530]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#505060]">{title}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>{actionLabel}</span>
          <span className="inline-flex h-3 w-3"><ArrowRightIcon /></span>
        </button>
      )}
    </div>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}

SectionHeader.defaultProps = {
  actionLabel: null,
  onAction: null,
}

function StatCard({ borderTone, valueTone, label, value, sub, trend }) {
  let TrendIcon = MinusIcon
  let trendTone = 'text-slate-500 dark:text-[#70708a]'

  if (trend.direction === 'up') {
    TrendIcon = TrendingUpIcon
    trendTone = 'text-emerald-600 dark:text-emerald-400'
  } else if (trend.direction === 'down') {
    TrendIcon = TrendingDownIcon
    trendTone = 'text-rose-500 dark:text-rose-400'
  }

  return (
    <article className={`rounded-2xl border border-slate-200 border-t-2 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-[#252530] dark:bg-[#111118]/80 ${borderTone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-[#606070]">{label}</p>
      <p className={`mt-2 text-[32px] font-bold leading-none ${valueTone}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-[#70708a]">{sub}</p>
      <div className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${trendTone}`}>
        <span className="inline-flex h-3.5 w-3.5"><TrendIcon /></span>
        <span>{trend.text}</span>
      </div>
    </article>
  )
}

StatCard.propTypes = {
  borderTone: PropTypes.string.isRequired,
  valueTone: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  sub: PropTypes.string.isRequired,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'flat']).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
}

function SpecialtyDonut() {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const segments = SPECIALTIES.reduce(
    (acc, segment) => {
      const length = (segment.percent / 100) * circumference
      const node = (
        <circle
          key={segment.label}
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={segment.label === 'Other' ? undefined : segment.color}
          strokeWidth="18"
          strokeDasharray={`${length} ${circumference - length}`}
          strokeDashoffset={-acc.offset}
          strokeLinecap="butt"
          className={segment.label === 'Other' ? 'stroke-slate-200 dark:stroke-[#252530]' : undefined}
        />
      )

      return {
        offset: acc.offset + length,
        nodes: [...acc.nodes, node],
      }
    },
    { offset: 0, nodes: [] },
  )

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
          {segments.nodes}
          <circle cx="60" cy="60" r="30" className="fill-white dark:fill-[#111118]" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">156</p>
          <p className="text-xs text-slate-500 dark:text-[#70708a]">patients</p>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col gap-2">
        {SPECIALTIES.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} aria-hidden="true" />
            <span className="text-xs text-slate-600 dark:text-[#9898b0]">{item.label}</span>
            <span className="ml-auto text-xs font-semibold text-slate-900 dark:text-[#eeeef5]">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function roleBadgeClass(role) {
  if (role.toLowerCase() === 'doctor') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-400'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400'
}

function QuickActionButton({ icon, iconTone, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-hover flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
    >
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1c1c25] ${iconTone}`}>
        {icon}
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-[#c8c8e0]">{label}</span>
    </button>
  )
}

QuickActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  iconTone: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default function AdminDashboardView({ navigateTo, user }) {
  const maxValue = Math.max(...WEEKLY_APPOINTMENTS.map((entry) => entry.value))

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Good morning, {firstName(user.name)}.</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">HealthAI Clinic · Wednesday, March 19</p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('reports')}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:border-[#353545] dark:hover:text-[#c8c8e0]"
        >
          <span className="inline-flex h-4 w-4"><DownloadIcon /></span>
          <span>Export Report</span>
        </button>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin stats">
        <StatCard
          borderTone="border-t-indigo-500"
          valueTone="text-indigo-600 dark:text-indigo-400"
          label="Total Patients"
          value="1,284"
          sub="156 registered this month"
          trend={{ direction: 'up', text: '+12% vs last month' }}
        />

        <StatCard
          borderTone="border-t-rose-400"
          valueTone="text-rose-500 dark:text-rose-400"
          label="Appointments Today"
          value="24"
          sub="8 completed · 16 upcoming"
          trend={{ direction: 'up', text: '+3% vs last month' }}
        />

        <StatCard
          borderTone="border-t-teal-400"
          valueTone="text-teal-600 dark:text-teal-400"
          label="Active Doctors"
          value="12"
          sub="3 on duty now"
          trend={{ direction: 'flat', text: 'same vs last month' }}
        />

        <StatCard
          borderTone="border-t-amber-400"
          valueTone="text-amber-500 dark:text-amber-400"
          label="Monthly Revenue"
          value="₫84.2M"
          sub="Target: ₫100M"
          trend={{ direction: 'down', text: '-6% vs last month' }}
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-2">
          <SectionHeader title="Appointments This Week" actionLabel="View All" onAction={() => navigateTo('appointments')} />

          <div className="flex h-32 items-end gap-2 px-2">
            {WEEKLY_APPOINTMENTS.map((item) => {
              const barHeight = Math.round((item.value / maxValue) * 120)
              const barTone = item.isToday
                ? 'bg-rose-500 dark:bg-rose-500 hover:bg-rose-600'
                : 'bg-indigo-500 dark:bg-indigo-500 hover:bg-indigo-600'

              return (
                <div key={item.day} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    <div
                      className={`w-8 rounded-t-lg transition-colors duration-150 ${barTone}`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="pointer-events-none absolute -top-8 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
                      {item.day}: {item.value}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-[#606070]">{item.day}</span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-[#c8c8e0]">{item.value}</span>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-1">
          <SectionHeader title="By Specialty" />
          <SpecialtyDonut />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-1">
          <SectionHeader title="New This Week" actionLabel="View All" onAction={() => navigateTo('users')} />

          <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {REGISTRATIONS.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3 py-3">
                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${entry.avatar}`}>
                  {entry.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-[#eeeef5]">{entry.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[#70708a]">{entry.role} · {entry.date}</p>
                </div>

                <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${roleBadgeClass(entry.role)}`}>
                  {entry.role}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-1">
          <SectionHeader title="Next 5 Appointments" actionLabel="View All" onAction={() => navigateTo('appointments')} />

          <div className="flex flex-col gap-2">
            {UPCOMING_APPOINTMENTS.map((entry) => (
              <article key={`${entry.time}-${entry.patient}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-[#1c1c25] dark:bg-[#111118]">
                <span className={`w-[3px] self-stretch rounded-full ${entry.accent}`} aria-hidden="true" />
                <span className="w-14 shrink-0 text-[11px] font-medium text-slate-400 dark:text-[#606070]">{entry.time}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-800 dark:text-[#c8c8e0]">{entry.patient}</span>
                  <span className="block truncate text-[11px] text-slate-500 dark:text-[#70708a]">{entry.doctor} · {entry.type}</span>
                </span>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#252530] dark:bg-[#111118] xl:col-span-1">
          <SectionHeader title="Quick Actions" />

          <div className="flex flex-col gap-2">
            <QuickActionButton
              icon={<span className="inline-flex h-4 w-4"><UserPlusIcon /></span>}
              iconTone="text-rose-500 dark:text-rose-400"
              label="Add New Doctor"
              onClick={() => navigateTo('users')}
            />

            <QuickActionButton
              icon={<span className="inline-flex h-4 w-4"><CalendarPlusIcon /></span>}
              iconTone="text-indigo-500 dark:text-indigo-400"
              label="Schedule Management"
              onClick={() => navigateTo('appointments')}
            />

            <QuickActionButton
              icon={<span className="inline-flex h-4 w-4"><BarChart3Icon /></span>}
              iconTone="text-amber-500 dark:text-amber-400"
              label="Generate Report"
              onClick={() => navigateTo('reports')}
            />

            <QuickActionButton
              icon={<span className="inline-flex h-4 w-4"><Settings2Icon /></span>}
              iconTone="text-slate-500 dark:text-[#9898b0]"
              label="System Settings"
              onClick={() => navigateTo('settings')}
            />

            <QuickActionButton
              icon={<span className="inline-flex h-4 w-4"><DownloadIcon /></span>}
              iconTone="text-teal-500 dark:text-teal-400"
              label="Export Patient Data"
              onClick={() => navigateTo('reports')}
            />
          </div>
        </article>
      </section>
    </div>
  )
}

AdminDashboardView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
