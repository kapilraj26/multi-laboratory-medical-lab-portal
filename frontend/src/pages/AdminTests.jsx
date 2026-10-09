import { useEffect, useState } from 'react'
import axios from 'axios'


function AdminTests() {

  const [tests, setTests] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)

  const [editingTest, setEditingTest] = useState(null)


  // =====================================================
  // FORM STATES
  // =====================================================

  const [testName, setTestName] = useState('')

  const [description, setDescription] = useState('')

  const [category, setCategory] = useState('')

  const [price, setPrice] = useState('')

  const [duration, setDuration] = useState('')


  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const token = localStorage.getItem(
    'access_token'
  )

  const role = localStorage.getItem(
    'role'
  )


  // =====================================================
  // LOAD ALL TESTS
  // ADMIN ONLY
  // ACTIVE + INACTIVE
  // =====================================================

  const loadTests = async () => {

    try {

      setLoading(true)

      setError('')


      const response = await axios.get(

        'http://127.0.0.1:8000/lab-tests/admin/all',

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setTests(response.data)

    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to load medical tests'
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


    loadTests()

  }, [])


  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {

    setTestName('')

    setDescription('')

    setCategory('')

    setPrice('')

    setDuration('')

    setEditingTest(null)

  }


  // =====================================================
  // EDIT TEST
  // =====================================================

  const handleEdit = (test) => {

    setEditingTest(test)

    setTestName(
      test.test_name
    )

    setDescription(
      test.description || ''
    )

    setCategory(
      test.category || ''
    )

    setPrice(
      test.price
    )

    setDuration(
      test.duration_minutes
    )

    setShowForm(true)

    setSuccess('')

    setError('')

  }


  // =====================================================
  // ADD / UPDATE TEST
  // =====================================================

  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')

    setSuccess('')


    try {

      const testData = {

        test_name: testName,

        description: description,

        category: category,

        price: Number(price),

        duration_minutes: Number(duration)

      }


      // =================================================
      // UPDATE TEST
      // =================================================

      if (editingTest) {

        await axios.put(

          `http://127.0.0.1:8000/lab-tests/${editingTest.test_id}`,

          testData,

          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }

        )


        setSuccess(
          'Medical test updated successfully'
        )

      }


      // =================================================
      // CREATE TEST
      // =================================================

      else {

        await axios.post(

          'http://127.0.0.1:8000/lab-tests/',

          testData,

          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }

        )


        setSuccess(
          'Medical test created successfully'
        )

      }


      clearForm()

      setShowForm(false)

      await loadTests()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to save medical test'
      )

    }

  }


  // =====================================================
  // DEACTIVATE TEST
  // =====================================================

  const handleDeactivate = async (testId) => {

    if (
      !window.confirm(
        'Are you sure you want to deactivate this medical test?'
      )
    ) {

      return

    }


    setError('')

    setSuccess('')


    try {

      await axios.put(

        `http://127.0.0.1:8000/lab-tests/${testId}/deactivate`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Medical test deactivated successfully'
      )


      await loadTests()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to deactivate medical test'
      )

    }

  }


  // =====================================================
  // REACTIVATE TEST
  // =====================================================

  const handleReactivate = async (testId) => {

    if (
      !window.confirm(
        'Are you sure you want to reactivate this medical test?'
      )
    ) {

      return

    }


    setError('')

    setSuccess('')


    try {

      await axios.put(

        `http://127.0.0.1:8000/lab-tests/${testId}/reactivate`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )


      setSuccess(
        'Medical test reactivated successfully'
      )


      await loadTests()


    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Unable to reactivate medical test'
      )

    }

  }


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
            Loading medical tests...
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
            Medical Test Management
          </h1>

          <p className="text-muted mb-0">
            Manage medical tests of your laboratory
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
            onClick={() => {

              clearForm()

              setShowForm(
                !showForm
              )

              setError('')

              setSuccess('')

            }}
          >
            + Add Test
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
          ADD / EDIT FORM
      ================================================= */}

      {showForm && (

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <h4 className="fw-bold mb-4">

              {editingTest
                ? 'Edit Medical Test'
                : 'Add New Medical Test'}

            </h4>


            <form onSubmit={handleSubmit}>

              <div className="row">


                {/* TEST NAME */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">

                    Test Name

                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={testName}
                    onChange={(event) =>
                      setTestName(
                        event.target.value
                      )
                    }
                    placeholder="Enter test name"
                    required
                  />

                </div>


                {/* CATEGORY */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">

                    Category

                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    placeholder="Example: Blood Test"
                    required
                  />

                </div>


                {/* PRICE */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">

                    Price

                  </label>

                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(event) =>
                      setPrice(
                        event.target.value
                      )
                    }
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>


                {/* DURATION */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">

                    Duration (Minutes)

                  </label>

                  <input
                    type="number"
                    className="form-control"
                    value={duration}
                    onChange={(event) =>
                      setDuration(
                        event.target.value
                      )
                    }
                    placeholder="Example: 30"
                    min="1"
                    required
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="col-12 mb-3">

                  <label className="form-label fw-semibold">

                    Description

                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Enter test description"
                  />

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >

                  {editingTest
                    ? 'Update Test'
                    : 'Add Test'}

                </button>


                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {

                    clearForm()

                    setShowForm(false)

                  }}
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          TEST LIST
      ================================================= */}

      <div className="card shadow-sm">

        <div className="card-body">


          {/* TEST LIST HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h3 className="fw-bold mb-0">

              Laboratory Medical Tests

            </h3>


            <span className="badge bg-primary">

              {tests.length} Tests

            </span>

          </div>


          {/* NO TESTS */}

          {tests.length === 0 ? (

            <div className="alert alert-info mb-0">

              No medical tests available.

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Test Name</th>

                    <th>Category</th>

                    <th>Price</th>

                    <th>Duration</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {tests.map((test) => (

                    <tr
                      key={test.test_id}
                    >

                      {/* ID */}

                      <td>
                        #{test.test_id}
                      </td>


                      {/* NAME */}

                      <td className="fw-semibold">

                        {test.test_name}

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {test.category || '-'}

                      </td>


                      {/* PRICE */}

                      <td>

                        ₹{test.price}

                      </td>


                      {/* DURATION */}

                      <td>

                        {test.duration_minutes} min

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            test.is_active
                              ? 'badge bg-success'
                              : 'badge bg-danger'
                          }
                        >

                          {test.is_active
                            ? 'Active'
                            : 'Inactive'}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="d-flex gap-2">


                          {/* EDIT */}

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(test)
                            }
                          >

                            Edit

                          </button>


                          {/* DEACTIVATE / REACTIVATE */}

                          {test.is_active ? (

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeactivate(
                                  test.test_id
                                )
                              }
                            >

                              Deactivate

                            </button>

                          ) : (

                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleReactivate(
                                  test.test_id
                                )
                              }
                            >

                              Reactivate

                            </button>

                          )}

                        </div>

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


export default AdminTests