import React, { useState, useEffect, useMemo } from 'react'
import { auditLogAPI } from '../../services/api'
import { FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (filterDate) filters.date = filterDate
      if (filterType) filters.type = filterType
      
      const response = await auditLogAPI.getAuditLogs(filters)
      
      // Backend returns { logs: [...], totalPages, currentPage, total }
      // Extract logs array from response
      let logs = []
      if (Array.isArray(response)) {
        logs = response
      } else if (response && response.logs && Array.isArray(response.logs)) {
        logs = response.logs
      } else if (response && Array.isArray(response.data)) {
        logs = response.data
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
        description: log.description || `${log.action || log.type || 'Action'} - ${log.entityType || 'Entity'} ${log.entityId || ''}`,
        user: log.user || (typeof log.userId === 'object' && log.userId?.name) || log.userId || 'System',
        userRole: log.userRole || 'Unknown',
      }))
      
      setAuditLogs(logs)
      
      // Show info if no logs found
      if (logs.length === 0 && !filterDate && !filterType) {
        console.info('No audit logs found in database. Audit logs are created automatically when users perform actions.')
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setAuditLogs([])
      toast.error(error.message || 'Failed to load audit logs. Please check your connection.', {
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
  }, [filterDate, filterType])

  const filteredLogs = Array.isArray(auditLogs) ? auditLogs : []

  // Extract unique types from audit logs (handle both action and type fields)
  const uniqueTypes = useMemo(() => {
    if (!Array.isArray(auditLogs) || auditLogs.length === 0) return []
    const types = auditLogs
      .map(log => {
        // Backend returns type field which contains the action
        return log.type || log.action || log.actionType
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    return types.sort() // Sort alphabetically
  }, [auditLogs])

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Audit Logs</h1>
        <p className="text-xs sm:text-sm text-text-secondary">View system activity and audit trail</p>
      </div>

      {/* Filters */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field-3d"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field-3d"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type, index) => (
                <option key={type || `type-${index}`} value={type}>
                  {type}
                </option>
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

      {/* Audit Logs Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Timestamp</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Type</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Description</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">User</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-secondary font-medium text-xs sm:text-sm">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted text-sm">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || log._id || `log-${index}`} className="border-b-2 border-secondary hover:bg-background transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {log.action || log.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                      {log.description || log.action || 'N/A'}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                      <div>
                        <div className="font-medium">{log.user || log.userId?.name || 'System'}</div>
                        {log.userRole && (
                          <div className="text-xs text-text-muted">{log.userRole}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-text-primary text-xs sm:text-sm break-words">
                      {log.changes && typeof log.changes === 'object' && Object.keys(log.changes).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(log.changes).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </div>
                          ))}
                          {Object.keys(log.changes).length > 3 && (
                            <div className="text-xs text-text-muted">+{Object.keys(log.changes).length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-muted">{log.entityType || 'N/A'}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <p>No audit logs found.</p>
                      {(filterDate || filterType) ? (
                        <p className="text-xs">Try clearing filters or select a different date/type.</p>
                      ) : (
                        <p className="text-xs">Audit logs are created automatically when users perform actions (create trips, update ledger, etc.).</p>
                      )}
                    </div>
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

export default AdminAuditLogs

