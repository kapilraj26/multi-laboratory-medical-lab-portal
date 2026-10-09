import { useEffect, useState } from 'react'
import axios from 'axios'


function AdminReports() {

  const [reports, setReports] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')


  const token = localStorage.getItem('access_token')

  const role = localStorage.getItem('role')


  // =====================================================
  // LOAD ALL LAB REPORTS
  // =====================================================

  const loadReports = async () => {

    try {

      setLoading(true)

      setError('')


      const response = await axios.get(

        'http://127.0.0.1:8000/reports/lab/all',

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setReports(response.data)

    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to load reports'
      )

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    if (role !== 'Admin') {

      window.location.href = '/login'

      return

    }


    loadReports()

  }, [])


  // =====================================================
  // DOWNLOAD REPORT
  // =====================================================

  const handleDownload = async (reportId) => {

    setError('')

    setSuccess('')


    try {

      const response = await axios.get(

        `http://127.0.0.1:8000/reports/${reportId}/download`,

        {
          headers: {
            Authorization: `Bearer ${token}`
          },

          responseType: 'blob'
        }

      )


      const blob = new Blob(
        [response.data],
        {
          type: 'application/pdf'
        }
      )


      const url = window.URL.createObjectURL(blob)


      const link = document.createElement('a')

      link.href = url

      link.download = `medical-report-${reportId}.pdf`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)


      setSuccess(
        `Report #${reportId} downloaded successfully`
      )


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to download report'
      )

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="container py-5">

        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-3">
            Loading reports...
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="container-fluid py-4 px-4">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h1 className="fw-bold">
            Report Management
          </h1>

          <p className="text-muted mb-0">
            View and manage laboratory reports
          </p>

        </div>


        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            window.location.href = '/admin'
          }
        >

          ← Admin Dashboard

        </button>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="row g-3 mb-4">


        {/* TOTAL REPORTS */}

        <div className="col-md-4">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Total Reports
              </h6>

              <h2 className="fw-bold text-primary">
                {reports.length}
              </h2>

            </div>

          </div>

        </div>


        {/* REPORTS WITH RESULTS */}

        <div className="col-md-4">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Reports Available
              </h6>

              <h2 className="fw-bold text-success">

                {
                  reports.filter(
                    report =>
                      report.result &&
                      report.result.trim() !== ''
                  ).length
                }

              </h2>

            </div>

          </div>

        </div>


        {/* PDF REPORTS */}

        <div className="col-md-4">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                PDF Reports
              </h6>

              <h2 className="fw-bold text-info">

                {
                  reports.filter(
                    report =>
                      report.report_file
                  ).length
                }

              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          REPORT TABLE
      ================================================= */}

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


          {/* NO REPORTS */}

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

                    <tr
                      key={report.report_id}
                    >


                      {/* REPORT ID */}

                      <td className="fw-semibold">

                        #{report.report_id}

                      </td>


                      {/* BOOKING ID */}

                      <td>

                        #{report.booking_id}

                      </td>


                      {/* PATIENT ID */}

                      <td>

                        #{report.patient_id}

                      </td>


                      {/* TEST ID */}

                      <td>

                        #{report.test_id}

                      </td>


                      {/* RESULT */}

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


                      {/* REMARKS */}

                      <td>

                        {report.remarks ? (

                          <span>

                            {report.remarks}

                          </span>

                        ) : (

                          <span className="text-muted">

                            -

                          </span>

                        )}

                      </td>


                      {/* CREATED */}

                      <td>

                        {report.created_at
                          ? new Date(
                              report.created_at
                            ).toLocaleString()
                          : '-'
                        }

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            handleDownload(
                              report.report_id
                            )
                          }
                        >

                          Download PDF

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