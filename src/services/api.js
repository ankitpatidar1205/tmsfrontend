import BaseUrl from '../utils/BaseUrl'

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${BaseUrl}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API Error' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', url, error)
    throw error
  }
}

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getCurrentUser: async (userId) => {
    return apiCall(`/auth/me?userId=${userId}`)
  },
}

// User APIs
export const userAPI = {
  getUsers: async (role = null) => {
    const query = role ? `?role=${role}` : ''
    return apiCall(`/users${query}`)
  },

  getAgents: async (branchId = null) => {
    const query = branchId ? `?branchId=${branchId}` : ''
    return apiCall(`/users/agents${query}`)
  },

  getUser: async (id) => {
    return apiCall(`/users/${id}`)
  },

  createUser: async (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  updateUser: async (id, userData) => {
    // Check if userData is FormData (has file)
    const isFormData = userData instanceof FormData;

    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: isFormData ? userData : JSON.stringify(userData),
      headers: isFormData ? {} : undefined, // Let browser set Content-Type for FormData (multipart/form-data)
    })
  },

  deleteUser: async (id, userId = null, userRole = null) => {
    const options = {
      method: 'DELETE',
    }
    // Add body if userId or userRole is provided
    if (userId || userRole) {
      options.body = JSON.stringify({
        userId: userId || null,
        userRole: userRole || 'Admin',
      })
    }
    return apiCall(`/users/${id}`, options)
  },
}

// Branch APIs
export const branchAPI = {
  getBranches: async () => {
    return apiCall('/branches')
  },

  createBranch: async (name) => {
    return apiCall('/branches', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  updateBranch: async (id, name) => {
    return apiCall(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  deleteBranch: async (id) => {
    return apiCall(`/branches/${id}`, {
      method: 'DELETE',
    })
  },
}

// Company APIs
export const companyAPI = {
  getCompanies: async (search = '') => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    const query = params.toString()
    return apiCall(`/companies${query ? `?${query}` : ''}`)
  },

  createCompany: async (name, createdBy = null) => {
    return apiCall('/companies', {
      method: 'POST',
      body: JSON.stringify({ name, createdBy }),
    })
  },

  updateCompany: async (id, name) => {
    return apiCall(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  deleteCompany: async (id) => {
    return apiCall(`/companies/${id}`, {
      method: 'DELETE',
    })
  },
}

// Trip APIs
export const tripAPI = {
  getTrips: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.branch) params.append('branch', filters.branch)
    if (filters.status) params.append('status', filters.status)
    if (filters.lrNumber) params.append('lrNumber', filters.lrNumber)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.lrSheet) params.append('lrSheet', filters.lrSheet)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const query = params.toString()
    return apiCall(`/trips${query ? `?${query}` : ''}`)
  },

  getTrip: async (id) => {
    return apiCall(`/trips/${id}`)
  },

  createTrip: async (tripData) => {
    return apiCall('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
  },

  updateTrip: async (id, updates) => {
    return apiCall(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  deleteTrip: async (id) => {
    return apiCall(`/trips/${id}`, {
      method: 'DELETE',
    })
  },

  getCompanyNames: async (searchTerm = '') => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    const query = params.toString()
    return apiCall(`/trips/companies${query ? `?${query}` : ''}`)
  },

  addPayment: async (tripId, paymentData) => {
    return apiCall(`/trips/${tripId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  },

  updateDeductions: async (tripId, deductions) => {
    return apiCall(`/trips/${tripId}/deductions`, {
      method: 'PUT',
      body: JSON.stringify(deductions),
    })
  },

  closeTrip: async (tripId, options = {}) => {
    const { forceClose = false, closedBy = null, closedByRole = null } = options
    return apiCall(`/trips/${tripId}/close`, {
      method: 'POST',
      body: JSON.stringify({ forceClose, closedBy, closedByRole }),
    })
  },

  uploadAttachment: async (tripId, file, uploadedBy = null) => {
    const formData = new FormData()
    formData.append('file', file)
    if (uploadedBy) formData.append('uploadedBy', uploadedBy)

    return fetch(`${BaseUrl}/trips/${tripId}/attachments`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
  },

  deleteAttachment: async (tripId, attachmentId) => {
    return apiCall(`/trips/${tripId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  },
}

// Ledger APIs
export const ledgerAPI = {
  getLedger: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.date) params.append('date', filters.date)
    if (filters.lrNumber) params.append('lrNumber', filters.lrNumber)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const query = params.toString()
    return apiCall(`/ledger${query ? `?${query}` : ''}`)
  },

  getAgentBalance: async (agentId) => {
    return apiCall(`/ledger/balance/${agentId}`)
  },

  addTopUp: async (topUpData) => {
    return apiCall('/ledger/topup', {
      method: 'POST',
      body: JSON.stringify(topUpData),
    })
  },

  transferToAgent: async (transferData) => {
    return apiCall('/ledger/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    })
  },
}

// Dispute APIs
export const disputeAPI = {
  getDisputes: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.status) params.append('status', filters.status)

    const query = params.toString()
    return apiCall(`/disputes${query ? `?${query}` : ''}`)
  },

  getDispute: async (id) => {
    return apiCall(`/disputes/${id}`)
  },

  createDispute: async (disputeData) => {
    return apiCall('/disputes', {
      method: 'POST',
      body: JSON.stringify(disputeData),
    })
  },

  resolveDispute: async (id, data = {}) => {
    return apiCall(`/disputes/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// Report APIs
export const reportAPI = {
  getDashboardStats: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.branchId) params.append('branchId', filters.branchId)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const query = params.toString()
    return apiCall(`/reports/dashboard${query ? `?${query}` : ''}`)
  },

  getTripReport: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.branch) params.append('branch', filters.branch)
    if (filters.status) params.append('status', filters.status)

    const query = params.toString()
    return apiCall(`/reports/trips${query ? `?${query}` : ''}`)
  },

  getLedgerReport: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.agentId) params.append('agentId', filters.agentId)
    if (filters.bank) params.append('bank', filters.bank)

    const query = params.toString()
    return apiCall(`/reports/ledger${query ? `?${query}` : ''}`)
  },

  getAgentPerformanceReport: async () => {
    return apiCall('/reports/agents')
  },
}

// Audit Log APIs
export const auditLogAPI = {
  getAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.date) params.append('date', filters.date)
    if (filters.type) params.append('type', filters.type)
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const query = params.toString()
    return apiCall(`/audit-logs${query ? `?${query}` : ''}`)
  },
}

// Search APIs
export const searchAPI = {
  globalLRSearch: async (lrNumber, companyName = null) => {
    const params = new URLSearchParams()
    if (companyName) params.append('companyName', companyName)
    const query = params.toString()
    return apiCall(`/search/lr/${encodeURIComponent(lrNumber)}${query ? `?${query}` : ''}`)
  },
}

export default {
  authAPI,
  userAPI,
  branchAPI,
  companyAPI,
  tripAPI,
  ledgerAPI,
  disputeAPI,
  reportAPI,
  auditLogAPI,
  searchAPI,
}

