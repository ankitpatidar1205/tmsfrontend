import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome,
  FiTruck,
  FiAlertCircle,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX,
  FiMenu,
} from 'react-icons/fi'
import logo from '../assets/logo.png'

const AgentSidebar = ({ isMobileOpen: externalIsMobileOpen, setIsMobileOpen: setExternalIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Use external state if provided, otherwise use internal state
  const mobileOpen = externalIsMobileOpen !== undefined ? externalIsMobileOpen : isMobileOpen
  const setMobileOpen = setExternalIsMobileOpen || setIsMobileOpen

  const menuItems = [
    { path: '/agent/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/agent/trips', label: 'Trips', icon: FiTruck },
    { path: '/agent/ledger', label: 'Ledger', icon: FiDollarSign },
    { path: '/agent/disputes', label: 'Dispute Management', icon: FiAlertCircle },
    { path: '/agent/profile', label: 'Agent Profile', icon: FiSettings },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Menu Button - Only show when sidebar is closed */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[70] p-2.5 bg-primary text-white rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transition-all duration-200"
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>
      )}

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[50]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-[50]
          bg-dark border-r-2 border-secondary
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-20'}
          shadow-3d
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative flex items-center justify-center py-4 min-h-[140px] border-b-2 border-secondary bg-white">
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-3 right-3 p-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all shadow-lg z-20"
              aria-label="Close menu"
            >
              <FiX size={22} />
            </button>

            {/* CENTER LOGO */}
            <div className="w-full max-w-[180px] h-32 flex items-center justify-center p-2">
              <img
                src={logo}
                alt="TMS Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Desktop Toggle Button (Right) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:block absolute right-4 text-gray-600 hover:text-primary transition-colors p-1 hover:bg-gray-100 rounded z-10"
            >
              <FiMenu size={20} />
            </button>
          </div>


          {/* User Info */}
          {isOpen && user && (
            <div className="px-6 py-4 border-b-2 border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-3d">
                  <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user.name}</p>
                  <p className="text-secondary text-xs truncate">Agent</p>
                  {user.branch && (
                    <p className="text-blue-400 text-xs font-semibold mt-1 truncate">
                      Branch: {user.branch}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${active
                          ? 'bg-primary text-white shadow-3d'
                          : 'text-secondary hover:bg-primary hover:bg-opacity-20 hover:text-white'
                        }
                      `}
                      title={!isOpen ? item.label : ''}
                    >
                      <Icon size={20} />
                      {isOpen && <span className="font-medium">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t-2 border-secondary">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-red-600 hover:text-white w-full transition-all duration-200 font-medium"
            >
              <FiLogOut size={20} />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AgentSidebar

