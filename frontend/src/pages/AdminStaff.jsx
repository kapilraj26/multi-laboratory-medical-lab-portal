import { useEffect, useState } from 'react'
import axios from 'axios'


function AdminStaff() {

  const [staff, setStaff] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)


  const [name, setName] = useState('')

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [phone, setPhone] = useState('')


  const token = localStorage.getItem(
    'access_token'
  )

  const role = localStorage.getItem(
    'role'
  )


  // =====================================================
  // LOAD STAFF
  // =====================================================

  const loadStaff = async () => {

    try {

      setLoading(true)

      setError('')


      const response = await axios.get(
        'http://127.0.0.1:8000/users/staff',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )


      setStaff(response.data)

    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to load staff'
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

    loadStaff()

  }, [])


  // =====================================================
  // ADD STAFF
  // =====================================================

  const handleAddStaff = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')


    try {

      await axios.post(

        'http://127.0.0.1:8000/users/staff',

        {
          name: name,
          email: email,
          password: password,
          phone: phone
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Staff created successfully'
      )


      // Clear form

      setName('')
      setEmail('')
      setPassword('')
      setPhone('')

      setShowForm(false)


      // Reload staff

      loadStaff()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to create staff'
      )

    }

  }


  // =====================================================
  // DEACTIVATE STAFF
  // =====================================================

  const handleDeactivate = async (staffId) => {

    if (
      !window.confirm(
        'Are you sure you want to deactivate this staff member?'
      )
    ) {

      return

    }


    setError('')
    setSuccess('')


    try {

      await axios.put(

        `http://127.0.0.1:8000/users/staff/${staffId}/deactivate`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Staff deactivated successfully'
      )


      loadStaff()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to deactivate staff'
      )

    }

  }


  // =====================================================
  // REACTIVATE STAFF
  // =====================================================

  const handleReactivate = async (staffId) => {

    if (
      !window.confirm(
        'Are you sure you want to reactivate this staff member?'
      )
    ) {

      return

    }


    setError('')
    setSuccess('')


    try {

      await axios.put(

        `http://127.0.0.1:8000/users/staff/${staffId}/reactivate`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Staff reactivated successfully'
      )


      loadStaff()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to reactivate staff'
      )

    }

  }


  // =====================================================
  // FILTER STAFF
  // =====================================================

  const activeStaff = staff.filter(
    (member) => member.is_active === true
  )


  const inactiveStaff = staff.filter(
    (member) => member.is_active === false
  )


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
            Loading staff...
          </p>

        </div>

      </div>

    )

  }


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
            Staff Management
          </h1>

          <p className="text-muted mb-0">
            Manage staff members of your laboratory
          </p>

        </div>


        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              window.location.href = '/admin'
            }
          >
            ← Admin Dashboard
          </button>


          <button
            className="btn btn-primary"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            + Add Staff
          </button>

        </div>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {success && (

        <div className="alert alert-success">
          {success}
        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* =================================================
          ADD STAFF FORM
      ================================================= */}

      {showForm && (

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <h4 className="fw-bold mb-4">
              Add New Staff
            </h4>


            <form onSubmit={handleAddStaff}>

              <div className="row">


                {/* NAME */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter staff name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter staff email"
                    required
                  />

                </div>


                {/* PASSWORD */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter temporary password"
                    required
                  />

                </div>


                {/* PHONE */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Phone
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="Enter phone number"
                  />

                </div>

              </div>


              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Staff
                </button>


                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          ACTIVE STAFF
      ================================================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h3 className="fw-bold mb-0">
              Active Staff
            </h3>

            <span className="badge bg-primary">
              {activeStaff.length} Staff
            </span>

          </div>


          {activeStaff.length === 0 ? (

            <div className="alert alert-info mb-0">
              No active staff members.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {activeStaff.map((member) => (

                    <tr key={member.user_id}>

                      <td>
                        #{member.user_id}
                      </td>

                      <td className="fw-semibold">
                        {member.name}
                      </td>

                      <td>
                        {member.email}
                      </td>

                      <td>
                        {member.phone || '-'}
                      </td>

                      <td>

                        <span className="badge bg-secondary">
                          {member.role}
                        </span>

                      </td>

                      <td>

                        <span className="badge bg-success">
                          Active
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDeactivate(
                              member.user_id
                            )
                          }
                        >
                          Deactivate
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          INACTIVE STAFF
      ================================================= */}

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h3 className="fw-bold mb-0">
              Inactive Staff
            </h3>

            <span className="badge bg-secondary">
              {inactiveStaff.length} Staff
            </span>

          </div>


          {inactiveStaff.length === 0 ? (

            <div className="alert alert-info mb-0">
              No inactive staff members.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {inactiveStaff.map((member) => (

                    <tr key={member.user_id}>

                      <td>
                        #{member.user_id}
                      </td>

                      <td className="fw-semibold">
                        {member.name}
                      </td>

                      <td>
                        {member.email}
                      </td>

                      <td>
                        {member.phone || '-'}
                      </td>

                      <td>

                        <span className="badge bg-secondary">
                          {member.role}
                        </span>

                      </td>

                      <td>

                        <span className="badge bg-danger">
                          Inactive
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() =>
                            handleReactivate(
                              member.user_id
                            )
                          }
                        >
                          Reactivate
                        </button>

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


export default AdminStaff