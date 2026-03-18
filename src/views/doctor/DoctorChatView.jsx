import PropTypes from 'prop-types'

export default function DoctorChatView({ selectedPatient }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-6xl flex-1 min-h-0 px-8 py-8">
        <div className="view-enter h-full min-h-0 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Doctor Chat</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-[#70708a]">
            {selectedPatient ? `Discussing case: ${selectedPatient.name}` : 'Select a patient to start secure clinical chat.'}
          </p>
        </div>
      </div>
    </div>
  )
}

DoctorChatView.propTypes = {
  selectedPatient: PropTypes.shape({
    name: PropTypes.string,
  }),
}

DoctorChatView.defaultProps = {
  selectedPatient: null,
}
