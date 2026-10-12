import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function MyReports() {
  const navigate = useNavigate()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'Patient') {
      setError('Only patients can view their reports.')
      setLoading(false)
      return
    }

    let isMounted = true

    const loadReports = async () => {
      try {
        const response = await api.get('/reports/my-reports', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (isMounted) {
          setReports(response.data)
        }
      } catch (error) {
        console.error('Failed to load reports:', error)

        if (isMounted) {
          const detail = error.response?.data?.detail

          setError(
            typeof detail === 'string'
              ? detail
              : 'Unable to load reports'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isMounted = false
    }
  }, [navigate])

  // Download PDF report
  const downloadReport = async (reportId) => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/login')
      return
    }

    setError('')
    setDownloadingId(reportId)

    try {
      const response = await api.get(
        `/reports/${reportId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      )

      const fileUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/pdf',
        })
      )

      const link = document.createElement('a')
      link.href = fileUrl
      link.download = `medical_report_${reportId}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(fileUrl)
    } catch (error) {
      console.error('Failed to download report:', error)

      setError('Unable to download report. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading reports"
        />

        <p className="mt-3">Loading your reports...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold">My Reports</h2>

          <p className="text-muted mb-0">
            View and download your medical reports
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

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* No reports */}
      {!error && reports.length === 0 && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <h4 className="fw-bold">No Reports Available</h4>

            <p className="text-muted">
              Your medical reports will appear here after the
              laboratory uploads them.
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
      )}

      {/* Reports */}
      {!error && reports.length > 0 && (
        <div className="row g-4">
          {reports.map((report) => (
            <div
              className="col-md-6 col-lg-4"
              key={report.report_id}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold">
                    Medical Report #{report.report_id}
                  </h5>

                  <hr />

                  <p className="mb-2">
                    <strong>Booking ID:</strong>{' '}
                    #{report.booking_id}
                  </p>

                  <p className="mb-2">
                    <strong>Laboratory:</strong>{' '}
                    Lab #{report.lab_id}
                  </p>

                  <p className="mb-2">
                    <strong>Test:</strong>{' '}
                    Test #{report.test_id}
                  </p>

                  <p className="mb-2">
                    <strong>Result:</strong>
                  </p>

                  <p className="text-muted">
                    {report.result ||
                      'Result available in PDF report'}
                  </p>

                  {report.remarks && (
                    <p className="text-muted">
                      <strong>Remarks:</strong>{' '}
                      {report.remarks}
                    </p>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary w-100 mt-3"
                    onClick={() => downloadReport(report.report_id)}
                    disabled={downloadingId !== null}
                  >
                    {downloadingId === report.report_id
                      ? 'Downloading...'
                      : '📄 Download PDF'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReports
