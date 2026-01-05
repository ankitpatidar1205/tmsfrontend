import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiUser } from 'react-icons/fi'
import AgentFilter from '../AgentFilter'
import LRSearch from '../LRSearch'

const FinanceNavbar = ({ isSidebarOpen = false, selectedAgentId = null, onAgentChange = null }) => {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-dark border-b-2 border-secondary px-4 lg:px-6 py-3 sm:py-4 shadow-3d relative">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side - Agent Selector */}
        <div className="flex items-center">
          {onAgentChange && (
            <div className="hidden md:block">
              <AgentFilter
                selectedAgent={selectedAgentId}
                onAgentChange={onAgentChange}
              />
            </div>
          )}
        </div>

        {/* Center - Global LR Search */}
        <div className="flex-1 flex justify-center px-2 sm:px-4 max-w-2xl mx-auto">
          <LRSearch />
        </div>

        {/* Right Side Actions - Profile */}
        <div className={`flex items-center gap-2 sm:gap-4 relative z-[65] ${isSidebarOpen ? 'hidden lg:flex' : ''}`}>
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
                <p className="text-white text-sm font-medium">{user?.name || 'Finance'}</p>
                <p className="text-secondary text-xs">Finance Manager</p>
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

export default FinanceNavbar
