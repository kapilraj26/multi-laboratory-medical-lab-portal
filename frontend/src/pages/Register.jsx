
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function Register() {
  const { labId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/users/patient', {
        lab_id: Number(labId),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      })

      setSuccess(
        'Registration successful! Redirecting to login...'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      console.error('Registration error:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '600px' }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold text-center">
            Patient Registration
          </h2>

          <p className="text-muted text-center">
            Register for this laboratory
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-bold">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                className="form-control"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="form-label fw-bold"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">
              Already have an account?
            </span>

            <button
              type="button"
              className="btn btn-link"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => navigate(`/lab/${labId}`)}
          >
            ← Back to Laboratory
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
