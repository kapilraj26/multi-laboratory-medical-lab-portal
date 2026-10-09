import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function MyReports() {

  const navigate = useNavigate()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {

    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')


    // =========================
    // CHECK LOGIN
    // =========================

    if (!token) {

      navigate('/login')

      return
    }


    // =========================
    // CHECK PATIENT
    // =========================

    if (role !== 'Patient') {

      setError(
        'Only patients can view their reports.'
      )

      setLoading(false)

      return
    }


    // =========================
    // LOAD REPORTS
    // =========================

    axios
      .get(
        'http://127.0.0.1:8000/reports/my-reports',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {

        setReports(response.data)

      })
      .catch((error) => {

        console.error(error)

        setError(
          error.response?.data?.detail ||
          'Unable to load reports'
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [navigate])


  // =========================
  // DOWNLOAD REPORT
  // =========================

  const downloadReport = async (reportId) => {

    const token = localStorage.getItem(
      'access_token'
    )

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


      const fileUrl = window.URL.createObjectURL(
        new Blob([response.data])
      )

      const link = document.createElement('a')

      link.href = fileUrl

      link.setAttribute(
        'download',
        `medical_report_${reportId}.pdf`
      )

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(fileUrl)

    } catch (error) {

      console.error(error)

      setError(
        'Unable to download report'
      )

    }

  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="container text-center py-5">

        <div
          className="spinner-border text-primary"
          role="status"
        />

        <p className="mt-3">
          Loading your reports...
        </p>

      </div>

    )
  }


  return (

    <div className="container py-5">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            My Reports
          </h2>

          <p className="text-muted mb-0">
            View and download your medical reports
          </p>

        </div>


        <button
          className="btn btn-outline-primary"
          onClick={() =>
            navigate('/my-bookings')
          }
        >
          My Bookings
        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* NO REPORTS */}

      {!error && reports.length === 0 && (

        <div className="card shadow-sm">

          <div className="card-body text-center py-5">

            <h4 className="fw-bold">
              No Reports Available
            </h4>

            <p className="text-muted">
              Your medical reports will appear here
              after the laboratory uploads them.
            </p>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate('/my-bookings')
              }
            >
              View My Bookings
            </button>

          </div>

        </div>

      )}


      {/* REPORTS */}

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
                    <strong>
                      Booking ID:
                    </strong>{' '}
                    #{report.booking_id}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Laboratory:
                    </strong>{' '}
                    Lab #{report.lab_id}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Test:
                    </strong>{' '}
                    Test #{report.test_id}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Result:
                    </strong>
                  </p>

                  <p className="text-muted">
                    {report.result ||
                      'Result available in PDF report'}
                  </p>

                  {report.remarks && (

                    <p className="text-muted">
                      <strong>
                        Remarks:
                      </strong>{' '}
                      {report.remarks}
                    </p>

                  )}

                  <button
                    className="btn btn-primary w-100 mt-3"
                    onClick={() =>
                      downloadReport(
                        report.report_id
                      )
                    }
                  >
                    📄 Download PDF
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