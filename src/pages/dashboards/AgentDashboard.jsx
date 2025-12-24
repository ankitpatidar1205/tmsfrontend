import React, { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FiTruck, FiDollarSign, FiAlertCircle, FiCheckCircle, FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AgentDashboard = () => {
  const { user } = useAuth()
  const { trips, disputes, ledger, getTripsByAgent, getTripsByBranch } = useData()

  // Filter trips by agent ID (handle both object and string IDs)
  const agentTrips = useMemo(() => {
    if (user?.role !== 'Agent') return []
    
    const agentId = String(user?.id || user?._id || '').trim()
    const agentName = user?.name
    
    // Filter trips by agent ID
    let filtered = trips.filter(trip => {
      // Get trip's agent ID in all possible formats
      const tripAgentId = trip.agentId?._id || trip.agentId?.id || trip.agentId
      const tripAgentName = trip.agent?.name || trip.agent || trip.agentDetails?.name
      
      // Normalize IDs to strings for comparison
      const normalizedTripAgentId = tripAgentId ? String(tripAgentId).trim() : ''
      const normalizedAgentId = agentId || ''
      
      // Match by ID
      const idMatch = normalizedTripAgentId && normalizedAgentId && (
        normalizedTripAgentId === normalizedAgentId
      )
      
      // Match by name (fallback)
      const nameMatch = tripAgentName && agentName && (
        tripAgentName === agentName ||
        trip.agent === agentName
      )
      
      return idMatch || nameMatch
    })
    
    // If branch is set, further filter by branch
    if (user?.branch && filtered.length > 0) {
      filtered = filtered.filter(trip => {
        const tripBranch = trip.branch?.name || trip.branch || trip.branchName
        return tripBranch === user.branch || !tripBranch
      })
    }
    
    return filtered
  }, [trips, user])
  const agentDisputes = useMemo(() => 
    disputes.filter(d => (d.agentId === user?.id || d.agentId === user?._id) || d.agent === user?.name),
    [disputes, user]
  )

  const kpiData = useMemo(() => {
    const activeTripsCount = agentTrips.filter(t => t.status === 'Active').length
    const completedTrips = agentTrips.filter(t => t.status === 'Completed').length
    const tripsInDispute = agentTrips.filter(t => t.status === 'Dispute').length
    const bulkTrips = agentTrips.filter(t => t.isBulk).length
    const lrSheetsPending = agentTrips.filter(t => !t.lrSheet || t.lrSheet === 'Not Received').length
    
    // Calculate current balance
    const agentId = String(user?.id || user?._id || '').trim()
    const agentName = user?.name
    const agentLedger = ledger.filter(l => {
      const ledgerAgentId = l.agentId?._id || l.agentId?.id || l.agentId
      const normalizedLedgerAgentId = ledgerAgentId ? String(ledgerAgentId).trim() : ''
      const normalizedAgentId = agentId || ''
      
      const idMatch = normalizedLedgerAgentId && normalizedAgentId && (
        normalizedLedgerAgentId === normalizedAgentId
      )
      
      const nameMatch = l.agent === agentName
      
      return idMatch || nameMatch
    })
    const currentBalance = agentLedger.reduce((sum, entry) => {
      if (entry.direction === 'Credit') {
        return sum + (entry.amount || 0)
      } else {
        return sum - (entry.amount || 0)
      }
    }, 0)

    return [
      { 
        title: 'My Active Trips', 
        value: activeTripsCount.toString(), 
        icon: FiTruck, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/agent/trips?status=active'
      },
      { 
        title: 'My Completed Trips', 
        value: completedTrips.toString(), 
        icon: FiCheckCircle, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/agent/trips?status=completed'
      },
      { 
        title: 'My Trips In Dispute', 
        value: tripsInDispute.toString(), 
        icon: FiAlertCircle, 
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        link: '/agent/disputes'
      },
      { 
        title: 'My Bulk Trips', 
        value: bulkTrips.toString(), 
        icon: FiTruck, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/agent/trips?type=bulk'
      },
      { 
        title: 'My LR Sheets Pending', 
        value: lrSheetsPending.toString(), 
        icon: FiFileText, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        link: '/agent/trips?lrSheet=pending'
      },
      { 
        title: 'My Current Balance', 
        value: `Rs ${(currentBalance || 0).toLocaleString()}`, 
        icon: FiDollarSign, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/agent/ledger'
      },
    ]
  }, [agentTrips, agentDisputes, ledger, user])

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">Agent Dashboard</h1>
              {user?.branch && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Branch: {user.branch}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              Welcome back, <span className="font-semibold text-text-primary">{user?.name || 'Agent'}</span>! Here's your trip overview
            </p>
          </div>
        </div>
        
        {/* Branch Info Card - More Prominent */}
        {user?.branch && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{user.branch}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Your Branch Assignment</p>
                <p className="text-xs text-blue-700">All your trips and transactions are filtered by Branch: <span className="font-bold">{user.branch}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Link
              key={index}
              to={kpi.link}
              className="card hover:shadow-3d-hover transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-text-secondary text-xs sm:text-sm font-medium break-words">{kpi.title}</h3>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${kpi.bgColor} ${kpi.color} rounded-lg flex items-center justify-center shadow-3d flex-shrink-0`}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary break-words">{kpi.value}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default AgentDashboard
