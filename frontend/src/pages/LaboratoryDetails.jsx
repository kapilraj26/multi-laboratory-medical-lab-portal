import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'


function LaboratoryDetails() {

  const { labId } = useParams()
  const navigate = useNavigate()

  const [lab, setLab] = useState(null)
  const [tests, setTests] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================
  // LOAD LAB + TESTS
  // =========================

  useEffect(() => {

    setLoading(true)
    setError('')

    Promise.all([
      axios.get(
        `http://127.0.0.1:8000/labs/${labId}`
      ),

      axios.get(
        `http://127.0.0.1:8000/lab-tests/lab/${labId}`
      )
    ])
      .then(([labResponse, testsResponse]) => {

        setLab(labResponse.data)
        setTests(testsResponse.data)

        setLoading(false)

      })
      .catch((error) => {

        console.error(error)

        setError(
          'Unable to load laboratory information'
        )

        setLoading(false)

      })

  }, [labId])


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
          Loading laboratory...
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


  // =========================
  // LAB NOT FOUND
  // =========================

  if (!lab) {

    return (
      <div className="container py-5">

        <div className="alert alert-warning">
          Laboratory not found
        </div>

      </div>
    )
  }


  return (

    <div className="container py-5">

      {/* =========================
          LABORATORY INFORMATION
      ========================= */}

      <div className="card shadow-sm mb-5">

        <div className="card-body p-4">

          <h1 className="fw-bold">
            {lab.lab_name}
          </h1>

          <p className="text-muted">
            {lab.description ||
              'Medical diagnostic laboratory'}
          </p>

          <hr />

          <div className="row">

            <div className="col-md-6">

              <h5 className="fw-bold">
                Laboratory Information
              </h5>

              <p>
                <strong>📍 Address:</strong><br />
                {lab.address}
              </p>

              <p>
                <strong>🏙️ City:</strong>{' '}
                {lab.city}
              </p>

              <p>
                <strong>📍 State:</strong>{' '}
                {lab.state}
              </p>

              <p>
                <strong>📮 Pincode:</strong>{' '}
                {lab.pincode}
              </p>

            </div>


            <div className="col-md-6">

              <h5 className="fw-bold">
                Contact
              </h5>

              <p>
                <strong>📞 Phone:</strong><br />
                {lab.phone}
              </p>

              <p>
                <strong>✉️ Email:</strong><br />
                {lab.email}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          AVAILABLE TESTS
      ========================= */}

      <div>

        <h2 className="fw-bold mb-4">
          Available Medical Tests
        </h2>


        {tests.length === 0 ? (

          <div className="alert alert-info">
            No medical tests are currently available
            at this laboratory.
          </div>

        ) : (

          <div className="row g-4">

            {tests.map((test) => (

              <div
                className="col-md-6 col-lg-4"
                key={`${test.lab_id}-${test.test_id}`}
              >

                <div className="card h-100 shadow-sm">

                  <div className="card-body">

                    <h5 className="fw-bold">
                      {test.test_name}
                    </h5>

                    <span className="badge bg-secondary mb-3">
                      {test.category}
                    </span>

                    <p className="text-muted">
                      {test.description ||
                        'Medical laboratory test'}
                    </p>

                    <p className="mb-2">

                      <strong>
                        💰 Price:
                      </strong>{' '}

                      ₹{test.price}

                    </p>

                    <p className="mb-3">

                      <strong>
                        ⏱️ Duration:
                      </strong>{' '}

                      {test.duration_minutes} minutes

                    </p>

                    <button
                      className="btn btn-primary w-100"
                      onClick={() =>
                        navigate(
                          `/lab/${labId}/test/${test.test_id}`
                        )
                      }
                    >
                      View Test

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  )
}


export default LaboratoryDetails