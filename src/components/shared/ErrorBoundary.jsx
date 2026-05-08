import React, { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * Full-page React Error Boundary.
 * Renders a friendly error screen when a child throws.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console in dev; send to an error tracker in production
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback error={this.state.error} />
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
}

/**
 * Default error fallback UI.
 */
function DefaultFallback({ error }) {
  const [collapsed, setCollapsed] = useState(false)

  const handleRefresh = () => {
    globalThis.location?.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#08080f]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="mb-2 text-lg font-bold text-slate-900 dark:text-[#eeeef5]">
          Something went wrong
        </h1>
        <p className="mb-1 text-sm text-slate-500 dark:text-[#9898b0]">
          We encountered an unexpected error. Try refreshing the page.
        </p>

        <button
          type="button"
          onClick={handleRefresh}
          className="mt-6 w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500"
        >
          Refresh Page
        </button>

        {/* Dev-only: show error message */}
        {error?.message && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {collapsed ? 'Show' : 'Hide'} error details
            </button>
            {collapsed && (
              <pre className="mt-2 select-all rounded-lg bg-slate-100 p-3 text-left text-xs text-rose-600 dark:bg-[#1c1c25] dark:text-rose-400" style={{ overflowX: 'auto' }}>
                {error.message}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

DefaultFallback.propTypes = { error: PropTypes.object }
