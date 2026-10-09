import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'


function Feedback() {

  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    const token = localStorage.getItem(
      'access_token'
    )

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
        'Only patients can submit feedback.'
      )

      return
    }


    setLoading(true)


    try {

      await axios.post(

        'http://127.0.0.1:8000/feedback/',

        {
          booking_id: Number(bookingId),
          rating: Number(rating),
          comments: comments
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Feedback submitted successfully!'
      )


      setComments('')


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to submit feedback'
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
            Submit Feedback
          </h2>

          <p className="text-muted text-center">
            Booking #{bookingId}
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

            {/* =========================
                RATING
            ========================= */}

            <div className="mb-4">

              <label className="form-label fw-bold">
                Rating
              </label>

              <select
                className="form-select"
                value={rating}
                onChange={(event) =>
                  setRating(
                    event.target.value
                  )
                }
              >

                <option value="5">
                  ⭐⭐⭐⭐⭐ — Excellent
                </option>

                <option value="4">
                  ⭐⭐⭐⭐ — Very Good
                </option>

                <option value="3">
                  ⭐⭐⭐ — Good
                </option>

                <option value="2">
                  ⭐⭐ — Fair
                </option>

                <option value="1">
                  ⭐ — Poor
                </option>

              </select>

            </div>


            {/* =========================
                COMMENTS
            ========================= */}

            <div className="mb-4">

              <label className="form-label fw-bold">
                Comments
              </label>

              <textarea
                className="form-control"
                rows="5"
                placeholder="Share your experience..."
                value={comments}
                onChange={(event) =>
                  setComments(
                    event.target.value
                  )
                }
              />

            </div>


            {/* =========================
                SUBMIT
            ========================= */}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >

              {loading
                ? 'Submitting...'
                : 'Submit Feedback'}

            </button>

          </form>


          {/* =========================
              BACK
          ========================= */}

          <button
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() =>
              navigate(
                `/booking/${bookingId}`
              )
            }
          >
            ← Back to Booking
          </button>

        </div>

      </div>

    </div>

  )
}


export default Feedback