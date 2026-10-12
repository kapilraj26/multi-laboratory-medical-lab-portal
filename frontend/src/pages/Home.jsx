import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Home() {
  const navigate = useNavigate()

  const [labs, setLabs] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load laboratories from the backend
  useEffect(() => {
    let isMounted = true

    const loadLaboratories = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/labs/')

        if (isMounted) {
          setLabs(response.data)
        }
      } catch (error) {
        console.error('Failed to load laboratories:', error)

        if (isMounted) {
          setError('Unable to load laboratories. Please try again.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadLaboratories()

    return () => {
      isMounted = false
    }
  }, [])

  // Get unique cities
  const cities = [
    ...new Set(labs.map((lab) => lab.city).filter(Boolean)),
  ]

  // Filter laboratories by selected city
  const filteredLabs = labs.filter(
    (lab) => selectedCity === '' || lab.city === selectedCity
  )

  // Find laboratories button
  const findLaboratories = () => {
    document.getElementById('laboratories')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold">
          Find a Laboratory Near You
        </h1>

        <p className="lead text-muted mt-3">
          Search laboratories, book medical tests,
          and access your reports securely.
        </p>
      </div>

      {/* Location Section */}
      <div
        className="card shadow-sm p-4 mx-auto"
        style={{ maxWidth: '700px' }}
      >
        <h3 className="fw-bold mb-3">
          Select Your Location
        </h3>

        <p className="text-muted">
          Choose your city to find available laboratories.
        </p>

        <select
          className="form-select form-select-lg"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
          disabled={loading || cities.length === 0}
        >
          <option value="">Select City</option>

          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-primary btn-lg w-100 mt-4"
          onClick={findLaboratories}
          disabled={loading || labs.length === 0}
        >
          Find Laboratories
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading laboratories"
          />

          <p className="mt-2">Loading laboratories...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger mt-5" role="alert">
          {error}

          <button
            type="button"
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Laboratories */}
      {!loading && !error && (
        <div id="laboratories" className="mt-5">
          <h2 className="text-center fw-bold mb-4">
            Available Laboratories
          </h2>

          <div className="row g-4">
            {filteredLabs.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-warning text-center">
                  {labs.length === 0
                    ? 'No laboratories are currently available.'
                    : 'No laboratories found for this location.'}
                </div>
              </div>
            ) : (
              filteredLabs.map((lab) => (
                <div className="col-md-6" key={lab.lab_id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h4 className="fw-bold">
                        {lab.lab_name}
                      </h4>

                      <p className="text-muted">
                        {lab.description ||
                          'Medical diagnostic laboratory'}
                      </p>

                      <p className="mb-1">
                        <strong>📍 Location:</strong>{' '}
                        {lab.city}, {lab.state}
                      </p>

                      <p className="mb-1">
                        <strong>📞 Phone:</strong> {lab.phone}
                      </p>

                      <p className="mb-3">
                        <strong>✉️ Email:</strong> {lab.email}
                      </p>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/lab/${lab.lab_id}`)
                        }
                      >
                        View Laboratory
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="row mt-5 g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm p-4 text-center">
            <h4>🏥</h4>
            <h5 className="fw-bold mt-3">
              Multiple Laboratories
            </h5>
            <p className="text-muted">
              Choose from different laboratories based on your location.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm p-4 text-center">
            <h4>📅</h4>
            <h5 className="fw-bold mt-3">Easy Booking</h5>
            <p className="text-muted">
              Book your required medical tests online.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm p-4 text-center">
            <h4>📄</h4>
            <h5 className="fw-bold mt-3">Secure Reports</h5>
            <p className="text-muted">
              Access your medical reports securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
