import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../hooks/useRole'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading } = useAuth()
  const { hasRole } = useRole()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

