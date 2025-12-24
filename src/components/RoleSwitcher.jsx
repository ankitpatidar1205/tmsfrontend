import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiUser, FiShield, FiDollarSign } from 'react-icons/fi'
import { toast } from 'react-toastify'

const RoleSwitcher = () => {
  const { user, switchRole } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const roles = [
    { value: 'Admin', label: 'Admin', icon: FiShield, color: 'text-red-600' },
    { value: 'Finance', label: 'Finance', icon: FiDollarSign, color: 'text-green-600' },
    { value: 'Agent', label: 'Agent', icon: FiUser, color: 'text-blue-600' },
  ]

  const currentRole = roles.find(r => r.value === user?.role)
  const CurrentIcon = currentRole?.icon || FiUser

  const handleRoleSwitch = async (newRole) => {
    if (newRole === user?.role) {
      setShowDropdown(false)
      return
    }

    setIsSwitching(true)
    try {
      const result = await switchRole(newRole)
      if (result.success) {
        toast.success(`Switched to ${newRole} role`, {
          position: 'top-right',
          autoClose: 2000,
        })
        
        // Navigate to appropriate dashboard
        if (newRole === 'Admin') {
          navigate('/admin/dashboard', { replace: true })
        } else if (newRole === 'Finance') {
          navigate('/finance/dashboard', { replace: true })
        } else if (newRole === 'Agent') {
          navigate('/agent/dashboard', { replace: true })
        }
      } else {
        toast.error(result.error || 'Failed to switch role', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error('Failed to switch role', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsSwitching(false)
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-2 bg-background-light border-2 border-secondary rounded-lg text-text-primary hover:bg-primary hover:text-white transition-all shadow-3d hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed"
        title="Switch Role"
      >
        <CurrentIcon size={18} className={currentRole?.color || 'text-text-secondary'} />
        <span className="hidden sm:inline text-sm font-medium">{currentRole?.label || 'Role'}</span>
        <FiChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-background-light border-2 border-secondary rounded-lg shadow-3d z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase border-b-2 border-secondary mb-1">
                Switch Role
              </div>
              {roles.map((role) => {
                const RoleIcon = role.icon
                const isActive = role.value === user?.role
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSwitch(role.value)}
                    disabled={isSwitching || isActive}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-white cursor-default'
                        : 'text-text-secondary hover:bg-primary hover:text-white'
                    } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RoleIcon size={18} className={isActive ? 'text-white' : role.color} />
                    <span className="font-medium">{role.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs">Current</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RoleSwitcher

