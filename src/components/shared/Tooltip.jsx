import { useId } from 'react'
import PropTypes from 'prop-types'

export default function Tooltip({ label, children }) {
  const id = useId()
  return (
    <div className="group relative inline-flex">
      <span aria-describedby={id}>{children}</span>
      <div
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]"
      >
        {label}
      </div>
    </div>
  )
}

Tooltip.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
