// src/components/layout/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { token } = useApp()
  const location  = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}