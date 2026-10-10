
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      })

      const data = response.data

      if (!data.access_token || !data.role) {
        setError('Invalid login response from server')
        return
      }

      const supportedRoles = ['Patient', 'Staff', 'Admin']

      if (!supportedRoles.includes(data.role)) {
        setError('Your account role is not supported')
        return
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_id', data.user_id ?? '')
      localStorage.setItem('role', data.role)
      localStorage.setItem('lab_id', data.lab_id ?? '')

      window.dispatchEvent(new Event('auth-change'))

      if (data.role === 'Patient') {
        navigate('/', { replace: true })
      } else if (data.role === 'Staff') {
        navigate('/staff', { replace: true })
      } else if (data.role === 'Admin') {
        navigate('/admin', { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error)

      if (error.response) {
        const detail = error.response.data?.detail

        setError(
          typeof detail === 'string'
            ? detail
            : 'Invalid email or password'
        )
      } else {
        setError(
          'Unable to connect to the server. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '500px' }}
      >
        <div className="card-body p-4">
          <h2 className="text-center fw-bold mb-4">
            Login
          </h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
