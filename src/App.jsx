import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Login from './pages/Login'

// Layouts
import AdminLayout from './components/layouts/AdminLayout'
import FinanceLayout from './components/layouts/FinanceLayout'
import AgentLayout from './components/layouts/AgentLayout'

// Admin Pages
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AdminTrips from './pages/admin/AdminTrips'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminReports from './pages/admin/AdminReports'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'

// Finance Pages
import FinanceDashboard from './pages/dashboards/FinanceDashboard'
import FinanceTrips from './pages/finance/FinanceTrips'
import Ledger from './pages/Ledger'
import FinanceReports from './pages/finance/FinanceReports'
import AgentProfile from './pages/AgentProfile'

// Agent Pages
import AgentDashboard from './pages/dashboards/AgentDashboard'
import AgentTrips from './pages/agent/AgentTrips'
import AgentDisputes from './pages/agent/AgentDisputes'

// Shared Pages
import TripView from './pages/TripView'
import ProfileSettings from './pages/ProfileSettings'

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// Role-based redirect component
const RoleRedirect = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'Admin') {
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

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminTrips />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips/:id"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <TripView />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminDisputes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ledger"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <Ledger />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AgentProfile />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminAuditLogs />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile-settings"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout>
              <ProfileSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Finance Routes */}
      <Route
        path="/finance/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <FinanceDashboard />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/trips"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <FinanceTrips />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/trips/:id"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <TripView />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/ledger"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <Ledger />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/profile"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <AgentProfile />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/profile-settings"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <ProfileSettings />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/reports"
        element={
          <ProtectedRoute allowedRoles={['Finance']}>
            <FinanceLayout>
              <FinanceReports />
            </FinanceLayout>
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <AgentDashboard />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/trips"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <AgentTrips />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/trips/:id"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <TripView />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/ledger"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <Ledger />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/disputes"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <AgentDisputes />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <AgentProfile />
            </AgentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile-settings"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentLayout>
              <ProfileSettings />
            </AgentLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
