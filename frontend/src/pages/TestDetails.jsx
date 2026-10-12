import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function TestDetails() {
  const { labId, testId } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load test details
  useEffect(() => {
    let isMounted = true

    const loadTest = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(
          `/lab-tests/lab/${labId}`
        )

        const selectedTest = response.data.find(
          (item) => Number(item.test_id) === Number(testId)
        )

        if (isMounted) {
          if (!selectedTest) {
            setError('Test not found')
          } else {
            setTest(selectedTest)
          }
        }
      } catch (error) {
        console.error('Failed to load test:', error)

        if (isMounted) {
          setError('Unable to load test details')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTest()

    return () => {
      isMounted = false
    }
  }, [labId, testId])

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading test details"
        />

        <p className="mt-3">Loading test details...</p>
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
          className="btn btn-secondary"
          onClick={() => navigate(`/lab/${labId}`)}
        >
          ← Back to Laboratory
        </button>
      </div>
    )
  }

  // Test not found
  if (!test) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Test not found
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/lab/${labId}`)}
        >
          ← Back to Laboratory
        </button>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '800px' }}
      >
        <div className="card-body p-4">
          {/* Category */}
          <span className="badge bg-secondary mb-3">
            {test.category}
          </span>

          {/* Test Name */}
          <h1 className="fw-bold">{test.test_name}</h1>

          {/* Description */}
          <p className="text-muted mt-3">
            {test.description || 'Medical laboratory test'}
          </p>

          <hr />

          <div className="row mt-4">
            {/* Test Information */}
            <div className="col-md-6">
              <h5 className="fw-bold">Test Information</h5>

              <p>
                <strong>Test ID:</strong> {test.test_id}
              </p>

              <p>
                <strong>Category:</strong> {test.category}
              </p>

              <p>
                <strong>Duration:</strong>{' '}
                {test.duration_minutes} minutes
              </p>
            </div>

            {/* Price */}
            <div className="col-md-6">
              <h5 className="fw-bold">Price</h5>

              <h2 className="text-primary">
                ₹{test.price}
              </h2>

              <p className="text-muted">Test price</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/lab/${labId}`)}
            >
              ← Back to Laboratory
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(`/lab/${labId}/test/${testId}/book`)
              }
            >
              Book This Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestDetails
