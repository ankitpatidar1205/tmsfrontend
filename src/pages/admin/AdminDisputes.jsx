import React, { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { FiEye, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi'
import AdminModal from '../../components/modals/AdminModal'
import AgentFilter from '../../components/AgentFilter'
import { toast } from 'react-toastify'

const AdminDisputes = () => {
  const { disputes, updateDispute, updateTrip } = useData()
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [lrSearchTerm, setLrSearchTerm] = useState('')

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
  const [selectedDispute, setSelectedDispute] = useState(null)

  const handleView = (dispute) => {
    setSelectedDispute(dispute)
    setShowViewModal(true)
  }

  const handleResolve = async (id) => {
    const dispute = disputes.find(d => d.id === id || d._id === id)
    if (!dispute) {
      toast.error('Dispute not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    
    if (dispute.status === 'Resolved') {
      toast.error('Dispute is already resolved', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    
    try {
      const disputeId = dispute.id || dispute._id
      await updateDispute(disputeId, { status: 'Resolved' })
      toast.success('Dispute resolved successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      toast.error(error.message || 'Failed to resolve dispute', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Disputes</h1>
          <p className="text-text-secondary">View and resolve all disputes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
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
                          onClick={() => handleResolve(dispute.id || dispute._id)}
                          className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="Resolve"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                      )}
                      {dispute.status === 'Resolved' && (
                        <span className="px-2 py-1 text-xs text-green-600 font-medium" title="Already Resolved">
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
                <p className="text-text-primary">{selectedDispute.agent || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                <p className="text-text-primary">{selectedDispute.type || 'N/A'}</p>
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
                  {selectedDispute.status}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <p className="text-text-primary">{selectedDispute.reason || 'N/A'}</p>
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
      </AdminModal>
    </div>
  )
}

export default AdminDisputes
