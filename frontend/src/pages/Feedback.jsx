
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function Feedback() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [rating, setRating] = useState('5')
  const [comments, setComments] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    // Check login
    if (!token) {
      navigate('/login')
      return
    }

    // Check patient role
    if (role !== 'Patient') {
      setError('Only patients can submit feedback.')
      return
    }

    setLoading(true)

    try {
      await api.post(
        '/feedback/',
        {
          booking_id: Number(bookingId),
          rating: Number(rating),
          comments: comments.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccess('Feedback submitted successfully!')
      setComments('')
      setRating('5')
    } catch (error) {
      console.error('Feedback submission error:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to submit feedback. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '650px' }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold text-center">
            Submit Feedback
          </h2>

          <p className="text-muted text-center">
            Booking #{bookingId}
          </p>

          {/* Error */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-4">
              <label htmlFor="rating" className="form-label fw-bold">
                Rating
              </label>

              <select
                id="rating"
                className="form-select"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                disabled={loading}
                required
              >
                <option value="5">⭐⭐⭐⭐⭐ — Excellent</option>
                <option value="4">⭐⭐⭐⭐ — Very Good</option>
                <option value="3">⭐⭐⭐ — Good</option>
                <option value="2">⭐⭐ — Fair</option>
                <option value="1">⭐ — Poor</option>
              </select>
            </div>

            {/* Comments */}
            <div className="mb-4">
              <label htmlFor="comments" className="form-label fw-bold">
                Comments
              </label>

              <textarea
                id="comments"
                className="form-control"
                rows="5"
                placeholder="Share your experience..."
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>

          {/* Back */}
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() => navigate(`/booking/${bookingId}`)}
          >
            ← Back to Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default Feedback
