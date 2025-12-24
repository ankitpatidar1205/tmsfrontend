import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Verify user still exists by fetching from API
        if (parsedUser.id) {
          authAPI.getCurrentUser(parsedUser.id)
            .then((currentUser) => {
              // Merge stored user data with API data
              setUser({
                ...parsedUser,
                ...currentUser,
                id: currentUser._id || currentUser.id || parsedUser.id,
              })
            })
            .catch(() => {
              // User not found or invalid, clear storage
              localStorage.removeItem('user')
              setUser(null)
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      } catch (error) {
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Login with email and password - role comes from database
      const response = await authAPI.login(email, password)
      
      // Transform response to match frontend expectations
      const userData = {
        id: response._id || response.id,
        _id: response._id || response.id,
        email: response.email,
        name: response.name,
        role: response.role, // Role comes from database
        phone: response.phone,
        branch: response.branch || null,
        token: response.token || `token-${Date.now()}`,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
