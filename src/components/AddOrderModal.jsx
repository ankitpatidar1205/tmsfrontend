import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiX } from 'react-icons/fi'

const AddOrderModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    orderName: '',
    orderId: '',
    orderDescription: '',
    quantity: '',
  })
  const [errors, setErrors] = useState({})

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [show])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [show])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.orderName.trim()) {
      newErrors.orderName = 'Order name is required'
    }

    if (!formData.orderId.trim()) {
      newErrors.orderId = 'Order ID is required'
    }

    if (!formData.orderDescription.trim()) {
      newErrors.orderDescription = 'Order description is required'
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Log form data
      console.log('Order Data:', formData)

      // Show success toast
      toast.success('Order added successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })

      // Reset form
      setFormData({
        orderName: '',
        orderId: '',
        orderDescription: '',
        quantity: '',
      })
      setErrors({})

      // Close modal
      onHide()
    } else {
      toast.error('Please fill all required fields correctly', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleClose = () => {
    setFormData({
      orderName: '',
      orderId: '',
      orderDescription: '',
      quantity: '',
    })
    setErrors({})
    onHide()
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary bg-primary text-white rounded-t-lg">
          <h2 className="text-white font-semibold text-xl">Add New Order</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-secondary-light transition-colors p-1 hover:bg-primary-dark rounded"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="text-text-primary font-medium mb-2 block">
              Order Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="orderName"
              value={formData.orderName}
              onChange={handleChange}
              className={`input-field ${errors.orderName ? 'border-red-500' : ''}`}
              placeholder="Enter order name"
            />
            {errors.orderName && (
              <p className="text-red-500 text-sm mt-1">{errors.orderName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-text-primary font-medium mb-2 block">
              Order ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              className={`input-field ${errors.orderId ? 'border-red-500' : ''}`}
              placeholder="Enter order ID"
            />
            {errors.orderId && (
              <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-text-primary font-medium mb-2 block">
              Order Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              name="orderDescription"
              value={formData.orderDescription}
              onChange={handleChange}
              className={`input-field resize-none ${errors.orderDescription ? 'border-red-500' : ''}`}
              placeholder="Enter order description"
            />
            {errors.orderDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.orderDescription}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="text-text-primary font-medium mb-2 block">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrderModal

