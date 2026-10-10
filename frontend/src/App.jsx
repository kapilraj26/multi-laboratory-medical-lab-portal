
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import LaboratoryDetails from './pages/LaboratoryDetails'
import TestDetails from './pages/TestDetails'
import Login from './pages/Login'
import Register from './pages/Register'

// Patient pages
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import BookingDetails from './pages/BookingDetails'
import MyReports from './pages/MyReports'
import Feedback from './pages/Feedback'
import MyFeedback from './pages/MyFeedback'

// Staff pages
import StaffDashboard from './pages/StaffDashboard'
import StaffReports from './pages/StaffReports'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import AdminStaff from './pages/AdminStaff'
import AdminTests from './pages/AdminTests'
import AdminBookings from './pages/AdminBookings'
import AdminReports from './pages/AdminReports'
import AdminFeedback from './pages/AdminFeedback'


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Public registration route */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Lab-specific registration route */}
        <Route
          path="/lab/:labId/register"
          element={<Register />}
        />

        <Route
          path="/lab/:labId"
          element={<LaboratoryDetails />}
        />

        <Route
          path="/lab/:labId/test/:testId"
          element={<TestDetails />}
        />


        {/* PATIENT ROUTES */}

        <Route
          path="/lab/:labId/test/:testId/book"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:bookingId"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reports"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:bookingId/feedback"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-feedback"
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <MyFeedback />
            </ProtectedRoute>
          }
        />


        {/* STAFF ROUTES */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/reports"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffReports />
            </ProtectedRoute>
          }
        />


        {/* ADMIN ROUTES */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminTests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />

        {/* Add a fallback later if you need a custom 404 page */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
