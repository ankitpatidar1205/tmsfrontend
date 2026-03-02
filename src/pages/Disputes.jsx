import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { FiPlus, FiEye, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Modal from '../components/Modal'
import { toast } from 'react-toastify'

const Disputes = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'
  const isAgent = user?.role === 'Agent'

  const { disputes, disputesPagination, loadDisputes, loading } = useData()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [formData, setFormData] = useState({
    tripId: '',
    reason: '',
    amount: '',
  })

  // Mock active trips for agent (ideally this should also come from API)
  const activeTrips = [
    { id: 1, tripId: 'TR001', route: 'Mumbai - Delhi' },
    { id: 2, tripId: 'TR023', route: 'Bangalore - Chennai' },
  ]

  // Load disputes on mount
  useEffect(() => {
    loadDisputes()
  }, [])

  const handleCreate = () => {
    setFormData({ tripId: '', reason: '', amount: '' })
    setShowCreateModal(true)
  }

  const handleView = (dispute) => {
    setSelectedDispute(dispute)
    setShowViewModal(true)
  }

  const handleResolve = (id) => {
    toast.info('Resolve functionality not connected to backend yet')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.info('Create functionality not connected to backend yet')
    setShowCreateModal(false)
    setFormData({ tripId: '', reason: '', amount: '' })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {isAgent ? 'Raise Dispute' : 'Disputes'}
          </h1>
          <p className="text-text-secondary">
            {isAgent ? 'Raise disputes for your active trips' : 'Manage and resolve disputes'}
          </p>
        </div>
        {isAgent && (
          <button
            onClick={handleCreate}
            className="btn-3d-primary flex items-center gap-2 px-4 py-2"
          >
            <FiPlus size={20} />
            <span>Raise Dispute</span>
          </button>
        )}
      </div>

      {/* Disputes Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading disputes...</div>
        ) : (
          <>
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b-2 border-secondary">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Dispute ID</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Trip ID</th>
                  {!isAgent && <th className="text-left py-3 px-4 text-text-secondary font-medium">Agent</th>}
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Reason</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.length > 0 ? (
                  disputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                      <td className="py-4 px-4 text-text-primary font-medium">{dispute.disputeId}</td>
                      <td className="py-4 px-4 text-text-primary">{dispute.tripId?.lrNumber || dispute.tripId || 'N/A'}</td>
                      {!isAgent && <td className="py-4 px-4 text-text-primary">{typeof dispute.agent === 'string' ? dispute.agent : (dispute.agent?.name || 'N/A')}</td>}
                      <td className="py-4 px-4 text-text-primary">{dispute.reason}</td>
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
                      <td className="py-4 px-4 text-text-primary">{dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(dispute)}
                            className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          {isAdmin && dispute.status === 'Open' && (
                            <button
                              onClick={() => handleResolve(dispute.id)}
                              className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                              title="Resolve"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAgent ? 7 : 8} className="text-center py-8 text-text-secondary">
                      No disputes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {disputesPagination && disputesPagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-text-secondary">
                  Showing <span className="font-medium">{(disputesPagination.page - 1) * disputesPagination.limit + 1}</span> to <span className="font-medium">{Math.min(disputesPagination.page * disputesPagination.limit, disputesPagination.total)}</span> of <span className="font-medium">{disputesPagination.total}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadDisputes({ page: disputesPagination.page - 1, limit: disputesPagination.limit })}
                    disabled={disputesPagination.page === 1}
                    className={`p-2 rounded-lg border ${
                      disputesPagination.page === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm'
                    }`}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium text-text-primary px-2">
                    Page {disputesPagination.page} of {disputesPagination.pages}
                  </span>
                  <button
                    onClick={() => loadDisputes({ page: disputesPagination.page + 1, limit: disputesPagination.limit })}
                    disabled={disputesPagination.page === disputesPagination.pages}
                    className={`p-2 rounded-lg border ${
                      disputesPagination.page === disputesPagination.pages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm'
                    }`}
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Dispute Modal (Agent Only) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Raise Dispute"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Select Trip <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              className="input-field-3d"
            >
              <option value="">Select an active trip</option>
              {activeTrips.map((trip) => (
                <option key={trip.id} value={trip.tripId}>
                  {trip.tripId} - {trip.route}
                </option>
              ))}
            </select>
            <p className="text-text-muted text-xs mt-1">
              Only active trips can have disputes raised
            </p>
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
              placeholder="Describe the issue..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Disputed Amount (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field-3d"
              placeholder="5000"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-3d-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-3d-primary px-4 py-2">
              Raise Dispute
            </button>
          </div>
        </form>
      </Modal>

      {/* View Dispute Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Dispute Details"
        size="md"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Dispute ID</label>
              <p className="text-text-primary font-medium">{selectedDispute.disputeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Trip ID</label>
              <p className="text-text-primary">{selectedDispute.tripId?.lrNumber || selectedDispute.tripId || 'N/A'}</p>
            </div>
            {!isAgent && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Agent</label>
                <p className="text-text-primary">{typeof selectedDispute.agent === 'string' ? selectedDispute.agent : (selectedDispute.agent?.name || 'N/A')}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <p className="text-text-primary">{selectedDispute.reason}</p>
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
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Created At</label>
              <p className="text-text-primary">{selectedDispute.createdAt ? new Date(selectedDispute.createdAt).toLocaleDateString() : 'N/A'}</p>
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
      </Modal>
    </div>
  )
}

export default Disputes
