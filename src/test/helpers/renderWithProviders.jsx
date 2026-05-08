import { render } from '@testing-library/react'
import { useState } from 'react'

/**
 * Thin render wrapper.
 * The app has no React Router and no AuthContext — everything is prop-drilled.
 * This helper is a pass-through for future expansion (e.g. wrapping with
 * AdminSettingsProvider when needed).
 */
export function renderWith(ui, _options = {}) {
  return render(ui)
}

/**
 * Stateful wrapper for LabResultReviewView.
 * The component receives `labOrders` as a prop AND calls `setLabOrders` to
 * propagate fetched data upward. This wrapper mirrors that parent contract so
 * re-renders happen naturally when setLabOrders is called.
 *
 * Usage:
 *   const { container } = render(
 *     <LabOrdersWrapper initialOrders={[order1]} Component={LabResultReviewView} extraProps={{...}} />
 *   )
 */
export function LabOrdersWrapper({ initialOrders = [], Component, extraProps = {} }) {
  const [orders, setOrders] = useState(initialOrders)
  return (
    <Component
      labOrders={orders}
      setLabOrders={setOrders}
      {...extraProps}
    />
  )
}
