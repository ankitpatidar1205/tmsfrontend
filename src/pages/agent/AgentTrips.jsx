import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FiPlus, FiEye, FiSearch, FiX } from 'react-icons/fi'
import AgentModal from '../../components/modals/AgentModal'
import { toast } from 'react-toastify'
import { formatDate } from '../../utils/dateFormatter'

const AgentTrips = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { trips, addTrip, addLedgerEntry, getTripsByAgent, getTripsByBranch, loadTrips } = useData()
  
  // Filter trips to show only agent's trips (restricted to their branch)
  const [agentTrips, setAgentTrips] = useState([])
  const [lrSearchTerm, setLrSearchTerm] = useState('')

  // Read LR number from URL query params on mount (for LR search navigation)
  useEffect(() => {
    const lrFromUrl = searchParams.get('lrNumber')
    if (lrFromUrl) {
      setLrSearchTerm(lrFromUrl)
      // Clear URL param after reading
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
    // Load trips when component mounts (only once)
    if (user?.role === 'Agent' && (user?.id || user?._id)) {
      loadTrips()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  useEffect(() => {
    // Get trips for current agent
    // API already filters by agentId, so trips array contains only agent's trips
    if (user?.role === 'Agent' && Array.isArray(trips)) {
      // Since API already filters by agentId, we can directly use trips
      // But do a quick verification to ensure they belong to current agent
      const agentId = String(user?.id || user?._id || '').trim()
      const agentName = user?.name
      
      // Simple filter - API already did the heavy lifting
      const filtered = trips.filter(trip => {
        // Get trip's agent ID
        const tripAgentId = trip.agentId?._id || trip.agentId?.id || trip.agentId
        
        // Match by ID
        if (tripAgentId && agentId) {
          if (String(tripAgentId).trim() === String(agentId).trim()) {
            return true
          }
        }
        
        // Match by name
        const tripAgentName = trip.agent?.name || trip.agent || trip.agentName || trip.agentDetails?.name
        if (tripAgentName && agentName && String(tripAgentName) === String(agentName)) {
          return true
        }
        
        // If API filtered correctly, include trip (backup)
        return true
      })
      
      setAgentTrips(filtered)
    } else if (user?.role === 'Agent') {
      setAgentTrips([])
    }
  }, [trips, user?.id, user?._id, user?.role, user?.name])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    lrNumber: '',
    date: new Date().toISOString().split('T')[0],
    truckNumber: '',
    companyName: '',
    routeFrom: '',
    routeTo: '',
    tonnage: '',
    lrSheet: '',
    isBulk: false,
    freightAmount: '',
    advancePaid: '',
    balanceAmount: '',
    status: 'Active',
  })

  // Auto-calculate balance (only for regular trips)
  useEffect(() => {
    if (!formData.isBulk) {
      const freight = parseFloat(formData.freightAmount) || 0
      const advance = parseFloat(formData.advancePaid) || 0
      const balance = freight - advance
      setFormData((prev) => ({
        ...prev,
        balanceAmount: balance.toFixed(2),
      }))
    } else {
      // For bulk trips, set balance to 0
      setFormData((prev) => ({
        ...prev,
        balanceAmount: '0',
      }))
    }
  }, [formData.freightAmount, formData.advancePaid, formData.isBulk])

  const handleCreate = () => {
    setFormData({
      lrNumber: '',
      date: new Date().toISOString().split('T')[0],
      truckNumber: '',
      companyName: '',
      routeFrom: '',
      routeTo: '',
      tonnage: '',
      lrSheet: '',
      isBulk: false,
      freightAmount: '',
      advancePaid: '',
      balanceAmount: '',
      status: 'Active',
    })
    setShowCreateModal(true)
  }

  // Filter trips by LR number
  const filteredAgentTrips = useMemo(() => {
    if (!lrSearchTerm) return agentTrips
    return agentTrips.filter(trip => {
      const lrNum = (trip.lrNumber || trip.tripId || '').toString().toLowerCase()
      return lrNum.includes(lrSearchTerm.toLowerCase().trim())
    })
  }, [agentTrips, lrSearchTerm])


  const handleView = (trip) => {
    navigate(`/agent/trips/${trip.id}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Find branch ID if user has branch
      let branchId = null
      if (user?.branch) {
        const { branchAPI } = await import('../../services/api')
        const branches = await branchAPI.getBranches()
        const branch = branches.find(b => b.name === user.branch)
        if (branch) {
          branchId = branch.id || branch._id
        }
      }

      // Ensure agentId is set correctly (use id or _id, both are same)
      const agentId = user?.id || user?._id
      
      const tripData = {
        lrNumber: formData.lrNumber,
        tripId: formData.lrNumber || `TR${Date.now()}`,
        date: formData.date,
        truckNumber: formData.truckNumber,
        companyName: formData.companyName,
        routeFrom: formData.routeFrom,
        routeTo: formData.routeTo,
        tonnage: parseFloat(formData.tonnage) || 0,
        lrSheet: formData.lrSheet || 'Not Received',
        isBulk: formData.isBulk,
        freightAmount: formData.isBulk ? 0 : (parseFloat(formData.freightAmount) || 0),
        advancePaid: formData.isBulk ? 0 : (parseFloat(formData.advancePaid) || 0),
        agentId: agentId, // Explicitly set agentId
        branchId: branchId,
      }
      

      // Create new trip (API will auto-create ledger entry)
      const newTrip = await addTrip(tripData)
      
      toast.success('Trip created successfully! Ledger entry added.', {
        position: 'top-right',
        autoClose: 2000,
      })
      setShowCreateModal(false)
      
      // Reload trips multiple times to ensure data is fetched
      await loadTrips()
      setTimeout(async () => {
        await loadTrips()
        // Force re-render by updating state
        setAgentTrips([])
        setTimeout(async () => {
          await loadTrips()
        }, 500)
      }, 1000)

      setFormData({
        lrNumber: '',
        date: new Date().toISOString().split('T')[0],
        truckNumber: '',
        companyName: '',
        routeFrom: '',
        routeTo: '',
        tonnage: '',
        lrSheet: '',
        isBulk: false,
        freightAmount: '',
        advancePaid: '',
        balanceAmount: '',
        status: 'Active',
      })
    } catch (error) {
      toast.error(error.message || 'Failed to create trip', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleRaiseDispute = (trip) => {
    if (trip.status !== 'Active') {
      toast.error('Disputes can only be raised for Active trips', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    toast.info('Redirecting to dispute form...', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Trips</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your trips and deliveries
            {user?.branch && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Branch: {user.branch}</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
          <button
            onClick={handleCreate}
            className="btn-3d-primary flex items-center justify-center gap-2 px-4 py-2 whitespace-nowrap text-sm sm:text-base"
          >
            <FiPlus size={18} className="sm:w-5 sm:h-5" />
            <span>Create Trip</span>
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="card overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">LR No</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Agent</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">LR Sheet</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Route</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgentTrips.length > 0 ? (
              filteredAgentTrips.map((trip) => (
                <tr key={trip.id || trip._id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                  <td className="py-4 px-4 text-text-primary">{formatDate(trip.date) || 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary font-medium">{trip.lrNumber || trip.tripId}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trip.isBulk ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trip.type || (trip.isBulk ? 'Bulk' : 'Normal')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{trip.agent || user?.name || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : trip.status === 'Dispute'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{trip.lrSheet || 'Not Received'}</td>
                  <td className="py-4 px-4 text-text-primary">{trip.route || `${trip.routeFrom || ''} - ${trip.routeTo || ''}`}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(trip)}
                        className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-text-muted">
                  {lrSearchTerm ? `No trips found matching "${lrSearchTerm}"` : 'No trips found. Create your first trip!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AgentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setFormData({
            lrNumber: '',
            date: new Date().toISOString().split('T')[0],
            truckNumber: '',
            companyName: '',
            routeFrom: '',
            routeTo: '',
            tonnage: '',
            lrSheet: '',
            isBulk: false,
            freightAmount: '',
            advancePaid: '',
            balanceAmount: '',
            status: 'Active',
          })
        }}
        title="Create New Trip"
        size="lg"
      >
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This screen is for creating a new trip with basic details only. 
            To manage expenses, payments, and close the trip, use the Trip Management screen after creating.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                L.R. No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lrNumber}
                onChange={(e) => setFormData({ ...formData, lrNumber: e.target.value })}
                className="input-field-3d"
                placeholder="LR001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field-3d"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Truck Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.truckNumber}
                onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                className="input-field-3d"
                placeholder="MH01AB1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="input-field-3d"
                placeholder="ABC Transport"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Route <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">From</label>
                <input
                  type="text"
                  required
                  value={formData.routeFrom}
                  onChange={(e) => setFormData({ ...formData, routeFrom: e.target.value })}
                  className="input-field-3d"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">To</label>
                <input
                  type="text"
                  required
                  value={formData.routeTo}
                  onChange={(e) => setFormData({ ...formData, routeTo: e.target.value })}
                  className="input-field-3d"
                  placeholder="Delhi"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tonnage (Tons) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.tonnage}
                onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                className="input-field-3d"
                placeholder="10.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                LR Sheet Status
              </label>
              <select
                value={formData.lrSheet || 'Not Received'}
                onChange={(e) => setFormData({ ...formData, lrSheet: e.target.value })}
                className="input-field-3d"
              >
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBulk"
              checked={formData.isBulk}
              onChange={(e) => setFormData({ ...formData, isBulk: e.target.checked })}
              className="w-4 h-4 text-primary border-secondary rounded focus:ring-primary"
            />
            <label htmlFor="isBulk" className="text-sm font-medium text-text-secondary">
              Bulk Trip (Freight/Advance/Balance ignored in settlement)
            </label>
          </div>

          {!formData.isBulk && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Freight Amount (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required={!formData.isBulk}
                  step="0.01"
                  min="0"
                  value={formData.freightAmount}
                  onChange={(e) => setFormData({ ...formData, freightAmount: e.target.value })}
                  className="input-field-3d"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Advance Paid (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required={!formData.isBulk}
                  step="0.01"
                  min="0"
                  value={formData.advancePaid}
                  onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                  className="input-field-3d"
                  placeholder="20000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Balance Amount (Rs)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.balanceAmount}
                  className="input-field-3d bg-background"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          )}
          {formData.isBulk && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> For Bulk trips, Freight, Advance, and Balance amounts are ignored in settlement calculations.
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
              Create Trip
            </button>
          </div>
        </form>
      </AgentModal>

    </div>
  )
}

export default AgentTrips
