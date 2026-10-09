import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function MyBookings() {

  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
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
        'Only patients can view their bookings.'
      )

      setLoading(false)

      return
    }


    // =========================
    // LOAD BOOKINGS
    // =========================

    axios
      .get(
        'http://127.0.0.1:8000/bookings/my-bookings',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {

        setBookings(response.data)

      })
      .catch((error) => {

        console.error(error)

        setError(
          error.response?.data?.detail ||
          'Unable to load bookings'
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [navigate])


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
          Loading your bookings...
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

      </div>

    )
  }


  return (

    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            My Bookings
          </h2>

          <p className="text-muted mb-0">
            View your medical test bookings
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Book Another Test
        </button>

      </div>


      {/* =========================
          NO BOOKINGS
      ========================= */}

      {bookings.length === 0 ? (

        <div className="card shadow-sm">

          <div className="card-body text-center py-5">

            <h4 className="fw-bold">
              No Bookings Found
            </h4>

            <p className="text-muted">
              You have not booked any medical tests yet.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Find a Laboratory
            </button>

          </div>

        </div>

      ) : (

        /* =========================
           BOOKINGS
        ========================= */

        <div className="row g-4">

          {bookings.map((booking) => (

            <div
              className="col-md-6 col-lg-4"
              key={booking.booking_id}
            >

              <div className="card h-100 shadow-sm">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="fw-bold mb-0">
                      Booking #{booking.booking_id}
                    </h5>


                    <span
                      className={`badge ${
                        booking.status === 'Completed'
                          ? 'bg-success'
                          : booking.status === 'Confirmed'
                          ? 'bg-primary'
                          : booking.status === 'Cancelled'
                          ? 'bg-danger'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {booking.status}
                    </span>

                  </div>


                  <hr />


                  <p className="mb-2">

                    <strong>
                      Laboratory:
                    </strong>{' '}

                    Lab #{booking.lab_id}

                  </p>


                  <p className="mb-2">

                    <strong>
                      Test:
                    </strong>{' '}

                    Test #{booking.test_id}

                  </p>


                  <p className="mb-2">

                    <strong>
                      📅 Date:
                    </strong>{' '}

                    {booking.booking_date}

                  </p>


                  <p className="mb-3">

                    <strong>
                      🕐 Time:
                    </strong>{' '}

                    {booking.booking_time}

                  </p>


                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() =>
                      navigate(
                        `/booking/${booking.booking_id}`
                      )
                    }
                  >
                    View Booking
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


export default MyBookings