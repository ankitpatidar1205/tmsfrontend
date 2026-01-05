import React, { useState, useEffect, useMemo } from 'react'
import { auditLogAPI } from '../../services/api'
import { FiSearch, FiEye, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(20)

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const filters = {
        page: currentPage,
        limit
      }
      if (filterDate) filters.date = filterDate
      if (filterType) filters.type = filterType
      
      const response = await auditLogAPI.getAuditLogs(filters)
      
      // Backend returns { logs: [...], totalPages, currentPage, total } or just array
      let logs = []
      let pages = 1

      if (response && response.logs && Array.isArray(response.logs)) {
        logs = response.logs
        pages = response.totalPages || 1
      } else if (Array.isArray(response)) {
        // Fallback if backend returns plain array (no pagination metadata)
        logs = response
      } else if (response && Array.isArray(response.data)) {
        logs = response.data
        pages = response.totalPages || 1
      } else {
        console.warn('Unexpected response format:', response)
        logs = []
      }
      
      // Ensure logs have the correct structure
      logs = logs.map(log => ({
        ...log,
        type: log.type || log.action || log.actionType || 'Unknown',
        action: log.action || log.type || log.actionType || 'Unknown',
        timestamp: log.timestamp || log.createdAt,
        // Remove MongoDB IDs (24 hex characters) from description
        description: (log.description || `${log.action || log.type || 'Action'} - ${log.entityType || 'Entity'}`).replace(/\s+[0-9a-fA-F]{24}/g, ''),
        user: log.user || (typeof log.userId === 'object' && log.userId?.name) || log.userId || 'System',
        userRole: log.userRole || 'Unknown',
      }))
      
      setAuditLogs(logs)
      setTotalPages(pages)
      
      // Show info if no logs found
      if (logs.length === 0 && !filterDate && !filterType) {
        console.info('No audit logs found.')
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setAuditLogs([])
      toast.error(error.message || 'Failed to load audit logs.', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterType, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterDate, filterType])

  // Extract unique types (This might need a separate API call if we want ALL types, 
  // currently only shows types from current page/fetch. Accepted limitation or hardcode list)
  const uniqueTypes = useMemo(() => {
    // For now, hardcode or distinct from current logs. 
    // Ideally backend provides a /types endpoint. 
    // We'll stick to extracting from loaded logs + common ones
    const loadedTypes = auditLogs.map(l => l.type).filter(Boolean)
    const commonTypes = ['Create Trip', 'Update Trip', 'Delete Trip', 'Add Payment', 'Resolve Dispute', 'Create Dispute', 'Login', 'Logout']
    return [...new Set([...loadedTypes, ...commonTypes])].sort()
  }, [auditLogs])

  // ... existing code ...
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  const handleViewLog = (log) => {
    setSelectedLog(log)
    setShowViewModal(true)
  }

  return (
    <div className="p-3 sm:p-6">
      {/* ... header and filters ... */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Audit Logs</h1>
        <p className="text-xs sm:text-sm text-text-secondary">View system activity and audit trail</p>
      </div>

      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field-3d"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field-3d"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type, index) => (
                <option key={type || `type-${index}`} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDate('')
                setFilterType('')
              }}
              className="btn-3d-secondary px-4 py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Timestamp</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Type</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Description</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">User</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Summary</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted text-sm">Loading audit logs...</td>
                </tr>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <tr key={log.id || log._id || `log-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {log.action || log.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words max-w-xs">
                       {/* Clean description by removing raw IDs if possible, though usually description is human readable */}
                      {log.description || log.action || 'N/A'}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                      <div>
                        <div className="font-medium">{log.user || log.userId?.name || 'System'}</div>
                        {log.userRole && <div className="text-xs text-text-muted">{log.userRole}</div>}
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                      {log.changes && Object.keys(log.changes).length > 0 ? (
                         <span className="text-text-secondary italic">
                            {Object.entries(log.changes)
                                .filter(([key]) => !key.toLowerCase().includes('id') && !key.includes('_'))
                                .length} fields changed
                         </span>
                      ) : (
                         <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                       <button
                          onClick={() => handleViewLog(log)}
                          className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                          title="View Details"
                       >
                          <FiEye size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <p>No audit logs found.</p>
                      {(filterDate || filterType) && <p className="text-xs">Try clearing filters.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-secondary bg-gray-50">
            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
                Next
            </button>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-lg text-gray-800">Log Details</h3>
                    <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Type</span>
                            <div className="font-medium text-blue-600">{selectedLog.type}</div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-semibold">User</span>
                            <div className="font-medium">{selectedLog.user} <span className="text-xs text-gray-400">({selectedLog.userRole})</span></div>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Time</span>
                            <div className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                        </div>
                         <div className="col-span-2">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Description</span>
                            <div className="p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                {selectedLog.description}
                            </div>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-2 pb-1 border-b">Changed Data</h4>
                    {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 ? (
                        <div className="space-y-2">
                           {Object.entries(selectedLog.changes)
                             .filter(([key]) => !key.toLowerCase().includes('id') && !key.includes('_'))
                             .map(([key, val]) => (
                               <div key={key} className="flex flex-col sm:flex-row sm:justify-between p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
                                   <span className="font-medium text-gray-700 capitalize w-1/3">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                   <span className="text-gray-600 font-mono text-sm break-all w-2/3 sm:text-right">
                                     {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                   </span>
                               </div>
                           ))}
                           {Object.entries(selectedLog.changes).filter(([key]) => !key.toLowerCase().includes('id') && !key.includes('_')).length === 0 && (
                               <div className="text-center py-4 text-gray-400 italic">No readable data changes to display</div>
                           )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 italic">No detailed changes recorded</div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
                    <button 
                        onClick={() => setShowViewModal(false)}
                        className="btn-3d-primary px-4 py-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default AdminAuditLogs

