
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function MyFeedback() {
  const navigate = useNavigate()

  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'Patient') {
      setError('Only patients can view their feedback.')
      setLoading(false)
      return
    }

    api
      .get('/feedback/my-feedback', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setFeedback(response.data)
      })
      .catch((error) => {
        console.error('Unable to load feedback:', error)

        const detail = error.response?.data?.detail

        setError(
          typeof detail === 'string'
            ? detail
            : 'Unable to load feedback'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
        <p className="mt-3">Loading your feedback...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">My Feedback</h2>
          <p className="text-muted mb-0">
            View your submitted laboratory feedback
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => navigate('/my-bookings')}
        >
          My Bookings
        </button>
      </div>

      {feedback.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <h4 className="fw-bold">No Feedback Submitted</h4>

            <p className="text-muted">
              Your submitted feedback will appear here.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/my-bookings')}
            >
              View My Bookings
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {feedback.map((item) => (
            <div
              className="col-md-6 col-lg-4"
              key={item.feedback_id}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="fw-bold">
                      Feedback #{item.feedback_id}
                    </h5>

                    <span className="badge bg-warning text-dark">
                      {item.rating}/5
                    </span>
                  </div>

                  <hr />

                  <p className="mb-2">
                    <strong>Booking:</strong> #{item.booking_id}
                  </p>

                  <p className="mb-2">
                    <strong>Laboratory:</strong> Lab #{item.lab_id}
                  </p>

                  <p className="mb-3">
                    <strong>Rating:</strong>{' '}
                    {'⭐'.repeat(
                      Math.max(0, Math.min(5, Number(item.rating) || 0))
                    )}
                  </p>

                  <p className="text-muted">
                    {item.comments || 'No comments provided.'}
                  </p>

                  <small className="text-muted">
                    Submitted:{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : 'Date unavailable'}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyFeedback
