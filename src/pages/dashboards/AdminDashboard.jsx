import React, { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FiTruck, FiUsers, FiAlertCircle, FiFileText, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AgentFilter from '../../components/AgentFilter'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { trips, ledger, disputes } = useData()
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(t => {
        const tripDate = new Date(t.date).toISOString().split('T')[0]
        return tripDate >= startDate
      })
    }
    if (endDate) {
      filtered = filtered.filter(t => {
        const tripDate = new Date(t.date).toISOString().split('T')[0]
        return tripDate <= endDate
      })
    }
    
    return filtered
  }, [trips, selectedAgentId, startDate, endDate])

  const kpiData = useMemo(() => {
    const activeTrips = filteredTrips.filter(t => t.status === 'Active').length
    const completedTrips = filteredTrips.filter(t => t.status === 'Completed').length
    const tripsInDispute = filteredTrips.filter(t => t.status === 'Dispute').length
    const lrNotReceived = filteredTrips.filter(t => !t.lrSheet || t.lrSheet === 'Not Received').length
    const regularTrips = filteredTrips.filter(t => !t.isBulk).length
    const bulkTrips = filteredTrips.filter(t => t.isBulk).length
    const uniqueAgents = [...new Set(trips.map(t => t.agent).filter(Boolean))].length
    const uniqueTrucks = [...new Set(trips.map(t => t.truckNumber).filter(Boolean))].length
    const today = new Date().toISOString().split('T')[0]
    const auditEventsToday = ledger.filter(l => l.createdAt?.split('T')[0] === today).length

    return [
      { 
        title: 'Active Trips', 
        value: activeTrips.toString(), 
        icon: FiTruck, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/admin/trips?status=active'
      },
      { 
        title: 'Completed Trips', 
        value: completedTrips.toString(), 
        icon: FiCheckCircle, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/admin/trips?status=completed'
      },
      { 
        title: 'Trips In Dispute', 
        value: tripsInDispute.toString(), 
        icon: FiAlertCircle, 
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        link: '/admin/disputes'
      },
      { 
        title: 'LR Not Received', 
        value: lrNotReceived.toString(), 
        icon: FiFileText, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        link: '/admin/trips?lrSheet=not-received'
      },
      { 
        title: 'Normal Trips', 
        value: regularTrips.toString(), 
        icon: FiTruck, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/admin/trips?type=regular'
      },
      { 
        title: 'Bulk Trips', 
        value: bulkTrips.toString(), 
        icon: FiTruck, 
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        link: '/admin/trips?type=bulk'
      },
      { 
        title: 'Total Agents', 
        value: uniqueAgents.toString(), 
        icon: FiUsers, 
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        link: '/admin/profile'
      },
      { 
        title: 'Total Trucks', 
        value: uniqueTrucks.toString(), 
        icon: FiTruck, 
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        link: '/admin/trips'
      },
      { 
        title: 'Audit Events Today', 
        value: auditEventsToday.toString(), 
        icon: FiClock, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        link: '/admin/audit-logs'
      },
    ]
  }, [filteredTrips, trips, ledger])

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-text-secondary">Welcome back, {user?.name || 'Admin'}! Here's your system overview</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                Filter by Agent
              </label>
              <AgentFilter
                selectedAgent={selectedAgentId}
                onAgentChange={setSelectedAgentId}
              />
            </div>
          </div>
        </div>
        
        {/* Date Range Filters */}
        <div className="card p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <FiCalendar size={18} />
              <span className="text-sm font-medium">Date Range Filter:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex-1 sm:flex-none">
                <label className="block text-xs text-text-secondary mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field-3d w-full sm:w-auto"
                />
              </div>
              <div className="flex-1 sm:flex-none">
                <label className="block text-xs text-text-secondary mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field-3d w-full sm:w-auto"
                />
              </div>
              {(startDate || endDate) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                    }}
                    className="btn-3d-secondary px-4 py-2 text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default AdminDashboard
