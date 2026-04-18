import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, AppContext } from './context/AppContext'
import { useContext } from 'react'
import Layout          from './components/layout/Layout'
import ProtectedRoute  from './components/layout/ProtectedRoute'
import Dashboard       from './pages/Dashboard'
import Profile         from './pages/Profile'
import HealthRecords   from './pages/HealthRecords'
import Analytics       from './pages/Analytics'
import Documents       from './pages/Documents'
import HealthAssistent from './pages/HealthAssistent'
import Emergency       from './pages/Emergency'
import Hospitals       from './pages/Hospitals'
import Pharmacy        from './pages/Pharmacy'
import PatientLogin    from './pages/PatientLogin'
import PatientRegister from './pages/PatientRegister'
import { Toaster }     from 'react-hot-toast'

// Redirect to /dashboard if already logged in
function GuestRoute({ children }) {
  const { token } = useContext(AppContext)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          {/* ── Public routes (no sidebar, no auth needed) ── */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <PatientLogin />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <PatientRegister />
              </GuestRoute>
            }
          />

          {/* ── Protected routes (wrapped in Layout with sidebar) ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<Dashboard />}       />
            <Route path="profile"          element={<Profile />}         />
            <Route path="records"          element={<HealthRecords />}   />
            <Route path="analytics"        element={<Analytics />}       />
            <Route path="documents"        element={<Documents />}       />
            <Route path="health-assistent" element={<HealthAssistent />} />
            <Route path="emergency"        element={<Emergency />}       />
            <Route path="hospitals"        element={<Hospitals />}       />
            <Route path="pharmacy"         element={<Pharmacy />}        />
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}