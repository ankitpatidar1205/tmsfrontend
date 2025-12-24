import { useAuth } from '../context/AuthContext'

export const useRole = () => {
  const { user } = useAuth()

  const hasRole = (roles) => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const isAdmin = () => hasRole('Admin')
  const isFinance = () => hasRole('Finance')
  const isAgent = () => hasRole('Agent')

  return {
    role: user?.role || null,
    hasRole,
    isAdmin,
    isFinance,
    isAgent,
  }
}
