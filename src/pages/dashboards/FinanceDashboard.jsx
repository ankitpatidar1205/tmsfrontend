import React, { useMemo, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { reportAPI } from '../../services/api'
import { FiDollarSign, FiFileText, FiTruck, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import LRSearch from '../../components/LRSearch'

const FinanceDashboard = () => {
  const { user } = useAuth()
  const { trips, ledger, loadTrips, loadLedger } = useData()
  const [dashboardStats, setDashboardStats] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Load data when component mounts
  useEffect(() => {
    loadTrips()
    loadLedger()
  }, [])

  useEffect(() => {
    loadDashboardStats()
    // Reload stats every 5 seconds
    const interval = setInterval(() => {
      loadDashboardStats()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [ledger, trips])

  const loadDashboardStats = async () => {
    try {
      const filters = {}
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
      
      const stats = await reportAPI.getDashboardStats(filters)
      console.log('Dashboard stats received:', stats)
      setDashboardStats(stats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Keep existing stats on error to avoid flickering if possible, or handle error state
    }
  }

  // Reload stats when date filters change
  useEffect(() => {
    loadDashboardStats()
  }, [startDate, endDate])

  const kpiData = useMemo(() => {
    // Default values if API hasn't loaded yet
    const stats = dashboardStats || {}
    
    // API provides all needed data now
    const apiMidPayments = stats.midPaymentsToday ?? 0
    const apiTopUps = stats.topUpsToday ?? 0
    const apiActiveTrips = stats.activeTrips ?? 0
    const apiLrSheets = stats.lrNotReceived ?? 0
    const apiNormalTrips = stats.regularTrips ?? 0
    const apiBulkTrips = stats.bulkTrips ?? 0
    const apiCompletedTrips = stats.completedTrips ?? 0
    const apiTotalTrips = (stats.activeTrips || 0) + (stats.completedTrips || 0) + (stats.tripsInDispute || 0) // Approximate total or use specific field if added
      
    // Note: Titles say "Today" but values respect the date filter if applied.
    // If date filter is applied, "Today" label might be slightly misleading but functionality is correct (shows stats for the period).
    
    return [
      { 
        title: 'Mid-Payments Today', 
        value: `Rs ${apiMidPayments.toLocaleString()}`, 
        icon: FiDollarSign, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/finance/ledger'
      },
      { 
        title: 'Top-Ups Today', 
        value: `Rs ${apiTopUps.toLocaleString()}`, 
        icon: FiDollarSign, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/finance/ledger'
      },
      { 
        title: 'Total Active Trips', 
        value: apiActiveTrips.toString(), 
        icon: FiTruck, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/finance/trips?status=active'
      },
      { 
        title: 'Total Completed Trips', 
        value: apiCompletedTrips.toString(), 
        icon: FiCheckCircle, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/finance/trips?status=completed'
      },
      { 
        title: 'Total Trips', 
        value: apiTotalTrips.toString(), 
        icon: FiTruck, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/finance/trips'
      },
      { 
        title: 'LR Sheets Not Received', 
        value: apiLrSheets.toString(), 
        icon: FiFileText, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        link: '/finance/trips?lrSheet=not-received'
      },
      { 
        title: 'Normal Trips', 
        value: apiNormalTrips.toString(), 
        icon: FiTruck, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/finance/trips?type=regular'
      },
      { 
        title: 'Bulk Trips', 
        value: apiBulkTrips.toString(), 
        icon: FiTruck, 
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        link: '/finance/trips?type=bulk'
      },
    ]
  }, [dashboardStats])

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Finance Dashboard</h1>
            <p className="text-xs sm:text-sm text-text-secondary">Welcome back, {user?.name || 'Finance'}! Here's your financial overview</p>
          </div>
          <div className="flex-1 max-w-md">
            <LRSearch />
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
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary break-words">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">{kpi.subtitle}</p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Bank-wise Summary Detail Card - Removed as per user request */}
    </div>
  )
}

export default FinanceDashboard
