import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setLoading(true)

    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.role)
      if (result.success) {
        toast.success('Account created successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full">
        <div className="card-3d bg-white p-8 rounded-2xl shadow-3d">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-3d">
              <FiUserPlus className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
            <p className="text-text-muted">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field-3d w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
              >
                <option value="User">User</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
              </select>
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
                  minLength={6}
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="Confirm your password"
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup

