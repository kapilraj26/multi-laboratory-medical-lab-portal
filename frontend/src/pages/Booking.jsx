import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'


function Booking() {

  const { labId, testId } = useParams()
  const navigate = useNavigate()

  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')


    // =========================
    // CHECK LOGIN
    // =========================

    if (!token) {

      navigate('/login')

      return
    }


    // =========================
    // CHECK PATIENT ROLE
    // =========================

    if (role !== 'Patient') {

      setError(
        'Only patients can book medical tests.'
      )

      return
    }


    setLoading(true)


    try {

      await axios.post(

        'http://127.0.0.1:8000/bookings/',

        {
          lab_id: Number(labId),
          test_id: Number(testId),
          booking_date: bookingDate,
          booking_time: bookingTime
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Booking created successfully!'
      )


      setBookingDate('')
      setBookingTime('')


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to create booking'
      )

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="container py-5">

      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '650px' }}
      >

        <div className="card-body p-4">

          <h2 className="fw-bold text-center">
            Book Medical Test
          </h2>

          <p className="text-muted text-center">
            Select your preferred date and time
          </p>


          {/* ERROR */}

          {error && (

            <div className="alert alert-danger">
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="alert alert-success">
              {success}
            </div>

          )}


          <form onSubmit={handleSubmit}>

            {/* DATE */}

            <div className="mb-4">

              <label className="form-label fw-bold">
                Booking Date
              </label>

              <input
                type="date"
                className="form-control"
                value={bookingDate}
                onChange={(event) =>
                  setBookingDate(
                    event.target.value
                  )
                }
                required
              />

            </div>


            {/* TIME */}

            <div className="mb-4">

              <label className="form-label fw-bold">
                Booking Time
              </label>

              <input
                type="time"
                className="form-control"
                value={bookingTime}
                onChange={(event) =>
                  setBookingTime(
                    event.target.value
                  )
                }
                required
              />

            </div>


            {/* BOOK */}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >

              {loading
                ? 'Creating Booking...'
                : 'Confirm Booking'}

            </button>

          </form>


          {/* BACK */}

          <button
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() =>
              navigate(
                `/lab/${labId}/test/${testId}`
              )
            }
          >
            ← Back to Test
          </button>

        </div>

      </div>

    </div>

  )
}


export default Booking