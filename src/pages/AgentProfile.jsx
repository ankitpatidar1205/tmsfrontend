import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useRole } from '../hooks/useRole'
import AgentFilter from '../components/AgentFilter'

const AgentProfile = () => {
  const { user } = useAuth()
  const { trips, ledger, agents, loadTrips, loadLedger, loadAgents, loading } = useData()
  const { isAgent } = useRole()
  
  const [selectedAgentId, setSelectedAgentId] = useState(isAgent() ? user?.id : null)

  // Reload data when component mounts (only once)
  useEffect(() => {
    loadTrips()
    loadLedger()
    loadAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  // Auto-select first agent for admin/finance if no agent is selected
  useEffect(() => {
    if (!isAgent() && !selectedAgentId && agents.length > 0) {
      const firstAgent = agents[0]
      setSelectedAgentId(firstAgent.id || firstAgent._id)
    }
  }, [agents, selectedAgentId, isAgent])

  // Get selected agent with improved matching
  const selectedAgent = useMemo(() => {
    if (isAgent()) {
      const agentId = user?.id || user?._id
      return agents.find(a => {
        const aId = a.id?.toString() || a._id?.toString()
        const uId = agentId?.toString()
        return aId === uId || a.name === user?.name || a.email === user?.email
      }) || null
    }
    if (!selectedAgentId) return null
    const agentIdStr = selectedAgentId?.toString()
    return agents.find(a => {
      const aId = a.id?.toString() || a._id?.toString()
      return aId === agentIdStr
    }) || null
  }, [selectedAgentId, agents, user, isAgent])

  // Calculate stats for selected agent
  const agentStats = useMemo(() => {
    if (!selectedAgent) return null

    const agentId = selectedAgent.id || selectedAgent._id
    const agentIdStr = agentId?.toString()
    const agentName = selectedAgent.name

    // Filter trips with improved matching
    const agentTrips = trips.filter(t => {
      const tripAgentId = t.agentId?.toString() || t.agentId?._id?.toString() || t.agentId?.id?.toString()
      return tripAgentId === agentIdStr ||
             t.agentId === agentId ||
             t.agentId === selectedAgent.id ||
             t.agentId === selectedAgent._id ||
             t.agent === agentName
    })
    
    const totalTrips = agentTrips.length
    const activeTrips = agentTrips.filter(t => (t.status || '').toLowerCase() === 'active').length
    const completedTrips = agentTrips.filter(t => (t.status || '').toLowerCase() === 'completed').length
    const tripsInDispute = agentTrips.filter(t => 
      (t.status || '').toLowerCase() === 'dispute' || 
      (t.status || '').toLowerCase() === 'in dispute'
    ).length
    const bulkTrips = agentTrips.filter(t => t.isBulk).length
    
    // Calculate current balance from ledger - EXACTLY same logic as Ledger.jsx
    const agentLedger = ledger.filter(l => {
      const ledgerAgentId = l.agentId?.toString() || l.agentId?._id?.toString() || l.agentId?.id?.toString()
      return ledgerAgentId === agentIdStr ||
             l.agentId === agentId ||
             l.agentId === selectedAgent.id ||
             l.agentId === selectedAgent._id ||
             l.agent === agentName ||
             l.agentId?._id === agentId ||
             l.agentId?.id === agentId
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

    return {
      name: selectedAgent.name || 'N/A',
      phone: selectedAgent.phone || 'N/A',
      email: selectedAgent.email || 'N/A',
      branch: selectedAgent.branch || 'N/A',
      currentBalance: currentBalance, // No fallback - show actual balance (can be 0)
      totalTrips,
      activeTrips,
      completedTrips,
      tripsInDispute,
      bulkTrips,
    }
  }, [selectedAgent, trips, ledger])

  // Show loading state while data is being loaded
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">Loading agent profile data...</p>
        </div>
      </div>
    )
  }

  // Show message if no agent selected (for admin/finance)
  if (!isAgent() && !selectedAgentId && agents.length === 0) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">No Agents Found</h2>
          <p className="text-text-secondary">Please create agents first to view their profiles.</p>
        </div>
      </div>
    )
  }

  // Show message if agent not found
  if (!selectedAgent && !isAgent()) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Select an Agent</h2>
          <p className="text-text-secondary mb-4">Please select an agent from the dropdown above to view their profile.</p>
          {agents.length > 0 && (
            <div className="mt-4">
              <AgentFilter
                selectedAgent={selectedAgentId}
                onAgentChange={setSelectedAgentId}
                showAll={false}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show loading if agent stats not calculated yet
  if (!agentStats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">Calculating agent statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header with Agent Selector */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Agent Profile</h1>
            <p className="text-text-secondary">
              {isAgent() ? 'Your profile information' : 'View agent profile and statistics'}
            </p>
          </div>
          {!isAgent() && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Viewing profile for:
              </label>
              <AgentFilter
                selectedAgent={selectedAgentId}
                onAgentChange={setSelectedAgentId}
                showAll={false}
              />
            </div>
          )}
        </div>
        {!isAgent() && agentStats && (
          <div className="p-4 bg-primary bg-opacity-10 border-2 border-primary rounded-lg">
            <p className="text-text-primary font-medium">
              Viewing profile for: <span className="font-bold">{agentStats.name}</span>
            </p>
          </div>
        )}
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Agent Name</h3>
          <p className="text-2xl font-bold text-text-primary">{agentStats.name}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Phone</h3>
          <p className="text-2xl font-bold text-text-primary">{agentStats.phone}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Current Balance</h3>
          <p className="text-2xl font-bold text-green-600">Rs {agentStats.currentBalance.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Total Trips</h3>
          <p className="text-2xl font-bold text-text-primary">{agentStats.totalTrips}</p>
        </div>
      </div>

      {/* Trip Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Active Trips</h3>
          <p className="text-3xl font-bold text-green-600">{agentStats.activeTrips}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Completed Trips</h3>
          <p className="text-3xl font-bold text-blue-600">{agentStats.completedTrips}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Trips In Dispute</h3>
          <p className="text-3xl font-bold text-red-600">{agentStats.tripsInDispute}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Bulk Trips</h3>
          <p className="text-3xl font-bold text-purple-600">{agentStats.bulkTrips}</p>
        </div>
      </div>
    </div>
  )
}

export default AgentProfile
