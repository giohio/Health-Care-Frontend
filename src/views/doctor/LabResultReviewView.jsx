import { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { emrApi } from '../../api/emr'

const MOCK_LAB_RESULTS = [
  {
    id: 'lr-001',
    patientName: 'Nguyen Van A',
    patientId: 'p1',
    test: 'Complete Blood Count',
    orderedAt: '2025-01-10',
    resultAt: '2025-01-11',
    status: 'AI_DRAFT',
    aiDraft: 'CBC is within normal limits. Hemoglobin 13.5 g/dL, WBC 7.2 K/uL, Platelets 250 K/uL. No concerning abnormalities detected.',
  },
  {
    id: 'lr-002',
    patientName: 'Tran Thi B',
    patientId: 'p2',
    test: 'Lipid Panel',
    orderedAt: '2025-01-09',
    resultAt: '2025-01-10',
    status: 'PENDING',
    aiDraft: null,
  },
  {
    id: 'lr-003',
    patientName: 'Le Van C',
    patientId: 'p3',
    test: 'HbA1c',
    orderedAt: '2025-01-08',
    resultAt: '2025-01-09',
    status: 'PUBLISHED',
    aiDraft: 'HbA1c 6.2% suggests mild prediabetes. Dietary modification is recommended.',
    verifiedAt: '2025-01-09 14:30',
  },
]

const FILTER_TABS = ['All', 'PENDING', 'AI_DRAFT', 'PUBLISHED']

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function normalizeStatus(status) {
  const normalized = String(status || '').toUpperCase()

  if (normalized === 'PENDING' || normalized === 'PROCESSING') return 'PENDING'
  if (normalized === 'READY' || normalized === 'AI_DRAFT') return 'AI_DRAFT'
  if (normalized === 'REVIEWED' || normalized === 'PUBLISHED') return 'PUBLISHED'

  return 'PENDING'
}

function toDisplayOrder(order) {
  const testName = Array.isArray(order.tests) && order.tests.length > 0
    ? order.tests.join(', ')
    : order.test || 'Lab Test'

  return {
    id: order.id,
    patientId: order.patientId || 'unknown',
    patientName: order.patientName || 'Unknown Patient',
    test: testName,
    orderedAt: order.orderedAt || order.createdAt || '-',
    resultAt: order.resultAt || order.estimatedReadyAt || '-',
    status: normalizeStatus(order.status),
    aiDraft: order.aiDraft || 'AI draft interpretation is ready for physician verification before patient publishing.',
    verifiedAt: order.verifiedAt || null,
  }
}

function formatDateLabel(value) {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function statusBadgeClass(status) {
  if (status === 'PENDING') return 'lr-badge lr-badge--pending'
  if (status === 'AI_DRAFT') return 'lr-badge lr-badge--ai-draft'
  return 'lr-badge lr-badge--published'
}

export default function LabResultReviewView({ labOrders, setLabOrders, onNotify, onBack }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [justPublishedId, setJustPublishedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await emrApi.getLabOrders({})
        if (response.success && response.data) {
          setLabOrders(response.data.items || response.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch lab orders:', err)
        setError(err.message || 'Failed to load lab results')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [setLabOrders])

  const allOrders = useMemo(() => {
    const source = labOrders.length > 0 ? labOrders : MOCK_LAB_RESULTS
    return source.map(toDisplayOrder)
  }, [labOrders])

  const tabCounts = useMemo(() => {
    const base = {
      All: allOrders.length,
      PENDING: 0,
      AI_DRAFT: 0,
      PUBLISHED: 0,
    }

    allOrders.forEach((order) => {
      base[order.status] += 1
    })

    return base
  }, [allOrders])

  const visibleOrders = useMemo(() => {
    if (activeFilter === 'All') return allOrders
    return allOrders.filter((order) => order.status === activeFilter)
  }, [activeFilter, allOrders])

const handleVerify = async (orderToPublish) => {
    try {
      await emrApi.verifyLabResult(orderToPublish.id, {
        notes: 'Verified by physician',
        status: 'PUBLISHED'
      })

      const verifiedAt = formatDateLabel(new Date())

      setLabOrders((prev) => {
        const source = prev.length > 0
          ? prev
          : MOCK_LAB_RESULTS.map((item) => ({
              ...item,
              tests: [item.test],
            }))

        return source.map((order) => {
          if (order.id !== orderToPublish.id) return order

          return {
            ...order,
            status: 'PUBLISHED',
            verifiedAt,
            resultAt: order.resultAt || new Date().toISOString(),
          }
        })
      })

      onNotify({
        id: `${orderToPublish.id}-published`,
        type: 'lab',
        title: 'Lab Result Published',
        body: `${orderToPublish.test} for ${orderToPublish.patientName} has been verified and published.`,
        time: 'Just now',
        isRead: false,
        navigateTo: 'lab-results',
      })

      setJustPublishedId(orderToPublish.id)

      globalThis.setTimeout(() => {
        setJustPublishedId((prev) => (prev === orderToPublish.id ? null : prev))  
      }, 2600)
    } catch (err) {
      console.error('Failed to verify lab result:', err)
      alert('Failed to publish lab result.')
    }
  }

  return (
    <section className="lr-shell">
      <button type="button" className="lr-back-btn" onClick={onBack}>
        <span className="inline-flex h-4 w-4">
          <ArrowLeftIcon />
        </span>
        <span>Back</span>
      </button>

      <h1 className="lr-title">Lab Result Review</h1>
      <p className="lr-subtitle">Review and approve laboratory results</p>

      <div className="lr-tabs" role="tablist" aria-label="Lab result status filters">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeFilter === tab}
            className={`lr-tab ${activeFilter === tab ? 'is-active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            <span>{tab}</span>
            <span className="lr-tab-count">{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      <div className="lr-list">
        {visibleOrders.map((order) => (
          <article key={order.id} className="lr-card">
            <div className="lr-card-top">
              <div>
                <div className="lr-patient">
                  <span className="lr-avatar">{getInitials(order.patientName)}</span>
                  <div>
                    <p className="lr-patient-name">{order.patientName}</p>
                    <p className="lr-test-name">{order.test}</p>
                  </div>
                </div>

                <div className="lr-meta">
                  <span>Ordered: {formatDateLabel(order.orderedAt)}</span>
                  <span>Result: {formatDateLabel(order.resultAt)}</span>
                </div>
              </div>

              <span className={statusBadgeClass(order.status)}>
                {order.status === 'AI_DRAFT' ? '✨ ' : ''}
                {order.status === 'PUBLISHED' ? '✓ ' : ''}
                {order.status}
              </span>
            </div>

            {order.status === 'AI_DRAFT' && (
              <div className="lr-ai-panel">
                <p className="lr-ai-title">AI Interpretation Draft</p>
                <p className="lr-ai-text">{order.aiDraft}</p>

                <div className="lr-actions">
                  <button
                    type="button"
                    className="lr-verify-btn"
                    onClick={() => handleVerify(order)}
                  >
                    Verify & Publish
                  </button>
                  {justPublishedId === order.id && <span className="lr-success">✓ Result published</span>}
                </div>
              </div>
            )}

            {order.status === 'PUBLISHED' && (
              <p className="lr-published-note">Verified at: {order.verifiedAt || formatDateLabel(order.resultAt)}</p>
            )}
          </article>
        ))}

        {visibleOrders.length === 0 && (
          <div className="lr-empty">No lab results found for this status.</div>
        )}
      </div>
    </section>
  )
}

LabResultReviewView.propTypes = {
  labOrders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    patientId: PropTypes.string,
    patientName: PropTypes.string,
    tests: PropTypes.arrayOf(PropTypes.string),
    test: PropTypes.string,
    orderedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    resultAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    estimatedReadyAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    aiDraft: PropTypes.string,
    verifiedAt: PropTypes.string,
  })).isRequired,
  setLabOrders: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}
