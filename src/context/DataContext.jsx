import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  branchAPI,
  userAPI,
  tripAPI,
  ledgerAPI,
  disputeAPI,
} from '../services/api'

const DataContext = createContext(null)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // State
  const [branches, setBranches] = useState([])
  const [agents, setAgents] = useState([])
  const [trips, setTrips] = useState([])
  const [ledger, setLedger] = useState([])
  const [disputes, setDisputes] = useState([])

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Reload trips and ledger when user ID changes (for agent branch filtering)
  // Use a ref to track previous user ID to avoid unnecessary reloads
  const prevUserIdRef = useRef(null)
  useEffect(() => {
    const currentUserId = user?.id || user?._id
    // Only reload if user ID actually changed
    if (currentUserId && currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId
      loadTrips()
      loadLedger()
      loadDisputes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id]) // Only depend on user ID, not entire user object

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadBranches(),
        loadAgents(),
        loadTrips(),
        loadLedger(),
        loadDisputes(),
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBranches = useCallback(async () => {
    try {
      const data = await branchAPI.getBranches()
      setBranches(data.map(b => b.name || b))
    } catch (error) {
      console.error('Error loading branches:', error)
      setBranches([])
    }
  }, []) // No dependencies - function doesn't depend on state

  const loadAgents = useCallback(async (branchId = null) => {
    try {
      const data = await userAPI.getAgents(branchId)
      setAgents(data)
    } catch (error) {
      console.error('Error loading agents:', error)
      setAgents([])
    }
  }, []) // No dependencies - function doesn't depend on user or state

  const loadTrips = useCallback(async (filters = {}) => {
    try {
      // For agents, filter by their agentId (use id or _id, both are same)
      if (user?.role === 'Agent' && (user?.id || user?._id)) {
        // Use id first, fallback to _id (both are same in localStorage)
        filters.agentId = user.id || user._id
      }
      const data = await tripAPI.getTrips(filters)
      const tripsArray = Array.isArray(data) ? data : []
      setTrips(tripsArray)
      return tripsArray
    } catch (error) {
      console.error('Error loading trips:', error)
      setTrips([])
      return []
    }
  }, [user?.role, user?.id, user?._id]) // Only depend on user role and ID

  const loadLedger = useCallback(async (filters = {}) => {
    try {
      // For agents, filter by their agentId
      if (user?.role === 'Agent' && user?.id) {
        filters.agentId = user.id
      }
      const data = await ledgerAPI.getLedger(filters)
      setLedger(data || [])
    } catch (error) {
      console.error('Error loading ledger:', error)
      setLedger([])
    }
  }, [user?.role, user?.id]) // Only depend on user role and ID

  const loadDisputes = useCallback(async (filters = {}) => {
    try {
      // For agents, filter by their agentId
      if (user?.role === 'Agent' && (user?.id || user?._id)) {
        filters.agentId = user.id || user._id
      }
      const data = await disputeAPI.getDisputes(filters)
      setDisputes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading disputes:', error)
      setDisputes([])
    }
  }, [user?.role, user?.id, user?._id]) // Only depend on user role and ID

  // Branch management
  const addBranch = async (branchName) => {
    try {
      const trimmedName = branchName.trim().toUpperCase()
      const data = await branchAPI.createBranch(trimmedName)
      await loadBranches()
      return data.name || trimmedName
    } catch (error) {
      throw new Error(error.message || 'Failed to create branch')
    }
  }

  const editBranch = async (branchId, newBranchName) => {
    try {
      const trimmedNewName = newBranchName.trim().toUpperCase()
      await branchAPI.updateBranch(branchId, trimmedNewName)
      await loadBranches()
      await loadAgents() // Reload agents as branch names might have changed
      return trimmedNewName
    } catch (error) {
      throw new Error(error.message || 'Failed to update branch')
    }
  }

  const deleteBranch = async (branchId) => {
    try {
      await branchAPI.deleteBranch(branchId)
      await loadBranches()
      await loadAgents()
    } catch (error) {
      throw new Error(error.message || 'Failed to delete branch')
    }
  }

  // Trip management
  const addTrip = async (tripData) => {
    try {
      // Ensure agentId is set from user if not provided (use id or _id, both are same)
      if (!tripData.agentId && user?.role === 'Agent' && (user?.id || user?._id)) {
        tripData.agentId = user.id || user._id
      }
      // Ensure branch is set from user if not provided
      if (!tripData.branchId && user?.branch) {
        // Find branch ID from branches list
        const branch = branches.find(b => b === user.branch || b.name === user.branch)
        if (branch && branch.id) {
          tripData.branchId = branch.id
        }
      }
      const data = await tripAPI.createTrip(tripData)
      // Reload trips and ledger immediately and after delay
      await loadTrips()
      await loadLedger() // Reload ledger as trip creation creates ledger entry
      setTimeout(async () => {
        await loadTrips()
        await loadLedger()
      }, 1000)
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to create trip')
    }
  }

  const updateTrip = async (id, updates) => {
    try {
      const data = await tripAPI.updateTrip(id, updates)
      await loadTrips()
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to update trip')
    }
  }

  const deleteTrip = async (id) => {
    try {
      await tripAPI.deleteTrip(id)
      await loadTrips()
    } catch (error) {
      throw new Error(error.message || 'Failed to delete trip')
    }
  }

  const getTripById = async (id) => {
    try {
      const data = await tripAPI.getTrip(id)
      return data
    } catch (error) {
      console.error('Error loading trip:', error)
      return null
    }
  }

  const addOnTripPayment = async (tripId, paymentData) => {
    try {
      // Ensure agentId is set
      if (!paymentData.agentId && user?.id) {
        paymentData.agentId = user.id
      }
      const data = await tripAPI.addPayment(tripId, paymentData)
      await loadTrips()
      await loadLedger() // Reload ledger as payment creates ledger entry
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to add payment')
    }
  }

  const updateDeductions = async (tripId, deductions) => {
    try {
      const data = await tripAPI.updateDeductions(tripId, deductions)
      await loadTrips()
      await loadLedger() // Reload ledger as deductions create ledger entries
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to update deductions')
    }
  }

  const closeTrip = async (tripId, options = {}) => {
    try {
      const data = await tripAPI.closeTrip(tripId, options)
      await loadTrips()
      await loadLedger() // Reload ledger as closing creates ledger entries
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to close trip')
    }
  }

  const addAttachment = async (tripId, file, uploadedBy = null) => {
    try {
      const userId = uploadedBy || user?.id
      const data = await tripAPI.uploadAttachment(tripId, file, userId)
      await loadTrips()
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to upload attachment')
    }
  }

  const deleteAttachment = async (tripId, attachmentId) => {
    try {
      await tripAPI.deleteAttachment(tripId, attachmentId)
      await loadTrips()
    } catch (error) {
      throw new Error(error.message || 'Failed to delete attachment')
    }
  }

  // Ledger management
  const addLedgerEntry = async (entryData) => {
    // This is mainly for internal use - ledger entries are usually created by trip operations
    // But keeping for compatibility
    await loadLedger()
  }

  const updateLedgerEntry = async (id, updates) => {
    // Ledger entries are usually read-only, but keeping for compatibility
    await loadLedger()
  }

  const addTopUp = async (topUpData) => {
    try {
      // Validate agentId
      if (!topUpData.agentId) {
        throw new Error('Agent selection is required')
      }
      
      // Call API
      const response = await ledgerAPI.addTopUp(topUpData)
      
      // Reload ledger to show new entry immediately
      await loadLedger()
      
      // Also reload after a short delay to ensure backend has processed
      setTimeout(async () => {
        await loadLedger()
      }, 500)
      
      return response
    } catch (error) {
      console.error('Add top-up error:', error)
      throw new Error(error.message || 'Failed to add top-up')
    }
  }

  const transferToAgent = async (senderAgentId, senderAgentName, receiverAgentId, receiverAgentName, amount) => {
    try {
      await ledgerAPI.transferToAgent({
        senderAgentId,
        receiverAgentId,
        amount: parseFloat(amount),
      })
      await loadLedger()
      return { success: true }
    } catch (error) {
      throw new Error(error.message || 'Failed to transfer')
    }
  }

  // Dispute management
  const addDispute = async (disputeData) => {
    try {
      // Ensure agentId is set
      if (!disputeData.agentId && user?.role === 'Agent' && user?.id) {
        disputeData.agentId = user.id
      }
      if (!disputeData.agentId) {
        throw new Error('agentId is required')
      }
      if (!disputeData.tripId) {
        throw new Error('tripId is required')
      }
      const data = await disputeAPI.createDispute(disputeData)
      await loadDisputes()
      await loadTrips() // Reload trips as dispute changes trip status
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to create dispute')
    }
  }

  const updateDispute = async (id, updates) => {
    try {
      // If resolving dispute
      if (updates.status === 'Resolved') {
        const resolvedBy = user?.id || null
        // Include newFreight and other updates in the payload
        const payload = {
            resolvedBy,
            ...updates
        }
        const data = await disputeAPI.resolveDispute(id, payload)
        await loadDisputes()
        await loadTrips() // Reload trips as resolving dispute changes trip status
        return data
      }
      // For other updates, reload disputes
      await loadDisputes()
    } catch (error) {
      throw new Error(error.message || 'Failed to update dispute')
    }
  }

  // Helper functions
  const getTripsByAgent = (agentId) => {
    return trips.filter((trip) => 
      trip.agentId === agentId || 
      trip.agentId?._id === agentId ||
      trip.agentId?.id === agentId ||
      trip.agent === agentId
    )
  }

  const getTripsByBranch = (branch) => {
    if (!branch) return trips
    return trips.filter((trip) => trip.branch === branch)
  }

  const getAgentsByBranch = (branch) => {
    if (!branch) return agents
    return agents.filter((agent) => agent.branch === branch)
  }

  const getTripsByLRNumber = (lrNumber) => {
    return trips.filter((trip) => 
      trip.lrNumber?.toLowerCase().includes(lrNumber.toLowerCase()) ||
      trip.tripId?.toLowerCase().includes(lrNumber.toLowerCase())
    )
  }

  const getLedgerByLRNumber = (lrNumber) => {
    return ledger.filter((entry) => 
      entry.lrNumber?.toLowerCase().includes(lrNumber.toLowerCase()) ||
      entry.tripId?.toLowerCase().includes(lrNumber.toLowerCase())
    )
  }

  const searchByLRNumber = (lrNumber) => {
    const matchingTrips = getTripsByLRNumber(lrNumber)
    const matchingLedger = getLedgerByLRNumber(lrNumber)
    return {
      trips: matchingTrips,
      ledger: matchingLedger,
    }
  }

  // Global LR search using API - searches across all trips and ledger entries regardless of user role
  const globalSearchByLRNumber = async (lrNumber, companyName = null) => {
    try {
      const { searchAPI } = await import('../services/api')
      const results = await searchAPI.globalLRSearch(lrNumber, companyName)
      return results
    } catch (error) {
      console.error('Global search error:', error)
      throw error
    }
  }

  const getAgents = () => {
    return agents
  }

  const value = {
    // Data
    trips,
    ledger,
    disputes,
    agents,
    branches,
    loading,
    
    // Trip functions
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    addOnTripPayment,
    updateDeductions,
    closeTrip,
    addAttachment,
    deleteAttachment,
    
    // Ledger functions
    addLedgerEntry,
    updateLedgerEntry,
    addTopUp,
    transferToAgent,
    
    // Dispute functions
    addDispute,
    updateDispute,
    
    // Branch functions
    addBranch,
    editBranch,
    deleteBranch,
    
    // Helper functions
    getTripsByAgent,
    getTripsByBranch,
    getAgentsByBranch,
    getTripsByLRNumber,
    getLedgerByLRNumber,
    searchByLRNumber,
    globalSearchByLRNumber,
    getAgents,
    
    // Reload functions (for manual refresh)
    loadTrips,
    loadLedger,
    loadDisputes,
    loadAgents,
    loadBranches,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
