import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FiPlus, FiEye, FiSearch, FiX } from 'react-icons/fi'
import AgentModal from '../../components/modals/AgentModal'
import { toast } from 'react-toastify'

const AgentDisputes = () => {
  const { user } = useAuth()
  const { trips, disputes, addDispute, getTripsByAgent, getTripsByBranch, agents, loadDisputes, loadTrips } = useData()
  
  // Use user ID directly for agent matching (more reliable)
  const agentId = user?.id || user?._id
  
  // Get agent's trips - API already filters by agentId when loadTrips() is called
  // So trips array should contain only this agent's trips
  // We just need to filter by branch if needed
  const agentTrips = useMemo(() => {
    if (!trips || trips.length === 0) return []
    
    // API already filtered by agentId, so trips array contains only this agent's trips
    // Just filter by branch if agent has branch assigned
    if (user?.role === 'Agent' && user?.branch) {
      return trips.filter(trip => {
        const tripBranch = trip.branch || trip.branch?.name
        // Include trips from same branch or trips without branch assigned
        return tripBranch === user.branch || !tripBranch
      })
    }
    
    // No branch filter needed, return all trips (already filtered by agentId from API)
    return trips
  }, [trips, user])
  
  // State declarations - must be before useMemo hooks
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [modalActiveTrips, setModalActiveTrips] = useState([]) // Store active trips found when opening modal
  const [lrSearchTerm, setLrSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    lrNumber: '',
    disputeType: 'DEFICIT (Freight Kam Enter Hua)',
    amount: '',
    reason: '',
  })

  const activeTrips = useMemo(() => {
    if (!agentTrips || agentTrips.length === 0) return []
    
    const filtered = agentTrips.filter(t => {
      // Backend enum has 'Active' (capital A), so status should be "Active"
      // But handle both cases for safety
      const status = (t.status || '').trim()
      const statusLower = status.toLowerCase()
      // Accept "Active" (capital A) or "active" (lowercase)
      return statusLower === 'active' || status === 'Active'
    })
    
    return filtered
  }, [agentTrips])
  
  const agentDisputes = useMemo(() => {
    if (!agentId && !user?.name) return []
    let filtered = disputes.filter(d => {
      const disputeAgentId = d.agentId?.toString() || d.agentId?._id?.toString() || d.agentId?.id?.toString()
      const userAgentId = agentId?.toString() || user?.id?.toString() || user?._id?.toString()
      return disputeAgentId === userAgentId ||
             d.agentId === agentId ||
             d.agentId === user?.id ||
             d.agentId === user?._id ||
             d.agent === user?.name
    })
    
    // Filter by LR Number
    if (lrSearchTerm) {
      filtered = filtered.filter(d => {
        const lrNum = (d.lrNumber || '').toString().toLowerCase()
        return lrNum.includes(lrSearchTerm.toLowerCase().trim())
      })
    }
    
    return filtered
  }, [disputes, agentId, user, lrSearchTerm])


  // Reload trips when component mounts (only once)
  useEffect(() => {
    const reloadData = async () => {
      await loadTrips()
      await loadDisputes()
    }
    reloadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  const handleCreate = async () => {
    // Always reload trips first to get latest data
    const reloadedTrips = await loadTrips()
    
    // Filter trips directly from reloaded data (don't wait for state update)
    const agentIdStr = String(user?.id || user?._id || '')
    const agentName = user?.name
    
    // Filter by agent and branch
    let filteredTrips = reloadedTrips || []
    
    if (user?.role === 'Agent' && user?.branch) {
      filteredTrips = filteredTrips.filter(trip => {
        const tripBranch = trip.branch || trip.branch?.name
        return tripBranch === user.branch || !tripBranch
      })
    }
    
    // Filter for active status
    const currentActiveTrips = filteredTrips.filter(t => {
      const status = (t.status || '').trim()
      const statusLower = status.toLowerCase()
      return statusLower === 'active' || status === 'Active'
    })
    
    // Store active trips for modal to use
    setModalActiveTrips(currentActiveTrips)
    
    // Always open modal - let it handle showing active trips or error message
    setFormData({ 
      lrNumber: currentActiveTrips.length > 0 ? (currentActiveTrips[0]?.lrNumber || currentActiveTrips[0]?.tripId || '') : '', 
      disputeType: 'DEFICIT', 
      amount: '', 
      reason: '' 
    })
    setShowCreateModal(true)
  }

  const handleView = (dispute) => {
    setSelectedDispute(dispute)
    setShowViewModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.lrNumber) {
      toast.error('Please select an LR Number', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!formData.reason || formData.reason.trim() === '') {
      toast.error('Please provide a reason for the dispute', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    
    // Find the selected trip by LR Number or Trip ID (use modalActiveTrips if available, otherwise activeTrips)
    const tripsToSearch = modalActiveTrips.length > 0 ? modalActiveTrips : activeTrips
    const selectedTrip = tripsToSearch.find(t => 
      t.lrNumber === formData.lrNumber || 
      t.tripId === formData.lrNumber ||
      (t.id && t.id.toString() === formData.lrNumber) ||
      (t._id && t._id.toString() === formData.lrNumber)
    )
    
    if (!selectedTrip) {
      toast.error('Selected trip not found. Please select a valid active trip.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // NEW REQUIREMENT: Disputes can only be raised for Active trips (strict validation)
    const tripStatus = (selectedTrip.status || '').toLowerCase()
    if (tripStatus !== 'active') {
      toast.error('Disputes can only be raised for Active trips. Selected trip status: ' + selectedTrip.status, {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Create dispute
    try {
      const tripId = selectedTrip.id || selectedTrip._id
      const disputeAgentId = agentId || user?.id || user?._id
      
      if (!disputeAgentId) {
        toast.error('Agent ID not found. Please login again.', {
          position: 'top-right',
          autoClose: 3000,
        })
        return
      }

      await addDispute({
        lrNumber: formData.lrNumber,
        tripId: tripId,
        type: formData.disputeType,
        amount: parseFloat(formData.amount),
        reason: formData.reason.trim(),
        agentId: disputeAgentId,
      })

      toast.success('Dispute raised successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
      setShowCreateModal(false)
      setFormData({ 
        lrNumber: '', 
        disputeType: 'Payment Dispute', 
        amount: '', 
        reason: '' 
      })
      
      // Reload disputes and trips
      setTimeout(() => {
        loadDisputes()
        loadTrips()
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to raise dispute. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  return (
    <div className="p-6 mt-4">
      {/* Search and Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
          {/* Direct LR Number Filter Input */}
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={lrSearchTerm}
                onChange={(e) => setLrSearchTerm(e.target.value)}
                placeholder="Filter by LR Number..."
                className="input-field-3d w-full pl-10 pr-10"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
              {lrSearchTerm && (
                <button
                  type="button"
                  onClick={() => setLrSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="card overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Created At</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">LR No</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Reason</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agentDisputes.length > 0 ? (
              agentDisputes.map((dispute, index) => (
                <tr key={dispute.id || dispute._id || `dispute-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                  <td className="py-4 px-4 text-text-primary">
                    {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-text-primary font-medium">{dispute.lrNumber || 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary">{(dispute.type || 'N/A').split('(')[0].trim()}</td>
                  <td className="py-4 px-4 text-text-primary">Rs {(dispute.amount || 0).toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dispute.status === 'Open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {dispute.status || 'Open'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{dispute.reason || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleView(dispute)}
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="View"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-text-muted">
                  No disputes found. Click "Raise Dispute" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dispute Modal */}
      <AgentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setModalActiveTrips([])
          setFormData({ 
            lrNumber: '', 
            disputeType: 'DEFICIT', 
            amount: '', 
            reason: '' 
          })
        }}
        title="Raise Dispute"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              LR Number <span className="text-red-500">*</span>
            </label>
            {(modalActiveTrips.length > 0 || activeTrips.length > 0) ? (
              <>
                <select
                  required
                  value={formData.lrNumber}
                  onChange={(e) => setFormData({ ...formData, lrNumber: e.target.value })}
                  className="input-field-3d"
                >
                  <option value="">Select an active trip</option>
                  {(modalActiveTrips.length > 0 ? modalActiveTrips : activeTrips).map((trip, index) => (
                    <option key={trip.id || trip._id || `trip-${index}`} value={trip.lrNumber || trip.tripId}>
                      {trip.lrNumber || trip.tripId} - {trip.route || `${trip.routeFrom || ''} - ${trip.routeTo || ''}`}
                    </option>
                  ))}
                </select>
                <p className="text-text-muted text-xs mt-1">
                  {(modalActiveTrips.length > 0 ? modalActiveTrips : activeTrips).length} active trip(s) available
                </p>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  No active trips available to raise disputes.
                </p>
                <p className="text-yellow-700 text-xs mb-3">
                  Please create an active trip first, then you can raise a dispute for it.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await loadTrips()
                    toast.info('Trips refreshed. If active trips exist, they will appear now.', {
                      position: 'top-right',
                      autoClose: 2000,
                    })
                  }}
                  className="text-sm text-yellow-800 underline hover:text-yellow-900"
                >
                  Refresh Trips
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Dispute Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.disputeType}
              onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
              className="input-field-3d"
            >
              <option value="DEFICIT">DEFICIT</option>
              <option value="EXCESS">EXCESS</option>
              <option value="Payment Dispute">Payment Dispute</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Amount (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field-3d"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field-3d resize-none"
              placeholder="Describe the issue in detail..."
            />
            <p className="text-text-muted text-xs mt-1">
              Please provide a detailed description of the dispute
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setModalActiveTrips([])
                setFormData({ 
                  lrNumber: '', 
                  disputeType: 'DEFICIT', 
                  amount: '', 
                  reason: '' 
                })
              }}
              className="btn-3d-secondary px-4 py-2"
            >
              Cancel
            </button>
            {(modalActiveTrips.length > 0 || activeTrips.length > 0) && (
              <button type="submit" className="btn-3d-primary px-4 py-2">
                Raise Dispute
              </button>
            )}
          </div>
        </form>
      </AgentModal>

      {/* View Dispute Modal */}
      <AgentModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Dispute Details"
        size="md"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Created At</label>
                <p className="text-text-primary">
                  {selectedDispute.createdAt ? new Date(selectedDispute.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">LR Number</label>
                <p className="text-text-primary font-medium">{selectedDispute.lrNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                <p className="text-text-primary">{(selectedDispute.type || 'N/A').split('(')[0].trim()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
                <p className="text-text-primary font-semibold">Rs {(selectedDispute.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDispute.status === 'Open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedDispute.status || 'Open'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <p className="text-text-primary whitespace-pre-wrap">{selectedDispute.reason || 'N/A'}</p>
            </div>
            <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This dispute is now visible to Admin. You cannot edit it after submission.
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-3d-primary px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AgentModal>
    </div>
  )
}

export default AgentDisputes
