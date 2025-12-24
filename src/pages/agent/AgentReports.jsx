import React from 'react'
import { FiFileText, FiDownload } from 'react-icons/fi'

const AgentReports = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Reports</h1>
        <p className="text-text-secondary">View and download your trip reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'My Trip Summary', description: 'Summary of all your trips' },
          { title: 'Financial Report', description: 'Your financial overview' },
          { title: 'Performance Report', description: 'Your trip performance metrics' },
        ].map((report, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-3d">
                <FiFileText className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{report.title}</h3>
            <p className="text-text-muted text-sm mb-4">{report.description}</p>
            <button className="btn-3d-secondary flex items-center gap-2 px-4 py-2 w-full">
              <FiDownload size={18} />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentReports

