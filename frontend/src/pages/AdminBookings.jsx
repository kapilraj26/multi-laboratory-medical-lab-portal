import { useEffect, useState } from 'react'
import axios from 'axios'


function AdminBookings() {

  const [bookings, setBookings] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')


  const token = localStorage.getItem('access_token')

  const role = localStorage.getItem('role')


  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  const loadBookings = async () => {

    try {

      setLoading(true)

      setError('')

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
        'Unable to load bookings'
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

    loadBookings()

  }, [])


  // =====================================================
  // UPDATE BOOKING STATUS
  // =====================================================

  const updateStatus = async (bookingId, status) => {

    if (
      !window.confirm(
        `Are you sure you want to change this booking to ${status}?`
      )
    ) {

      return

    }


    setError('')

    setSuccess('')


    try {

      await axios.put(

        `http://127.0.0.1:8000/bookings/${bookingId}/status`,

        {
          status: status
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        `Booking #${bookingId} updated to ${status} successfully`
      )


      await loadBookings()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to update booking status'
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
            Loading bookings...
          </p>

        </div>

      </div>

    )

  }


  // =====================================================
  // COUNTS
  // =====================================================

  const totalBookings = bookings.length

  const pendingBookings = bookings.filter(
    booking => booking.status === 'Pending'
  ).length

  const confirmedBookings = bookings.filter(
    booking => booking.status === 'Confirmed'
  ).length

  const completedBookings = bookings.filter(
    booking => booking.status === 'Completed'
  ).length

  const cancelledBookings = bookings.filter(
    booking => booking.status === 'Cancelled'
  ).length


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
            Booking Management
          </h1>

          <p className="text-muted mb-0">
            Manage patient bookings in your laboratory
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
          SUCCESS
      ================================================= */}

      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="row g-3 mb-4">


        {/* TOTAL */}

        <div className="col-md-4 col-lg">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Total Bookings
              </h6>

              <h2 className="fw-bold">
                {totalBookings}
              </h2>

            </div>

          </div>

        </div>


        {/* PENDING */}

        <div className="col-md-4 col-lg">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Pending
              </h6>

              <h2 className="fw-bold text-warning">
                {pendingBookings}
              </h2>

            </div>

          </div>

        </div>


        {/* CONFIRMED */}

        <div className="col-md-4 col-lg">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Confirmed
              </h6>

              <h2 className="fw-bold text-primary">
                {confirmedBookings}
              </h2>

            </div>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="col-md-4 col-lg">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Completed
              </h6>

              <h2 className="fw-bold text-success">
                {completedBookings}
              </h2>

            </div>

          </div>

        </div>


        {/* CANCELLED */}

        <div className="col-md-4 col-lg">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Cancelled
              </h6>

              <h2 className="fw-bold text-danger">
                {cancelledBookings}
              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          BOOKINGS TABLE
      ================================================= */}

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

                    <tr
                      key={booking.booking_id}
                    >


                      {/* BOOKING ID */}

                      <td className="fw-semibold">

                        #{booking.booking_id}

                      </td>


                      {/* PATIENT */}

                      <td>

                        #{booking.patient_id}

                      </td>


                      {/* TEST */}

                      <td>

                        #{booking.test_id}

                      </td>


                      {/* DATE */}

                      <td>

                        {booking.booking_date}

                      </td>


                      {/* TIME */}

                      <td>

                        {booking.booking_time}

                      </td>


                      {/* STATUS */}

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


                      {/* ACTION */}

                      <td>

                        <div className="d-flex gap-2 flex-wrap">


                          {/* PENDING */}

                          {booking.status === 'Pending' && (

                            <>

                              <button
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


                          {/* CONFIRMED */}

                          {booking.status === 'Confirmed' && (

                            <>

                              <button
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


                          {/* COMPLETED */}

                          {booking.status === 'Completed' && (

                            <span className="text-success fw-semibold">

                              Completed

                            </span>

                          )}


                          {/* CANCELLED */}

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