import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { doctorApi } from '../../api/doctor'
import { IconStar, IconCheckCircle } from '../../icons'

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function DoctorRatingView({ appointment, onDone, onSkip }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const starRefs = useRef([])

  const doctorName = appointment?.doctor_name ?? appointment?.doctor ?? 'Your Doctor'
  const doctorId = appointment?.doctor_id ?? appointment?.doctor_user_id
  const appointmentId = appointment?.id
  const displayed = hovered || rating

  const handleStarKeyDown = (e, star) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(star + 1, 5)
      setRating(next)
      starRefs.current[next - 1]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = Math.max(star - 1, 1)
      setRating(prev)
      starRefs.current[prev - 1]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setRating(1)
      starRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setRating(5)
      starRefs.current[4]?.focus()
    }
  }

  async function handleSubmit() {
    if (!rating) {
      setError('Please select a star rating.')
      return
    }
    if (!doctorId) {
      setError('Unable to identify the doctor. Please try again.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await doctorApi.submitRating(doctorId, {
        rating,
        comment: comment.trim() || undefined,
        appointment_id: appointmentId,
      })
      setDone(true)
    } catch (err) {
      setError(err?.message ?? 'Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-teal-950/20">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-emerald-500 dark:bg-black/20">
            <span className="inline-flex h-9 w-9"><IconCheckCircle /></span>
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#eeeef5]">Thank You!</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#9898b0]">
              Your feedback helps improve care for everyone.
            </p>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-[22px] font-bold text-slate-900 dark:text-[#eeeef5]">Rate Your Visit</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-[#70708a]">
        How was your experience with <strong className="font-semibold text-slate-700 dark:text-[#c8c8e0]">{doctorName}</strong>?
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#252530] dark:bg-[#111118]">
        {/* Stars */}
        <fieldset
          className="mb-2 flex items-center justify-center gap-2"
          aria-label="Star rating"
        >
          <legend className="sr-only">Select a rating from 1 to 5 stars</legend>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              ref={(el) => { starRefs.current[star - 1] = el }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onKeyDown={(e) => handleStarKeyDown(e, star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              className={`inline-flex h-10 w-10 items-center justify-center transition-all duration-100 ${
                star <= displayed
                  ? 'scale-110 text-amber-400'
                  : 'text-slate-300 dark:text-[#353545]'
              } hover:scale-125`}
            >
              <IconStar size={22} />
            </button>
          ))}
        </fieldset>

        <p className={`mb-5 min-h-[20px] text-center text-sm font-medium transition-all duration-150 ${displayed ? 'text-amber-500 dark:text-amber-400' : 'text-transparent'}`}>
          {RATING_LABELS[displayed] || '\u00A0'}
        </p>

        {/* Comment */}
        <label htmlFor="rating-comment" className="sr-only">Comment (optional)</label>
        <textarea
          id="rating-comment"
          className="mb-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-[#252530] dark:bg-[#16161e] dark:text-[#eeeef5] dark:focus:border-indigo-600 dark:focus:ring-indigo-950/50"
          rows={3}
          placeholder="Share more about your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p id="rating-error" className="mb-3 text-sm text-rose-500" role="alert">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#1c1c25]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !rating}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {submitting ? 'Submitting\u2026' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}

DoctorRatingView.propTypes = {
  appointment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    doctor_name: PropTypes.string,
    doctor: PropTypes.string,
    doctor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    doctor_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onDone: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
}

DoctorRatingView.defaultProps = {
  appointment: null,
}
