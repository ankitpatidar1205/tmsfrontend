import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import logo from '../components/assets/new-logo.png'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setLoading(true)

    try {
      // Login with email and password - role will come from database
      const result = await login(formData.email, formData.password)
      if (result.success) {
        toast.success(`Login successful! Welcome ${result.user?.name || ''}`, {
          position: 'top-right',
          autoClose: 2000,
        })
        navigate('/dashboard', { replace: true })
      } else {
        toast.error('Login failed. Please check your credentials.', {
          position: 'top-right',
          autoClose: 3000,
        })
        setLoading(false)
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.', {
        position: 'top-right',
        autoClose: 3000,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src={logo} 
              alt="TMS Logo" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Transport Management System</h1>
          <p className="text-text-secondary text-sm sm:text-base">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="card-3d p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-3d">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary mb-5 sm:mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-text-secondary mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field-3d pl-12 pr-4 w-full py-3 sm:py-3.5 md:py-4 bg-background-light border-2 border-secondary rounded-lg text-text-primary text-sm sm:text-base focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-text-secondary mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field-3d pl-12 pr-12 w-full py-3 sm:py-3.5 md:py-4 bg-background-light border-2 border-secondary rounded-lg text-text-primary text-sm sm:text-base focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="btn-3d-primary w-full py-3 sm:py-3.5 md:py-4 px-4 bg-primary text-white text-base sm:text-lg font-semibold rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
