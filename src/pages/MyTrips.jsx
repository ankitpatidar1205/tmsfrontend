import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiEye, FiEdit, FiAlertCircle } from 'react-icons/fi'
import Modal from '../components/Modal'
import { toast } from 'react-toastify'

const MyTrips = () => {
  const { user } = useAuth()
  
  // Mock data - filtered to show only agent's trips
  const [trips, setTrips] = useState([
    { id: 1, tripId: 'TR001', route: 'Mumbai - Delhi', status: 'Active', freight: 50000, advance: 20000, balance: 30000 },
    { id: 2, tripId: 'TR045', route: 'Delhi - Bangalore', status: 'Completed', freight: 45000, advance: 20000, balance: 25000 },
    { id: 3, tripId: 'TR023', route: 'Bangalore - Chennai', status: 'Active', freight: 30000, advance: 15000, balance: 15000 },
  ])

  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)

  const handleView = (trip) => {
    setSelectedTrip(trip)
    setShowViewModal(true)
  }

  const handleRaiseDispute = (trip) => {
    if (trip.status !== 'Active') {
      toast.error('Disputes can only be raised for Active trips', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    // Navigate to disputes page or open dispute modal
    toast.info('Redirecting to dispute form...', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Trips</h1>
          <p className="text-text-secondary">View and manage your assigned trips</p>
        </div>
      </div>

      {/* Trips Table */}
      <div className="card overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Trip ID</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Route</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Freight</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Advance</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Balance</th>
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
                        : trip.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-text-primary">Rs {trip.freight.toLocaleString()}</td>
                <td className="py-4 px-4 text-text-primary">Rs {trip.advance.toLocaleString()}</td>
                <td className="py-4 px-4 text-text-primary font-medium">Rs {trip.balance.toLocaleString()}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(trip)}
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="View"
                    >
                      <FiEye size={18} />
                    </button>
                    {trip.status === 'Active' && (
                      <button
                        onClick={() => handleRaiseDispute(trip)}
                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="Raise Dispute"
                      >
                        <FiAlertCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <label className="block text-sm font-medium text-text-secondary mb-1">Advance</label>
              <p className="text-text-primary">Rs {selectedTrip.advance.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Balance</label>
              <p className="text-text-primary font-semibold">Rs {selectedTrip.balance.toLocaleString()}</p>
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

export default MyTrips

