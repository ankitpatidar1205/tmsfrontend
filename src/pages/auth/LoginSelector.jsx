import React from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiDollarSign, FiTruck } from 'react-icons/fi'

const LoginSelector = () => {
  const loginOptions = [
    {
      role: 'Admin',
      path: '/login/admin',
      icon: FiShield,
      description: 'Full system access, user management, and dispute resolution',
      color: 'bg-red-100 text-red-600',
    },
    {
      role: 'Finance',
      path: '/login/finance',
      icon: FiDollarSign,
      description: 'Financial records, ledger management, and reports',
      color: 'bg-green-100 text-green-600',
    },
    {
      role: 'Agent',
      path: '/login/agent',
      icon: FiTruck,
      description: 'Trip management, disputes, and personal financial overview',
      color: 'bg-blue-100 text-blue-600',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome to ShipX</h1>
          <p className="text-text-secondary text-lg">Transport Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loginOptions.map((option) => {
            const Icon = option.icon
            return (
              <Link
                key={option.role}
                to={option.path}
                className="card-3d bg-white p-6 rounded-2xl shadow-3d hover:shadow-3d-hover transform hover:-translate-y-2 transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-3d group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
                  {option.role} Login
                </h2>
                <p className="text-text-muted text-sm text-center mb-4">
                  {option.description}
                </p>
                <div className="text-center">
                  <span className="text-primary font-semibold group-hover:underline">
                    Continue as {option.role} →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSelector

