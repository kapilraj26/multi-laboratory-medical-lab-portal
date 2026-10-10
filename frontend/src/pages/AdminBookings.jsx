
import { useEffect, useState } from 'react'
import api from '../api'

function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
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
          : 'Unable to load bookings'
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

    loadBookings()
  }, [])

  // Update booking status
  const updateStatus = async (bookingId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to change this booking to ${status}?`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')

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

      setSuccess(
        `Booking #${bookingId} updated to ${status} successfully`
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

  // Loading
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />
          <p className="mt-3">Loading bookings...</p>
        </div>
      </div>
    )
  }

  // Booking counts
  const totalBookings = bookings.length

  const pendingBookings = bookings.filter(
    (booking) => booking.status === 'Pending'
  ).length

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === 'Confirmed'
  ).length

  const completedBookings = bookings.filter(
    (booking) => booking.status === 'Completed'
  ).length

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === 'Cancelled'
  ).length

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Booking Management</h1>
          <p className="text-muted mb-0">
            Manage patient bookings in your laboratory
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

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Bookings</h6>
              <h2 className="fw-bold">{totalBookings}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-lg">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Pending</h6>
              <h2 className="fw-bold text-warning">
                {pendingBookings}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-lg">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Confirmed</h6>
              <h2 className="fw-bold text-primary">
                {confirmedBookings}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-lg">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Completed</h6>
              <h2 className="fw-bold text-success">
                {completedBookings}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-lg">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Cancelled</h6>
              <h2 className="fw-bold text-danger">
                {cancelledBookings}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">
              Laboratory Bookings
            </h3>

            <span className="badge bg-primary">
              {bookings.length} Bookings
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="alert alert-info">
              No bookings available.
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
                      <td className="fw-semibold">
                        #{booking.booking_id}
                      </td>

                      <td>#{booking.patient_id}</td>

                      <td>#{booking.test_id}</td>

                      <td>{booking.booking_date}</td>

                      <td>{booking.booking_time}</td>

                      <td>
                        <span
                          className={
                            booking.status === 'Pending'
                              ? 'badge bg-warning text-dark'
                              : booking.status === 'Confirmed'
                                ? 'badge bg-primary'
                                : booking.status === 'Completed'
                                  ? 'badge bg-success'
                                  : 'badge bg-danger'
                          }
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {booking.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  updateStatus(
                                    booking.booking_id,
                                    'Confirmed'
                                  )
                                }
                              >
                                Confirm
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  updateStatus(
                                    booking.booking_id,
                                    'Cancelled'
                                  )
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === 'Confirmed' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  updateStatus(
                                    booking.booking_id,
                                    'Completed'
                                  )
                                }
                              >
                                Complete
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  updateStatus(
                                    booking.booking_id,
                                    'Cancelled'
                                  )
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === 'Completed' && (
                            <span className="text-success fw-semibold">
                              Completed
                            </span>
                          )}

                          {booking.status === 'Cancelled' && (
                            <span className="text-danger fw-semibold">
                              Cancelled
                            </span>
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

export default AdminBookings
