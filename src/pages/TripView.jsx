import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { FiArrowLeft, FiUpload, FiX, FiAlertCircle, FiCheckCircle, FiFile, FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import BaseUrl from '../utils/BaseUrl'

const TripView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trips, getTripById, updateTrip, addOnTripPayment, updateDeductions, addAttachment, deleteAttachment, closeTrip, addDispute, getAgents, disputes, loadTrips } = useData()
  
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [disputeForm, setDisputeForm] = useState({
    type: '',
    reason: '',
  })
  
  // Closing Deductions form (only shown when preparing to close)
  const [deductions, setDeductions] = useState({
    cess: '',
    kata: '',
    excessTonnage: '',
    halting: '',
    expenses: '',
    beta: '',
    others: '',
    othersReason: '',
  })

  // On-trip payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    reason: '',
    agentId: '',
    mode: 'Cash', // Cash or Online
    bank: '',
  })

  // Load trip on mount and when trips data changes
  useEffect(() => {
    if (!id) {
      setLoading(false)
      toast.error('Invalid trip ID')
      navigate(-1)
      return
    }

    const loadTrip = async () => {
      try {
        // First try to get from trips array (faster)
        const tripFromArray = trips.find(t => String(t.id) === String(id) || String(t._id) === String(id))
        if (tripFromArray) {
          setTrip(tripFromArray)
          setDeductions({
            cess: tripFromArray.deductions?.cess || '',
            kata: tripFromArray.deductions?.kata || '',
            excessTonnage: tripFromArray.deductions?.excessTonnage || '',
            halting: tripFromArray.deductions?.halting || '',
            expenses: tripFromArray.deductions?.expenses || '',
            beta: tripFromArray.deductions?.beta || '',
            others: tripFromArray.deductions?.others || '',
            othersReason: tripFromArray.deductions?.othersReason || '',
          })
          // Pre-fill agent for Finance users
          if (user?.role === 'Finance') {
            const tripAgentId = tripFromArray.agentId?._id || tripFromArray.agentId?.id || tripFromArray.agentId
            if (tripAgentId) {
              setPaymentForm(prev => ({ ...prev, agentId: tripAgentId }))
            }
          }
          setLoading(false)
          return
        }
        
        // If not found in array, fetch from API
        const tripData = await getTripById(id)
        if (tripData) {
          setTrip(tripData)
          setDeductions({
            cess: tripData.deductions?.cess || '',
            kata: tripData.deductions?.kata || '',
            excessTonnage: tripData.deductions?.excessTonnage || '',
            halting: tripData.deductions?.halting || '',
            expenses: tripData.deductions?.expenses || '',
            beta: tripData.deductions?.beta || '',
            others: tripData.deductions?.others || '',
            othersReason: tripData.deductions?.othersReason || '',
          })
          // Pre-fill agent for Finance users
          if (user?.role === 'Finance') {
            const tripAgentId = tripData.agentId?._id || tripData.agentId?.id || tripData.agentId
            if (tripAgentId) {
              setPaymentForm(prev => ({ ...prev, agentId: tripAgentId }))
            }
          }
          setLoading(false)
        } else {
          setLoading(false)
          if (!trip) {
            toast.error('Trip not found. Please check the trip ID.')
            setTimeout(() => {
              const backPath = user?.role === 'Admin' ? '/admin/trips' : user?.role === 'Finance' ? '/finance/trips' : '/agent/trips'
              navigate(backPath)
            }, 2000)
          }
        }
      } catch (error) {
        console.error('Error loading trip:', error)
        setLoading(false)
        if (!trip) {
          toast.error('Failed to load trip')
        }
      }
    }
    loadTrip()
  }, [id, trips, getTripById, navigate, user?.role])

  // Check if trip has open dispute (must be defined before use)
  const hasOpenDispute = trip?.status === 'Dispute' || trip?.status === 'In Dispute'

  // Check if user can edit (Agent only, and trip must be Active - not Completed)
  const canEdit = user?.role === 'Agent' && trip?.status === 'Active'
  const isReadOnly = user?.role === 'Admin' || user?.role === 'Finance' || trip?.status === 'Completed'
  const canUploadAttachments = user?.role === 'Admin' || user?.role === 'Finance' // Only Finance/Admin can upload (NEW REQUIREMENT)
  const canReplaceAttachments = user?.role === 'Admin' || user?.role === 'Finance' // Only Finance/Admin can replace
  const canViewAttachments = true // All roles can view attachments
  const canAddPayments = user?.role === 'Agent' || user?.role === 'Finance'
  // NEW REQUIREMENT: Strict dispute blocking - Close Trip disabled when In Dispute
  // Admin can close any trip (including force close), Agent can only close Active trips without disputes
  const canCloseTrip = (user?.role === 'Admin' && trip?.status !== 'Completed') || 
                       (user?.role === 'Agent' && trip?.status === 'Active' && trip?.status !== 'In Dispute' && !hasOpenDispute)
  
  // Finance cannot close trips (NEW REQUIREMENT)
  const financeCanClose = false // Finance cannot close trips
  
  // For Closing Deductions: Agent can edit if trip is Active (even if it was previously Completed/Dispute and is now Active)
  const canEditDeductions = user?.role === 'Agent' && trip?.status !== 'Completed'

  // Calculate totals
  const initialBalance = trip ? ((trip.freight || trip.freightAmount || 0) - (trip.advance || trip.advancePaid || 0)) : 0
  // Use current deductions state for Active trips (real-time calculation), trip.deductions for Completed trips
  const currentDeductionsTotal = Object.entries(deductions).reduce((sum, [key, val]) => {
    if (key === 'othersReason') return sum
    return sum + (parseFloat(val) || 0)
  }, 0)
  const totalDeductions = trip?.status === 'Completed' 
    ? (trip.deductions ? Object.entries(trip.deductions).reduce((sum, [key, val]) => {
        if (key === 'othersReason') return sum
        return sum + (parseFloat(val) || 0)
      }, 0) : 0)
    : currentDeductionsTotal
  const totalPayments = trip?.onTripPayments ? trip.onTripPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0
  const finalBalance = initialBalance - totalDeductions - totalPayments

  // Note: Deductions are now only saved when closing trip, not separately

  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!canAddPayments) {
      toast.error('You do not have permission to add payments')
      return
    }

    // NEW REQUIREMENT: Mid-trip payments only allowed when Trip status = Active
    if (trip.status !== 'Active') {
      toast.error('Mid-trip payments can only be added for Active trips', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Validation based on role
    if (user?.role === 'Finance') {
      if (!paymentForm.amount || !paymentForm.reason || !paymentForm.agentId || !paymentForm.mode) {
        toast.error('Please fill all required fields')
        return
      }
      // If mode is Online, bank is required
      if (paymentForm.mode === 'Online' && !paymentForm.bank) {
        toast.error('Bank selection is required for Online payments')
        return
      }
    } else {
      // Agent validation (simpler)
      if (!paymentForm.amount || !paymentForm.reason) {
        toast.error('Please fill all fields')
        return
      }
    }

    try {
      // IMPORTANT: Payment should be deducted from the agent who is making the payment, NOT the trip creator
      // - For Finance: Use selected agent from dropdown (agentId)
      // - For Agent: Use logged-in agent's ID (userId) - the agent making the payment
      const targetAgentId = user?.role === 'Finance' && paymentForm.agentId 
        ? paymentForm.agentId
        : (user?.id || user?._id) // Agent making the payment (logged-in user)

      const tripId = trip.id || trip._id
      await addOnTripPayment(tripId, {
        amount: parseFloat(paymentForm.amount),
        reason: paymentForm.reason,
        agentId: targetAgentId, // Agent whose account will be debited
        mode: paymentForm.mode,
        bank: paymentForm.bank || (paymentForm.mode === 'Cash' ? 'Cash' : ''),
        userRole: user?.role, // Pass user role to backend
        userId: user?.id || user?._id, // Pass user ID to backend (logged-in agent making payment)
      })

      toast.success('Payment added successfully')
      setPaymentForm({ amount: '', reason: '', agentId: '', mode: 'Cash', bank: '' })
      
      // Refresh trip data
      setTimeout(async () => {
        const updatedTrip = await getTripById(id)
        if (updatedTrip) {
          setTrip(updatedTrip)
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to add payment')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!canUploadAttachments) {
      toast.error('You do not have permission to upload attachments. Only Finance and Admin can upload.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Check max 4 files limit (NEW REQUIREMENT)
    const currentAttachments = trip.attachments || []
    if (currentAttachments.length >= 4) {
      toast.error('Maximum 4 attachments allowed per trip. Please delete an existing attachment first.', {
        position: 'top-right',
        autoClose: 3000,
      })
      e.target.value = ''
      return
    }

    // Validate file type (Image/PDF only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only Image (JPEG, PNG, GIF) and PDF files are allowed', {
        position: 'top-right',
        autoClose: 3000,
      })
      e.target.value = ''
      return
    }

    try {
      const tripId = trip.id || trip._id
      await addAttachment(tripId, file, user?.id || user?._id)
      toast.success('Attachment uploaded successfully')
      
      // Refresh trip data
      setTimeout(async () => {
        const updatedTrip = await getTripById(id)
        if (updatedTrip) {
          setTrip(updatedTrip)
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to upload attachment')
    }
    
    // Reset file input
    e.target.value = ''
  }

  const handleReplaceAttachment = async (attachmentId, e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!canReplaceAttachments) {
      toast.error('You do not have permission to replace attachments')
      return
    }

    try {
      // Delete old attachment first
      const tripId = trip.id || trip._id
      await deleteAttachment(tripId, attachmentId)
      
      // Upload new attachment
      await addAttachment(tripId, file, user?.id || user?._id)
      
      toast.success('Attachment replaced successfully')
      
      // Refresh trip data
      setTimeout(async () => {
        const updatedTrip = await getTripById(id)
        if (updatedTrip) {
          setTrip(updatedTrip)
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to replace attachment')
    }
    
    // Reset file input
    e.target.value = ''
  }

  const handleRaiseDispute = async (e) => {
    e.preventDefault()
    if (!disputeForm.type || !disputeForm.reason) {
      toast.error('Please fill all fields')
      return
    }

    // NEW REQUIREMENT: Strict validation - Disputes can only be raised for Active trips
    if (trip.status !== 'Active') {
      toast.error('Disputes can only be raised for Active trips. Current status: ' + trip.status, {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Check if dispute already exists
    const existingDispute = disputes.find(d => 
      (d.tripId === trip.id || d.tripId === trip._id || String(d.tripId) === String(trip.id) || String(d.tripId) === String(trip._id)) && d.status === 'Open'
    )
    if (existingDispute) {
      toast.error('This trip already has an open dispute. Please resolve it first.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      const tripId = trip.id || trip._id
      const agentId = trip.agentId?._id || trip.agentId?.id || trip.agentId || user?.id || user?._id
      
      await addDispute({
        tripId: tripId,
        lrNumber: trip.lrNumber,
        agentId: agentId,
        type: disputeForm.type,
        reason: disputeForm.reason,
        amount: trip.freight || trip.freightAmount || 0,
      })

      toast.success('Dispute raised successfully! Trip status changed to "In Dispute". Close Trip is now blocked.', {
        position: 'top-right',
        autoClose: 3000,
      })
      setShowDisputeModal(false)
      setDisputeForm({ type: '', reason: '' })
      
      // Refresh trip data
      setTimeout(async () => {
        const updatedTrip = await getTripById(id)
        if (updatedTrip) {
          setTrip(updatedTrip)
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to raise dispute')
    }
  }

  const handlePrepareToClose = () => {
    // NEW REQUIREMENT: Strict blocking - cannot close if in dispute (unless Admin force close)
    if (trip.status === 'In Dispute' && user?.role !== 'Admin') {
      toast.error('Cannot close trip with status "In Dispute". Only Admin can force close.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!canCloseTrip && user?.role !== 'Admin') {
      toast.error('You cannot close this trip')
      return
    }

    if (hasOpenDispute && user?.role !== 'Admin') {
      toast.error('Cannot close trip with open dispute. Only Admin can force close.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Load existing deductions if any
    setDeductions({
      cess: trip.deductions?.cess || '',
      kata: trip.deductions?.kata || '',
      excessTonnage: trip.deductions?.excessTonnage || '',
      halting: trip.deductions?.halting || '',
      expenses: trip.deductions?.expenses || '',
      beta: trip.deductions?.beta || '',
      others: trip.deductions?.others || '',
      othersReason: trip.deductions?.othersReason || '',
    })
    setShowCloseModal(true)
  }

  const handleCloseTrip = async () => {
    if (!canCloseTrip && user?.role !== 'Admin') {
      toast.error('You cannot close this trip')
      return
    }

    // Admin can force close even with disputes, but show warning
    if (hasOpenDispute && user?.role !== 'Admin') {
      toast.error('Cannot close trip with open dispute')
      return
    }

    const confirmMessage = hasOpenDispute && user?.role === 'Admin'
      ? 'Warning: This trip has an open dispute. Are you sure you want to force close it?'
      : trip.isBulk
      ? 'Are you sure you want to mark this Bulk trip as Completed?'
      : 'Are you sure you want to close this trip? This action cannot be undone.'
    
    if (window.confirm(confirmMessage)) {
      try {
        // Save deductions first (only for non-bulk trips)
        if (!trip.isBulk) {
          const tripId = trip.id || trip._id
          await updateDeductions(tripId, deductions)
        }

        const tripId = trip.id || trip._id
        await closeTrip(tripId, hasOpenDispute && user?.role === 'Admin')
        toast.success(trip.isBulk ? 'Trip marked as Completed successfully' : 'Trip closed successfully')
        setShowCloseModal(false)
        
        // Refresh trip data
        setTimeout(async () => {
          const updatedTrip = await getTripById(id)
          if (updatedTrip) {
            setTrip(updatedTrip)
            setDeductions({
              cess: updatedTrip.deductions?.cess || '',
              kata: updatedTrip.deductions?.kata || '',
              excessTonnage: updatedTrip.deductions?.excessTonnage || '',
              halting: updatedTrip.deductions?.halting || '',
              expenses: updatedTrip.deductions?.expenses || '',
              beta: updatedTrip.deductions?.beta || '',
              others: updatedTrip.deductions?.others || '',
              othersReason: updatedTrip.deductions?.othersReason || '',
            })
          }
        }, 500)
      } catch (error) {
        toast.error(error.message || 'Failed to close trip')
      }
    }
  }

  const handleSaveDeductions = async () => {
    if (!canEditDeductions) {
      toast.error('You do not have permission to edit deductions')
      return
    }

    if (!trip || (!trip.id && !trip._id)) {
      toast.error('Trip not found')
      return
    }

    try {
      const tripId = trip.id || trip._id
      await updateDeductions(tripId, deductions)
      toast.success('Deductions saved successfully')
      
      // Refresh trip data
      setTimeout(async () => {
        const updatedTrip = await getTripById(id)
        if (updatedTrip) {
          setTrip(updatedTrip)
          setDeductions({
            cess: updatedTrip.deductions?.cess || '',
            kata: updatedTrip.deductions?.kata || '',
            excessTonnage: updatedTrip.deductions?.excessTonnage || '',
            halting: updatedTrip.deductions?.halting || '',
            expenses: updatedTrip.deductions?.expenses || '',
            beta: updatedTrip.deductions?.beta || '',
            others: updatedTrip.deductions?.others || '',
            othersReason: updatedTrip.deductions?.othersReason || '',
          })
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to save deductions')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Trip not found</div>
      </div>
    )
  }

  const getBackPath = () => {
    if (user?.role === 'Admin') return '/admin/trips'
    if (user?.role === 'Finance') return '/finance/trips'
    if (user?.role === 'Agent') return '/agent/trips'
    return '/'
  }

  return (
      <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate(getBackPath())}
            className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2 break-words">Trip Management</h1>
            <p className="text-xs sm:text-sm text-text-secondary break-words">L.R. No: {trip.lrNumber || trip.tripId} | Status: 
                <span className={`ml-1 sm:ml-2 px-2 py-1 rounded text-xs sm:text-sm font-medium ${
                trip.status === 'Active' ? 'bg-green-100 text-green-800' :
                trip.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                trip.status === 'In Dispute' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {trip.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {trip?.status === 'Completed' && (
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-lg font-medium text-xs sm:text-sm">
              ✓ Trip Completed
            </div>
          )}
          {hasOpenDispute && (
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-800 rounded-lg font-medium text-xs sm:text-sm">
              ⚠ Trip in Dispute - Cannot Close
            </div>
          )}
          {/* NEW REQUIREMENT: Close Trip button must be disabled when status is In Dispute */}
          {canCloseTrip && trip.status !== 'In Dispute' && !hasOpenDispute && (
            <button
              onClick={handlePrepareToClose}
              className="btn-3d-primary flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm sm:text-lg shadow-lg whitespace-nowrap"
            >
              <FiCheckCircle size={18} className="sm:w-[22px] sm:h-[22px]" />
              <span>{trip.isBulk ? 'Mark Completed' : 'Close Trip'}</span>
            </button>
          )}
          {/* Show disabled button when in dispute (NEW REQUIREMENT - Strict blocking) */}
          {(trip.status === 'In Dispute' || hasOpenDispute) && user?.role !== 'Admin' && (
            <button
              disabled
              className="btn-3d-secondary flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 text-white font-semibold text-sm sm:text-lg shadow-lg whitespace-nowrap cursor-not-allowed opacity-60"
              title="Cannot close trip with open dispute. Only Admin can resolve disputes."
            >
              <FiAlertCircle size={18} className="sm:w-[22px] sm:h-[22px]" />
              <span>Close Trip (Blocked - In Dispute)</span>
            </button>
          )}
          {user?.role === 'Admin' && (hasOpenDispute || trip.status === 'In Dispute') && (
            <button
              onClick={handlePrepareToClose}
              className="btn-3d-primary flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-lg shadow-lg whitespace-nowrap"
            >
              <FiCheckCircle size={18} className="sm:w-[22px] sm:h-[22px]" />
              <span>Force Close (Admin)</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Workflow Info Banner */}
      {trip.status === 'Active' && user?.role === 'Agent' && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Trip Management Workflow:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Add On-Trip Payments (mid payments) as expenses occur during the trip</li>
            <li>Enter Closing Deductions (Cess, Kata, Expenses, etc.) when ready to settle</li>
            <li>Review Final Balance calculation</li>
            <li>Click "Close Trip" button to finalize and complete the trip</li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Overview */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-3 sm:mb-4">Trip Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                <p className="text-text-primary">{trip.date ? new Date(trip.date).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Truck No</label>
                <p className="text-text-primary">{trip.truckNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Company</label>
                <p className="text-text-primary">{trip.companyName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Agent Name</label>
                <p className="text-text-primary">{trip.agent?.name || trip.agentDetails?.name || trip.agent || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Route</label>
                <p className="text-text-primary">{trip.route || `${trip.routeFrom || ''} → ${trip.routeTo || ''}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tonnage</label>
                <p className="text-text-primary">{trip.tonnage ? `${trip.tonnage} Tons` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">L.R. No</label>
                <p className="text-text-primary font-medium">{trip.lrNumber || trip.tripId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Trip Type</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  trip.isBulk ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {trip.type || (trip.isBulk ? 'Bulk' : 'Normal')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  trip.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : trip.status === 'In Dispute' || trip.status === 'Dispute'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {trip.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">LR Sheet Status</label>
                {(user?.role === 'Finance' || user?.role === 'Admin') ? (
                  <select
                    value={trip.lrSheet || 'Not Received'}
                    onChange={async (e) => {
                      try {
                        const tripId = trip.id || trip._id
                        await updateTrip(tripId, { lrSheet: e.target.value })
                        toast.success('LR Sheet status updated')
                        setTimeout(async () => {
                          const updatedTrip = await getTripById(id)
                          if (updatedTrip) {
                            setTrip(updatedTrip)
                          }
                        }, 500)
                      } catch (error) {
                        toast.error(error.message || 'Failed to update LR Sheet status')
                      }
                    }}
                    className="input-field-3d"
                  >
                    <option value="Not Received">Not Received</option>
                    <option value="Received">Received</option>
                  </select>
                ) : (
                  <p className="text-text-primary">{trip.lrSheet || 'Not Received'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Initial Financials */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-3 sm:mb-4">Initial Financials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Freight</label>
                <p className="text-text-primary font-semibold text-base sm:text-lg break-words">Rs {((trip.freight || trip.freightAmount || 0)).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Advance</label>
                <p className="text-text-primary text-base sm:text-lg break-words">Rs {((trip.advance || trip.advancePaid || 0)).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Initial Balance</label>
                <p className="text-text-primary font-semibold text-base sm:text-lg break-words">Rs {initialBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Closing Deductions Section - Always visible and editable for Active trips */}
          {!trip.isBulk && (
            <div className="card">
              <h2 className="text-xl font-bold text-text-primary mb-4">Closing Deductions</h2>
              {trip.status === 'Completed' ? (
                // Read-only view for completed trips
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Cess (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.cess) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Kata (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.kata) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Excess Tonnage (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.excessTonnage) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Halting (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.halting) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Expenses (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.expenses) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Beta / Batta (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.beta) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1">Others (Rs)</label>
                    <p className="text-text-primary text-sm sm:text-base break-words">Rs {(parseFloat(trip.deductions?.others) || 0).toLocaleString()}</p>
                  </div>
                  {trip.deductions?.othersReason && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Others Reason</label>
                      <p className="text-text-primary">{trip.deductions.othersReason}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Editable inputs for Active/Dispute trips (Agent can edit)
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Cess (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.cess}
                        onChange={(e) => setDeductions({ ...deductions, cess: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Kata (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.kata}
                        onChange={(e) => setDeductions({ ...deductions, kata: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Excess Tonnage (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.excessTonnage}
                        onChange={(e) => setDeductions({ ...deductions, excessTonnage: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Halting (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.halting}
                        onChange={(e) => setDeductions({ ...deductions, halting: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Expenses (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.expenses}
                        onChange={(e) => setDeductions({ ...deductions, expenses: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Beta / Batta (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.beta}
                        onChange={(e) => setDeductions({ ...deductions, beta: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Others (Rs)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deductions.others}
                        onChange={(e) => setDeductions({ ...deductions, others: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Others Reason</label>
                      <input
                        type="text"
                        value={deductions.othersReason}
                        onChange={(e) => setDeductions({ ...deductions, othersReason: e.target.value })}
                        disabled={!canEditDeductions}
                        className="input-field-3d"
                        placeholder="Reason for others"
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-secondary">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-text-secondary font-medium text-sm sm:text-base">Total Deductions:</span>
                      <span className="text-text-primary font-bold text-base sm:text-lg break-words">
                        Rs {Object.entries(deductions).reduce((sum, [key, val]) => {
                          if (key === 'othersReason') return sum
                          return sum + (parseFloat(val) || 0)
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {canEditDeductions && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveDeductions}
                        className="btn-3d-primary px-4 py-2"
                      >
                        Save Deductions
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Dispute Section */}
          {user?.role === 'Agent' && trip.status === 'Active' && !hasOpenDispute && (
            <div className="card">
              <h2 className="text-xl font-bold text-text-primary mb-4">Raise Dispute</h2>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="btn-3d-secondary flex items-center gap-2 px-4 py-2"
              >
                <FiAlertCircle size={20} />
                <span>Raise Dispute</span>
              </button>
            </div>
          )}

          {hasOpenDispute && (
            <div className="card bg-red-50 border-2 border-red-200">
              <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                <FiAlertCircle size={24} />
                Trip in Dispute
              </h2>
              <p className="text-red-700">
                {user?.role === 'Admin' 
                  ? 'This trip has an open dispute. Admin can force close if needed.'
                  : 'This trip has an open dispute and cannot be closed until resolved by Admin.'}
              </p>
            </div>
          )}

          {/* Summary & Final Balance */}
          {!trip.isBulk && (
            <div className="card bg-primary bg-opacity-10 border-2 border-primary">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-3 sm:mb-4">Summary & Final Balance</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <span className="text-text-secondary text-sm sm:text-base">Initial Balance:</span>
                  <span className="text-text-primary font-medium text-sm sm:text-base break-words">Rs {initialBalance.toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <span className="text-text-secondary text-sm sm:text-base">Total On-Trip Payments:</span>
                  <span className="text-text-primary font-medium text-sm sm:text-base break-words">- Rs {totalPayments.toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <span className="text-text-secondary text-sm sm:text-base">Total Closing Deductions:</span>
                  <span className="text-text-primary font-medium text-sm sm:text-base break-words">- Rs {totalDeductions.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t-2 border-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-text-primary font-bold text-base sm:text-lg">Final Balance (Auto):</span>
                  <span className="text-text-primary font-bold text-xl sm:text-2xl break-words">Rs {finalBalance.toLocaleString()}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-secondary">
                  <p className="text-xs text-text-secondary italic">
                    Final Balance = Initial Balance - On-Trip Payments - Closing Deductions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - On-Trip Payments & Attachments */}
        <div className="space-y-6">
          {/* On-Trip Payments Section (Mid Payments) */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">On-Trip Payments</h2>
              {canAddPayments && trip.status === 'Active' && (
                <span className="text-sm text-green-600 font-medium">✓ Can Add</span>
              )}
            </div>
            
            {/* Add Payment Form */}
            {canAddPayments && trip.status === 'Active' && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-3">Add Payment</h3>
                <p className="text-xs text-green-700 mb-3">
                  Any payments done by agents during the trip should be added here with reasons.
                </p>
                <form onSubmit={handleAddPayment} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Amount (Rs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="input-field-3d"
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Finance-specific fields */}
                  {user?.role === 'Finance' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Agent <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={paymentForm.agentId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, agentId: e.target.value })}
                          className="input-field-3d"
                        >
                          <option value="">Select Agent</option>
                          {getAgents().map((agent, index) => (
                            <option key={agent.id || agent._id || `agent-${index}`} value={agent.id || agent._id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Mode <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={paymentForm.mode}
                            onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value, bank: e.target.value === 'Cash' ? '' : paymentForm.bank })}
                            className="input-field-3d"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Online">Online</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Bank {paymentForm.mode === 'Online' && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            required={paymentForm.mode === 'Online'}
                            value={paymentForm.bank}
                            onChange={(e) => setPaymentForm({ ...paymentForm, bank: e.target.value })}
                            className="input-field-3d"
                            disabled={paymentForm.mode === 'Cash'}
                          >
                            <option value="">Select Bank</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="State Bank of India">State Bank of India</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.reason}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reason: e.target.value })}
                      className="input-field-3d"
                      placeholder="Fuel, repairs, food, etc."
                    />
                  </div>
                  <button type="submit" className="btn-3d-primary px-4 py-2 w-full">
                    Add Payment
                  </button>
                </form>
                <p className="text-xs text-green-700 mt-2">
                  Note: Payment will be deducted from balance immediately.
                </p>
              </div>
            )}
            
            {!canAddPayments && trip.status === 'Active' && (
              <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Only Agent and Finance can add payments for Active trips.
                </p>
              </div>
            )}
            
            {trip.status !== 'Active' && (
              <div className="mb-4 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Payments can only be added for Active trips.
                </p>
              </div>
            )}

            {/* Payments Table */}
            {trip.onTripPayments && trip.onTripPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="border-b-2 border-secondary">
                      <th className="text-left py-2 px-2 text-text-secondary font-medium">Amount</th>
                      <th className="text-left py-2 px-2 text-text-secondary font-medium">Reason</th>
                      <th className="text-left py-2 px-2 text-text-secondary font-medium">Paid By</th>
                      <th className="text-left py-2 px-2 text-text-secondary font-medium">Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.onTripPayments.map((payment, index) => (
                      <tr key={payment.id || payment._id || `payment-${index}`} className="border-b border-secondary">
                        <td className="py-2 px-2 text-text-primary font-medium text-xs sm:text-sm break-words">Rs {(parseFloat(payment.amount) || 0).toLocaleString()}</td>
                        <td className="py-2 px-2 text-text-primary text-xs break-words">{payment.reason || 'N/A'}</td>
                        <td className="py-2 px-2 text-text-primary text-xs break-words">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.addedByRole === 'Finance' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.addedByRole === 'Finance' ? 'Finance' : 'Agent'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-text-primary text-xs break-words">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-muted text-center py-4 text-sm">No payments recorded</p>
            )}
            
            <div className="mt-4 pt-4 border-t-2 border-secondary">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-text-secondary font-medium text-xs sm:text-sm">Total Payments:</span>
                <span className="text-text-primary font-bold text-sm sm:text-base break-words">Rs {totalPayments.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="card">
            <h2 className="text-xl font-bold text-text-primary mb-4">Attachments</h2>
            
            {canUploadAttachments && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Upload Document (Max 4 files - Image/PDF only)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,image/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-3d-secondary flex items-center gap-2 px-4 py-2 cursor-pointer"
                  >
                    <FiUpload size={18} />
                    <span>Upload</span>
                  </label>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Maximum 4 attachments per trip. Only Finance and Admin can upload documents.
                </p>
                {trip.attachments && trip.attachments.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Current: {trip.attachments.length}/4 files
                  </p>
                )}
              </div>
            )}
            {!canUploadAttachments && user?.role === 'Agent' && (
              <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>View Only:</strong> Agents cannot upload attachments. Only Finance and Admin can upload documents.
                </p>
              </div>
            )}

            {trip.attachments && trip.attachments.length > 0 ? (
              <div className="space-y-2">
                {trip.attachments.map((attachment, index) => {
                  // Get file name from originalName or filename
                  const fileName = attachment.originalName || attachment.filename || attachment.name || `File ${index + 1}`
                  // Get file path for download/view - use filename or path
                  const filePath = attachment.filename || attachment.path
                  // Build download URL - backend serves files from /uploads route (not /api/uploads)
                  // BaseUrl includes /api, so we need to remove it for static file serving
                  const backendBaseUrl = BaseUrl.replace('/api', '') || 'http://localhost:5000'
                  const downloadUrl = filePath ? `${backendBaseUrl}/uploads/${filePath}` : null
                  
                  return (
                    <div key={attachment.id || attachment._id || attachment.filename || `attachment-${index}`} className="flex items-center justify-between p-3 bg-background rounded-lg border-2 border-secondary hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FiFile size={18} className="text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-text-primary font-medium text-sm truncate" title={fileName}>
                            {fileName}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {attachment.uploadedBy?.name || attachment.uploadedBy || 'Unknown'} • {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString('en-IN') : 'N/A'}
                            {attachment.replaced && <span className="ml-2 text-orange-600">(Replaced)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-3d-primary flex items-center gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors"
                            title="View/Download file"
                          >
                            <FiEye size={14} />
                            <span className="hidden sm:inline">View</span>
                          </a>
                        )}
                        {canReplaceAttachments && (
                          <div>
                            <input
                              type="file"
                              id={`replace-${attachment.id || attachment._id || attachment.filename || index}`}
                              onChange={(e) => handleReplaceAttachment(attachment.id || attachment._id, e)}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,image/*"
                            />
                            <label
                              htmlFor={`replace-${attachment.id || attachment._id || attachment.filename || index}`}
                              className="btn-3d-secondary flex items-center gap-1 px-2 py-1 text-xs cursor-pointer"
                              title="Replace document"
                            >
                              <FiUpload size={14} />
                              <span className="hidden sm:inline">Replace</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-text-muted text-center py-4">No attachments</p>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Raise Dispute</h2>
            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Dispute Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={disputeForm.type}
                  onChange={(e) => setDisputeForm({ ...disputeForm, type: e.target.value })}
                  className="input-field-3d"
                >
                  <option value="">Select type</option>
                  <option value="Payment Dispute">Payment Dispute</option>
                  <option value="Amount Dispute">Amount Dispute</option>
                  <option value="Service Dispute">Service Dispute</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  className="input-field-3d"
                  placeholder="Describe the dispute..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="btn-3d-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-3d-primary px-4 py-2">
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Trip Modal - Summary and Confirmation */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Close Trip - Final Summary</h2>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {trip.isBulk ? (
              <div className="mb-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Bulk Trip:</strong> This trip will be marked as Completed without financial settlement.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please review the final balance before closing. Make sure all deductions are entered correctly.
                    {deductions.beta && parseFloat(deductions.beta) > 0 && (
                      <span className="block mt-2">
                        <strong>Beta/Batta:</strong> Rs {parseFloat(deductions.beta).toLocaleString()} will be credited back to your balance.
                      </span>
                    )}
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-text-secondary text-sm">Initial Balance:</span>
                <span className="text-text-primary font-medium text-sm break-words">Rs {initialBalance.toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-text-secondary text-sm">Total On-Trip Payments:</span>
                <span className="text-text-primary font-medium text-sm break-words">- Rs {totalPayments.toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-text-secondary text-sm">Total Closing Deductions:</span>
                <span className="text-text-primary font-medium text-sm break-words">- Rs {Object.entries(deductions).reduce((sum, [key, val]) => {
                  if (key === 'othersReason') return sum
                  return sum + (parseFloat(val) || 0)
                }, 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t-2 border-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-text-primary font-bold text-base sm:text-lg">Final Balance:</span>
                <span className="text-text-primary font-bold text-lg sm:text-xl break-words">
                  Rs {(initialBalance - totalPayments - Object.entries(deductions).reduce((sum, [key, val]) => {
                    if (key === 'othersReason') return sum
                    return sum + (parseFloat(val) || 0)
                  }, 0)).toLocaleString()}
                </span>
              </div>
              {deductions.beta && parseFloat(deductions.beta) > 0 && (
                <div className="pt-2 border-t border-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-green-600 font-semibold text-sm">Beta/Batta Credit Back:</span>
                  <span className="text-green-600 font-bold text-base break-words">
                    + Rs {parseFloat(deductions.beta).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t-2 border-secondary">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="btn-3d-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTrip}
                className="btn-3d-primary px-4 py-2"
              >
                {trip.isBulk ? 'Confirm & Mark Completed' : 'Confirm & Close Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripView

