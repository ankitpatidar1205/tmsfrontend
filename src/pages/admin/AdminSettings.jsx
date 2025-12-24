import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { branchAPI } from '../../services/api'
import { FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'

const AdminSettings = () => {
  const { loadBranches } = useData()
  const [branches, setBranches] = useState([])
  const [newBranchName, setNewBranchName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [editBranchName, setEditBranchName] = useState('')

  useEffect(() => {
    loadBranchesList()
  }, [])

  const loadBranchesList = async () => {
    try {
      const data = await branchAPI.getBranches()
      setBranches(data)
    } catch (error) {
      console.error('Error loading branches:', error)
      toast.error('Failed to load branches', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleAddBranch = async (e) => {
    e.preventDefault()
    if (!newBranchName || newBranchName.trim() === '') {
      toast.error('Please enter a branch name', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setIsAdding(true)
    try {
      await branchAPI.createBranch(newBranchName.trim().toUpperCase())
      await loadBranchesList()
      await loadBranches() // Reload in DataContext
      toast.success(`Branch "${newBranchName.trim().toUpperCase()}" added successfully!`, {
        position: 'top-right',
        autoClose: 2000,
      })
      setNewBranchName('')
    } catch (error) {
      toast.error(error.message || 'Failed to add branch', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleStartEdit = (branch) => {
    setEditingBranch(branch)
    setEditBranchName(branch.name || branch)
  }

  const handleSaveEdit = async () => {
    if (!editBranchName || editBranchName.trim() === '') {
      toast.error('Please enter a branch name', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      const branchId = editingBranch.id || editingBranch._id
      await branchAPI.updateBranch(branchId, editBranchName.trim().toUpperCase())
      await loadBranchesList()
      await loadBranches() // Reload in DataContext
      toast.success(`Branch updated to "${editBranchName.trim().toUpperCase()}" successfully!`, {
        position: 'top-right',
        autoClose: 2000,
      })
      setEditingBranch(null)
      setEditBranchName('')
    } catch (error) {
      toast.error(error.message || 'Failed to update branch', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingBranch(null)
    setEditBranchName('')
  }

  const handleDeleteBranch = async (branch) => {
    const branchName = branch.name || branch
    if (window.confirm(`Are you sure you want to delete branch "${branchName}"?\n\nNote: You cannot delete a branch if any agents are assigned to it.`)) {
      try {
        const branchId = branch.id || branch._id
        await branchAPI.deleteBranch(branchId)
        await loadBranchesList()
        await loadBranches() // Reload in DataContext
        toast.success(`Branch "${branchName}" deleted successfully!`, {
          position: 'top-right',
          autoClose: 2000,
        })
      } catch (error) {
        toast.error(error.message || 'Failed to delete branch', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Admin Settings</h1>
        <p className="text-xs sm:text-sm text-text-secondary">Manage system-wide settings and branches</p>
      </div>

      {/* Branch Management Section */}
      <div className="card mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">Branch Management</h2>
        <p className="text-xs sm:text-sm text-text-secondary mb-4">
          Create, edit, and manage branches. Agents can be assigned to branches to filter their trips and transactions.
        </p>
        
        {/* Add Branch Form */}
        <form onSubmit={handleAddBranch} className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value.toUpperCase())}
                className="input-field-3d"
                placeholder="Enter branch name (e.g., C1, C2, C3)"
                maxLength={10}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAdding}
                className="btn-3d-primary flex items-center gap-2 px-4 py-2 whitespace-nowrap"
              >
                <FiPlus size={18} />
                <span>{isAdding ? 'Adding...' : 'Add Branch'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Branches List */}
        <div>
          <h3 className="text-sm sm:text-base font-medium text-text-secondary mb-3">Existing Branches</h3>
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {branches.map((branch) => {
                const branchName = branch.name || branch
                const branchId = branch.id || branch._id
                const isEditing = editingBranch && (editingBranch.id === branchId || editingBranch._id === branchId)
                
                return (
                  <div
                    key={branchId}
                    className="flex items-center justify-between p-3 bg-background border-2 border-secondary rounded-lg"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editBranchName}
                          onChange={(e) => setEditBranchName(e.target.value.toUpperCase())}
                          className="input-field-3d flex-1 text-sm"
                          maxLength={10}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Save"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Cancel"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-text-primary">{branchName}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(branch)}
                            className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                            title="Edit branch"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(branch)}
                            className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                            title="Delete branch"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4">No branches found. Add your first branch above.</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminSettings
