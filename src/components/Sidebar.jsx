import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MENU_ITEMS } from '../utils/constants'
import {
  FiHome,
  FiFileText,
  FiTruck,
  FiBox,
  FiSettings,
  FiLogOut,
  FiX,
  FiMenu,
  FiUsers,
  FiAlertCircle,
  FiDollarSign,
  FiZap,
} from 'react-icons/fi'
import * as Icons from 'react-icons/fi'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const iconMap = {
    FiHome,
    FiFileText,
    FiTruck,
    FiBox,
    FiSettings,
    FiUsers,
    FiAlertCircle,
    FiDollarSign,
    FiZap,
  }

  const menuItems = MENU_ITEMS[user?.role] || MENU_ITEMS.User

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getIcon = (iconName) => {
    return iconMap[iconName] || FiHome
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-primary text-white rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40
          bg-dark border-r-2 border-secondary
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-20'}
          shadow-3d
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-3d">
                  <span className="text-white font-bold text-xl">X</span>
                </div>
                <span className="text-white font-bold text-xl">ShipX</span>
              </div>
            )}
            {!isOpen && (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-3d">
                <span className="text-white font-bold text-xl">X</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:block text-secondary hover:text-secondary-light transition-colors p-1 hover:bg-primary rounded"
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
                  <p className="text-secondary text-xs truncate">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = getIcon(item.icon)
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
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

export default Sidebar
