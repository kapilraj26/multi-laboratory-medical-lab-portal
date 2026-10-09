import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'


function BookingDetails() {

  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
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
        'Only patients can view booking details.'
      )

      setLoading(false)

      return
    }


    // =========================
    // LOAD BOOKING
    // =========================

    axios
      .get(
        `http://127.0.0.1:8000/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {

        setBooking(response.data)

      })
      .catch((error) => {

        console.error(error)

        setError(
          error.response?.data?.detail ||
          'Unable to load booking details'
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [bookingId, navigate])


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
          Loading booking details...
        </p>

      </div>

    )
  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (

      <div className="container py-5">

        <div className="alert alert-danger">
          {error}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate('/my-bookings')
          }
        >
          ← Back to My Bookings
        </button>

      </div>

    )
  }


  // =========================
  // BOOKING NOT FOUND
  // =========================

  if (!booking) {

    return (

      <div className="container py-5">

        <div className="alert alert-warning">
          Booking not found
        </div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate('/my-bookings')
          }
        >
          ← Back to My Bookings
        </button>

      </div>

    )
  }


  // =========================
  // STATUS STYLE
  // =========================

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

          {/* =========================
              HEADER
          ========================= */}

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h2 className="fw-bold mb-1">
                Booking Details
              </h2>

              <p className="text-muted mb-0">
                Booking #{booking.booking_id}
              </p>

            </div>


            <span
              className={`badge ${statusClass}`}
            >
              {booking.status}
            </span>

          </div>


          <hr className="my-4" />


          {/* =========================
              DETAILS
          ========================= */}

          <div className="row g-4">

            <div className="col-md-6">

              <h5 className="fw-bold">
                Laboratory
              </h5>

              <p className="mb-0">
                Laboratory #{booking.lab_id}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Medical Test
              </h5>

              <p className="mb-0">
                Test #{booking.test_id}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Booking Date
              </h5>

              <p className="mb-0">
                📅 {booking.booking_date}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Booking Time
              </h5>

              <p className="mb-0">
                🕐 {booking.booking_time}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Patient ID
              </h5>

              <p className="mb-0">
                {booking.patient_id}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Booking Status
              </h5>

              <p className="mb-0">
                {booking.status}
              </p>

            </div>

          </div>


          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="d-flex flex-wrap gap-2 mt-5">

            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate('/my-bookings')
              }
            >
              ← Back to My Bookings
            </button>


            {/* =========================
                COMPLETED BOOKING
            ========================= */}

            {booking.status === 'Completed' && (

              <>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/my-reports')
                  }
                >
                  📄 View Reports
                </button>


                <button
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