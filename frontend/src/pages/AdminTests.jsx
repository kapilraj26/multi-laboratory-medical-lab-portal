
import { useEffect, useState } from 'react'
import api from '../api'

function AdminTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)

  // Form states
  const [testName, setTestName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')

  // Authentication
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')

  // Load all tests
  const loadTests = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/lab-tests/admin/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setTests(response.data)
    } catch (error) {
      console.error('Unable to load medical tests:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to load medical tests'
      )
    } finally {
      setLoading(false)
    }
  }

  // Page load
  useEffect(() => {
    if (!token || role !== 'Admin') {
      window.location.href = '/login'
      return
    }

    loadTests()
  }, [])

  // Clear form
  const clearForm = () => {
    setTestName('')
    setDescription('')
    setCategory('')
    setPrice('')
    setDuration('')
    setEditingTest(null)
  }

  // Edit test
  const handleEdit = (test) => {
    setEditingTest(test)
    setTestName(test.test_name)
    setDescription(test.description || '')
    setCategory(test.category || '')
    setPrice(String(test.price))
    setDuration(String(test.duration_minutes))
    setShowForm(true)
    setSuccess('')
    setError('')
  }

  // Add or update test
  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const testData = {
      test_name: testName.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      duration_minutes: Number(duration),
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      if (editingTest) {
        await api.put(
          `/lab-tests/${editingTest.test_id}`,
          testData,
          { headers }
        )

        setSuccess('Medical test updated successfully')
      } else {
        await api.post('/lab-tests/', testData, { headers })

        setSuccess('Medical test created successfully')
      }

      clearForm()
      setShowForm(false)
      await loadTests()
    } catch (error) {
      console.error('Unable to save medical test:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save medical test'
      )
    }
  }

  // Deactivate test
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
      await api.put(
        `/lab-tests/${testId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccess('Medical test deactivated successfully')
      await loadTests()
    } catch (error) {
      console.error('Unable to deactivate medical test:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to deactivate medical test'
      )
    }
  }

  // Reactivate test
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
      await api.put(
        `/lab-tests/${testId}/reactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSuccess('Medical test reactivated successfully')
      await loadTests()
    } catch (error) {
      console.error('Unable to reactivate medical test:', error)

      const detail = error.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to reactivate medical test'
      )
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          />
          <p className="mt-3">Loading medical tests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Medical Test Management</h1>
          <p className="text-muted mb-0">
            Manage medical tests of your laboratory
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              window.location.href = '/admin'
            }}
          >
            ← Admin Dashboard
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!showForm) {
                clearForm()
              }

              setShowForm(!showForm)
              setError('')
              setSuccess('')
            }}
          >
            + Add Test
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
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
                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="testName"
                    className="form-label fw-semibold"
                  >
                    Test Name
                  </label>

                  <input
                    id="testName"
                    type="text"
                    className="form-control"
                    value={testName}
                    onChange={(event) =>
                      setTestName(event.target.value)
                    }
                    placeholder="Enter test name"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="testCategory"
                    className="form-label fw-semibold"
                  >
                    Category
                  </label>

                  <input
                    id="testCategory"
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    placeholder="Example: Blood Test"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="testPrice"
                    className="form-label fw-semibold"
                  >
                    Price
                  </label>

                  <input
                    id="testPrice"
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="testDuration"
                    className="form-label fw-semibold"
                  >
                    Duration (Minutes)
                  </label>

                  <input
                    id="testDuration"
                    type="number"
                    className="form-control"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    placeholder="Example: 30"
                    min="1"
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <label
                    htmlFor="testDescription"
                    className="form-label fw-semibold"
                  >
                    Description
                  </label>

                  <textarea
                    id="testDescription"
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Enter test description"
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTest ? 'Update Test' : 'Add Test'}
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

      {/* Test List */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">
              Laboratory Medical Tests
            </h3>

            <span className="badge bg-primary">
              {tests.length} Tests
            </span>
          </div>

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
                    <tr key={test.test_id}>
                      <td>#{test.test_id}</td>

                      <td className="fw-semibold">
                        {test.test_name}
                      </td>

                      <td>{test.category || '-'}</td>

                      <td>
                        ₹{Number(test.price).toFixed(2)}
                      </td>

                      <td>{test.duration_minutes} min</td>

                      <td>
                        <span
                          className={
                            test.is_active
                              ? 'badge bg-success'
                              : 'badge bg-danger'
                          }
                        >
                          {test.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(test)}
                          >
                            Edit
                          </button>

                          {test.is_active ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeactivate(test.test_id)
                              }
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleReactivate(test.test_id)
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
