import React from 'react'
import { FiTrendingUp, FiFilter, FiSettings, FiStar, FiCloud, FiTrendingDown, FiAlertTriangle } from 'react-icons/fi'

const Products = () => {
  const kpiData = [
    { title: 'Total Products', value: '15K', percentage: '82%', color: 'purple' },
    { title: 'Available Stock', value: '12K', percentage: '84%', color: 'blue' },
    { title: 'Low Stock Alert', value: '2K', percentage: '32%', color: 'green' },
    { title: 'Pending Orders', value: '980', percentage: '32%', color: 'yellow' },
  ]

  const aiInsights = [
    {
      id: 1,
      product: 'Sneakers',
      status: 'Fast-Selling',
      statusIcon: FiStar, // Updated icon to FiStar
      statusColor: 'text-red-500',
      recommendation: 'Restock in 2 Days',
    },
    {
      id: 2,
      product: 'Cold Drinks',
      status: 'Seasonal Demand',
      statusIcon: FiCloud,
      statusColor: 'text-blue-500',
      recommendation: 'Stock 20% More',
    },
    {
      id: 3,
      product: 'Sofa',
      status: 'Low Sales',
      statusIcon: FiTrendingDown,
      statusColor: 'text-blue-500',
      recommendation: 'Offer Discount',
    },
    {
      id: 4,
      product: 'Chips',
      status: 'Low Stock',
      statusIcon: FiAlertTriangle,
      statusColor: 'text-yellow-500',
      recommendation: 'Reorder',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Products</h1>
        <p className="text-text-secondary">Manage your product inventory</p>
      </div>

      {/* Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <div key={index} className="card p-4 bg-white rounded-lg shadow-lg border border-secondary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary text-sm font-medium">{kpi.title}</h3>
                <FiTrendingUp className={`text-${kpi.color}-500`} size={20} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-text-primary mb-1">{kpi.value}</p>
                  <p className="text-text-muted text-sm">{kpi.percentage}</p>
                </div>
                <div className="w-16 h-12 bg-accent-purple bg-opacity-20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Trends Section */}
      <div className="card mb-8 p-6 bg-white rounded-lg shadow-lg border border-secondary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Stock Trends</h2>
          <div className="flex items-center gap-3">
            <select className="bg-background-light border-2 border-secondary rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary focus:shadow-3d transition-all">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
            <button className="p-2 text-text-secondary hover:text-primary hover:bg-background-light rounded-lg transition-all shadow-3d hover:shadow-3d-hover">
              <FiFilter size={20} />
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-background rounded-lg border-2 border-secondary">
          <p className="text-text-muted">Stock trends chart visualization would go here</p>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card p-6 bg-white rounded-lg shadow-lg border border-secondary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-text-primary">AI Insights</h2>
          </div>
          <button className="p-2 text-text-secondary hover:text-primary hover:bg-background-light rounded-lg transition-all shadow-3d hover:shadow-3d-hover">
            <FiSettings size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left py-3 px-4 text-text-secondary font-medium text-sm">Product</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium text-sm">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {aiInsights.map((insight, index) => {
                const StatusIcon = insight.statusIcon
                return (
                  <tr key={insight.id} className="border-b-2 border-secondary hover:bg-background-light transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-3d">
                          <span className="text-white font-bold text-lg">{insight.product.charAt(0)}</span>
                        </div>
                        <span className="text-text-primary font-medium">{insight.product}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={insight.statusColor} size={18} />
                        <span className="text-text-primary">{insight.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="btn-3d-primary text-sm py-1 px-3 bg-primary text-white font-medium rounded-lg shadow-3d hover:shadow-3d-hover active:shadow-3d-active transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                        {insight.recommendation}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Products
