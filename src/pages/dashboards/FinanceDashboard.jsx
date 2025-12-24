import React, { useMemo, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { reportAPI } from '../../services/api'
import { FiDollarSign, FiFileText, FiTruck, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import LRSearch from '../../components/LRSearch'

const FinanceDashboard = () => {
  const { user } = useAuth()
  const { trips, ledger } = useData()
  const [dashboardStats, setDashboardStats] = useState(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const stats = await reportAPI.getDashboardStats({})
      setDashboardStats(stats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    // Use API stats if available, otherwise fallback to local calculation
    if (dashboardStats) {
      return [
        { 
          title: 'Mid-Payments Today', 
          value: `Rs ${(dashboardStats.midPaymentsToday || 0).toLocaleString()}`, 
          icon: FiDollarSign, 
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          link: '/finance/ledger'
        },
        { 
          title: 'Top-Ups Today', 
          value: `Rs ${(dashboardStats.topUpsToday || 0).toLocaleString()}`, 
          icon: FiDollarSign, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          link: '/finance/ledger'
        },
        { 
          title: 'Active Trips', 
          value: (dashboardStats.activeTrips || 0).toString(), 
          icon: FiTruck, 
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          link: '/finance/trips?status=active'
        },
        { 
          title: 'LR Sheets Not Received', 
          value: (dashboardStats.lrSheetsNotReceived || 0).toString(), 
          icon: FiFileText, 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          link: '/finance/trips?lrSheet=not-received'
        },
        { 
          title: 'Normal Trips', 
          value: (dashboardStats.normalTrips || 0).toString(), 
          icon: FiTruck, 
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          link: '/finance/trips?type=regular'
        },
        { 
          title: 'Bulk Trips', 
          value: (dashboardStats.bulkTrips || 0).toString(), 
          icon: FiTruck, 
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          link: '/finance/trips?type=bulk'
        },
        { 
          title: 'Bank-wise Movements Today', 
          value: `${dashboardStats.bankMovementsToday || 0} banks`, 
          icon: FiClock, 
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          link: '/finance/ledger',
          subtitle: `Net: Rs ${(dashboardStats.totalBankNet || 0).toLocaleString()}`,
          bankSummary: dashboardStats.bankSummary
        },
      ]
    }
    
    // Fallback to local calculation
    
    // Mid-payments today (ledger entries with type containing "Mid" or "Payment")
    const midPaymentsToday = ledger.filter(l => {
      const entryDate = l.date || l.createdAt?.split('T')[0]
      return entryDate === today && (l.type?.includes('Payment') || l.type?.includes('Mid'))
    }).reduce((sum, e) => sum + (e.amount || 0), 0)
    
    // Top-ups today
    const topUpsToday = ledger.filter(l => {
      const entryDate = l.date || l.createdAt?.split('T')[0]
      return entryDate === today && l.type?.includes('Top-up')
    }).reduce((sum, e) => sum + (e.amount || 0), 0)
    
    const activeTrips = trips.filter(t => t.status === 'Active').length
    const lrSheetsNotReceived = trips.filter(t => !t.lrSheet || t.lrSheet === 'Not Received').length
    const regularTrips = trips.filter(t => !t.isBulk).length
    const bulkTrips = trips.filter(t => t.isBulk).length
    
    // Bank-wise movements today - Enhanced with detailed summary
    const todayLedgerEntries = ledger.filter(l => {
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
      { 
        title: 'Bank-wise Movements Today', 
        value: `${bankMovementsToday} banks`, 
        icon: FiClock, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        link: '/finance/ledger',
        subtitle: `Net: Rs ${totalBankNet.toLocaleString()}`,
        bankSummary: bankSummary
      },
    ]
  }, [trips, ledger, dashboardStats])

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

      {/* Bank-wise Summary Detail Card */}
      {(() => {
        const bankWidget = kpiData.find(k => k.bankSummary)
        const bankSummaryData = bankWidget?.bankSummary || {}
        const bankSummaryArray = Object.values(bankSummaryData)
        
        if (bankSummaryArray.length === 0) return null
        
        return (
          <div className="card mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Bank-wise Movement Summary (Today)</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-secondary">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Bank</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Credit</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Debit</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Net Amount</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {bankSummaryArray.map((bank, idx) => (
                    <tr key={idx} className="border-b-2 border-secondary hover:bg-background transition-colors">
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm font-medium">{bank.bank}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm text-right">Rs {bank.credit.toLocaleString()}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm text-right">Rs {bank.debit.toLocaleString()}</td>
                      <td className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold ${bank.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rs {bank.net.toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm text-right">{bank.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default FinanceDashboard
