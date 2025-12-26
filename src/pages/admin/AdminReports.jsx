import React, { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { FiDownload, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import AgentFilter from '../../components/AgentFilter'
import { toast } from 'react-toastify'

const AdminReports = () => {
  const { trips, agents, ledger } = useData()
  
  const [reportType, setReportType] = useState('Trips - Detail')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [tripType, setTripType] = useState('')
  const [status, setStatus] = useState('')
  const [lrSheet, setLrSheet] = useState('')
  const [truckFilter, setTruckFilter] = useState('')
  const [routeFilter, setRouteFilter] = useState('')
  const [lrSearchTerm, setLrSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  // Process data based on report type
  const processedData = useMemo(() => {
    let filtered = [...trips]

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo)
    }

    // Apply other filters based on report type
    if (reportType.includes('Trips') || reportType.includes('LR Sheets') || reportType.includes('Bulk trips') || reportType.includes('Regular trip')) {
      if (selectedAgent) {
        filtered = filtered.filter(t => t.agentId === parseInt(selectedAgent) || t.agent === selectedAgent)
      }
      if (tripType) {
        filtered = filtered.filter(t => 
          (tripType === 'Normal' && !t.isBulk) || 
          (tripType === 'Bulk' && t.isBulk)
        )
      }
      if (status) {
        filtered = filtered.filter(t => t.status === status)
      }
      if (lrSheet) {
        if (lrSheet === 'Not Received') {
          filtered = filtered.filter(t => !t.lrSheet || t.lrSheet === 'Not Received')
        } else {
          filtered = filtered.filter(t => t.lrSheet?.includes(lrSheet))
        }
      }
      if (truckFilter) {
        filtered = filtered.filter(t => 
          t.truckNumber?.toLowerCase().includes(truckFilter.toLowerCase())
        )
      }
      if (routeFilter) {
        filtered = filtered.filter(t => 
          t.route?.toLowerCase().includes(routeFilter.toLowerCase()) ||
          t.routeFrom?.toLowerCase().includes(routeFilter.toLowerCase()) ||
          t.routeTo?.toLowerCase().includes(routeFilter.toLowerCase())
        )
      }
      if (lrSearchTerm) {
        filtered = filtered.filter(t => 
          t.lrNumber?.toLowerCase().includes(lrSearchTerm.toLowerCase()) ||
          t.tripId?.toLowerCase().includes(lrSearchTerm.toLowerCase())
        )
      }
    }

    // Process based on report type
    switch (reportType) {
      case 'Trips - Summary by Company':
        const companySummary = {}
        filtered.forEach(trip => {
          const company = trip.companyName || 'Unknown'
          if (!companySummary[company]) {
            companySummary[company] = {
              company,
              totalTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalBalance: 0,
            }
          }
          companySummary[company].totalTrips++
          companySummary[company].totalFreight += (trip.freight || trip.freightAmount || 0)
          companySummary[company].totalAdvance += (trip.advance || trip.advancePaid || 0)
          companySummary[company].totalBalance += (trip.balance || trip.balanceAmount || 0)
        })
        return Object.values(companySummary)

      case 'Trips - Summary by Agent':
        const agentSummary = {}
        filtered.forEach(trip => {
          const agent = trip.agent || 'Unknown'
          if (!agentSummary[agent]) {
            agentSummary[agent] = {
              agent,
              totalTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalBalance: 0,
            }
          }
          agentSummary[agent].totalTrips++
          agentSummary[agent].totalFreight += (trip.freight || trip.freightAmount || 0)
          agentSummary[agent].totalAdvance += (trip.advance || trip.advancePaid || 0)
          agentSummary[agent].totalBalance += (trip.balance || trip.balanceAmount || 0)
        })
        return Object.values(agentSummary)

      case 'Trips - Summary by Truck':
        const truckSummary = {}
        filtered.forEach(trip => {
          const truck = trip.truckNumber || 'Unknown'
          if (!truckSummary[truck]) {
            truckSummary[truck] = {
              truck,
              totalTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalBalance: 0,
            }
          }
          truckSummary[truck].totalTrips++
          truckSummary[truck].totalFreight += (trip.freight || trip.freightAmount || 0)
          truckSummary[truck].totalAdvance += (trip.advance || trip.advancePaid || 0)
          truckSummary[truck].totalBalance += (trip.balance || trip.balanceAmount || 0)
        })
        return Object.values(truckSummary)

      case 'Bulk trips - Summary by Truck':
        const bulkTrips = filtered.filter(t => t.isBulk)
        const bulkTruckSummary = {}
        bulkTrips.forEach(trip => {
          const truck = trip.truckNumber || 'Unknown'
          if (!bulkTruckSummary[truck]) {
            bulkTruckSummary[truck] = {
              truck,
              totalTrips: 0,
            }
          }
          bulkTruckSummary[truck].totalTrips++
        })
        return Object.values(bulkTruckSummary)

      case 'Normal trip - All':
        return filtered.filter(t => !t.isBulk)

      case 'Trips - Summary by Status':
        const statusSummary = {}
        filtered.forEach(trip => {
          const tripStatus = trip.status || 'Unknown'
          if (!statusSummary[tripStatus]) {
            statusSummary[tripStatus] = {
              status: tripStatus,
              totalTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalBalance: 0,
            }
          }
          statusSummary[tripStatus].totalTrips++
          statusSummary[tripStatus].totalFreight += (trip.freight || trip.freightAmount || 0)
          statusSummary[tripStatus].totalAdvance += (trip.advance || trip.advancePaid || 0)
          statusSummary[tripStatus].totalBalance += (trip.balance || trip.balanceAmount || 0)
        })
        return Object.values(statusSummary)

      case 'LR Sheets - Summary by Received/Not Received':
        const lrSummary = {
          'Received': { status: 'Received', count: 0 },
          'Not Received': { status: 'Not Received', count: 0 }
        }
        filtered.forEach(trip => {
          if (trip.lrSheet && trip.lrSheet !== 'Not Received') {
            lrSummary['Received'].count++
          } else {
            lrSummary['Not Received'].count++
          }
        })
        return Object.values(lrSummary)

      case 'Ledger - Summary by Bank':
        let ledgerFiltered = [...ledger]
        if (dateFrom) {
          ledgerFiltered = ledgerFiltered.filter(l => {
            const entryDate = l.date || l.createdAt?.split('T')[0]
            return entryDate >= dateFrom
          })
        }
        if (dateTo) {
          ledgerFiltered = ledgerFiltered.filter(l => {
            const entryDate = l.date || l.createdAt?.split('T')[0]
            return entryDate <= dateTo
          })
        }
        const bankSummary = {}
        ledgerFiltered.forEach(entry => {
          const bank = entry.bank || 'Cash'
          if (!bankSummary[bank]) {
            bankSummary[bank] = {
              bank,
              totalEntries: 0,
              totalCredit: 0,
              totalDebit: 0,
              netAmount: 0,
            }
          }
          bankSummary[bank].totalEntries++
          if (entry.direction === 'Credit') {
            bankSummary[bank].totalCredit += (entry.amount || 0)
            bankSummary[bank].netAmount += (entry.amount || 0)
          } else {
            bankSummary[bank].totalDebit += (entry.amount || 0)
            bankSummary[bank].netAmount -= (entry.amount || 0)
          }
        })
        return Object.values(bankSummary)

      case 'Ledger - Top ups by Agent':
        let topUpFiltered = ledger.filter(l => l.type === 'Top-up')
        if (dateFrom) {
          topUpFiltered = topUpFiltered.filter(l => {
            const entryDate = l.date || l.createdAt?.split('T')[0]
            return entryDate >= dateFrom
          })
        }
        if (dateTo) {
          topUpFiltered = topUpFiltered.filter(l => {
            const entryDate = l.date || l.createdAt?.split('T')[0]
            return entryDate <= dateTo
          })
        }
        if (selectedAgent) {
          topUpFiltered = topUpFiltered.filter(l => 
            l.agentId === parseInt(selectedAgent) || l.agent === selectedAgent
          )
        }
        const topUpSummary = {}
        topUpFiltered.forEach(entry => {
          const agent = entry.agent || 'Unknown'
          if (!topUpSummary[agent]) {
            topUpSummary[agent] = {
              agent,
              totalTopUps: 0,
              totalAmount: 0,
            }
          }
          topUpSummary[agent].totalTopUps++
          topUpSummary[agent].totalAmount += (entry.amount || 0)
        })
        return Object.values(topUpSummary)

      case 'Route Profitability Heatmap':
        const routeProfitability = {}
        filtered.forEach(trip => {
          if (trip.isBulk) return // Skip bulk trips
          const route = trip.route || `${trip.routeFrom || ''} - ${trip.routeTo || ''}`
          if (!routeProfitability[route]) {
            routeProfitability[route] = {
              route,
              totalTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalExpenses: 0,
              totalProfit: 0,
            }
          }
          routeProfitability[route].totalTrips++
          routeProfitability[route].totalFreight += (trip.freight || trip.freightAmount || 0)
          routeProfitability[route].totalAdvance += (trip.advance || trip.advancePaid || 0)
          const payments = trip.onTripPayments || []
          const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
          const deductions = trip.deductions || {}
          const totalDeductions = Object.entries(deductions).reduce((sum, [key, val]) => {
            if (key === 'othersReason' || key === 'beta') return sum
            return sum + (parseFloat(val) || 0)
          }, 0)
          routeProfitability[route].totalExpenses += totalPayments + totalDeductions
          routeProfitability[route].totalProfit += ((trip.freight || trip.freightAmount || 0) - (trip.advance || trip.advancePaid || 0) - totalPayments - totalDeductions)
        })
        return Object.values(routeProfitability)

      case 'Trip Closing Audit List':
        return filtered
          .filter(trip => trip.status === 'Completed' && trip.closedAt)
          .map(trip => ({
            ...trip,
            closedDate: trip.closedAt ? new Date(trip.closedAt).toISOString().split('T')[0] : 'N/A',
            closedTime: trip.closedAt ? new Date(trip.closedAt).toLocaleTimeString() : 'N/A',
            finalBalance: trip.finalBalance || 0,
          }))
          .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))

      case 'Agent Performance & Wallet History':
        const agentPerformance = {}
        filtered.forEach(trip => {
          const agentId = trip.agentId
          const agentName = trip.agent || 'Unknown'
          if (!agentPerformance[agentId]) {
            agentPerformance[agentId] = {
              agentId,
              agentName,
              totalTrips: 0,
              activeTrips: 0,
              completedTrips: 0,
              disputedTrips: 0,
              totalFreight: 0,
              totalAdvance: 0,
              totalExpenses: 0,
            }
          }
          agentPerformance[agentId].totalTrips++
          if (trip.status === 'Active') agentPerformance[agentId].activeTrips++
          if (trip.status === 'Completed') agentPerformance[agentId].completedTrips++
          if (trip.status === 'Dispute' || trip.status === 'In Dispute') agentPerformance[agentId].disputedTrips++
          agentPerformance[agentId].totalFreight += (trip.freight || trip.freightAmount || 0)
          agentPerformance[agentId].totalAdvance += (trip.advance || trip.advancePaid || 0)
          const payments = trip.onTripPayments || []
          const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
          agentPerformance[agentId].totalExpenses += totalPayments
        })
        
        // Add wallet history from ledger
        Object.keys(agentPerformance).forEach(agentId => {
          const agentLedger = ledger.filter(l => 
            l.agentId === parseInt(agentId) || l.agent === agentPerformance[agentId].agentName
          )
          const currentBalance = agentLedger.reduce((sum, entry) => {
            if (entry.direction === 'Credit') {
              return sum + (entry.amount || 0)
            } else {
              return sum - (entry.amount || 0)
            }
          }, 0)
          agentPerformance[agentId].currentWalletBalance = currentBalance
          agentPerformance[agentId].totalTopUps = agentLedger
            .filter(l => l.type === 'Top-up' || l.type === 'Virtual Top-up')
            .reduce((sum, e) => sum + (e.amount || 0), 0)
        })
        
        return Object.values(agentPerformance)

      default:
        // Trips - Detail
        return filtered
    }
  }, [trips, ledger, reportType, dateFrom, dateTo, selectedAgent, tripType, status, lrSheet, truckFilter, routeFilter, lrSearchTerm])

  const filteredData = processedData

  // Get table columns based on report type
  const getTableColumns = () => {
    switch (reportType) {
      case 'Trips - Summary by Company':
        return [
          { key: 'company', label: 'Company' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalBalance', label: 'Total Balance' },
        ]
      case 'Trips - Summary by Agent':
        return [
          { key: 'agent', label: 'Agent' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalBalance', label: 'Total Balance' },
        ]
      case 'Trips - Summary by Truck':
        return [
          { key: 'truck', label: 'Truck' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalBalance', label: 'Total Balance' },
        ]
      case 'Bulk trips - Summary by Truck':
        return [
          { key: 'truck', label: 'Truck' },
          { key: 'totalTrips', label: 'Total Trips' },
        ]
      case 'Trips - Summary by Status':
        return [
          { key: 'status', label: 'Status' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalBalance', label: 'Total Balance' },
        ]
      case 'LR Sheets - Summary by Received/Not Received':
        return [
          { key: 'status', label: 'LR Sheet Status' },
          { key: 'count', label: 'Count' },
        ]
      case 'Ledger - Summary by Bank':
        return [
          { key: 'bank', label: 'Bank' },
          { key: 'totalEntries', label: 'Total Entries' },
          { key: 'totalCredit', label: 'Total Credit' },
          { key: 'totalDebit', label: 'Total Debit' },
          { key: 'netAmount', label: 'Net Amount' },
        ]
      case 'Ledger - Top ups by Agent':
        return [
          { key: 'agent', label: 'Agent' },
          { key: 'totalTopUps', label: 'Total Top-ups' },
          { key: 'totalAmount', label: 'Total Amount' },
        ]
      case 'Route Profitability Heatmap':
        return [
          { key: 'route', label: 'Route' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalExpenses', label: 'Total Expenses' },
          { key: 'totalProfit', label: 'Total Profit' },
        ]
      case 'Trip Closing Audit List':
        return [
          { key: 'closedDate', label: 'Closed Date' },
          { key: 'closedTime', label: 'Closed Time' },
          { key: 'lrNumber', label: 'LR No' },
          { key: 'agent', label: 'Agent' },
          { key: 'route', label: 'Route' },
          { key: 'finalBalance', label: 'Final Balance' },
        ]
      case 'Agent Performance & Wallet History':
        return [
          { key: 'agentName', label: 'Agent' },
          { key: 'totalTrips', label: 'Total Trips' },
          { key: 'activeTrips', label: 'Active Trips' },
          { key: 'completedTrips', label: 'Completed Trips' },
          { key: 'disputedTrips', label: 'Disputed Trips' },
          { key: 'totalFreight', label: 'Total Freight' },
          { key: 'totalAdvance', label: 'Total Advance' },
          { key: 'totalExpenses', label: 'Total Expenses' },
          { key: 'currentWalletBalance', label: 'Current Wallet Balance' },
          { key: 'totalTopUps', label: 'Total Top-ups' },
        ]
      default:
        // Trips - Detail or Normal trip - All
        return [
          { key: 'date', label: 'Date' },
          { key: 'lrNumber', label: 'LR No' },
          { key: 'type', label: 'Type' },
          { key: 'agent', label: 'Agent' },
          { key: 'status', label: 'Status' },
          { key: 'lrSheet', label: 'LR Sheet' },
          { key: 'route', label: 'Route' },
          { key: 'truck', label: 'Truck' },
          { key: 'freight', label: 'Freight' },
          { key: 'advance', label: 'Advance' },
          { key: 'balance', label: 'Balance' },
        ]
    }
  }

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    const columns = getTableColumns()
    const headers = columns.map(col => col.label)
    
    let htmlContent = `
      <html>
        <head>
          <title>${reportType} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            @media print { @page { margin: 1cm; } }
          </style>
        </head>
        <body>
          <h1>${reportType} Report</h1>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(row => `
                <tr>
                  ${columns.map(col => {
                    const value = row[col.key]
                    const displayValue = typeof value === 'number' 
                      ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      : (value || '')
                    return `<td>${displayValue}</td>`
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
    
    toast.success('PDF export initiated!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    const columns = getTableColumns()
    const headers = columns.map(col => col.label)
    
    const rows = filteredData.map(row => {
      return columns.map(col => {
        const value = row[col.key]
        if (typeof value === 'number') {
          return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        }
        return value || ''
      })
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${reportType.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Report exported successfully!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setSelectedAgent('')
    setTripType('')
    setStatus('')
    setLrSheet('')
    setTruckFilter('')
    setRouteFilter('')
    setLrSearchTerm('')
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-text-secondary">Generate tabular reports and export as CSV</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-3d-primary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base whitespace-nowrap"
          >
            <FiDownload size={18} className="sm:w-5 sm:h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-3d-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base whitespace-nowrap"
          >
            <FiDownload size={18} className="sm:w-5 sm:h-5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Report Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-3d-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base"
          >
            <FiFilter size={18} className="sm:w-5 sm:h-5" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field-3d"
              >
                <option value="Trips - Detail">Trips - Detail</option>
                <option value="Trips - Summary by Company">Trips - Summary by Company</option>
                <option value="Trips - Summary by Agent">Trips - Summary by Agent</option>
                <option value="Trips - Summary by Truck">Trips - Summary by Truck</option>
                <option value="Trips - Summary by Status">Trips - Summary by Status</option>
                <option value="Normal trip - All">Normal trip - All</option>
                <option value="Bulk trips - Summary by Truck">Bulk trips - Summary by Truck</option>
                <option value="LR Sheets - Summary by Received/Not Received">LR Sheets - Summary by Received/Not Received</option>
                <option value="Ledger - Summary by Bank">Ledger - Summary by Bank</option>
                <option value="Ledger - Top ups by Agent">Ledger - Top ups by Agent</option>
                <option value="Route Profitability Heatmap">Route Profitability Heatmap</option>
                <option value="Trip Closing Audit List">Trip Closing Audit List</option>
                <option value="Agent Performance & Wallet History">Agent Performance & Wallet History</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field-3d"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field-3d"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Agent
              </label>
              <AgentFilter
                selectedAgent={selectedAgent}
                onAgentChange={setSelectedAgent}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="input-field-3d"
              >
                <option value="">All</option>
                <option value="Normal">Normal</option>
                <option value="Bulk">Bulk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field-3d"
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="In Transit">In Transit</option>
                <option value="Dispute">Dispute</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                LR Sheet
              </label>
              <select
                value={lrSheet}
                onChange={(e) => setLrSheet(e.target.value)}
                className="input-field-3d"
              >
                <option value="">All</option>
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Truck (contains)
              </label>
              <input
                type="text"
                value={truckFilter}
                onChange={(e) => setTruckFilter(e.target.value)}
                className="input-field-3d"
                placeholder="Enter truck number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Route (contains)
              </label>
              <input
                type="text"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="input-field-3d"
                placeholder="Enter route"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                LR Number
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
                <input
                  type="text"
                  value={lrSearchTerm}
                  onChange={(e) => setLrSearchTerm(e.target.value)}
                  className="input-field-3d pl-10 pr-10"
                  placeholder="Search by LR Number..."
                />
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

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-3d-secondary px-4 py-2 w-full"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
            Report Results ({filteredData.length} records)
          </h2>
        </div>
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                {getTableColumns().map((col) => (
                  <th key={col.key} className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={row.id || row._id || `row-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                    {getTableColumns().map((col, colIndex) => {
                      const value = row[col.key]
                      let displayValue = value
                      
                      // Format based on column type
                      if (col.key.includes('Freight') || col.key.includes('Advance') || col.key.includes('Balance') || 
                          col.key.includes('Credit') || col.key.includes('Debit') || col.key.includes('Amount') || 
                          col.key.includes('netAmount')) {
                        displayValue = `Rs ${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                      } else if (col.key === 'type') {
                        return (
                          <td key={col.key} className="py-3 sm:py-4 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              row.isBulk ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {value || (row.isBulk ? 'Bulk' : 'Normal')}
                            </span>
                          </td>
                        )
                      } else if (col.key === 'status' && reportType.includes('Trips')) {
                        return (
                          <td key={col.key} className="py-3 sm:py-4 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              value === 'Active' ? 'bg-green-100 text-green-800' :
                              value === 'Dispute' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {value}
                            </span>
                          </td>
                        )
                      } else if (col.key === 'lrNumber') {
                        displayValue = row.lrNumber || row.tripId || 'N/A'
                      } else if (col.key === 'route') {
                        displayValue = row.route || `${row.routeFrom || ''} - ${row.routeTo || ''}`
                      } else if (col.key === 'truck') {
                        displayValue = row.truckNumber || 'N/A'
                      } else if (col.key === 'lrSheet') {
                        displayValue = row.lrSheet || 'Not Received'
                      }
                      
                      return (
                        <td key={col.key} className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                          {displayValue || 'N/A'}
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={getTableColumns().length} className="py-8 text-center text-text-muted text-sm">
                    No data found. Adjust filters and try again.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
