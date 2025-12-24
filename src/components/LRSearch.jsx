import React, { useState, useRef, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchAPI } from '../services/api'
import { toast } from 'react-toastify'

const LRSearch = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setResults(null)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      // Global search API - searches across all trips and ledger entries regardless of user role
      const searchResults = await searchAPI.globalLRSearch(searchTerm.trim())
      
      // Check if we got valid results
      if (searchResults && (searchResults.trips || searchResults.ledger)) {
        const trips = searchResults.trips || []
        const ledgerEntries = searchResults.ledger || []
        
        // LR Search = Trip Search - Always navigate directly to trip, NO POPUP
        if (trips.length > 0) {
          // Navigate directly to the FIRST trip found (no popup, no selection)
          const trip = trips[0]
          const tripId = trip.id || trip._id
          
          if (!tripId) {
            toast.error('Trip ID not found', {
              position: 'top-right',
              autoClose: 2000,
            })
            return
          }
          
          // Navigate based on user role
          if (user?.role === 'Admin') {
            navigate(`/admin/trips/${tripId}`)
          } else if (user?.role === 'Finance') {
            navigate(`/finance/trips/${tripId}`)
          } else if (user?.role === 'Agent') {
            navigate(`/agent/trips/${tripId}`)
          } else {
            // Default to agent route if role not found
            navigate(`/agent/trips/${tripId}`)
          }
          
          // Clear search
          setSearchTerm('')
          setResults(null)
          setShowResults(false)
          
          // Show success message only if multiple trips found (inform user we're showing first one)
          if (trips.length > 1) {
            toast.success(`Found ${trips.length} trips. Opening first trip: ${trip.lrNumber || trip.tripId}`, {
              position: 'top-right',
              autoClose: 3000,
            })
          } else {
            toast.success(`Opening trip: ${trip.lrNumber || trip.tripId}`, {
              position: 'top-right',
              autoClose: 2000,
            })
          }
          return
        } else if (ledgerEntries.length > 0) {
          // No trips but ledger entries found - try to navigate to trip from ledger entry
          const ledgerEntry = ledgerEntries[0]
          const tripId = ledgerEntry.tripId?._id || ledgerEntry.tripId?.id || ledgerEntry.tripId
          
          if (tripId) {
            // Navigate based on user role
            if (user?.role === 'Admin') {
              navigate(`/admin/trips/${tripId}`)
            } else if (user?.role === 'Finance') {
              navigate(`/finance/trips/${tripId}`)
            } else if (user?.role === 'Agent') {
              navigate(`/agent/trips/${tripId}`)
            } else {
              navigate(`/agent/trips/${tripId}`)
            }
            
            setSearchTerm('')
            setResults(null)
            setShowResults(false)
            
            toast.success('Opening trip from ledger entry', {
              position: 'top-right',
              autoClose: 2000,
            })
            return
          } else {
            // No trip ID in ledger entry - show error
            toast.error('No trip found for this LR number', {
              position: 'top-right',
              autoClose: 3000,
            })
            setResults(null)
            setShowResults(false)
          }
        } else {
          // No results found
          toast.info(`No trips found for "${searchTerm.trim()}"`, {
            position: 'top-right',
            autoClose: 2000,
          })
          setResults(null)
          setShowResults(false)
        }
      } else {
        // Invalid response format
        toast.info(`No trips found for "${searchTerm.trim()}"`, {
          position: 'top-right',
          autoClose: 2000,
        })
        setResults(null)
        setShowResults(false)
      }
    } catch (error) {
      console.error('Search error details:', {
        message: error.message,
        stack: error.stack,
        searchTerm: searchTerm.trim()
      })
      
      // Better error messages
      let errorMessage = 'Search failed. '
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage += 'Please check if backend server is running on http://localhost:5000'
      } else if (error.message?.includes('404')) {
        errorMessage += 'Search endpoint not found. Please check backend routes.'
      } else if (error.message?.includes('500')) {
        errorMessage += 'Server error. Please try again later.'
      } else {
        errorMessage += error.message || 'Please check your connection and try again.'
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
      setResults({ trips: [], ledger: [], searchTerm: searchTerm.trim() })
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    setSearchTerm('')
    setResults(null)
    setShowResults(false)
    // Collapse search on mobile when cleared
    if (isMobile) {
      setIsExpanded(false)
      // Use setTimeout to ensure blur happens after state update
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.blur()
        }
      }, 100)
    }
  }

  const handleFocus = () => {
    // Expand search on mobile when focused
    if (isMobile) {
      setIsExpanded(true)
    }
  }

  const handleBlur = (e) => {
    // Don't collapse if there's text in the search
    // Check if the blur is caused by clicking the clear button
    const relatedTarget = e.relatedTarget || document.activeElement
    const isClearButton = relatedTarget?.closest('button[aria-label="Clear search"]')
    
    if (!searchTerm && isMobile && !isClearButton) {
      // Small delay to allow clear button click
      setTimeout(() => {
        if (!searchTerm && !isClearButton) {
          setIsExpanded(false)
        }
      }, 200)
    }
  }

  return (
    <div className={`relative ${isExpanded && isMobile ? 'z-[60]' : 'z-auto'}`}>
      <form onSubmit={handleSearch} className={`flex items-center gap-2 ${
        isExpanded && isMobile ? 'w-full' : ''
      }`}>
        <div className={`relative transition-all duration-300 ease-in-out ${
          isMobile 
            ? (isExpanded ? 'flex-1' : 'w-32 sm:w-36')
            : 'w-64 lg:w-80' // Desktop: smaller fixed width
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleFocus}
            placeholder="Search by LR Number..."
            className={`input-field-3d w-full pl-10 pr-10 transition-all duration-300 ${
              isExpanded && isMobile ? 'shadow-lg border-primary ring-2 ring-primary ring-opacity-50' : ''
            }`}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
          {(isExpanded || searchTerm) && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary p-1.5 z-10 bg-background-light rounded-full hover:bg-background transition-all"
              aria-label="Clear search"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
        {(isExpanded || !isMobile) && (
          <button
            type="submit"
            disabled={isSearching}
            className="btn-3d-primary px-3 sm:px-4 py-2 flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <FiSearch size={18} />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        )}
      </form>

      {/* Modal removed - Direct navigation to trip page instead */}
    </div>
  )
}

export default LRSearch

