
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function BookingDetails() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
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
      setError('Only patients can view booking details.')
      setLoading(false)
      return
    }

    let isMounted = true

    const loadBooking = async () => {
      try {
        const response = await api.get(
          `/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (isMounted) {
          setBooking(response.data)
        }
      } catch (error) {
        console.error('Failed to load booking:', error)

        if (isMounted) {
          const detail = error.response?.data?.detail

          setError(
            typeof detail === 'string'
              ? detail
              : 'Unable to load booking details'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBooking()

    return () => {
      isMounted = false
    }
  }, [bookingId, navigate])

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading booking details"
        />

        <p className="mt-3">Loading booking details...</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/my-bookings')}
        >
          ← Back to My Bookings
        </button>
      </div>
    )
  }

  // Booking not found
  if (!booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Booking not found
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/my-bookings')}
        >
          ← Back to My Bookings
        </button>
      </div>
    )
  }

  // Status style
  const statusClass =
    booking.status === 'Completed'
      ? 'bg-success'
      : booking.status === 'Confirmed'
      ? 'bg-primary'
      : booking.status === 'Cancelled'
      ? 'bg-danger'
      : 'bg-warning text-dark'

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '750px' }}
      >
        <div className="card-body p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">
                Booking Details
              </h2>

              <p className="text-muted mb-0">
                Booking #{booking.booking_id}
              </p>
            </div>

            <span className={`badge ${statusClass}`}>
              {booking.status}
            </span>
          </div>

          <hr className="my-4" />

          {/* Booking information */}
          <div className="row g-4">
            <div className="col-md-6">
              <h5 className="fw-bold">Laboratory</h5>
              <p className="mb-0">
                Laboratory #{booking.lab_id}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Medical Test</h5>
              <p className="mb-0">
                Test #{booking.test_id}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Booking Date</h5>
              <p className="mb-0">
                📅 {booking.booking_date}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Booking Time</h5>
              <p className="mb-0">
                🕐 {booking.booking_time}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Patient ID</h5>
              <p className="mb-0">
                {booking.patient_id}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Booking Status</h5>
              <p className="mb-0">
                {booking.status}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/my-bookings')}
            >
              ← Back to My Bookings
            </button>

            {booking.status === 'Completed' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/my-reports')}
                >
                  📄 View Reports
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    navigate(
                      `/booking/${booking.booking_id}/feedback`
                    )
                  }
                >
                  ⭐ Submit Feedback
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
