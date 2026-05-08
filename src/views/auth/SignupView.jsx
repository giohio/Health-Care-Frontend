import { useState } from 'react'
import PropTypes from 'prop-types'
import { authApi } from '../../api/auth'

// ── Eye-toggle icons ───────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8" />
      <path d="M1 12s4 8 11 8 11-8 11-8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
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

// ── Validation helpers ────────────────────────────────────────────────────────
function validateEmail(val) {
  if (!val) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address'
  return ''
}

function validatePassword(val) {
  if (!val) return 'Password is required'
  if (val.length < 8) return 'Password must be at least 8 characters'
  return ''
}

function validateConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password'
  if (confirm !== password) return 'Passwords do not match'
  return ''
}

function buildValidationErrors({ email, password, confirm, agreed }) {
  const nextErrors = {}
  const emailErr = validateEmail(email)
  const passwordErr = validatePassword(password)
  const confirmErr = validateConfirm(password, confirm)

  if (emailErr) nextErrors.email = emailErr
  if (passwordErr) nextErrors.password = passwordErr
  if (confirmErr) nextErrors.confirm = confirmErr
  if (!agreed) nextErrors.agreed = 'You must accept the terms to continue'

  return nextErrors
}

function SignupSuccess({ dark }) {
  return (
    <div className={`su-overlay app-root${dark ? ' dark' : ''}`}>
      <div className="su-card su-card--success" role="status" aria-live="polite">
        <CheckCircleIcon />
        <h2 className="su-success-title">Account Created!</h2>
        <p className="su-success-sub">Redirecting to email verification...</p>
      </div>
    </div>
  )
}

SignupSuccess.propTypes = {
  dark: PropTypes.bool.isRequired,
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="su-error-banner" role="alert">
      {message}
    </div>
  )
}

ErrorBanner.propTypes = {
  message: PropTypes.string.isRequired,
}

function EmailField({ value, setValue, error, onBlur }) {
  return (
    <div className="su-field">
      <label className="su-label" htmlFor="su-email">Email address</label>
      <input
        id="su-email"
        type="email"
        className={`su-input${error ? ' su-input--err' : ''}`}
        placeholder="you@email.com"
        value={value}
        autoComplete="email"
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        aria-describedby={error ? 'su-email-err' : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <span id="su-email-err" className="su-field-err" role="alert">{error}</span>
      )}
    </div>
  )
}

EmailField.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  error: PropTypes.string,
  onBlur: PropTypes.func.isRequired,
}

function PasswordField({ id, label, value, setValue, error, onBlur, show, setShow }) {
  return (
    <div className="su-field">
      <label className="su-label" htmlFor={id}>{label}</label>
      <div className="su-pw-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`su-input su-input--pw${error ? ' su-input--err' : ''}`}
          placeholder={id === 'su-password' ? 'Min. 8 characters' : 'Repeat your password'}
          value={value}
          autoComplete="new-password"
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          aria-describedby={error ? `${id}-err` : undefined}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="su-eye-btn"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span id={`${id}-err`} className="su-field-err" role="alert">{error}</span>
      )}
    </div>
  )
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  error: PropTypes.string,
  onBlur: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
}

function TermsField({ agreed, setAgreed, error }) {
  return (
    <>
      <div className="su-field su-field--inline">
        <input
          id="su-terms"
          type="checkbox"
          className="su-checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          aria-describedby={error ? 'su-terms-err' : undefined}
          aria-invalid={!!error}
        />
        <label htmlFor="su-terms" className="su-terms-label">
          I agree to the{' '}
          <a href="#" className="su-link">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="su-link">Privacy Policy</a>
        </label>
      </div>
      {error && (
        <span id="su-terms-err" className="su-field-err" role="alert">{error}</span>
      )}
    </>
  )
}

TermsField.propTypes = {
  agreed: PropTypes.bool.isRequired,
  setAgreed: PropTypes.func.isRequired,
  error: PropTypes.string,
}

function SignupFormCard({
  dark,
  setDark,
  onLoginClick,
  handleSubmit,
  apiError,
  email,
  setEmail,
  password,
  setPassword,
  confirm,
  setConfirm,
  agreed,
  setAgreed,
  showPw,
  setShowPw,
  showConfirm,
  setShowConfirm,
  loading,
  errors,
  onBlurEmail,
  onBlurPassword,
  onBlurConfirm,
}) {
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

      <main className="su-card">
        <div className="su-header">
          <span className="su-logo-mark" aria-hidden="true">H</span>
          <h1 className="su-title">Create your account</h1>
          <p className="su-subtitle">Start managing your health smarter</p>
        </div>

        <ErrorBanner message={apiError} />

        <form className="su-form" onSubmit={handleSubmit} noValidate>
          <EmailField value={email} setValue={setEmail} error={errors.email} onBlur={onBlurEmail} />
          <PasswordField id="su-password" label="Password" value={password} setValue={setPassword} error={errors.password} onBlur={onBlurPassword} show={showPw} setShow={setShowPw} />
          <PasswordField id="su-confirm" label="Confirm password" value={confirm} setValue={setConfirm} error={errors.confirm} onBlur={onBlurConfirm} show={showConfirm} setShow={setShowConfirm} />
          <TermsField agreed={agreed} setAgreed={setAgreed} error={errors.agreed} />

          <button
            type="submit"
            className="su-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="su-signin-link">
          Already have an account?{' '}
          <button type="button" className="su-link-btn" onClick={onLoginClick}>
            Sign in
          </button>
        </div>
      </main>
    </div>
  )
}

SignupFormCard.propTypes = {
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  apiError: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  confirm: PropTypes.string.isRequired,
  setConfirm: PropTypes.func.isRequired,
  agreed: PropTypes.bool.isRequired,
  setAgreed: PropTypes.func.isRequired,
  showPw: PropTypes.bool.isRequired,
  setShowPw: PropTypes.func.isRequired,
  showConfirm: PropTypes.bool.isRequired,
  setShowConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    confirm: PropTypes.string,
    agreed: PropTypes.string,
  }).isRequired,
  onBlurEmail: PropTypes.func.isRequired,
  onBlurPassword: PropTypes.func.isRequired,
  onBlurConfirm: PropTypes.func.isRequired,
  style: PropTypes.object,
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SignupView({ onSuccess, onLoginClick, dark, setDark }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const hasErrors = Object.keys(errors).length > 0

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = buildValidationErrors({ email, password, confirm, agreed })
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await authApi.register(email, password)
      setSuccess(true)
      setTimeout(() => onSuccess(email), 1800)
    } catch (err) {
      setApiError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleBlurEmail() {
    updateError('email', validateEmail(email))
  }

  function handleBlurPassword() {
    updateError('password', validatePassword(password))
  }

  function handleBlurConfirm() {
    updateError('confirm', validateConfirm(password, confirm))
  }

  if (success) {
    return <SignupSuccess dark={dark} />
  }

  return (
    <SignupFormCard
      dark={dark}
      setDark={setDark}
      onLoginClick={onLoginClick}
      handleSubmit={handleSubmit}
      apiError={apiError}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirm={confirm}
      setConfirm={setConfirm}
      agreed={agreed}
      setAgreed={setAgreed}
      showPw={showPw}
      setShowPw={setShowPw}
      showConfirm={showConfirm}
      setShowConfirm={setShowConfirm}
      loading={loading}
      errors={hasErrors ? errors : {}}
      onBlurEmail={handleBlurEmail}
      onBlurPassword={handleBlurPassword}
      onBlurConfirm={handleBlurConfirm}
    />
  )
}

SignupView.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  dark: PropTypes.bool.isRequired,
  setDark: PropTypes.func.isRequired,
}
