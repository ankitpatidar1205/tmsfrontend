import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Password reset link sent to your email!', {
        position: 'top-right',
        autoClose: 3000,
      })
      setLoading(false)
      setEmail('')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full">
        <div className="card-3d bg-white p-8 rounded-2xl shadow-3d">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-3d">
              <FiMail className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Forgot Password?</h1>
            <p className="text-text-muted">Enter your email to receive a reset link</p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field-3d pl-10 w-full px-4 py-3 bg-background-light border-2 border-secondary rounded-lg text-text-primary focus:outline-none focus:border-primary focus:shadow-3d transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-primary w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                <FiArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

