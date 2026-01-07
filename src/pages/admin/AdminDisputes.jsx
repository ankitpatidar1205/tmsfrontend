import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { FiEye, FiCheckCircle, FiSearch, FiX, FiExternalLink, FiAlertTriangle } from 'react-icons/fi'
import AdminModal from '../../components/modals/AdminModal'
import AgentFilter from '../../components/AgentFilter'
import { toast } from 'react-toastify'

const AdminDisputes = () => {
  const navigate = useNavigate()
  const { disputes, updateDispute, trips, loadTrips } = useData()
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [lrSearchTerm, setLrSearchTerm] = useState('')

  // Load trips if not loaded (for freight info)
  useEffect(() => {
    if (!trips || trips.length === 0) {
      loadTrips()
    }
  }, [])

  const filteredDisputes = useMemo(() => {
    let filtered = disputes
    
    // Filter by agent
    if (selectedAgentId) {
      filtered = filtered.filter(d => 
        d.agentId === selectedAgentId || 
        d.agentId?._id === selectedAgentId ||
        d.agentId?.id === selectedAgentId
      )
    }
    
    // Filter by LR number
    if (lrSearchTerm) {
      filtered = filtered.filter(d => 
        d.lrNumber?.toLowerCase().includes(lrSearchTerm.toLowerCase()) ||
        d.tripId?.toLowerCase().includes(lrSearchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [disputes, selectedAgentId, lrSearchTerm])

  const [showViewModal, setShowViewModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  
  // Resolve Form State
  const [resolveData, setResolveData] = useState({
    lrNumber: '',
    date: '',
    truckNumber: '',
    driverPhoneNumber: '',
    companyName: '',
    routeFrom: '',
    routeTo: '',
    tonnage: '',
    freight: '',
    advance: '',
    originalFreight: 0,
    originalAdvance: 0,
    freightDiff: 0,
    advanceDiff: 0,
    // Deductions/Expenses
    cess: '',
    kata: '',
    excessTonnage: '',
    halting: '',
    expenses: '',
    beta: '',
    others: '',
    othersReason: ''
  })

  const handleView = (dispute) => {
    setSelectedDispute(dispute)
    setShowViewModal(true)
  }

  const openResolveModal = (dispute) => {
    // Find associated trip to get current details
    const trip = trips.find(t => t.id === dispute.tripId || t._id === dispute.tripId)
    
    // Default values if trip not found (shouldn't happen)
    const currentFreight = trip ? (trip.freight || 0) : 0
    const currentAdvance = trip ? (trip.advance || 0) : 0
    const deductions = trip?.deductions || {}

    setResolveData({
        lrNumber: trip?.lrNumber || '',
        date: trip?.date || '',
        truckNumber: trip?.truckNumber || '',
        driverPhoneNumber: trip?.driverPhoneNumber || '',
        companyName: trip?.companyName || '',
        routeFrom: trip?.routeFrom || '',
        routeTo: trip?.routeTo || '',
        tonnage: trip?.tonnage || '',
        freight: currentFreight, // Pre-fill with CURRENT freight, allowing admin to edit
        advance: currentAdvance, // Pre-fill with CURRENT advance
        originalFreight: currentFreight,
        originalAdvance: currentAdvance,
        freightDiff: 0,
        advanceDiff: 0,
        // Pre-fill deductions
        cess: deductions.cess || 0,
        kata: deductions.kata || 0,
        excessTonnage: deductions.excessTonnage || 0,
        halting: deductions.halting || 0,
        expenses: deductions.expenses || 0,
        beta: deductions.beta || 0,
        others: deductions.others || 0,
        othersReason: deductions.othersReason || ''
    })
    setSelectedDispute(dispute)
    setShowResolveModal(true)
  }

  // Handle submit sends full object
  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDispute) return
    
    setIsResolving(true)
    try {
      const disputeId = selectedDispute.id || selectedDispute._id
      // Pass all updates to backend with correct mapping
      const payload = {
          status: 'Resolved',
          ...resolveData,
          newFreight: resolveData.freight, // Map freight to newFreight
          newAdvance: resolveData.advance  // Map advance to newAdvance
      }
      
      await updateDispute(disputeId, payload)
      
      toast.success(`Dispute resolved! Trip details updated successfully.`, {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Close modal and refresh
      setShowResolveModal(false)
      setShowViewModal(false) 
      setSelectedDispute(null)
      
      // Reload trips to reflect new details
      loadTrips()
      
    } catch (error) {
      toast.error(error.message || 'Failed to resolve dispute', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Disputes</h1>
          <p className="text-xs sm:text-sm text-text-secondary">View and resolve all disputes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          {/* LR Number Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
            <input
              type="text"
              value={lrSearchTerm}
              onChange={(e) => setLrSearchTerm(e.target.value)}
              placeholder="Search by LR Number..."
              className="input-field-3d pl-10 pr-10 w-full"
            />
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
          <AgentFilter
            selectedAgent={selectedAgentId}
            onAgentChange={setSelectedAgentId}
          />
        </div>
      </div>

      {/* Disputes Table */}
      <div className="card overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Created At</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">LR No</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Agent</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Reason</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisputes.length > 0 ? (
              filteredDisputes.map((dispute, index) => (
                <tr key={dispute.id || dispute._id || `dispute-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                  <td className="py-4 px-4 text-text-primary">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-text-primary font-medium">{dispute.lrNumber || 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary">{dispute.agent?.name || dispute.agent || 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary">{dispute.type || 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary">Rs {(dispute.amount || 0).toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dispute.status === 'Open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{dispute.reason || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(dispute)}
                        className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      {dispute.status === 'Open' && (
                        <button
                          onClick={() => openResolveModal(dispute)}
                          className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Resolve"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                      )}
                      {dispute.status === 'Resolved' && (
                        <span className="px-2 py-1 text-xs text-green-600 font-medium whitespace-nowrap" title="Already Resolved">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-text-muted">
                  No disputes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <AdminModal
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
                <p className="text-text-primary">{new Date(selectedDispute.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">LR Number</label>
                <p className="text-text-primary font-medium">{selectedDispute.lrNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Agent</label>
                <p className="text-text-primary">{selectedDispute.agent?.name || selectedDispute.agent || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                <p className="text-text-primary">{selectedDispute.type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Disputed Amount</label>
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
                  {selectedDispute.status}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <p className="text-text-primary bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedDispute.reason || 'N/A'}</p>
            </div>
            
            {/* Trip Details Link */}
            {selectedDispute.tripId && (
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Related Trip</p>
                    <p className="text-xs text-blue-600">Click to view full trip details</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      navigate(`/admin/trips/${selectedDispute.tripId}`)
                    }}
                    className="btn-3d-primary flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <FiExternalLink size={16} />
                    <span>View Trip</span>
                  </button>
                </div>
              </div>
            )}
            
            {selectedDispute.resolvedBy && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">Resolved By</label>
                  <p className="text-text-primary font-semibold">{selectedDispute.resolvedBy?.name || 'Admin'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">Resolved At</label>
                  <p className="text-text-primary font-semibold">
                    {selectedDispute.resolvedAt 
                      ? new Date(selectedDispute.resolvedAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-secondary">
              {selectedDispute.status === 'Open' && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    openResolveModal(selectedDispute)
                  }}
                  className="btn-3d-primary flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700"
                >
                  <FiCheckCircle size={18} />
                  <span>Resolve Dispute</span>
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-3d-secondary px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Resolve Modal with Full Trip Edit */}
      <AdminModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Dispute - Edit Trip Details"
        size="lg" // Larger modal for full form
      >
        {selectedDispute && (
            <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Dispute Context Banner */}
                <div className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                    selectedDispute.type?.toUpperCase().includes('EXCESS') 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                    <div>
                        <span className="text-xs uppercase font-bold tracking-wider opacity-70 block mb-1">Dispute Type</span>
                        <div className="font-bold text-lg flex items-center gap-2">
                            <FiAlertTriangle className="flex-shrink-0" />
                            {selectedDispute.type}
                        </div>
                    </div>
                    <div className="md:text-right">
                        <span className="text-xs uppercase font-bold tracking-wider opacity-70 block mb-1">Reason</span>
                        <div className="font-medium text-sm">{selectedDispute.reason}</div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Review & Correct Trip Details:</strong> Make any necessary changes below. 
                        Financial changes (Freight/Advance) will automatically update the Ledger.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Fields */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">LR Number</label>
                        <input 
                            type="text" 
                            name="lrNumber"
                            value={resolveData.lrNumber}
                            onChange={(e) => setResolveData({...resolveData, lrNumber: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                        <input 
                            type="date" 
                            name="date"
                            value={resolveData.date ? new Date(resolveData.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setResolveData({...resolveData, date: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Truck Number</label>
                        <input 
                            type="text" 
                            name="truckNumber"
                            value={resolveData.truckNumber}
                            onChange={(e) => setResolveData({...resolveData, truckNumber: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Tonnage</label>
                        <input 
                            type="number" 
                            name="tonnage"
                            step="0.01"
                            value={resolveData.tonnage}
                            onChange={(e) => setResolveData({...resolveData, tonnage: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Route From</label>
                        <input 
                            type="text" 
                            name="routeFrom"
                            value={resolveData.routeFrom}
                            onChange={(e) => setResolveData({...resolveData, routeFrom: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Route To</label>
                        <input 
                            type="text" 
                            name="routeTo"
                            value={resolveData.routeTo}
                            onChange={(e) => setResolveData({...resolveData, routeTo: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Driver Phone</label>
                        <input 
                            type="text" 
                            name="driverPhoneNumber"
                            value={resolveData.driverPhoneNumber}
                            onChange={(e) => setResolveData({...resolveData, driverPhoneNumber: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
                        <input 
                            type="text" 
                            name="companyName"
                            value={resolveData.companyName}
                            onChange={(e) => setResolveData({...resolveData, companyName: e.target.value})}
                            className="input-field-3d w-full"
                        />
                    </div>
                </div>

                <hr className="border-secondary my-4" />

                <h3 className="font-semibold text-text-primary mb-3">Expenses & Deductions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Cess</label>
                        <input type="number" name="cess" value={resolveData.cess} onChange={(e) => setResolveData({...resolveData, cess: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Kata</label>
                        <input type="number" name="kata" value={resolveData.kata} onChange={(e) => setResolveData({...resolveData, kata: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Excess Tonnage</label>
                        <input type="number" name="excessTonnage" value={resolveData.excessTonnage} onChange={(e) => setResolveData({...resolveData, excessTonnage: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Halting</label>
                        <input type="number" name="halting" value={resolveData.halting} onChange={(e) => setResolveData({...resolveData, halting: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Expenses</label>
                        <input type="number" name="expenses" value={resolveData.expenses} onChange={(e) => setResolveData({...resolveData, expenses: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Beta</label>
                        <input type="number" name="beta" value={resolveData.beta} onChange={(e) => setResolveData({...resolveData, beta: e.target.value})} className="input-field-3d w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Others</label>
                        <input type="number" name="others" value={resolveData.others} onChange={(e) => setResolveData({...resolveData, others: e.target.value})} className="input-field-3d w-full" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Others Reason</label>
                        <input type="text" name="othersReason" value={resolveData.othersReason} onChange={(e) => setResolveData({...resolveData, othersReason: e.target.value})} className="input-field-3d w-full" placeholder="Reason..." />
                    </div>
                </div>

                <hr className="border-secondary my-4" />

                {/* Financial Fields */}
                <h3 className="font-semibold text-text-primary mb-3">Financial Corrections</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    {/* Freight Section */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Total Freight</label>
                        <input 
                            type="number" 
                            name="freight"
                            min="0"
                            value={resolveData.freight}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setResolveData(prev => ({
                                    ...prev, 
                                    freight: e.target.value,
                                    freightDiff: val - prev.originalFreight
                                }));
                            }}
                            className="input-field-3d w-full font-bold text-lg"
                        />
                    </div>

                    {/* Advance Section */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Advance Amount</label>
                        <input 
                            type="number" 
                            name="advance"
                            min="0"
                            value={resolveData.advance}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setResolveData(prev => ({
                                    ...prev, 
                                    advance: e.target.value,
                                    advanceDiff: val - prev.originalAdvance
                                }));
                            }}
                            className="input-field-3d w-full font-bold text-lg"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary mt-2">
                    <button
                        type="button"
                        onClick={() => setShowResolveModal(false)}
                        className="btn-3d-secondary px-4 py-2"
                        disabled={isResolving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isResolving}
                        className="btn-3d-primary flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700"
                    >
                        {isResolving ? (
                            <span>Resolving...</span>
                        ) : (
                            <>
                                <FiCheckCircle size={18} />
                                <span>Confirm & Resolve</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        )}
      </AdminModal>
    </div>
  )
}

export default AdminDisputes
