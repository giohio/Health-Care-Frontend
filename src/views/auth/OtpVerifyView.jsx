import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { authApi } from '../../api/auth'

const OTP_POSITIONS = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5', 'pos-6']
const OTP_LENGTH = 6
const RESEND_COOLDOWN = 120 // 2 minutes in seconds

function ShieldCheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11.5 14.5 16 9.5" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12.5 11.2 14.7 15.5 10.4" />
    </svg>
  )
}

function VerifySuccess({ dark }) {
  return (
    <div className={`su-overlay app-root${dark ? ' dark' : ''}`}>
      <div className="su-card su-card--success" role="status" aria-live="polite">
        <CheckCircleIcon />
        <h2 className="su-success-title">Email Verified!</h2>
        <p className="su-success-sub">Redirecting to sign in...</p>
      </div>
    </div>
  )
}

VerifySuccess.propTypes = { dark: PropTypes.bool.isRequired }

export default function OtpVerifyView({ email, dark, setDark, onVerified, onBackToLogin }) {
  const [digits, setDigits] = useState(new Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN)
  const [resendMsg, setResendMsg] = useState('')
  const inputRefs = useRef([])

  // Start resend cooldown timer on mount
  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replaceAll(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = new Array(OTP_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    setError('')
    const focusTarget = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusTarget]?.focus()
  }

  const otp = digits.join('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authApi.verifyEmail(email, otp)
      setSuccess(true)
      setTimeout(() => onVerified(), 1800)
    } catch (err) {
      if (err?.status === 400) {
        setError('Invalid or expired OTP. Please try again.')
      } else if (err?.status === 404) {
        setError('Email not found. Please register first.')
      } else {
        setError(err?.message || 'Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setResendMsg('')
    setError('')
    try {
      await authApi.resendOtp(email)
      setResendMsg('A new code has been sent to your email.')
      setResendCooldown(RESEND_COOLDOWN)
    } catch (err) {
      if (err?.status === 429) {
        setError('Please wait before requesting a new code.')
        setResendCooldown(RESEND_COOLDOWN)
      } else {
        setError(err?.message || 'Could not resend code. Please try again.')
      }
    }
  }

  const formatCooldown = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (success) {
    return <VerifySuccess dark={dark} />
  }

  return (
    <div className={`su-overlay app-root${dark ? ' dark' : ''}`}>
      <button
        type="button"
        className="su-dark-toggle"
        onClick={() => setDark((d) => !d)}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? 'Light' : 'Dark'}
      </button>

      <main className="su-card" style={{ maxWidth: 420 }}>
        <div className="su-header">
          <span className="inline-flex text-indigo-500 dark:text-indigo-400">
            <ShieldCheckIcon />
          </span>
          <h1 className="su-title" style={{ marginTop: 8 }}>Verify your email</h1>
          <p className="su-subtitle">
            We sent a 6-digit code to <strong className="text-slate-700 dark:text-[#d0d0e8]">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="su-error-banner" role="alert">{error}</div>
        )}

        {resendMsg && (
          <output
            className="block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            {resendMsg}
          </output>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex justify-center gap-3 my-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={OTP_POSITIONS[i]}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-11 rounded-xl border-2 border-slate-200 bg-white text-center text-xl font-bold text-slate-900 outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5] dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
              />
            ))}
          </div>

          <button
            type="submit"
            className="su-submit"
            disabled={loading || otp.length !== OTP_LENGTH}
            aria-busy={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500 dark:text-[#70708a]">
          Didn&apos;t receive the code?{' '}
          {resendCooldown > 0 ? (
            <span className="font-medium text-slate-400 dark:text-[#606070]">
              Resend in {formatCooldown(resendCooldown)}
            </span>
          ) : (
            <button
              type="button"
              className="su-link-btn"
              onClick={handleResend}
            >
              Resend code
            </button>
          )}
        </div>

        <div className="su-signin-link" style={{ marginTop: 12 }}>
          <button type="button" className="su-link-btn" onClick={onBackToLogin}>
            Back to sign in
          </button>
        </div>
      </main>
    </div>
  )
}

OtpVerifyView.propTypes = {
  email: PropTypes.string.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onVerified: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
}
