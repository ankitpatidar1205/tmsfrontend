import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiDollarSign, FiFileText } from 'react-icons/fi'

const FinanceLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        // Ensure user is Finance role
        if (result.user.role === 'Finance') {
          toast.success('Login successful! Redirecting to Finance Dashboard...', {
            position: 'top-right',
            autoClose: 2000,
          })
          navigate('/dashboard', { replace: true })
        } else {
          toast.error('Invalid credentials for Finance login', {
            position: 'top-right',
            autoClose: 3000,
          })
          setLoading(false)
        }
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.', {
        position: 'top-right',
        autoClose: 3000,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full">
        <div className="card-3d bg-white p-8 rounded-2xl shadow-3d">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-3d">
              <FiDollarSign className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Finance Login</h1>
            <p className="text-text-muted">Access financial records, ledger, and reports</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="finance@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-primary w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing in...' : 'Sign In as Finance'}
            </button>

            <div className="bg-background-light p-4 rounded-lg border-2 border-secondary">
              <div className="flex items-start gap-2">
                <FiFileText className="text-primary mt-0.5" size={18} />
                <div className="text-xs text-text-muted">
                  <p className="font-medium text-text-primary mb-1">Quick Links:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>View financial reports</li>
                    <li>Manage agent balances</li>
                    <li>Process payments</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-secondary">
            <p className="text-xs text-center text-text-muted mb-2">
              Demo: Use email containing 'finance' (e.g., finance@test.com)
            </p>
            <div className="flex gap-2 justify-center text-xs">
              <Link to="/login/admin" className="text-primary hover:underline">Admin Login</Link>
              <span className="text-text-muted">|</span>
              <Link to="/login/agent" className="text-primary hover:underline">Agent Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceLogin

