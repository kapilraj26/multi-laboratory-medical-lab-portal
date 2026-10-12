import { Navigate } from 'react-router-dom'


function ProtectedRoute({ children, allowedRoles }) {

  const token = localStorage.getItem('access_token')

  const role = localStorage.getItem('role')


  // ============================================
  // NOT LOGGED IN
  // ============================================

  if (!token || !role) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // ============================================
  // ROLE NOT ALLOWED
  // ============================================

  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {

    if (role === 'Admin') {

      return (
        <Navigate
          to="/admin"
          replace
        />
      )

    }


    if (role === 'Staff') {

      return (
        <Navigate
          to="/staff"
          replace
        />
      )

    }


    if (role === 'Patient') {

      return (
        <Navigate
          to="/"
          replace
        />
      )

    }


    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // ============================================
  // ACCESS GRANTED
  // ============================================

  return children

}


export default ProtectedRoute
