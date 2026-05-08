import PropTypes from 'prop-types'
import { APPT_STATUS_COLOR, APPT_STATUS_LABEL } from '../../constants/enums'

/**
 * Reusable appointment status badge.
 *
 * @param {object} props
 * @param {string} props.status - appointment status key
 * @param {string} [props.className]
 */
export function StatusBadge({ status, className = '' }) {
  const color = APPT_STATUS_COLOR[status] || { bg: '#f1f5f9', text: '#475569' }
  const label = APPT_STATUS_LABEL[status] || status || 'Unknown'

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{ background: color.bg, color: color.text, borderColor: color.bg }}
    >
      {label}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
}

/**
 * Payment status badge.
 *
 * @param {object} props
 * @param {string} props.status
 */
export function PaymentStatusBadge({ status, className = '' }) {
  const config = {
    unpaid:    { bg: '#fef9c3', text: '#854d0e' },
    paid:      { bg: '#dcfce7', text: '#166534' },
    failed:    { bg: '#fee2e2', text: '#991b1b' },
    refunded:  { bg: '#f1f5f9', text: '#475569' },
    expired:   { bg: '#f1f5f9', text: '#64748b' },
    processing:{ bg: '#dbeafe', text: '#1e40af' },
  }[status] || { bg: '#f1f5f9', text: '#475569' }

  const label = {
    unpaid: 'Unpaid', paid: 'Paid', failed: 'Failed',
    refunded: 'Refunded', expired: 'Expired', processing: 'Processing',
  }[status] || status || 'Unknown'

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{ background: config.bg, color: config.text, borderColor: config.bg }}
    >
      {label}
    </span>
  )
}

PaymentStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
}

/**
 * Lab result status badge.
 *
 * @param {object} props
 * @param {string} props.status
 */
export function LabStatusBadge({ status, className = '' }) {
  const config = {
    PENDING:             { bg: '#f1f5f9', text: '#475569' },
    AI_PROCESSING:       { bg: '#dbeafe', text: '#1e40af' },
    AI_DRAFT:            { bg: '#e0e7ff', text: '#3730a3' },
    DOCTOR_REVIEW:       { bg: '#fef9c3', text: '#92400e' },
    NEEDS_MANUAL_REVIEW: { bg: '#fee2e2', text: '#991b1b' },
    PUBLISHED:           { bg: '#dcfce7', text: '#166534' },
  }[status] || { bg: '#f1f5f9', text: '#475569' }

  const label = {
    PENDING: 'Pending',
    AI_PROCESSING: 'AI Processing',
    AI_DRAFT: 'AI Draft',
    DOCTOR_REVIEW: 'Doctor Review',
    NEEDS_MANUAL_REVIEW: 'Manual Review',
    PUBLISHED: 'Published',
  }[status] || status || 'Unknown'

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{ background: config.bg, color: config.text, borderColor: config.bg }}
    >
      {label}
    </span>
  )
}

LabStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
}
