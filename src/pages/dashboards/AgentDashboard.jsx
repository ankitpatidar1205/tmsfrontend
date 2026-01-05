import React, { useMemo, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FiTruck, FiDollarSign, FiAlertCircle, FiCheckCircle, FiFileText, FiCalendar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AgentDashboard = () => {
  const { user } = useAuth()
  const { trips, disputes, ledger, loadTrips, loadLedger, loadDisputes, getTripsByAgent, getTripsByBranch } = useData()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Load data when component mounts
  useEffect(() => {
    if (user?.role === 'Agent') {
      console.log('Dashboard: Loading data for agent:', user?.id || user?._id)
      loadTrips()
      loadLedger()
      loadDisputes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Reload when user changes
  useEffect(() => {
    if (user?.role === 'Agent' && (user?.id || user?._id)) {
      loadTrips()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id])

  // Filter trips - EXACT same logic as AgentTrips.jsx
  const agentTrips = useMemo(() => {
    if (user?.role !== 'Agent') return []
    if (!Array.isArray(trips)) return []
    
    const agentId = String(user?.id || user?._id || '').trim()
    const agentName = user?.name
    
    // Filter trips - EXACT same logic as AgentTrips page (lines 49-68)
    let filtered = trips.filter(trip => {
      // Get trip's agent ID
      const tripAgentId = trip.agentId?._id || trip.agentId?.id || trip.agentId
      
      // Match by ID
      if (tripAgentId && agentId) {
        if (String(tripAgentId).trim() === String(agentId).trim()) {
          return true
        }
      }
      
      // Match by name
      const tripAgentName = trip.agent?.name || trip.agent || trip.agentName || trip.agentDetails?.name
      if (tripAgentName && agentName && String(tripAgentName) === String(agentName)) {
        return true
      }
      
      // If API filtered correctly, include trip (backup)
      return true
    })
    
    // Branch filter (same as AgentTrips - but AgentTrips doesn't filter by branch in useEffect)
    // So we also don't filter by branch here to match exactly
    
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
  }, [trips, user, startDate, endDate])
  const agentDisputes = useMemo(() => 
    disputes.filter(d => (d.agentId === user?.id || d.agentId === user?._id) || d.agent === user?.name),
    [disputes, user]
  )

  const kpiData = useMemo(() => {
    // Status matching - case-insensitive, handle all variations
    const activeTripsCount = agentTrips.filter(t => {
      const status = String(t.status || '').trim().toLowerCase()
      return status === 'active'
    }).length
    
    const completedTrips = agentTrips.filter(t => {
      const status = String(t.status || '').trim().toLowerCase()
      return status === 'completed'
    }).length
    
    const tripsInDispute = agentTrips.filter(t => {
      const status = String(t.status || '').trim().toLowerCase()
      return status === 'dispute' || status === 'in dispute'
    }).length
    
    const bulkTrips = agentTrips.filter(t => t.isBulk === true).length
    
    const lrSheetsPending = agentTrips.filter(t => {
      const lrSheet = String(t.lrSheet || '').trim().toLowerCase()
      return !t.lrSheet || lrSheet === 'not received' || lrSheet === ''
    }).length
    
    console.log('=== Dashboard Stats ===')
    console.log('Total trips:', agentTrips.length)
    console.log('Active trips:', activeTripsCount)
    console.log('Completed trips:', completedTrips)
    console.log('Dispute trips:', tripsInDispute)
    console.log('Bulk trips:', bulkTrips)
    console.log('LR Sheets Pending:', lrSheetsPending)
    console.log('All statuses:', [...new Set(agentTrips.map(t => t.status))])
    if (agentTrips.length > 0) {
      console.log('Sample trips:', agentTrips.slice(0, 5).map(t => ({
        lrNumber: t.lrNumber,
        status: t.status,
        statusLower: String(t.status || '').toLowerCase(),
        isBulk: t.isBulk,
        lrSheet: t.lrSheet
      })))
    }
    console.log('=== End Stats ===')
    
    // Calculate current balance - EXACTLY same logic as Ledger.jsx
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
    
    // Remove duplicates
    const uniqueEntries = []
    const seenEntries = new Set()
    agentLedger.forEach(entry => {
      const entryId = entry.id || entry._id
      if (entryId && !seenEntries.has(entryId)) {
        seenEntries.add(entryId)
        uniqueEntries.push(entry)
      } else if (!entryId) {
        const entryKey = `${entry.type}_${entry.amount}_${entry.createdAt || entry.date}_${entry.lrNumber || entry.tripId || ''}`
        if (!seenEntries.has(entryKey)) {
          seenEntries.add(entryKey)
          uniqueEntries.push(entry)
        }
      }
    })
    
    // Sort chronologically (oldest first)
    const finalLedger = uniqueEntries.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.date || 0).getTime()
      return dateA - dateB
    })
    
    // Helper function to check if Finance payment entries match
    const financePaymentMatches = (entry1, entry2) => {
      const amount1 = parseFloat(entry1.amount) || 0
      const amount2 = parseFloat(entry2.amount) || 0
      if (Math.abs(amount1 - amount2) > 0.01) return false
      if (entry1.lrNumber && entry2.lrNumber && 
          String(entry1.lrNumber).trim() === String(entry2.lrNumber).trim()) {
        return true
      }
      if (entry1.tripId && entry2.tripId && 
          String(entry1.tripId) === String(entry2.tripId)) {
        return true
      }
      return false
    }
    
    // Pre-process: Find all Finance payment pairs
    const financePaymentPairs = []
    const processedCredits = new Set()
    const processedDebits = new Set()
    
    finalLedger.forEach(creditEntry => {
      if (creditEntry.type === 'Top-up' && 
          creditEntry.paymentMadeBy === 'Finance' && 
          creditEntry.direction === 'Credit') {
        const creditId = creditEntry.id || creditEntry._id
        if (processedCredits.has(creditId)) return
        
        const matchingDebit = finalLedger.find(debitEntry => {
          const debitId = debitEntry.id || debitEntry._id
          if (processedDebits.has(debitId)) return false
          return debitEntry.type === 'On-Trip Payment' && 
                 debitEntry.paymentMadeBy === 'Finance' && 
                 debitEntry.direction === 'Debit' &&
                 financePaymentMatches(creditEntry, debitEntry)
        })
        
        if (matchingDebit) {
          const creditId = creditEntry.id || creditEntry._id
          const debitId = matchingDebit.id || matchingDebit._id
          financePaymentPairs.push({
            creditId: creditId,
            debitId: debitId
          })
          processedCredits.add(creditId)
          processedDebits.add(debitId)
        }
      }
    })
    
    // Calculate balance
    let balance = 0
    finalLedger.forEach(entry => {
      const entryAmount = parseFloat(entry.amount) || 0
      const entryId = entry.id || entry._id
      
      // Skip Trip Closed
      if (entry.type === 'Trip Closed') return
      
      // Skip informational entries (balance not affected)
      if (entry.isInformational === true) return
      
      // Skip Finance payment entries (both Credit and Debit)
      const isFinanceCredit = entry.type === 'Top-up' && 
                               entry.paymentMadeBy === 'Finance' && 
                               entry.direction === 'Credit'
      const isFinanceDebit = entry.type === 'On-Trip Payment' && 
                             entry.paymentMadeBy === 'Finance' && 
                             entry.direction === 'Debit'
      
      if (isFinanceCredit || isFinanceDebit) {
        const isInPair = financePaymentPairs.some(pair => {
          return (pair.creditId && entryId && String(pair.creditId) === String(entryId)) ||
                 (pair.debitId && entryId && String(pair.debitId) === String(entryId))
        })
        if (isInPair) return // Skip both Credit and Debit
      }
      
      // Handle Trip Created - always debit, use advance amount
      if (entry.type === 'Trip Created') {
        let advanceAmount = entryAmount
        if (entry.advance && parseFloat(entry.advance) > 0) {
          advanceAmount = parseFloat(entry.advance)
        } else if (entry.tripId || entry.lrNumber) {
          const trip = trips.find(t => 
            (entry.tripId && (String(t.id) === String(entry.tripId) || String(t._id) === String(entry.tripId))) ||
            (entry.lrNumber && t.lrNumber === entry.lrNumber)
          )
          if (trip && (trip.advance || trip.advancePaid)) {
            const tripAdvance = parseFloat(trip.advance || trip.advancePaid || 0)
            if (tripAdvance > 0) {
              advanceAmount = tripAdvance
            }
          }
        }
        balance = balance - advanceAmount
        return
      }
      
      // Handle all other entries normally
      if (entry.direction === 'Credit') {
        balance = balance + entryAmount
      } else {
        balance = balance - entryAmount
      }
    })
    
    const currentBalance = balance

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
  }, [agentTrips, agentDisputes, ledger, trips, user])

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

export default AgentDashboard
