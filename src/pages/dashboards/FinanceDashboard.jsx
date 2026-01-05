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
      const stats = await reportAPI.getDashboardStats({})
      console.log('Dashboard stats received:', stats) // Debug log
      console.log('midPaymentsToday value:', stats?.midPaymentsToday) // Debug log
      console.log('Type of midPaymentsToday:', typeof stats?.midPaymentsToday) // Debug log
      console.log('Full stats object:', JSON.stringify(stats, null, 2)) // Debug log
      setDashboardStats(stats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Set empty stats on error
      setDashboardStats(null)
    }
  }

  const filteredTrips = useMemo(() => {
    let filtered = trips
    
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
  }, [trips, startDate, endDate])

  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    // Use filtered trips for calculations if date filters are applied
    const tripsForCalculation = (startDate || endDate) ? filteredTrips : trips
    
    // Always use API stats if available (even if 0), only fallback if API failed
    if (dashboardStats !== null && dashboardStats !== undefined) {
      const apiMidPayments = dashboardStats.midPaymentsToday ?? 0
      const apiTopUps = dashboardStats.topUpsToday ?? 0
      const apiActiveTrips = dashboardStats.activeTrips ?? 0
      const apiLrSheets = dashboardStats.lrSheetsNotReceived ?? 0
      const apiNormalTrips = dashboardStats.normalTrips ?? 0
      const apiBulkTrips = dashboardStats.bulkTrips ?? 0
      const apiBankMovements = dashboardStats.bankMovementsToday ?? 0
      const apiBankNet = dashboardStats.totalBankNet ?? 0
      
      console.log('Using API stats:', {
        midPaymentsToday: apiMidPayments,
        topUpsToday: apiTopUps,
        activeTrips: apiActiveTrips,
        fullStats: dashboardStats
      })
      
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
          value: (dashboardStats.trips?.completed || 0).toString(), 
          icon: FiCheckCircle, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          link: '/finance/trips?status=completed'
        },
        { 
          title: 'Total Trips', 
          value: (dashboardStats.trips?.total || 0).toString(), 
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
        // Bank-wise Movements card removed as per user request
      ]
    }
    
    // Fallback to local calculation
    
    // Filter ledger by date range if filters are applied
    let filteredLedger = ledger
    if (startDate || endDate) {
      filteredLedger = ledger.filter(l => {
        const entryDate = l.date ? new Date(l.date).toISOString().split('T')[0] : (l.createdAt?.split('T')[0] || '')
        if (startDate && entryDate < startDate) return false
        if (endDate && entryDate > endDate) return false
        return true
      })
    }
    
    // Mid-payments today - Finance payments only (On-Trip Payment made by Finance)
    const allFinancePayments = filteredLedger.filter(l => 
      l.type === 'On-Trip Payment' && l.paymentMadeBy === 'Finance'
    )
    console.log('All Finance payments in ledger:', allFinancePayments.length, allFinancePayments.map(p => ({ 
      amount: p.amount, 
      lrNumber: p.lrNumber, 
      date: p.date, 
      createdAt: p.createdAt,
      paymentMadeBy: p.paymentMadeBy
    })))
    
    const midPaymentsToday = filteredLedger.filter(l => {
      // Handle date comparison - check both date field and createdAt
      let entryDate = ''
      if (l.date) {
        try {
          entryDate = new Date(l.date).toISOString().split('T')[0]
        } catch (e) {
          entryDate = l.date.toString().split('T')[0]
        }
      } else if (l.createdAt) {
        entryDate = l.createdAt.toString().split('T')[0]
      }
      
      const isToday = entryDate === today
      if (!isToday) return false
      
      // Check if it's a Finance payment
      // Method 1: Direct paymentMadeBy field
      if (l.type === 'On-Trip Payment' && l.paymentMadeBy === 'Finance') {
        console.log('Found Finance payment today:', l.amount, l.lrNumber, entryDate)
        return true
      }
      
      // Method 2: Check if there's a matching Finance Top-up entry (Finance payments create both Top-up and On-Trip Payment)
      if (l.type === 'On-Trip Payment') {
        const hasMatchingFinanceTopUp = ledger.some(topup => 
          topup.type === 'Top-up' && 
          topup.paymentMadeBy === 'Finance' &&
          topup.amount === l.amount &&
          (topup.lrNumber === l.lrNumber || topup.tripId === l.tripId) &&
          Math.abs(new Date(topup.date || topup.createdAt) - new Date(l.date || l.createdAt)) < 120000 // Within 2 minutes
        )
        if (hasMatchingFinanceTopUp) {
          console.log('Found Finance payment via Top-up match:', l.amount, l.lrNumber)
          return true
        }
      }
      
      return false
    }).reduce((sum, e) => sum + (e.amount || 0), 0)
    
    console.log('Mid-payments today (frontend calculation):', midPaymentsToday, 'Today:', today)
    
    // Top-ups today - All top-ups including Finance top-ups
    const topUpsToday = filteredLedger.filter(l => {
      const entryDate = l.date ? new Date(l.date).toISOString().split('T')[0] : (l.createdAt?.split('T')[0] || '')
      return entryDate === today && (l.type === 'Top-up' || l.type === 'Virtual Top-up')
    }).reduce((sum, e) => sum + (e.amount || 0), 0)
    
    const activeTrips = tripsForCalculation.filter(t => t.status === 'Active').length
    const lrSheetsNotReceived = tripsForCalculation.filter(t => !t.lrSheet || t.lrSheet === 'Not Received').length
    const regularTrips = tripsForCalculation.filter(t => !t.isBulk).length
    const bulkTrips = tripsForCalculation.filter(t => t.isBulk).length
    
    // Bank-wise movements today - Enhanced with detailed summary
    const todayLedgerEntries = filteredLedger.filter(l => {
      const entryDate = l.date || l.createdAt?.split('T')[0]
      return entryDate === today
    })
    
    const bankSummary = {}
    todayLedgerEntries.forEach(entry => {
      const bank = entry.bank || 'Cash'
      if (!bankSummary[bank]) {
        bankSummary[bank] = {
          bank,
          credit: 0,
          debit: 0,
          net: 0,
          count: 0
        }
      }
      bankSummary[bank].count++
      if (entry.direction === 'Credit') {
        bankSummary[bank].credit += (entry.amount || 0)
        bankSummary[bank].net += (entry.amount || 0)
      } else {
        bankSummary[bank].debit += (entry.amount || 0)
        bankSummary[bank].net -= (entry.amount || 0)
      }
    })
    
    const bankMovementsToday = Object.keys(bankSummary).length
    const totalBankNet = Object.values(bankSummary).reduce((sum, b) => sum + b.net, 0)

    return [
      { 
        title: 'Mid-Payments Today', 
        value: `Rs ${midPaymentsToday.toLocaleString()}`, 
        icon: FiDollarSign, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/finance/ledger'
      },
      { 
        title: 'Top-Ups Today', 
        value: `Rs ${topUpsToday.toLocaleString()}`, 
        icon: FiDollarSign, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/finance/ledger'
      },
      { 
        title: 'Active Trips', 
        value: activeTrips.toString(), 
        icon: FiTruck, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/finance/trips?status=active'
      },
      { 
        title: 'LR Sheets Not Received', 
        value: lrSheetsNotReceived.toString(), 
        icon: FiFileText, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        link: '/finance/trips?lrSheet=not-received'
      },
      { 
        title: 'Normal Trips', 
        value: regularTrips.toString(), 
        icon: FiTruck, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/finance/trips?type=regular'
      },
        { 
          title: 'Bulk Trips', 
          value: bulkTrips.toString(), 
          icon: FiTruck, 
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          link: '/finance/trips?type=bulk'
        },
        // Bank-wise Movements card removed as per user request
    ]
  }, [trips, ledger, dashboardStats, filteredTrips, startDate, endDate])

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
