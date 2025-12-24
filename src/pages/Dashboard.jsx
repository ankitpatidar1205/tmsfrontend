// This file redirects to role-specific dashboards
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'SuperAdmin' || user.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (user.role === 'Finance') {
    return <Navigate to="/finance/dashboard" replace />
  }

  if (user.role === 'Agent') {
    return <Navigate to="/agent/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export default Dashboard
