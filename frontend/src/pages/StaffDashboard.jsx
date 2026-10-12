import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function StaffDashboard() {
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load bookings
  const loadBookings = async () => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      setLoading(false)
      return
    }

    if (role !== 'Staff') {
      setError('Only laboratory staff can access this dashboard.')
      setLoading(false)
      return
    }

    try {
      setError('')

      const response = await api.get('/bookings/lab/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setBookings(response.data)
    } catch (error) {
      console.error('Unable to load bookings:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to load laboratory bookings'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  // Update booking status
  const updateStatus = async (bookingId, status) => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/login')
      return
    }

    setError('')

    try {
      await api.put(
        `/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      await loadBookings()
    } catch (error) {
      console.error('Unable to update booking status:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to update booking status'
      )
    }
  }

  // Status badge
  const getStatusClass = (status) => {
    if (status === 'Completed') return 'bg-success'
    if (status === 'Confirmed') return 'bg-primary'
    if (status === 'Cancelled') return 'bg-danger'

    return 'bg-warning text-dark'
  }

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
        <p className="mt-3">Loading laboratory bookings...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Staff Dashboard</h2>
          <p className="text-muted mb-0">
            Manage your laboratory bookings
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadBookings}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Booking Counts */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Bookings</h6>
              <h2 className="fw-bold">{bookings.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Pending</h6>
              <h2 className="fw-bold text-warning">
                {
                  bookings.filter(
                    (booking) => booking.status === 'Pending'
                  ).length
                }
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Completed</h6>
              <h2 className="fw-bold text-success">
                {
                  bookings.filter(
                    (booking) => booking.status === 'Completed'
                  ).length
                }
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-4">Laboratory Bookings</h4>

          {bookings.length === 0 ? (
            <div className="alert alert-info">
              No bookings available for this laboratory.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Patient ID</th>
                    <th>Test ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>#{booking.booking_id}</td>
                      <td>#{booking.patient_id}</td>
                      <td>#{booking.test_id}</td>
                      <td>{booking.booking_date}</td>
                      <td>{booking.booking_time}</td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {booking.status === 'Pending' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                updateStatus(
                                  booking.booking_id,
                                  'Confirmed'
                                )
                              }
                            >
                              Confirm
                            </button>
                          )}

                          {booking.status === 'Confirmed' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                updateStatus(
                                  booking.booking_id,
                                  'Completed'
                                )
                              }
                            >
                              Complete
                            </button>
                          )}

                          {(
                            booking.status === 'Pending' ||
                            booking.status === 'Confirmed'
                          ) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                updateStatus(
                                  booking.booking_id,
                                  'Cancelled'
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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

export default StaffDashboard
