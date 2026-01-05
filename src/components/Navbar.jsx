import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiSearch, FiUser, FiPlus } from 'react-icons/fi'

const Navbar = ({ onAddOrderClick }) => {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-dark border-b-2 border-secondary px-4 lg:px-6 py-4 shadow-3d">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full pl-10 pr-4 py-2 bg-background-light border-2 border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:shadow-3d transition-all"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 hover:bg-primary rounded-lg transition-all"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-3d">
                <FiUser className="text-white" size={16} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-secondary text-xs">{user?.role || 'Role'}</p>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-background-light border-2 border-secondary rounded-lg shadow-3d z-50">
                <div className="p-2">
                  <button className="w-full text-left px-4 py-2 text-text-secondary hover:bg-primary hover:text-white rounded-lg transition-all text-sm">
                    Profile Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-text-secondary hover:bg-red-600 hover:text-white rounded-lg transition-all text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Order Button */}
          <button
            onClick={onAddOrderClick}
            className="btn-3d-primary flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <FiPlus size={20} />
            <span className="hidden sm:inline">Add Order</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
