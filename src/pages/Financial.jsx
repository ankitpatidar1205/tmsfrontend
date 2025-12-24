import React from 'react'
import { useAuth } from '../context/AuthContext'
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const Financial = () => {
  const { user } = useAuth()

  // Mock data - agent's financial data
  const financialData = {
    totalBalance: 120000,
    pendingPayments: 45000,
    completedTrips: 30,
    totalEarnings: 1500000,
  }

  const transactions = [
    { id: 1, type: 'Credit', amount: 50000, description: 'Trip TR001 - Final Settlement', date: '2024-01-15', tripId: 'TR001' },
    { id: 2, type: 'Debit', amount: 25000, description: 'Advance Payment', date: '2024-01-14', tripId: 'TR001' },
    { id: 3, type: 'Credit', amount: 45000, description: 'Trip TR045 - Final Settlement', date: '2024-01-13', tripId: 'TR045' },
    { id: 4, type: 'Debit', amount: 15000, description: 'Advance Payment', date: '2024-01-12', tripId: 'TR045' },
  ]

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Financial Overview</h1>
        <p className="text-xs sm:text-sm text-text-secondary">Your financial records and transactions</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary text-sm font-medium">Total Balance</h3>
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shadow-3d">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 break-words">
            Rs {financialData.totalBalance.toLocaleString()}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-text-secondary text-xs sm:text-sm font-medium">Pending Payments</h3>
            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center shadow-3d flex-shrink-0">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 break-words">
            Rs {financialData.pendingPayments.toLocaleString()}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-text-secondary text-xs sm:text-sm font-medium">Completed Trips</h3>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shadow-3d flex-shrink-0">
              <FiTrendingUp size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 break-words">
            {financialData.completedTrips}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-text-secondary text-xs sm:text-sm font-medium">Total Earnings</h3>
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shadow-3d flex-shrink-0">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 break-words">
            Rs {(financialData.totalEarnings / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Description</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Trip ID</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                  <td className="py-4 px-4 text-text-primary">{transaction.date}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'Credit'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-primary">{transaction.description}</td>
                  <td className="py-4 px-4 text-text-primary font-medium">{transaction.tripId}</td>
                  <td className={`py-4 px-4 text-right font-semibold ${
                    transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'Credit' ? '+' : '-'}Rs {transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Financial

