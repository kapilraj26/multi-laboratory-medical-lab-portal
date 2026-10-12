import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function AdminDashboard() {
  const navigate = useNavigate()

  const [staff, setStaff] = useState([])
  const [tests, setTests] = useState([])
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])
  const [feedback, setFeedback] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load admin data
  const loadAdminData = async () => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'Admin') {
      setError(
        'Only laboratory administrators can access this dashboard.'
      )
      setLoading(false)
      return
    }

    try {
      setError('')

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const labId = localStorage.getItem('lab_id')

      const [
        staffResponse,
        testsResponse,
        bookingsResponse,
        reportsResponse,
        feedbackResponse,
      ] = await Promise.all([
        api.get('/users/staff', { headers }),

        api.get(`/lab-tests/lab/${labId}`, { headers }),

        api.get('/bookings/lab/all', { headers }),

        api.get('/reports/lab/all', { headers }),

        api.get('/feedback/lab/all', { headers }),
      ])

      setStaff(staffResponse.data)
      setTests(testsResponse.data)
      setBookings(bookingsResponse.data)
      setReports(reportsResponse.data)
      setFeedback(feedbackResponse.data)
    } catch (error) {
      console.error('Unable to load admin dashboard:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to load admin dashboard'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
        <p className="mt-3">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Admin Dashboard</h2>
          <p className="text-muted mb-0">
            Manage your laboratory
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => {
            setLoading(true)
            loadAdminData()
          }}
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

      {/* Summary Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Staff</h6>
              <h2 className="fw-bold text-primary">
                {staff.length}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/admin/staff')}
              >
                Manage Staff
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Medical Tests</h6>
              <h2 className="fw-bold text-info">
                {tests.length}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={() => navigate('/admin/tests')}
              >
                Manage Tests
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Bookings</h6>
              <h2 className="fw-bold text-warning">
                {bookings.length}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={() => navigate('/admin/bookings')}
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Reports</h6>
              <h2 className="fw-bold text-success">
                {reports.length}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-4">
            Quick Management
          </h4>

          <div className="row g-3">
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100 py-3"
                onClick={() => navigate('/admin/staff')}
              >
                👨‍💼 Staff Management
              </button>
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-info w-100 py-3"
                onClick={() => navigate('/admin/tests')}
              >
                🧪 Test Management
              </button>
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-warning w-100 py-3"
                onClick={() => navigate('/admin/bookings')}
              >
                📅 Booking Management
              </button>
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-success w-100 py-3"
                onClick={() => navigate('/admin/reports')}
              >
                📄 Report Management
              </button>
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-secondary w-100 py-3"
                onClick={() => navigate('/admin/feedback')}
              >
                ⭐ Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h4 className="fw-bold">Feedback Summary</h4>

          <p className="text-muted">
            Total feedback received:{' '}
            <strong>{feedback.length}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
