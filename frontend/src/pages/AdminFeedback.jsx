
import { useEffect, useState } from 'react'
import api from '../api'

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  // Load all laboratory feedback
  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/feedback/lab/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setFeedbacks(response.data)
    } catch (error) {
      console.error('Unable to load feedback:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to load feedback'
      )
    } finally {
      setLoading(false)
    }
  }

  // Page load and admin check
  useEffect(() => {
    if (!token || role !== 'Admin') {
      window.location.href = '/login'
      return
    }

    loadFeedbacks()
  }, [])

  // Rating stars
  const renderStars = (rating) => {
    const safeRating = Math.max(
      0,
      Math.min(5, Number(rating) || 0)
    )

    return (
      <span className="text-warning">
        {'★'.repeat(safeRating)}
        <span className="text-muted">
          {'★'.repeat(5 - safeRating)}
        </span>
      </span>
    )
  }

  // Summary
  const totalFeedback = feedbacks.length

  const averageRating =
    totalFeedback > 0
      ? (
          feedbacks.reduce(
            (sum, feedback) =>
              sum + (Number(feedback.rating) || 0),
            0
          ) / totalFeedback
        ).toFixed(1)
      : '0.0'

  const fiveStar = feedbacks.filter(
    (feedback) => Number(feedback.rating) === 5
  ).length

  const lowRating = feedbacks.filter(
    (feedback) => Number(feedback.rating) <= 2
  ).length

  // Loading
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />
          <p className="mt-3">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Feedback Management</h1>
          <p className="text-muted mb-0">
            View patient feedback for your laboratory
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            window.location.href = '/admin'
          }}
        >
          ← Admin Dashboard
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Feedback</h6>
              <h2 className="fw-bold text-primary">
                {totalFeedback}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Average Rating</h6>
              <h2 className="fw-bold text-warning">
                {averageRating}
                <small className="fs-5 ms-1">/ 5</small>
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">5-Star Feedback</h6>
              <h2 className="fw-bold text-success">
                {fiveStar}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Low Rating</h6>
              <h2 className="fw-bold text-danger">
                {lowRating}
              </h2>
              <small className="text-muted">
                1 or 2 stars
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">
              Patient Feedback
            </h3>

            <span className="badge bg-primary">
              {feedbacks.length} Feedback
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="alert alert-info">
              No feedback available.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Feedback ID</th>
                    <th>Patient ID</th>
                    <th>Booking ID</th>
                    <th>Rating</th>
                    <th>Comments</th>
                    <th>Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.feedback_id}>
                      <td className="fw-semibold">
                        #{feedback.feedback_id}
                      </td>

                      <td>#{feedback.patient_id}</td>

                      <td>#{feedback.booking_id}</td>

                      <td>
                        <div>
                          {renderStars(feedback.rating)}
                        </div>
                        <small className="text-muted">
                          {feedback.rating} / 5
                        </small>
                      </td>

                      <td>
                        {feedback.comments ? (
                          <span>{feedback.comments}</span>
                        ) : (
                          <span className="text-muted">
                            No comments
                          </span>
                        )}
                      </td>

                      <td>
                        {feedback.created_at
                          ? new Date(
                              feedback.created_at
                            ).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminFeedback
