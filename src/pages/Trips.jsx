import React, { useState } from 'react'
import { FiPlus, FiEye, FiEdit, FiTrash2, FiTruck } from 'react-icons/fi'
import Modal from '../components/Modal'
import { toast } from 'react-toastify'

const Trips = () => {
  const [trips, setTrips] = useState([
    { id: 1, tripId: 'TR001', route: 'Mumbai - Delhi', status: 'Active', freight: 50000, agent: 'John Doe' },
    { id: 2, tripId: 'TR002', route: 'Delhi - Bangalore', status: 'Completed', freight: 45000, agent: 'Jane Smith' },
    { id: 3, tripId: 'TR003', route: 'Bangalore - Chennai', status: 'Active', freight: 30000, agent: 'John Doe' },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [formData, setFormData] = useState({
    tripId: '',
    route: '',
    status: 'Active',
    freight: '',
    agent: '',
  })

  const handleCreate = () => {
    setFormData({ tripId: '', route: '', status: 'Active', freight: '', agent: '' })
    setShowCreateModal(true)
  }

  const handleView = (trip) => {
    setSelectedTrip(trip)
    setShowViewModal(true)
  }

  const handleEdit = (trip) => {
    setSelectedTrip(trip)
    setFormData({
      tripId: trip.tripId,
      route: trip.route,
      status: trip.status,
      freight: trip.freight,
      agent: trip.agent,
    })
    setShowEditModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter((trip) => trip.id !== id))
      toast.success('Trip deleted successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (showCreateModal) {
      const newTrip = {
        id: Date.now(),
        ...formData,
        freight: parseFloat(formData.freight),
      }
      setTrips([...trips, newTrip])
      toast.success('Trip created successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    } else if (showEditModal) {
      setTrips(
        trips.map((trip) =>
          trip.id === selectedTrip.id
            ? { ...trip, ...formData, freight: parseFloat(formData.freight) }
            : trip
        )
      )
      toast.success('Trip updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
    setShowCreateModal(false)
    setShowEditModal(false)
    setFormData({ tripId: '', route: '', status: 'Active', freight: '', agent: '' })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Trips</h1>
          <p className="text-text-secondary">Manage your trips and deliveries</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-3d-primary flex items-center gap-2 px-4 py-2"
        >
          <FiPlus size={20} />
          <span>Create Trip</span>
        </button>
      </div>

      {/* Trips Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Trip ID</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Route</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Freight</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Agent</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                <td className="py-4 px-4 text-text-primary font-medium">{trip.tripId}</td>
                <td className="py-4 px-4 text-text-primary">{trip.route}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-text-primary">Rs {trip.freight.toLocaleString()}</td>
                <td className="py-4 px-4 text-text-primary">{trip.agent}</td>
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
                      title="Edit"
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Trip"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Trip ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              className="input-field-3d"
              placeholder="TR001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Route <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="input-field-3d"
              placeholder="Mumbai - Delhi"
            />
          </div>
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Freight (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.freight}
              onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
              className="input-field-3d"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Agent <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.agent}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              className="input-field-3d"
              placeholder="John Doe"
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
              Create Trip
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Trip Details"
        size="md"
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Trip ID</label>
              <p className="text-text-primary font-medium">{selectedTrip.tripId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Route</label>
              <p className="text-text-primary">{selectedTrip.route}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTrip.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {selectedTrip.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Freight</label>
              <p className="text-text-primary">Rs {selectedTrip.freight.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Agent</label>
              <p className="text-text-primary">{selectedTrip.agent}</p>
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Trip"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Trip ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              className="input-field-3d"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Route <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="input-field-3d"
            />
          </div>
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Freight (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.freight}
              onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
              className="input-field-3d"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Agent <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.agent}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              className="input-field-3d"
            />
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
              Update Trip
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Trips

