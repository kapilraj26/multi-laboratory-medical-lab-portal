
import { useEffect, useState } from 'react'
import api from '../api'

function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  // Load all laboratory reports
  const loadReports = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/reports/lab/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setReports(response.data)
    } catch (error) {
      console.error('Unable to load reports:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to load reports'
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

    loadReports()
  }, [])

  // Download PDF report
  const handleDownload = async (reportId) => {
    setError('')
    setSuccess('')
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

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `medical-report-${reportId}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

      setSuccess(`Report #${reportId} downloaded successfully`)
    } catch (error) {
      console.error('Unable to download report:', error)

      let message = 'Unable to download report'

      if (error.response?.data instanceof Blob) {
        try {
          const responseText = await error.response.data.text()
          const errorData = JSON.parse(responseText)

          if (typeof errorData.detail === 'string') {
            message = errorData.detail
          }
        } catch {
          // Keep the default error message.
        }
      } else if (typeof error.response?.data?.detail === 'string') {
        message = error.response.data.detail
      }

      setError(message)
    } finally {
      setDownloadingId(null)
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
          <p className="mt-3">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Summary
  const availableReports = reports.filter(
    (report) =>
      report.result && report.result.trim() !== ''
  ).length

  const pdfReports = reports.filter(
    (report) => report.report_file
  ).length

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Report Management</h1>
          <p className="text-muted mb-0">
            View and manage laboratory reports
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

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Reports</h6>
              <h2 className="fw-bold text-primary">
                {reports.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Reports Available</h6>
              <h2 className="fw-bold text-success">
                {availableReports}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">PDF Reports</h6>
              <h2 className="fw-bold text-info">
                {pdfReports}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">
              Laboratory Reports
            </h3>

            <span className="badge bg-primary">
              {reports.length} Reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="alert alert-info">
              No reports available.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Booking ID</th>
                    <th>Patient ID</th>
                    <th>Test ID</th>
                    <th>Result</th>
                    <th>Remarks</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report.report_id}>
                      <td className="fw-semibold">
                        #{report.report_id}
                      </td>

                      <td>#{report.booking_id}</td>

                      <td>#{report.patient_id}</td>

                      <td>#{report.test_id}</td>

                      <td>
                        {report.result ? (
                          <span className="text-success fw-semibold">
                            Available
                          </span>
                        ) : (
                          <span className="text-muted">
                            Not available
                          </span>
                        )}
                      </td>

                      <td>
                        {report.remarks || (
                          <span className="text-muted">-</span>
                        )}
                      </td>

                      <td>
                        {report.created_at
                          ? new Date(
                              report.created_at
                            ).toLocaleString()
                          : '-'}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          disabled={downloadingId !== null}
                          onClick={() =>
                            handleDownload(report.report_id)
                          }
                        >
                          {downloadingId === report.report_id
                            ? 'Downloading...'
                            : 'Download PDF'}
                        </button>
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

export default AdminReports
