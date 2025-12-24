import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Modal from '../components/Modal'
import { toast } from 'react-toastify'

const Disputes = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'
  const isAgent = user?.role === 'Agent'

  // Mock data
  const [disputes, setDisputes] = useState([
    { 
      id: 1, 
      disputeId: 'D001', 
      tripId: 'TR001', 
      agent: 'John Doe', 
      reason: 'Amount discrepancy', 
      amount: 5000, 
      status: 'Open', 
      createdAt: '2024-01-15' 
    },
    { 
      id: 2, 
      disputeId: 'D002', 
      tripId: 'TR045', 
      agent: 'Jane Smith', 
      reason: 'Route issue', 
      amount: 3000, 
      status: 'Resolved', 
      createdAt: '2024-01-14' 
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [formData, setFormData] = useState({
    tripId: '',
    reason: '',
    amount: '',
  })

  // Mock active trips for agent
  const activeTrips = [
    { id: 1, tripId: 'TR001', route: 'Mumbai - Delhi' },
    { id: 2, tripId: 'TR023', route: 'Bangalore - Chennai' },
  ]

  const handleCreate = () => {
    setFormData({ tripId: '', reason: '', amount: '' })
    setShowCreateModal(true)
  }

  const handleView = (dispute) => {
    setSelectedDispute(dispute)
    setShowViewModal(true)
  }

  const handleResolve = (id) => {
    setDisputes(
      disputes.map((dispute) =>
        dispute.id === id ? { ...dispute, status: 'Resolved' } : dispute
      )
    )
    toast.success('Dispute resolved successfully!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.tripId || !formData.reason || !formData.amount) {
      toast.error('Please fill all fields', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    const newDispute = {
      id: Date.now(),
      disputeId: `D${String(Date.now()).slice(-3)}`,
      tripId: formData.tripId,
      agent: user?.name || 'Agent',
      reason: formData.reason,
      amount: parseFloat(formData.amount),
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setDisputes([...disputes, newDispute])
    toast.success('Dispute raised successfully!', {
      position: 'top-right',
      autoClose: 2000,
    })
    setShowCreateModal(false)
    setFormData({ tripId: '', reason: '', amount: '' })
  }

  // Filter disputes for agents (only their own)
  const displayedDisputes = isAgent
    ? disputes.filter((d) => d.agent === user?.name)
    : disputes

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
            {displayedDisputes.map((dispute) => (
              <tr key={dispute.id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                <td className="py-4 px-4 text-text-primary font-medium">{dispute.disputeId}</td>
                <td className="py-4 px-4 text-text-primary">{dispute.tripId}</td>
                {!isAgent && <td className="py-4 px-4 text-text-primary">{dispute.agent}</td>}
                <td className="py-4 px-4 text-text-primary">{dispute.reason}</td>
                <td className="py-4 px-4 text-text-primary">Rs {dispute.amount.toLocaleString()}</td>
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
                <td className="py-4 px-4 text-text-primary">{dispute.createdAt}</td>
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
            ))}
          </tbody>
        </table>
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
              <p className="text-text-primary">{selectedDispute.tripId}</p>
            </div>
            {!isAgent && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Agent</label>
                <p className="text-text-primary">{selectedDispute.agent}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
              <p className="text-text-primary">{selectedDispute.reason}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
              <p className="text-text-primary font-semibold">Rs {selectedDispute.amount.toLocaleString()}</p>
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
              <p className="text-text-primary">{selectedDispute.createdAt}</p>
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
