import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useRole } from '../hooks/useRole'
import { FiFilter, FiSend, FiUser, FiSearch, FiX } from 'react-icons/fi'
import AgentFilter from '../components/AgentFilter'
import { toast } from 'react-toastify'

const  Ledger = () => {
  const { user } = useAuth()
  const { role, isAgent, isAdmin } = useRole()
  const { ledger, trips, agents, getAgents, transferToAgent, addLedgerEntry, addTopUp, getTripsByBranch, loadAgents, loadLedger, loadTrips } = useData()
  
  // Load agents, trips, and ledger when component mounts (only once)
  useEffect(() => {
    loadAgents()
    loadTrips() // Load trips to get advance data for Trip Created entries
    loadLedger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount
  
  const [filterDate, setFilterDate] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [lrSearchTerm, setLrSearchTerm] = useState('')
  
  // Payment to Agent form state (only for agents)
  const [showPaymentForm, setShowPaymentForm] = useState(true) // Open by default
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedReceiverAgentId, setSelectedReceiverAgentId] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  
  // Top-up form state (for Finance/Admin)
  const [topUpForm, setTopUpForm] = useState({
    amount: '',
    agentId: '',
    mode: 'Cash',
    bank: '',
    reason: '',
    isVirtual: false, // Virtual top-up for repairs (Credit + Immediate Debit)
  })
  const [isAddingTopUp, setIsAddingTopUp] = useState(false)

  const filteredLedger = useMemo(() => {
    let filtered = [...ledger]

    // If Agent, show only their entries (restricted to their branch)
    if (isAgent()) {
      // First filter by agent - get all entries for this agent
      // Improved matching: check agentId in multiple formats
      const agentId = user?.id || user?._id
      const agentIdStr = agentId ? String(agentId).trim() : ''
      const agentName = user?.name
      
      filtered = filtered.filter(entry => {
        const entryAgentId = entry.agentId?._id || entry.agentId?.id || entry.agentId
        const entryAgentIdStr = entryAgentId ? String(entryAgentId).trim() : ''
        const entryAgentName = entry.agent?.name || entry.agent || entry.agentName
        
        // Match by ID (multiple formats)
        if (agentIdStr && entryAgentIdStr && entryAgentIdStr === agentIdStr) {
          return true
        }
        
        // Match by name
        if (agentName && entryAgentName && String(entryAgentName).trim() === String(agentName).trim()) {
          return true
        }
        
        return false
      })
      
      // Then filter by branch if agent has branch assigned
      if (user?.branch) {
        const branchTrips = getTripsByBranch(user.branch)
        const branchTripIds = branchTrips.map(t => String(t.id || t._id))
        filtered = filtered.filter(entry => {
          // Always include entries without tripId (Top-ups, Transfers)
          if (!entry.tripId) return true
          
          // Always include Trip Created entries (advance payments) for this agent
          if (entry.type === 'Trip Created') return true
          
          // Always include Finance payment entries (On-Trip Payment and Top-up with paymentMadeBy='Finance')
          // Finance payments should be visible to the agent they're made for
          if (entry.paymentMadeBy === 'Finance') return true
          
          // Always include On-Trip Payment entries where this agent made the payment
          // (even if trip belongs to different branch - agent made payment so should see it)
          if (entry.type === 'On-Trip Payment' && 
              (entry.agentId === user?.id || entry.agentId === user?._id || entry.agent === user?.name) &&
              entry.isInformational !== true) {
            return true
          }
          
          // Check if tripId matches any branch trip (convert to string for comparison)
          const entryTripId = String(entry.tripId)
          return branchTripIds.some(id => String(id) === entryTripId)
        })
      }
    }

    // Filter by agent (for Admin/Finance)
    if (!isAgent() && selectedAgentId) {
      filtered = filtered.filter(entry => 
        entry.agentId === selectedAgentId || 
        entry.agentId?._id === selectedAgentId ||
        entry.agentId?.id === selectedAgentId
      )
    }
    
    // For Finance/Admin: Exclude informational entries (trip creator entries when payment was made by another agent)
    // Finance should only see payment maker's entries, not trip creator's informational entries
    if (!isAgent()) {
      filtered = filtered.filter(entry => {
        // Exclude informational entries (these are for trip creators, not payment makers)
        if (entry.isInformational === true) {
          return false
        }
        return true
      })
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(entry => {
        const entryDate = entry.date || entry.createdAt?.split('T')[0]
        return entryDate === filterDate
      })
    }

    // Filter by LR Number
    if (lrSearchTerm) {
      filtered = filtered.filter(entry => {
        const lrNum = (entry.lrNumber || entry.tripId || '').toString().toLowerCase()
        return lrNum.includes(lrSearchTerm.toLowerCase().trim())
      })
    }

    // Remove duplicates before processing (use entry ID as primary key)
    const uniqueFilteredEntries = []
    const seenFilteredEntries = new Set()
    filtered.forEach(entry => {
      const entryId = entry.id || entry._id
      if (entryId && !seenFilteredEntries.has(entryId)) {
        seenFilteredEntries.add(entryId)
        uniqueFilteredEntries.push(entry)
      } else if (!entryId) {
        // Fallback for entries without ID
        const entryKey = `${entry.type}_${entry.amount}_${entry.createdAt || entry.date}_${entry.lrNumber || entry.tripId || ''}`
        if (!seenFilteredEntries.has(entryKey)) {
          seenFilteredEntries.add(entryKey)
          uniqueFilteredEntries.push(entry)
        }
      }
    })
    
    // Sort by date (newest first for display)
    uniqueFilteredEntries.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0)
      const dateB = new Date(b.createdAt || b.date || 0)
      return dateB - dateA
    })

    // Fix: Transform Trip Created entries - correct amount and direction for old database entries
    // Rule: Trip Created should ALWAYS debit only the advance amount, NOT freight
    filtered = uniqueFilteredEntries.map(entry => {
      if (entry.type === 'Trip Created') {
        // Fix direction if it's Credit (should be Debit)
        const correctedDirection = entry.direction === 'Credit' ? 'Debit' : entry.direction
        
        // Fix amount: ALWAYS use advance amount, NOT freight
        // Priority: 1) trip.advance from trips array (source of truth), 2) entry.advance field, 3) keep original (fallback)
        let correctedAmount = entry.amount
        
        // First try: Find trip and get advance from trip data (most reliable)
        if (entry.tripId || entry.lrNumber) {
          const trip = trips.find(t => 
            (entry.tripId && (String(t.id) === String(entry.tripId) || String(t._id) === String(entry.tripId))) ||
            (entry.lrNumber && t.lrNumber === entry.lrNumber)
          )
          if (trip && (trip.advance || trip.advancePaid)) {
            const tripAdvance = trip.advance || trip.advancePaid || 0
            if (tripAdvance > 0) {
              correctedAmount = tripAdvance
            }
          }
        }
        
        // Second try: Use advance field from ledger entry (if trip data not available)
        if (correctedAmount === entry.amount && entry.advance && entry.advance > 0) {
          correctedAmount = entry.advance
        }
        
        return {
          ...entry,
          direction: correctedDirection,
          amount: correctedAmount // Use advance amount instead of freight
        }
      }
      return entry
    })

    return filtered
  }, [ledger, trips, filterDate, selectedAgentId, lrSearchTerm, isAgent, user, getTripsByBranch])

  const clearFilters = () => {
    setFilterDate('')
    setSelectedAgentId(null)
    setLrSearchTerm('')
  }


  // Determine columns based on role
  const showBankColumn = isAdmin() || role === 'Finance'
  const showAgentColumn = !isAgent()

  // Calculate current agent's balance
  // IMPORTANT: Finance payments have NO net effect on balance
  // Finance payment creates: Credit (Top-up) + Debit (On-Trip Payment)
  // We should only count the Credit, NOT the Debit (because it's offset)
  const currentAgentBalance = useMemo(() => {
    if (!isAgent() || !user) return 0
    
    const agentId = user?.id || user?._id
    const agentIdStr = agentId ? String(agentId).trim() : ''
    const agentName = user?.name
    
    // Improved matching: check agentId in multiple formats
    const agentLedger = ledger.filter(l => {
      const ledgerAgentId = l.agentId?._id || l.agentId?.id || l.agentId
      const ledgerAgentIdStr = ledgerAgentId ? String(ledgerAgentId).trim() : ''
      const ledgerAgentName = l.agent?.name || l.agent || l.agentName
      
      // Match by ID (multiple formats)
      if (agentIdStr && ledgerAgentIdStr && ledgerAgentIdStr === agentIdStr) {
        return true
      }
      
      // Match by name
      if (agentName && ledgerAgentName && String(ledgerAgentName).trim() === String(agentName).trim()) {
        return true
      }
      
      return false
    })
    
    // Track Finance payment Credit entries to match with their Debit entries
    // Finance payments create: Credit (Top-up) + Debit (On-Trip Payment)
    // Only Credit should affect balance, Debit should be skipped
    const financePaymentCredits = [] // Array of Finance Credit entries
    
    agentLedger.forEach(entry => {
      if (entry.type === 'Top-up' && entry.paymentMadeBy === 'Finance') {
        financePaymentCredits.push({
          amount: parseFloat(entry.amount) || 0,
          lrNumber: entry.lrNumber,
          tripId: entry.tripId ? String(entry.tripId) : null,
          createdAt: entry.createdAt || entry.date
        })
      }
    })
    
    // Remove duplicates from agentLedger (in case same entry appears multiple times)
    const uniqueEntries = []
    const seenEntries = new Set()
    agentLedger.forEach(entry => {
      // Use entry ID as primary key for uniqueness
      const entryId = entry.id || entry._id
      if (entryId && !seenEntries.has(entryId)) {
        seenEntries.add(entryId)
        uniqueEntries.push(entry)
      } else if (!entryId) {
        // Fallback for entries without ID - use composite key
        const entryKey = `${entry.type}_${entry.amount}_${entry.createdAt || entry.date}_${entry.lrNumber || entry.tripId || ''}`
        if (!seenEntries.has(entryKey)) {
          seenEntries.add(entryKey)
          uniqueEntries.push(entry)
        }
      }
    })
    
    // Sort entries chronologically (oldest first) for correct balance calculation
    // IMPORTANT: Include ALL agent entries for balance calculation, don't filter by branch
    const finalLedger = uniqueEntries.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.date || 0).getTime()
      return dateA - dateB // Oldest first
    })
    
    // Debug: Log all entries to verify Trip Created entries are included
    console.log('=== All Entries for Balance Calculation ===')
    finalLedger.forEach((entry, idx) => {
      console.log(`${idx + 1}. Type: ${entry.type} | Direction: ${entry.direction} | Amount: ${entry.amount} | Advance: ${entry.advance} | LR: ${entry.lrNumber} | TripId: ${entry.tripId} | Date: ${entry.createdAt || entry.date}`)
    })
    
    
    // Track which Finance payments we've already matched (both Credit and Debit)
    const matchedFinancePayments = new Set()
    
    // Helper function to check if Finance payment entries match
    const financePaymentMatches = (entry1, entry2) => {
      const amount1 = parseFloat(entry1.amount) || 0
      const amount2 = parseFloat(entry2.amount) || 0
      
      // Amount must match
      if (Math.abs(amount1 - amount2) > 0.01) return false
      
      // Match by LR number (most reliable)
      if (entry1.lrNumber && entry2.lrNumber && 
          String(entry1.lrNumber).trim() === String(entry2.lrNumber).trim()) {
        return true
      }
      
      // Match by trip ID
      if (entry1.tripId && entry2.tripId && 
          String(entry1.tripId) === String(entry2.tripId)) {
        return true
      }
      
      return false
    }
    
    // Pre-process: Find all Finance payment pairs and mark them for skipping
    const financePaymentPairs = []
    const processedCredits = new Set()
    const processedDebits = new Set()
    
    finalLedger.forEach(creditEntry => {
      if (creditEntry.type === 'Top-up' && 
          creditEntry.paymentMadeBy === 'Finance' && 
          creditEntry.direction === 'Credit') {
        const creditId = creditEntry.id || creditEntry._id
        if (processedCredits.has(creditId)) return // Already processed
        
        const matchingDebit = finalLedger.find(debitEntry => {
          const debitId = debitEntry.id || debitEntry._id
          if (processedDebits.has(debitId)) return false // Already in a pair
          
          return debitEntry.type === 'On-Trip Payment' && 
                 debitEntry.paymentMadeBy === 'Finance' && 
                 debitEntry.direction === 'Debit' &&
                 financePaymentMatches(creditEntry, debitEntry)
        })
        
        if (matchingDebit) {
          const pairKey = `${parseFloat(creditEntry.amount)}_${creditEntry.lrNumber || creditEntry.tripId || 'no-trip'}`
          const creditId = creditEntry.id || creditEntry._id
          const debitId = matchingDebit.id || matchingDebit._id
          
          financePaymentPairs.push({
            credit: creditEntry,
            debit: matchingDebit,
            key: pairKey,
            creditId: creditId,
            debitId: debitId
          })
          
          processedCredits.add(creditId)
          processedDebits.add(debitId)
          
          console.log(`Found Finance payment pair: Credit ${creditEntry.amount} (ID: ${creditId}) + Debit ${matchingDebit.amount} (ID: ${debitId}) for LR ${creditEntry.lrNumber}`)
        }
      }
    })
    
    console.log(`Total Finance payment pairs found: ${financePaymentPairs.length}`)
    
    // Calculate balance with explicit handling for each entry type
    let balance = 0
    let skippedEntries = []
    let countedEntries = []
    
    finalLedger.forEach(entry => {
      const entryAmount = parseFloat(entry.amount) || 0
      const entryId = entry.id || entry._id || 'unknown'
      
      // STEP 1: Skip Trip Closed entries completely (informational only)
      if (entry.type === 'Trip Closed') {
        skippedEntries.push({ type: entry.type, amount: entryAmount, lrNumber: entry.lrNumber, reason: 'Trip Closed is informational only' })
        return
      }
      
      // Skip informational entries (entries marked as informational - balance not affected)
      if (entry.isInformational === true) {
        skippedEntries.push({ type: entry.type, amount: entryAmount, lrNumber: entry.lrNumber, reason: 'Informational entry (balance not affected)' })
        return
      }
      
      // STEP 2: Skip Finance payment entries (both Credit and Debit) - net zero effect
      // Finance payment creates: Credit (Top-up) + Debit (On-Trip Payment)
      // Both entries are VISIBLE in ledger but SKIPPED in balance calculation (net zero effect)
      
      // Check if this entry is part of a Finance payment pair
      const isFinanceCredit = entry.type === 'Top-up' && 
                               entry.paymentMadeBy === 'Finance' && 
                               entry.direction === 'Credit'
      const isFinanceDebit = entry.type === 'On-Trip Payment' && 
                             entry.paymentMadeBy === 'Finance' && 
                             entry.direction === 'Debit'
      
      if (isFinanceCredit || isFinanceDebit) {
        // Check if this entry is part of a matched Finance payment pair
        const matchingPair = financePaymentPairs.find(pair => {
          const creditId = pair.creditId
          const debitId = pair.debitId
          
          return (creditId && entryId && String(creditId) === String(entryId)) ||
                 (debitId && entryId && String(debitId) === String(entryId))
        })
        
        if (matchingPair) {
          const entryKey = `${entryAmount}_${entry.lrNumber || entry.tripId || 'no-trip'}`
          if (!matchedFinancePayments.has(entryKey)) {
            matchedFinancePayments.add(entryKey)
            skippedEntries.push({ 
              type: entry.type, 
              amount: entryAmount, 
              lrNumber: entry.lrNumber, 
              reason: `Finance payment ${isFinanceCredit ? 'credit' : 'debit'} (offset by matching ${isFinanceCredit ? 'debit' : 'credit'} - net zero effect)` 
            })
            console.log(`✓ Skipping Finance ${isFinanceCredit ? 'Credit' : 'Debit'}: ${entryAmount} for LR ${entry.lrNumber} (matched pair)`)
            return // Skip this entry - don't count it in balance
          } else {
            console.log(`⚠ Finance ${isFinanceCredit ? 'Credit' : 'Debit'} already skipped: ${entryAmount} for LR ${entry.lrNumber}`)
            return // Already skipped
          }
        } else {
          console.log(`✗ Finance ${isFinanceCredit ? 'Credit' : 'Debit'} NOT in pair: ${entryAmount} for LR ${entry.lrNumber} - Will be counted`)
        }
      }
      
      // STEP 3: Handle Trip Created - always debit, use advance amount only
      if (entry.type === 'Trip Created') {
        let advanceAmount = entryAmount
        
        // Priority 1: Use entry.advance field (most reliable for ledger entries)
        if (entry.advance && parseFloat(entry.advance) > 0) {
          advanceAmount = parseFloat(entry.advance)
        } 
        // Priority 2: Try to get advance from trip data
        else if (entry.tripId || entry.lrNumber) {
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
        // Priority 3: Use entry.amount if it's already the advance amount
        
        // Always debit the advance amount (never credit)
        // Even if direction says Credit, we debit the advance
        balance = balance - advanceAmount
        countedEntries.push({ 
          type: entry.type, 
          direction: 'Debit', 
          amount: advanceAmount, 
          lrNumber: entry.lrNumber, 
          balance: balance,
          originalAmount: entryAmount,
          usedAdvance: advanceAmount
        })
        return
      }
      
      // STEP 4: Handle all other entries normally
      // Finance Credit entries (Top-up with paymentMadeBy='Finance') are counted normally
      // Finance Debit entries are already skipped in STEP 2
      if (entry.direction === 'Credit') {
        balance = balance + entryAmount
        countedEntries.push({ 
          type: entry.type, 
          direction: 'Credit', 
          amount: entryAmount, 
          lrNumber: entry.lrNumber, 
          balance: balance,
          paymentMadeBy: entry.paymentMadeBy || null
        })
      } else {
        // Regular debit entries (not Finance debits - those are skipped in STEP 2)
        balance = balance - entryAmount
        countedEntries.push({ 
          type: entry.type, 
          direction: 'Debit', 
          amount: entryAmount, 
          lrNumber: entry.lrNumber, 
          balance: balance 
        })
      }
    })
    
    // Debug output
    console.log('=== Balance Calculation Summary ===')
    console.log('Agent ID:', agentId)
    console.log('Agent Name:', agentName)
    console.log('Total entries from ledger:', agentLedger.length)
    console.log('Unique entries after deduplication:', finalLedger.length)
    console.log('Skipped entries:', skippedEntries.length)
    skippedEntries.forEach(e => console.log('  - Skipped:', e.type, e.amount, e.lrNumber, e.reason))
    console.log('Counted entries:', countedEntries.length)
    countedEntries.forEach(e => {
      const details = e.usedAdvance ? ` (Original: ${e.originalAmount}, Used Advance: ${e.usedAdvance})` : ''
      console.log(`  - Counted: ${e.type} | ${e.direction} | Amount: ${e.amount}${details} | LR: ${e.lrNumber} | Balance: ${e.balance}`)
    })
    console.log('Final balance:', balance)
    console.log('=== End Summary ===')
    
    return balance
  }, [ledger, trips, isAgent, user])

  // Get all agents except current agent for dropdown (restricted to same branch for agents)
  const availableAgents = useMemo(() => {
    const allAgents = getAgents() || []
    if (!isAgent() || !user) return allAgents
    
    // For agents, only show agents from the same branch
    if (user?.branch) {
      return allAgents.filter(agent => {
        const agentIdStr = agent.id?.toString() || agent._id?.toString()
        const userIdStr = user?.id?.toString() || user?._id?.toString()
        return agentIdStr !== userIdStr && 
               agent.name !== user?.name &&
               agent.branch === user.branch // Only same branch agents
      })
    }
    
    return allAgents.filter(agent => {
      const agentIdStr = agent.id?.toString() || agent._id?.toString()
      const userIdStr = user?.id?.toString() || user?._id?.toString()
      return agentIdStr !== userIdStr && agent.name !== user?.name
    })
  }, [getAgents, isAgent, user])

  // Handle payment to agent
  const handlePaymentToAgent = async (e) => {
    e.preventDefault()
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!selectedReceiverAgentId) {
      toast.error('Please select an agent', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    const receiverAgent = availableAgents.find(a => 
      (a.id === parseInt(selectedReceiverAgentId) || a.id === selectedReceiverAgentId) ||
      (a._id === selectedReceiverAgentId)
    )

    if (!receiverAgent) {
      toast.error('Selected agent not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (currentAgentBalance < parseFloat(paymentAmount)) {
      toast.error('Insufficient balance', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setIsTransferring(true)
    try {
      const receiverAgentId = receiverAgent.id || receiverAgent._id
      const senderAgentId = user?.id || user?._id
      
      await transferToAgent(
        senderAgentId,
        user?.name,
        receiverAgentId,
        receiverAgent.name,
        parseFloat(paymentAmount)
      )
      
      toast.success(`Payment of Rs ${parseFloat(paymentAmount).toLocaleString()} sent to ${receiverAgent.name}`, {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Reset form
      setPaymentAmount('')
      setSelectedReceiverAgentId('')
      setShowPaymentForm(false)
    } catch (error) {
      toast.error(error.message || 'Failed to transfer payment', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsTransferring(false)
    }
  }

  // Handle top-up (for Finance/Admin)
  const handleTopUp = async (e) => {
    e.preventDefault()
    
    if (!topUpForm.amount || parseFloat(topUpForm.amount) <= 0) {
      toast.error('Please enter a valid amount', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!topUpForm.agentId) {
      toast.error('Please select an agent', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // If mode is Online, bank is required
    if (topUpForm.mode === 'Online' && !topUpForm.bank) {
      toast.error('Bank selection is required for Online payments', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setIsAddingTopUp(true)
    try {
      const topUpData = {
        amount: parseFloat(topUpForm.amount),
        agentId: topUpForm.agentId,
        mode: topUpForm.mode,
        bank: topUpForm.bank || (topUpForm.mode === 'Cash' ? 'Cash' : ''),
        reason: topUpForm.reason || '',
        isVirtual: topUpForm.isVirtual || false,
      }

      await addTopUp(topUpData)
      
      const successMessage = topUpForm.isVirtual
        ? `Virtual Top-up of Rs ${parseFloat(topUpForm.amount).toLocaleString()} processed (Credit + Debit). Check ledger table below.`
        : `Top-up of Rs ${parseFloat(topUpForm.amount).toLocaleString()} added successfully. Check ledger table below.`
      
      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 4000,
      })
      
      // Reset form
      setTopUpForm({
        amount: '',
        agentId: '',
        mode: 'Cash',
        bank: '',
        reason: '',
        isVirtual: false,
      })
      
      // Scroll to ledger table to show the new entry
      setTimeout(() => {
        const ledgerTable = document.querySelector('.card.overflow-x-auto')
        if (ledgerTable) {
          ledgerTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Failed to add top-up', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setIsAddingTopUp(false)
    }
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Ledger</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {isAgent() ? (
            <>
              Your financial ledger and transactions
              {user?.branch && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Branch: {user.branch}</span>}
            </>
          ) : (
            'Financial ledger and transactions'
          )}
        </p>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
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
        {!isAgent() && (
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <AgentFilter
              selectedAgent={selectedAgentId}
              onAgentChange={setSelectedAgentId}
            />
          </div>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-3d-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
        >
          <FiFilter size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Filters</span>
          <span className="sm:hidden">Filter</span>
        </button>
      </div>
      
      {/* Top-up Form for Finance/Admin */}
      {(role === 'Finance' || isAdmin()) && (
        <div className="card bg-white border-2 border-gray-200 shadow-lg mb-4 sm:mb-6">
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3">Add Top-up</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              
              
             
              
             
              
             
            </div>
          </div>
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={topUpForm.isVirtual}
                onChange={(e) => setTopUpForm({ ...topUpForm, isVirtual: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-blue-800">
                Virtual Top-up (for Repairs/Direct Payments)
              </span>
            </label>
            <p className="text-xs text-blue-600 mt-1 ml-6">
              Virtual Top-up: Credit to Agent → Immediate Debit for Expense (Net zero effect, for direct payments like repairs)
            </p>
          </div>
          <form onSubmit={handleTopUp} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={topUpForm.amount}
                  onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                  className="input-field-3d w-full"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Agent <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={topUpForm.agentId}
                  onChange={(e) => setTopUpForm({ ...topUpForm, agentId: e.target.value })}
                  className="input-field-3d w-full appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select Agent</option>
                  {getAgents().length > 0 ? (
                    getAgents().map((agent) => (
                      <option key={agent.id || agent._id} value={agent.id || agent._id}>
                        {agent.name} {agent.phone ? `(${agent.phone})` : ''} {agent.branch ? `- ${agent.branch}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No agents available. Please wait...</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={topUpForm.mode}
                  onChange={(e) => setTopUpForm({ ...topUpForm, mode: e.target.value, bank: e.target.value === 'Cash' ? '' : topUpForm.bank })}
                  className="input-field-3d w-full appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Bank {topUpForm.mode === 'Online' && <span className="text-red-500">*</span>}
                </label>
                <select
                  required={topUpForm.mode === 'Online'}
                  value={topUpForm.bank}
                  onChange={(e) => setTopUpForm({ ...topUpForm, bank: e.target.value })}
                  className={`input-field-3d w-full appearance-none ${
                    topUpForm.mode === 'Cash' 
                      ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                      : 'bg-background-light cursor-pointer'
                  }`}
                  disabled={topUpForm.mode === 'Cash'}
                  style={{ 
                    backgroundImage: topUpForm.mode !== 'Cash' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")' : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="">Select Bank</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Canara Bank">Canara Bank</option>
                </select>
                {topUpForm.mode === 'Cash' && (
                  <p className="text-xs text-gray-500 mt-1">Bank selection is optional for Cash</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Reason (optional)
              </label>
              <input
                type="text"
                value={topUpForm.reason}
                onChange={(e) => setTopUpForm({ ...topUpForm, reason: e.target.value })}
                className="input-field-3d w-full"
                placeholder="Optional reason for top-up"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  For <strong>Cash</strong>, bank is optional. For <strong>Online</strong>, bank selection is compulsory.
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✓ After adding, the entry will appear in the ledger table below with Type: "Top-up" or "Virtual Top-up"
                </p>
              </div>
              <button
                type="submit"
                className="btn-3d-primary px-6 py-2.5 text-sm sm:text-base font-semibold whitespace-nowrap w-full sm:w-auto bg-[#8B4513] hover:bg-[#A0522D] text-white"
                disabled={isAddingTopUp || !topUpForm.agentId || !topUpForm.amount || (topUpForm.mode === 'Online' && !topUpForm.bank)}
              >
                {isAddingTopUp ? 'Adding...' : 'Add Top-up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment to Agent Section - Only for Agents */}
      {isAgent() && (
        <div className="card mb-4 sm:mb-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1">Payment to Agent</h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Transfer balance to other agents in emergency situations
              </p>
              <p className="text-xs sm:text-sm font-semibold text-blue-700 mt-2">
                Your Current Balance: Rs {currentAgentBalance.toLocaleString()}
              </p>
            </div>
            {showPaymentForm && (
              <button
                onClick={() => setShowPaymentForm(false)}
                className="btn-3d-secondary flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
              >
                <span>Hide Form</span>
              </button>
            )}
            {!showPaymentForm && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="btn-3d-primary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base whitespace-nowrap"
              >
                <FiSend size={18} className="sm:w-5 sm:h-5" />
                <span>Send Payment</span>
              </button>
            )}
          </div>

          {showPaymentForm && (
            <form onSubmit={handlePaymentToAgent} className="space-y-4 pt-4 border-t-2 border-blue-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                    Amount (Rs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentAgentBalance}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="input-field-3d w-full"
                    placeholder="Enter amount"
                  />
                  {paymentAmount && parseFloat(paymentAmount) > currentAgentBalance && (
                    <p className="text-xs text-red-600 mt-1">Amount exceeds your balance</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                    Select Agent <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedReceiverAgentId}
                    onChange={(e) => setSelectedReceiverAgentId(e.target.value)}
                    className="input-field-3d w-full"
                    style={{ 
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      paddingRight: '2.5rem',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="">Choose an agent...</option>
                    {availableAgents.length > 0 ? (
                      availableAgents.map((agent, index) => {
                        const agentIdValue = agent.id || agent._id || `agent-${index}`
                        return (
                          <option key={agentIdValue} value={agentIdValue}>
                            {agent.name} {agent.phone ? `(${agent.phone})` : ''} {agent.branch ? `- ${agent.branch}` : ''}
                          </option>
                        )
                      })
                    ) : (
                      <option value="" disabled>No agents available</option>
                    )}
                  </select>
                  {availableAgents.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">No other agents found in your branch. Please contact admin.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false)
                    setPaymentAmount('')
                    setSelectedReceiverAgentId('')
                  }}
                  className="btn-3d-secondary px-4 py-2 text-sm sm:text-base"
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base"
                  disabled={isTransferring || !paymentAmount || !selectedReceiverAgentId || parseFloat(paymentAmount) > currentAgentBalance}
                >
                  <FiSend size={18} className="sm:w-4 sm:h-5" />
                  <span>{isTransferring ? 'Processing...' : 'Send Payment'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input-field-3d w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={clearFilters}
                className="btn-3d-secondary px-4 py-2 w-full sm:w-auto text-sm sm:text-base"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Date / Time</th>
                {showAgentColumn && (
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Agent</th>
                )}
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">LR No</th>
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Type</th>
                {showBankColumn && (
                  <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Bank</th>
                )}
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Direction</th>
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Amount</th>
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm whitespace-nowrap">Paid By</th>
                <th className="text-left py-3 px-3 sm:px-4 text-text-secondary font-semibold text-xs sm:text-sm">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length > 0 ? (
                filteredLedger.map((entry, index) => (
                  <tr key={entry.id || entry._id || `ledger-${index}`} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 sm:px-4 text-text-primary text-xs sm:text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : 
                           entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                        </span>
                      </div>
                    </td>
                    {showAgentColumn && (
                      <td className="py-3 px-3 sm:px-4 text-text-primary text-xs sm:text-sm break-words">{entry.agent?.name || entry.agent || 'N/A'}</td>
                    )}
                    <td className="py-3 px-3 sm:px-4 text-text-primary font-medium text-xs sm:text-sm break-words">
                      {entry.lrNumber || entry.tripId || 'N/A'}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                          // Credit types: green
                          entry.type === 'Top-up' || entry.type === 'Virtual Top-up' || entry.type === 'Settlement' || entry.type === 'Beta/Batta Credit' || 
                          (entry.type === 'Agent Transfer' && entry.direction === 'Credit')
                            ? 'bg-green-100 text-green-800'
                            // Debit types: red
                            : entry.type === 'Trip Created' || entry.type === 'On-Trip Payment' || entry.type === 'Virtual Expense' || entry.type === 'Trip Closed' ||
                              (entry.type === 'Agent Transfer' && entry.direction === 'Debit')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {entry.type || 'N/A'}
                      </span>
                    </td>
                    {showBankColumn && (
                      <td className="py-3 px-3 sm:px-4 text-text-primary text-xs sm:text-sm break-words">{entry.bank || 'N/A'}</td>
                    )}
                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                          entry.direction === 'Credit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.direction || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-text-primary font-semibold text-xs sm:text-sm break-words whitespace-nowrap">
                      {/* Display corrected amount (already transformed in filteredLedger) */}
                      Rs {(entry.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      {entry.paymentMadeBy ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          entry.paymentMadeBy === 'Finance' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.paymentMadeBy}
                        </span>
                      ) : entry.type === 'Agent Transfer' ? (
                        // Extract receiver/sender name from description for Agent Transfer
                        (() => {
                          const desc = entry.description || ''
                          let transferPartner = ''
                          if (entry.direction === 'Debit') {
                            // "Payment transferred to {name}"
                            const match = desc.match(/transferred to (.+)/i)
                            transferPartner = match ? match[1].trim() : ''
                          } else if (entry.direction === 'Credit') {
                            // "Payment received from {name}"
                            const match = desc.match(/received from (.+)/i)
                            transferPartner = match ? match[1].trim() : ''
                          }
                          return transferPartner ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-100 text-purple-800">
                              {transferPartner}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )
                        })()
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-text-primary text-xs sm:text-sm break-words">{entry.description || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showAgentColumn && showBankColumn ? 9 : showAgentColumn || showBankColumn ? 8 : 7} className="py-12 text-center text-text-muted text-sm">
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      {filteredLedger.length > 0 && (
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card bg-white border-2 border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-text-secondary mb-2">Total Amount</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary break-words">
              Rs {filteredLedger.reduce((sum, entry) => sum + (entry.amount || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card bg-white border-2 border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-text-secondary mb-2">Total Credits</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 break-words">
              Rs {filteredLedger.filter(e => {
                // Fix: Trip Created should not be counted as Credit
                const direction = (e.type === 'Trip Created' && e.direction === 'Credit') ? 'Debit' : e.direction
                return direction === 'Credit'
              }).reduce((sum, entry) => {
                // Use corrected amount (already transformed in filteredLedger)
                return sum + (entry.amount || 0)
              }, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card bg-white border-2 border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-text-secondary mb-2">Total Debits</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 break-words">
              Rs {filteredLedger.filter(e => {
                // Fix: Trip Created should be counted as Debit
                const direction = (e.type === 'Trip Created' && e.direction === 'Credit') ? 'Debit' : e.direction
                return direction === 'Debit'
              }).reduce((sum, entry) => {
                // Use corrected amount (already transformed in filteredLedger)
                return sum + (entry.amount || 0)
              }, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ledger
