import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { userAPI } from '../../services/api'
import { FiPlus, FiEdit, FiTrash2, FiUser, FiSearch, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'

const AdminUsers = () => {
  const { user } = useAuth()
  const { branches, loadAgents } = useData()
  const [users, setUsers] = useState([])
  const [branchesList, setBranchesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [nameSearchTerm, setNameSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Agent',
    phone: '',
    branchId: '',
  })

  useEffect(() => {
    loadUsers()
    loadBranchesList()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Load both Agent and Finance users
      const [agents, financeUsers] = await Promise.all([
        userAPI.getUsers('Agent'),
        userAPI.getUsers('Finance'),
      ])
      setUsers([...agents, ...financeUsers])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBranchesList = async () => {
    try {
      const { branchAPI } = await import('../../services/api')
      const data = await branchAPI.getBranches()
      setBranchesList(data)
    } catch (error) {
      console.error('Error loading branches:', error)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Agent',
      phone: '',
      branchId: '',
    })
    setShowCreateModal(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    // Find branch ID from branch name
    const branch = branchesList.find(b => b.name === user.branch)
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role,
      phone: user.phone,
      branchId: branch?.id || branch?._id || '',
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id, user?.id || user?._id || null, user?.role || 'Admin')
        await loadUsers()
        await loadAgents() // Reload agents list
        toast.success('User deleted successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
      } catch (error) {
        toast.error(error.message || 'Failed to delete user', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Validate branch for agents
    if (formData.role === 'Agent' && !formData.branchId) {
      toast.error('Please select a branch for the agent', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      if (showCreateModal) {
        // Create new user
        if (!formData.password) {
          toast.error('Password is required for new users', {
            position: 'top-right',
            autoClose: 3000,
          })
          return
        }

        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          branchId: formData.role === 'Agent' ? formData.branchId : null,
          userId: user?.id || user?._id || null, // Current logged-in user who is creating
          userRole: user?.role || 'Admin', // Current logged-in user's role
        }

        await userAPI.createUser(userData)
        await loadUsers()
        await loadAgents() // Reload agents list
        
        toast.success('User created successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
        
        setShowCreateModal(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Agent',
          phone: '',
          branchId: '',
        })
      } else if (showEditModal && selectedUser) {
        // Update existing user
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          branchId: formData.role === 'Agent' ? formData.branchId : null,
          userId: user?.id || user?._id || null, // Current logged-in user who is updating
          userRole: user?.role || 'Admin', // Current logged-in user's role
        }
        
        // Only include password if provided
        if (formData.password) {
          userData.password = formData.password
        }

        await userAPI.updateUser(selectedUser.id || selectedUser._id, userData)
        await loadUsers()
        await loadAgents() // Reload agents list
        
        toast.success('User updated successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
        
        setShowEditModal(false)
        setSelectedUser(null)
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Agent',
          phone: '',
          branchId: '',
        })
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save user', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => u.role === 'Agent' || u.role === 'Finance')
    
    // Filter by name
    if (nameSearchTerm) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(nameSearchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(nameSearchTerm.toLowerCase()) ||
        u.phone?.includes(nameSearchTerm)
      )
    }
    
    return filtered
  }, [users, nameSearchTerm])

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center py-8">
          <p className="text-text-muted">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Users</h1>
          <p className="text-xs sm:text-sm text-text-secondary">Manage Agent and Finance users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
          {/* Name Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
            <input
              type="text"
              value={nameSearchTerm}
              onChange={(e) => setNameSearchTerm(e.target.value)}
              placeholder="Search by Name, Email, Phone..."
              className="input-field-3d pl-10 pr-10 w-full"
            />
            {nameSearchTerm && (
              <button
                type="button"
                onClick={() => setNameSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="btn-3d-primary flex items-center justify-center gap-2 px-4 py-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
          >
            <FiPlus size={18} className="sm:w-5 sm:h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Name</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Email</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Phone</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Role</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Branch</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted text-sm">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id || user._id || `user-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary font-medium text-xs sm:text-sm break-words">{user.name}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">{user.email}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">{user.phone}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Agent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      {user.role === 'Agent' && user.branch ? (
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {user.branch}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Edit"
                        >
                          <FiEdit size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id || user._id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Delete"
                        >
                          <FiTrash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted text-sm">
                    No users found. Create your first user!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field-3d"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field-3d"
                  placeholder="user@tms.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field-3d"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field-3d"
                >
                  <option value="Agent">Agent</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field-3d"
                  placeholder="9990001111"
                />
              </div>
              {formData.role === 'Agent' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    required={formData.role === 'Agent'}
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="input-field-3d"
                  >
                    <option value="">Select Branch</option>
                    {branchesList && branchesList.length > 0 ? (
                      branchesList.map((branch, index) => (
                        <option key={branch.id || branch._id || `branch-${index}`} value={branch.id || branch._id}>
                          {branch.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No branches available. Please add branches in Settings first.</option>
                    )}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">
                    Assign this agent to a branch. Agents can only see trips from their assigned branch.
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-3d-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-3d-primary px-4 py-2">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field-3d"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field-3d"
                  placeholder="user@tms.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field-3d"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field-3d"
                >
                  <option value="Agent">Agent</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field-3d"
                  placeholder="9990001111"
                />
              </div>
              {formData.role === 'Agent' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    required={formData.role === 'Agent'}
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="input-field-3d"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch, index) => (
                      <option key={branch || `branch-str-${index}`} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">
                    Assign this agent to a branch. Agents can only see trips from their assigned branch.
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                  className="btn-3d-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-3d-primary px-4 py-2">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
