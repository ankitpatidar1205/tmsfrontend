import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiBell, FiSettings, FiUser } from 'react-icons/fi'
import LRSearch from '../LRSearch'

const AgentNavbar = ({ isSidebarOpen = false }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()

  // Close notifications when sidebar opens on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      setShowNotifications(false)
    }
  }, [isSidebarOpen])

  return (
    <nav className="bg-dark border-b-2 border-secondary px-4 lg:px-6 py-3 sm:py-4 shadow-3d relative">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side - Agent Name Display */}
        <div className="hidden md:flex items-center gap-2 text-white font-medium">
          <span>{user?.name || 'Agent'}</span>
          {user?.branch && (
            <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold">
              {user.branch}
            </span>
          )}
        </div>

        {/* Center - Global LR Search */}
        <div className="flex-1 flex justify-center px-2 sm:px-4 max-w-2xl mx-auto">
          <LRSearch />
        </div>

        {/* Right Side Actions - Notifications, Settings, Profile */}
        <div className={`flex items-center gap-2 sm:gap-4 relative z-[65] ${isSidebarOpen ? 'hidden lg:flex' : ''}`}>
          {/* Notifications */}
          <div className="relative z-[65]">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-secondary hover:text-white hover:bg-primary rounded-lg transition-all shadow-3d hover:shadow-3d-hover z-[65]"
            >
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && !isSidebarOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-background-light border-2 border-secondary rounded-lg shadow-3d z-[65] min-w-[280px] max-w-[90vw] sm:max-w-none">
                <div className="p-4 border-b-2 border-secondary">
                  <h3 className="text-text-primary font-semibold">Notifications</h3>
                </div>
                <div className="p-4">
                  <p className="text-text-secondary text-sm">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 text-secondary hover:text-white hover:bg-primary rounded-lg transition-all shadow-3d hover:shadow-3d-hover">
            <FiSettings size={20} />
          </button>

          {/* Profile */}
          <div className="relative z-[65]">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 hover:bg-primary rounded-lg transition-all z-[65]"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-3d">
                <FiUser className="text-white" size={16} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">{user?.name || 'Agent'}</p>
                <p className="text-secondary text-xs">
                  Agent
                  {user?.branch && <span className="ml-1 text-blue-400">• {user.branch}</span>}
                </p>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-background-light border-2 border-secondary rounded-lg shadow-3d z-[65]">
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
        </div>
      </div>
    </nav>
  )
}

export default AgentNavbar
