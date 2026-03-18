import PropTypes from 'prop-types'

export default function ScheduleView({ user }) {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <div className="view-enter rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Schedule</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-[#70708a]">Clinical scheduling workspace for {user.name}.</p>
      </div>
    </div>
  )
}

ScheduleView.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
