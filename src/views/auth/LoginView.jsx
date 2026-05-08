import { useState } from 'react'
import PropTypes from 'prop-types'
import { authApi } from '../../api/auth'

function StethoscopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3v6a4 4 0 0 0 8 0V3" />
      <path d="M8 15v1a6 6 0 0 0 12 0v-2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-3z" />
      <polyline points="9 12.5 11.2 14.7 15.5 10.4" />
    </svg>
  )
}

function AlertCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.76 21.76 0 0 1 5.07-6.63" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.74 21.74 0 0 1-3.34 4.87" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="17" y1="7" x2="19.1" y2="4.9" />
      <line x1="4.9" y1="19.1" x2="7" y2="17" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z" />
    </svg>
  )
}

export default function LoginView({ dark, setDark, onLogin, onSignupClick, onNeedVerify, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password || isLoading) return

    setIsLoading(true)
    setError('')
    setNeedsVerification(false)
    try {
      const data = await authApi.login(email, password)
      // data.user has: { id, email, role, is_active, is_profile_completed }
      // Token is set as HttpOnly cookie automatically by server
      onLogin(data.user)
    } catch (err) {
      const msg = err.message || 'Invalid email or password'
      setError(msg)
      setNeedsVerification(msg.toLowerCase().includes('email not verified'))
      setIsLoading(false)
    }
  }

  const handleVerifyAgain = async () => {
    if (!email) return
    try {
      await authApi.resendOtp(email)
    } catch {
      // Keep generic UX and still send user to OTP page to retry from there.
    }
    if (onNeedVerify) onNeedVerify(email)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] dark:bg-[#08080f]">
      <div className="blob absolute -right-20 -top-32 h-[500px] w-[500px] bg-indigo-500/[0.07] dark:bg-indigo-500/[0.12]" />
      <div className="blob absolute -bottom-24 left-16 h-[400px] w-[400px] bg-violet-500/[0.05] dark:bg-violet-500/[0.09]" />

      <button
        type="button"
        className="fixed right-4 top-4 z-20 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all duration-150 hover:scale-105 dark:border-[#252530] dark:bg-[#111118]/60"
        onClick={() => setDark(!dark)}
        aria-label="Toggle theme"
      >
        <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]">{dark ? <MoonIcon /> : <SunIcon />}</span>
      </button>

      <div className="view-enter relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/60 bg-white/70 px-8 py-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-[#252530]/80 dark:bg-[#111118]/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
            <span className="inline-flex h-7 w-7 text-white"><StethoscopeIcon /></span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">HealthAI</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">Healthcare Portal</p>

          <div className="mb-2 mt-4 flex justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400">
              <span className="inline-flex h-3.5 w-3.5"><UserIcon /></span>
              <span>Patient</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-600 dark:border-teal-800/40 dark:bg-teal-950/50 dark:text-teal-400">
              <span className="inline-flex h-3.5 w-3.5"><StethoscopeIcon /></span>
              <span>Doctor</span>
            </span>
          </div>

          <p className="mb-6 text-center text-xs text-slate-400 dark:text-[#505060]">
            Sign in with your assigned credentials. Your role is detected automatically.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-[#9898b0]">Password</span>
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#eeeef5] dark:placeholder:text-[#505060] dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</span>
              </button>
            </span>
          </label>
        </div>

        {error !== '' && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
            <span className="inline-flex h-4 w-4 text-rose-500"><AlertCircleIcon /></span>
            <span className="text-sm text-rose-600 dark:text-rose-300">{error}</span>
          </div>
        )}

        {needsVerification && (
          <button
            type="button"
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            onClick={handleVerifyAgain}
          >
            Verify email now
          </button>
        )}

        <div className="mt-2 text-right">
          <button
            type="button"
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 hover:underline dark:text-[#9898b0] dark:hover:text-indigo-400"
            onClick={() => onForgotPassword && onForgotPassword(email)}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          onClick={handleSubmit}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#1c1c25]">
          <p className="mb-3 text-center text-[11px] uppercase tracking-widest text-slate-400 dark:text-[#505060]">Quick access</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
              onClick={() => {
                setEmail('patient.le.thi.mai@healthai.dev')
                setPassword('Patient123!')
                setError('')
              }}
            >
              <span className="inline-flex h-3.5 w-3.5"><UserIcon /></span>
              <span>Patient Demo</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-400"
              onClick={() => {
                setEmail('dr.nguyen.van.an@healthai.dev')
                setPassword('Doctor123!')
                setError('')
              }}
            >
              <span className="inline-flex h-3.5 w-3.5"><StethoscopeIcon /></span>
              <span>Doctor Demo</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              onClick={() => {
                setEmail('admin@healthai.dev')
                setPassword('Admin123!')
                setError('')
              }}
            >
              <span className="inline-flex h-3.5 w-3.5"><ShieldCheckIcon /></span>
              <span>Admin Demo</span>
            </button>
          </div>

          {/* Sign-up link */}
          {onSignupClick && (
            <div className="mt-5 text-center text-sm text-slate-500 dark:text-[#9898b0]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                onClick={onSignupClick}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

LoginView.propTypes = {
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onSignupClick: PropTypes.func,
  onNeedVerify: PropTypes.func,
  onForgotPassword: PropTypes.func,
}
