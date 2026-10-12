import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const [role, setRole] = useState(() =>
    localStorage.getItem('role')
  )

  // Update navbar after login or logout
  useEffect(() => {
    const handleAuthChange = () => {
      setRole(localStorage.getItem('role'))
    }

    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('role')
    localStorage.removeItem('lab_id')

    window.dispatchEvent(new Event('auth-change'))

    setRole(null)
    navigate('/login', { replace: true })
  }

  // Navigation link styling
  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? 'nav-link active fw-semibold'
      : 'nav-link'

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid px-4">

        {/* Brand */}
        <NavLink className="navbar-brand fw-bold" to="/">
          Multi-Lab Portal
        </NavLink>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation links */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {/* Home */}
            <li className="nav-item">
              <NavLink to="/" className={getNavLinkClass}>
                Home
              </NavLink>
            </li>

            {/* Public navigation */}
            {!role && (
              <>
                <li className="nav-item">
                  <NavLink to="/" className={getNavLinkClass}>
                    Laboratories
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/" className={getNavLinkClass}>
                    Tests
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={getNavLinkClass}
                  >
                    Login
                  </NavLink>
                </li>

                {/* Register */}
                <li className="nav-item">
                  <NavLink
                    to="/register"
                    className={getNavLinkClass}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}

            {/* Patient navigation */}
            {role === 'Patient' && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/my-bookings"
                    className={getNavLinkClass}
                  >
                    My Bookings
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/my-reports"
                    className={getNavLinkClass}
                  >
                    My Reports
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/my-feedback"
                    className={getNavLinkClass}
                  >
                    My Feedback
                  </NavLink>
                </li>

                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Staff navigation */}
            {role === 'Staff' && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/staff"
                    className={getNavLinkClass}
                  >
                    Dashboard
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/staff/reports"
                    className={getNavLinkClass}
                  >
                    Reports
                  </NavLink>
                </li>

                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Admin navigation */}
            {role === 'Admin' && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/admin"
                    className={getNavLinkClass}
                  >
                    Dashboard
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/admin/staff"
                    className={getNavLinkClass}
                  >
                    Staff
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/admin/tests"
                    className={getNavLinkClass}
                  >
                    Tests
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/admin/bookings"
                    className={getNavLinkClass}
                  >
                    Bookings
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/admin/reports"
                    className={getNavLinkClass}
                  >
                    Reports
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/admin/feedback"
                    className={getNavLinkClass}
                  >
                    Feedback
                  </NavLink>
                </li>

                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
