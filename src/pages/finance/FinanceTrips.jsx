import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { FiEye, FiSearch, FiX } from 'react-icons/fi'
import AgentFilter from '../../components/AgentFilter'

const FinanceTrips = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { trips } = useData()
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
    let filtered = trips
    
    // Filter by agent
    if (selectedAgentId) {
      filtered = filtered.filter(t => 
        t.agentId === selectedAgentId || 
        t.agentId?._id === selectedAgentId ||
        t.agentId?.id === selectedAgentId
      )
    }
    
    // Filter by LR Number
    if (lrSearchTerm) {
      filtered = filtered.filter(t => {
        const lrNum = (t.lrNumber || t.tripId || '').toString().toLowerCase()
        return lrNum.includes(lrSearchTerm.toLowerCase().trim())
      })
    }
    
    return filtered
  }, [trips, selectedAgentId, lrSearchTerm])

  const handleView = (trip) => {
    navigate(`/finance/trips/${trip.id}`)
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Trips</h1>
          <p className="text-xs sm:text-sm text-text-secondary">View all trips and their financial status</p>
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
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <tr key={trip.id || trip._id || `trip-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
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
                          : trip.status === 'In Dispute' || trip.status === 'Dispute'
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
                    <button
                      onClick={() => handleView(trip)}
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
                <td colSpan="8" className="py-8 text-center text-text-muted">
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default FinanceTrips
