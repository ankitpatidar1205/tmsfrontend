import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiUser } from 'react-icons/fi'
import LRSearch from '../LRSearch'

import BaseUrl from '../../utils/BaseUrl'

const AgentNavbar = ({ isSidebarOpen = false }) => {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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

        {/* Right Side Actions - Profile */}
        <div className={`flex items-center gap-2 sm:gap-4 relative z-[65] ${isSidebarOpen ? 'hidden lg:flex' : ''}`}>
          {/* Profile */}
          <div className="relative z-[65]">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 hover:bg-primary rounded-lg transition-all z-[65]"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-3d overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage.startsWith('http') ? user.profileImage : `${BaseUrl.replace('/api', '')}/${user.profileImage.replace(/\\/g, '/')}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <FiUser className="text-white" size={16} />
                )}
                <FiUser className="text-white hidden" size={16} />
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
                  <button 
                    onClick={() => {
                      setShowProfile(false)
                      navigate('/agent/profile-settings')
                    }}
                    className="w-full text-left px-4 py-2 text-text-secondary hover:bg-primary hover:text-white rounded-lg transition-all text-sm"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false)
                      logout()
                    }}
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
