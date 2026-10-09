import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function Home() {

  const navigate = useNavigate()

  const [labs, setLabs] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================
  // LOAD LABORATORIES
  // =========================

  useEffect(() => {

    axios
      .get('http://127.0.0.1:8000/labs/')
      .then((response) => {

        setLabs(response.data)
        setLoading(false)

      })
      .catch((error) => {

        console.error(error)

        setError(
          'Unable to load laboratories'
        )

        setLoading(false)

      })

  }, [])


  // =========================
  // GET UNIQUE CITIES
  // =========================

  const cities = [
    ...new Set(
      labs.map((lab) => lab.city)
    )
  ]


  // =========================
  // FILTER LABORATORIES
  // =========================

  const filteredLabs = labs.filter(
    (lab) =>
      selectedCity === '' ||
      lab.city === selectedCity
  )


  // =========================
  // FIND LABORATORIES BUTTON
  // =========================

  const findLaboratories = () => {

    document
      .getElementById('laboratories')
      ?.scrollIntoView({
        behavior: 'smooth'
      })

  }


  return (

    <div className="container py-5">

      {/* =========================
          HERO SECTION
      ========================= */}

      <div className="text-center py-5">

        <h1 className="display-4 fw-bold">
          Find a Laboratory Near You
        </h1>

        <p className="lead text-muted mt-3">
          Search laboratories, book medical tests,
          and access your reports securely.
        </p>

      </div>


      {/* =========================
          LOCATION SECTION
      ========================= */}

      <div
        className="card shadow-sm p-4 mx-auto"
        style={{
          maxWidth: '700px'
        }}
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
          onChange={(event) =>
            setSelectedCity(
              event.target.value
            )
          }
        >

          <option value="">
            Select City
          </option>


          {cities.map((city) => (

            <option
              key={city}
              value={city}
            >
              {city}
            </option>

          ))}

        </select>


        <button
          className="btn btn-primary btn-lg w-100 mt-4"
          onClick={findLaboratories}
        >
          Find Laboratories
        </button>

      </div>


      {/* =========================
          LOADING
      ========================= */}

      {loading && (

        <div className="text-center mt-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-2">
            Loading laboratories...
          </p>

        </div>

      )}


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="alert alert-danger mt-5">
          {error}
        </div>

      )}


      {/* =========================
          LABORATORIES
      ========================= */}

      {!loading && !error && (

        <div
          id="laboratories"
          className="mt-5"
        >

          <h2 className="text-center fw-bold mb-4">
            Available Laboratories
          </h2>


          <div className="row g-4">

            {filteredLabs.length === 0 ? (

              <div className="col-12">

                <div className="alert alert-warning text-center">
                  No laboratories found for this location.
                </div>

              </div>

            ) : (

              filteredLabs.map((lab) => (

                <div
                  className="col-md-6"
                  key={lab.lab_id}
                >

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

                        <strong>
                          📍 Location:
                        </strong>{' '}

                        {lab.city}, {lab.state}

                      </p>


                      <p className="mb-1">

                        <strong>
                          📞 Phone:
                        </strong>{' '}

                        {lab.phone}

                      </p>


                      <p className="mb-3">

                        <strong>
                          ✉️ Email:
                        </strong>{' '}

                        {lab.email}

                      </p>


                      {/* VIEW LABORATORY */}

                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(
                            `/lab/${lab.lab_id}`
                          )
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


      {/* =========================
          FEATURES
      ========================= */}

      <div className="row mt-5 g-4">


        {/* Multiple Laboratories */}

        <div className="col-md-4">

          <div className="card h-100 shadow-sm p-4 text-center">

            <h4>🏥</h4>

            <h5 className="fw-bold mt-3">
              Multiple Laboratories
            </h5>

            <p className="text-muted">
              Choose from different laboratories
              based on your location.
            </p>

          </div>

        </div>


        {/* Easy Booking */}

        <div className="col-md-4">

          <div className="card h-100 shadow-sm p-4 text-center">

            <h4>📅</h4>

            <h5 className="fw-bold mt-3">
              Easy Booking
            </h5>

            <p className="text-muted">
              Book your required medical tests
              online.
            </p>

          </div>

        </div>


        {/* Secure Reports */}

        <div className="col-md-4">

          <div className="card h-100 shadow-sm p-4 text-center">

            <h4>📄</h4>

            <h5 className="fw-bold mt-3">
              Secure Reports
            </h5>

            <p className="text-muted">
              Access your medical reports
              securely.
            </p>

          </div>

        </div>

      </div>

    </div>

  )

}


export default Home