
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function Booking() {
  const { labId, testId } = useParams()
  const navigate = useNavigate()

  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    // Check login
    if (!token) {
      navigate('/login')
      return
    }

    // Check patient role
    if (role !== 'Patient') {
      setError('Only patients can book medical tests.')
      return
    }

    setLoading(true)

    try {
      await api.post(
        '/bookings/',
        {
          lab_id: Number(labId),
          test_id: Number(testId),
          booking_date: bookingDate,
          booking_time: bookingTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccess('Booking created successfully!')
      setBookingDate('')
      setBookingTime('')
    } catch (error) {
      console.error('Booking error:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to create booking. Please try again.'
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
            Book Medical Test
          </h2>

          <p className="text-muted text-center">
            Select your preferred date and time
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="bookingDate" className="form-label fw-bold">
                Booking Date
              </label>

              <input
                id="bookingDate"
                type="date"
                className="form-control"
                value={bookingDate}
                onChange={(event) =>
                  setBookingDate(event.target.value)
                }
                min={new Date().toLocaleDateString('en-CA')}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="bookingTime" className="form-label fw-bold">
                Booking Time
              </label>

              <input
                id="bookingTime"
                type="time"
                className="form-control"
                value={bookingTime}
                onChange={(event) =>
                  setBookingTime(event.target.value)
                }
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() =>
              navigate(`/lab/${labId}/test/${testId}`)
            }
          >
            ← Back to Test
          </button>
        </div>
      </div>
    </div>
  )
}

export default Booking
