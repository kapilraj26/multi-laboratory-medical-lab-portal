import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function StaffReports() {

  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedBooking, setSelectedBooking] = useState(null)

  const [result, setResult] = useState('')
  const [remarks, setRemarks] = useState('')
  const [pdfFile, setPdfFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')


  // =========================
  // LOAD BOOKINGS
  // =========================

  const loadBookings = async () => {

    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login')
      return
    }

    if (role !== 'Staff') {

      setError(
        'Only laboratory staff can access this page.'
      )

      setLoading(false)

      return
    }

    try {

      const response = await axios.get(
        'http://127.0.0.1:8000/bookings/lab/all',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setBookings(response.data)

    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to load laboratory bookings'
      )

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {

    loadBookings()

  }, [])


  // =========================
  // SELECT BOOKING
  // =========================

  const selectBooking = (booking) => {

    setSelectedBooking(booking)

    setResult('')
    setRemarks('')
    setPdfFile(null)
    setError('')
    setSuccess('')

  }


  // =========================
  // UPLOAD REPORT
  // =========================

  const handleUpload = async (event) => {

    event.preventDefault()

    const token = localStorage.getItem(
      'access_token'
    )


    if (!selectedBooking) {

      setError(
        'Please select a booking.'
      )

      return
    }


    if (!pdfFile) {

      setError(
        'Please select a PDF report.'
      )

      return
    }


    if (
      pdfFile.type !==
      'application/pdf'
    ) {

      setError(
        'Only PDF files are allowed.'
      )

      return
    }


    setUploading(true)
    setError('')
    setSuccess('')


    try {

      const formData = new FormData()

      formData.append(
        'booking_id',
        selectedBooking.booking_id
      )

      formData.append(
        'result',
        result
      )

      formData.append(
        'remarks',
        remarks
      )

      formData.append(
        'report_pdf',
        pdfFile
      )


      await axios.post(

        'http://127.0.0.1:8000/reports/',

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        `Report uploaded successfully for Booking #${selectedBooking.booking_id}.`
      )


      setSelectedBooking(null)
      setResult('')
      setRemarks('')
      setPdfFile(null)


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to upload report'
      )

    } finally {

      setUploading(false)

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
          Loading bookings...
        </p>

      </div>

    )
  }


  return (

    <div className="container py-5">

      {/* =========================
          HEADER
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            Staff Report Management
          </h2>

          <p className="text-muted mb-0">
            Upload medical reports for completed bookings
          </p>

        </div>


        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate('/staff')
          }
        >
          ← Staff Dashboard
        </button>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* =========================
          SUCCESS
      ========================= */}

      {success && (

        <div className="alert alert-success">
          {success}
        </div>

      )}


      {/* =========================
          BOOKINGS
      ========================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h4 className="fw-bold mb-4">
            Completed Bookings
          </h4>


          {bookings.filter(
            (booking) =>
              booking.status === 'Completed'
          ).length === 0 ? (

            <div className="alert alert-info">
              No completed bookings available.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>
                      Booking
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Test
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {bookings
                    .filter(
                      (booking) =>
                        booking.status === 'Completed'
                    )
                    .map(
                      (booking) => (

                        <tr
                          key={
                            booking.booking_id
                          }
                        >

                          <td>
                            #{booking.booking_id}
                          </td>

                          <td>
                            #{booking.patient_id}
                          </td>

                          <td>
                            #{booking.test_id}
                          </td>

                          <td>
                            {booking.booking_date}
                          </td>

                          <td>

                            <span className="badge bg-success">
                              Completed
                            </span>

                          </td>

                          <td>

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                selectBooking(
                                  booking
                                )
                              }
                            >
                              Upload Report
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =========================
          UPLOAD FORM
      ========================= */}

      {selectedBooking && (

        <div className="card shadow-sm">

          <div className="card-body p-4">

            <h4 className="fw-bold">
              Upload Report
            </h4>

            <p className="text-muted">
              Booking #{selectedBooking.booking_id}
            </p>


            <hr />


            <form onSubmit={handleUpload}>

              {/* RESULT */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Test Result
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter test result..."
                  value={result}
                  onChange={(event) =>
                    setResult(
                      event.target.value
                    )
                  }
                />

              </div>


              {/* REMARKS */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Remarks
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter remarks..."
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(
                      event.target.value
                    )
                  }
                />

              </div>


              {/* PDF */}

              <div className="mb-4">

                <label className="form-label fw-bold">
                  Medical Report PDF
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(event) =>
                    setPdfFile(
                      event.target.files[0]
                    )
                  }
                  required
                />

                <small className="text-muted">
                  Only PDF files are allowed.
                </small>

              </div>


              {/* BUTTONS */}

              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Upload Report'}
                </button>


                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setSelectedBooking(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )
}


export default StaffReports