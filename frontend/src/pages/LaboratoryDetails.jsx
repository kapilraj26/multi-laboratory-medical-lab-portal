import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function LaboratoryDetails() {
  const { labId } = useParams()
  const navigate = useNavigate()

  const [lab, setLab] = useState(null)
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load laboratory and tests
  useEffect(() => {
    let isMounted = true

    const loadLaboratory = async () => {
      setLoading(true)
      setError('')

      try {
        const [labResponse, testsResponse] = await Promise.all([
          api.get(`/labs/${labId}`),
          api.get(`/lab-tests/lab/${labId}`),
        ])

        if (isMounted) {
          setLab(labResponse.data)
          setTests(testsResponse.data)
        }
      } catch (error) {
        console.error('Failed to load laboratory:', error)

        if (isMounted) {
          setError('Unable to load laboratory information')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadLaboratory()

    return () => {
      isMounted = false
    }
  }, [labId])

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading laboratory"
        />

        <p className="mt-3">Loading laboratory...</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  // Laboratory not found
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
      {/* Laboratory Information */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">
          <h1 className="fw-bold">{lab.lab_name}</h1>

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
                <strong>📍 Address:</strong>
                <br />
                {lab.address}
              </p>

              <p>
                <strong>🏙️ City:</strong> {lab.city}
              </p>

              <p>
                <strong>📍 State:</strong> {lab.state}
              </p>

              <p>
                <strong>📮 Pincode:</strong> {lab.pincode}
              </p>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold">Contact</h5>

              <p>
                <strong>📞 Phone:</strong>
                <br />
                {lab.phone}
              </p>

              <p>
                <strong>✉️ Email:</strong>
                <br />
                {lab.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div>
        <h2 className="fw-bold mb-4">
          Available Medical Tests
        </h2>

        {tests.length === 0 ? (
          <div className="alert alert-info">
            No medical tests are currently available at this
            laboratory.
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
                      <strong>💰 Price:</strong> ₹{test.price}
                    </p>

                    <p className="mb-3">
                      <strong>⏱️ Duration:</strong>{' '}
                      {test.duration_minutes} minutes
                    </p>

                    <button
                      type="button"
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
