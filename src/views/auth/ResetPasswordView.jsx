import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { authApi } from '../../api/auth'

const RESEND_COOLDOWN = 120

export default function ResetPasswordView({ dark, setDark, initialEmail, onBackToLogin }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

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

  const handleSendCode = async () => {
    if (!email || loading) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await authApi.forgotPassword(email)
      setStep(2)
      setResendCooldown(RESEND_COOLDOWN)
      setMessage('Reset code sent. Check your email.')
    } catch (err) {
      setError(err?.message || 'Could not send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword || !confirmPassword || loading) return
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      await authApi.resetPassword(email, otp, newPassword)
      setMessage('Password reset successful. You can sign in now.')
      setTimeout(() => onBackToLogin(), 900)
    } catch (err) {
      setError(err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || loading || resendCooldown > 0) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await authApi.forgotPassword(email)
      setResendCooldown(RESEND_COOLDOWN)
      setMessage('A new reset code has been sent.')
    } catch (err) {
      setError(err?.message || 'Could not resend reset code')
    } finally {
      setLoading(false)
    }
  }

  const formatCooldown = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] dark:bg-[#08080f]">
      <button
        type="button"
        className="fixed right-4 top-4 z-20 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white/60 px-3 text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-150 hover:scale-105 dark:border-[#252530] dark:bg-[#111118]/60"
        onClick={() => setDark(!dark)}
      >
        {dark ? 'Light' : 'Dark'}
      </button>

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/60 bg-white/70 px-8 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">{step === 1 ? 'Request a reset code' : 'Enter code and set new password'}</p>

        <div className="mt-5 flex flex-col gap-3">
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]"
            />
          </label>

          {step === 2 && (
            <>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">OTP code</span>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setError('')
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">New password</span>
                <span className="relative block">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-[#9898b0] dark:hover:text-indigo-400"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Confirm password</span>
                <span className="relative block">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-[#9898b0] dark:hover:text-indigo-400"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>

              <div className="text-sm text-slate-500 dark:text-[#9898b0]">
                Didn&apos;t receive code?{' '}
                {resendCooldown > 0 ? (
                  <span className="font-medium text-slate-400 dark:text-[#70708a]">
                    Resend in {formatCooldown(resendCooldown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        {message && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            {message}
          </div>
        )}

        <button
          type="button"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-700 disabled:opacity-60"
          onClick={step === 1 ? handleSendCode : handleResetPassword}
          disabled={loading}
        >
          {loading ? 'Please wait...' : step === 1 ? 'Send Reset Code' : 'Reset Password'}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 hover:underline dark:text-[#9898b0] dark:hover:text-indigo-400"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}

ResetPasswordView.propTypes = {
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  initialEmail: PropTypes.string,
  onBackToLogin: PropTypes.func.isRequired,
}
