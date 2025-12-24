import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { FiEye, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import AdminModal from '../../components/modals/AdminModal'
import AgentFilter from '../../components/AgentFilter'
import { toast } from 'react-toastify'

const AdminTrips = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { trips, updateTrip, deleteTrip } = useData()
  const [selectedAgentId, setSelectedAgentId] = useState(null)
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


  const filteredTrips = useMemo(() => {
    let filtered = [...trips]
    
    // Filter by agent
    if (selectedAgentId) {
      filtered = filtered.filter(t => 
        t.agentId === selectedAgentId || 
        t.agentId?._id === selectedAgentId ||
        t.agentId?.id === selectedAgentId
      )
    }
    
    // Filter by LR number
    if (lrSearchTerm) {
      filtered = filtered.filter(t => 
        t.lrNumber?.toLowerCase().includes(lrSearchTerm.toLowerCase()) ||
        t.tripId?.toLowerCase().includes(lrSearchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [trips, selectedAgentId, lrSearchTerm])

  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [formData, setFormData] = useState({
    status: 'Active',
  })

  const handleView = (trip) => {
    navigate(`/admin/trips/${trip.id || trip._id}`)
  }

  const handleEdit = (trip) => {
    setSelectedTrip(trip)
    setFormData({
      status: trip.status,
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id)
        toast.success('Trip deleted successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
      } catch (error) {
        toast.error(error.message || 'Failed to delete trip', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (showEditModal && selectedTrip) {
      try {
        const tripId = selectedTrip.id || selectedTrip._id
        await updateTrip(tripId, {
          status: formData.status,
        })
        toast.success('Trip updated successfully!', {
          position: 'top-right',
          autoClose: 2000,
        })
        setShowEditModal(false)
        setFormData({ status: 'Active' })
      } catch (error) {
        toast.error(error.message || 'Failed to update trip', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Trips</h1>
          <p className="text-xs sm:text-sm text-text-secondary">View and manage all trips from all agents</p>
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
          <AgentFilter
            selectedAgent={selectedAgentId}
            onAgentChange={setSelectedAgentId}
          />
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
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Attachments</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <tr key={trip.id || trip._id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                  <td className="py-4 px-4 text-text-primary">{trip.date ? new Date(trip.date).toLocaleDateString('en-IN') : 'N/A'}</td>
                  <td className="py-4 px-4 text-text-primary font-medium">{trip.lrNumber || trip.tripId}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trip.isBulk ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trip.type || (trip.isBulk ? 'Bulk' : 'Normal')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{trip.agent?.name || trip.agentDetails?.name || trip.agent || 'N/A'}</td>
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
                    {trip.attachments && trip.attachments.length > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trip.attachments.length} file{trip.attachments.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-text-muted text-sm">No attachments</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(trip)}
                        className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(trip)}
                        className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="Edit Status"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-text-muted">
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Edit Modal - Only Status */}
      <AdminModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Trip Status"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field-3d"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Dispute">Dispute</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-3d-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-3d-primary px-4 py-2">
              Update Status
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

export default AdminTrips
