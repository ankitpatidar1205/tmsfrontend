import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { bankAPI } from '../../services/api'
import AddBankModal from '../../components/modals/AddBankModal'

const AdminBanks = () => {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBank, setEditingBank] = useState(null)
  const [bankName, setBankName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch banks
  const fetchBanks = async () => {
    try {
      setLoading(true)
      const response = await bankAPI.getBanks()
      
      if (response.success) {
        setBanks(response.data)
      }
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error(error.message || 'Failed to fetch banks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  // Handle edit bank
  const handleEditBank = async (e) => {
    e.preventDefault()
    if (!bankName.trim()) {
      toast.error('Please enter bank name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await bankAPI.updateBank(editingBank._id, bankName.trim())

      if (response.success) {
        toast.success('Bank updated successfully')
        setBankName('')
        setShowEditModal(false)
        setEditingBank(null)
        fetchBanks()
      }
    } catch (error) {
      console.error('Error updating bank:', error)
      toast.error(error.message || 'Failed to update bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete bank
  const handleDeleteBank = async (bank) => {
    if (!window.confirm(`Are you sure you want to delete "${bank.name}"?`)) {
      return
    }

    try {
      const response = await bankAPI.deleteBank(bank._id)

      if (response.success) {
        toast.success('Bank deleted successfully')
        fetchBanks()
      }
    } catch (error) {
      console.error('Error deleting bank:', error)
      toast.error(error.message || 'Failed to delete bank')
    }
  }

  // Open edit modal
  const openEditModal = (bank) => {
    setEditingBank(bank)
    setBankName(bank.name)
    setShowEditModal(true)
  }

  // Close modals
  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingBank(null)
    setBankName('')
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1">
            Bank Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage banks for online payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-3d-primary flex items-center gap-2 px-4 py-2 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <FiPlus size={18} />
          <span>Add Bank</span>
        </button>
      </div>

      {/* Banks Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading banks...</p>
          </div>
        ) : banks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No banks found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-3d-primary px-4 py-2 text-sm"
            >
              Add Your First Bank
            </button>
          </div>
        ) : (
          <div className="min-w-full">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">
                    #
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">
                    Bank Name
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">
                    Created At
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank, index) => (
                  <tr
                    key={bank._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 sm:px-4 text-text-primary text-xs sm:text-sm">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-text-primary font-medium text-xs sm:text-sm">
                      {bank.name}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          bank.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-text-secondary text-xs sm:text-sm">
                      {new Date(bank.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(bank)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBank(bank)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Bank Modal */}
      <AddBankModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchBanks}
      />

      {/* Edit Bank Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Bank</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleEditBank} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-field-3d w-full"
                  placeholder="Enter bank name"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-3d-secondary px-4 py-2 text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-6 py-2 text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBanks
