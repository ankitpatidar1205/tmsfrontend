import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { FiX } from 'react-icons/fi'
import { bankAPI } from '../../services/api'

const AddBankModal = ({ isOpen, onClose, onSuccess }) => {
  const [bankName, setBankName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddBank = async (e) => {
    e.preventDefault()
    if (!bankName.trim()) {
      toast.error('Please enter bank name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await bankAPI.createBank(bankName.trim())

      if (response.success) {
        toast.success('Bank added successfully')
        setBankName('')
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding bank:', error)
      toast.error(error.message || 'Failed to add bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add New Bank</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleAddBank} className="p-4 sm:p-6 space-y-4">
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
              onClick={onClose}
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
              {isSubmitting ? 'Adding...' : 'Add Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBankModal
