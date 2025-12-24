export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  FINANCE: 'Finance',
  AGENT: 'Agent',
  DOCTOR: 'Doctor',
  USER: 'User',
}

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  TRIPS: '/trips',
  REPORTS: '/reports',
  VEHICLES: '/vehicles',
  DELIVERY_SERVICE: '/delivery-service',
  INTEGRATION: '/integration',
  SETTINGS: '/settings',
  MEMBERS: '/members',
  DISPUTES: '/disputes',
  LEDGER: '/ledger',
}

export const MENU_ITEMS = {
  SuperAdmin: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/trips', label: 'All Trips', icon: 'FiTruck' },
    { path: '/members', label: 'Users', icon: 'FiUsers' },
    { path: '/disputes', label: 'Disputes', icon: 'FiAlertCircle' },
    { path: '/reports', label: 'Reports', icon: 'FiFileText' },
    { path: '/ledger', label: 'Ledger', icon: 'FiDollarSign' },
    { path: '/settings', label: 'Settings', icon: 'FiSettings' },
  ],
  Admin: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/trips', label: 'Trip Management', icon: 'FiTruck' },
    { path: '/members', label: 'User Management', icon: 'FiUsers' },
    { path: '/disputes', label: 'Dispute Management', icon: 'FiAlertCircle' },
    { path: '/reports', label: 'Reports', icon: 'FiFileText' },
    { path: '/settings', label: 'Settings', icon: 'FiSettings' },
  ],
  Finance: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/trips', label: 'Trips', icon: 'FiTruck' },
    { path: '/ledger', label: 'Ledger', icon: 'FiDollarSign' },
    { path: '/documents', label: 'Documents', icon: 'FiFileText' },
    { path: '/reports', label: 'Reports', icon: 'FiFileText' },
    { path: '/settings', label: 'Settings', icon: 'FiSettings' },
  ],
  Agent: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/my-trips', label: 'My Trips', icon: 'FiTruck' },
    { path: '/disputes', label: 'Raise Dispute', icon: 'FiAlertCircle' },
    { path: '/financial', label: 'Financial Overview', icon: 'FiDollarSign' },
    { path: '/reports', label: 'My Reports', icon: 'FiFileText' },
    { path: '/settings', label: 'Profile', icon: 'FiSettings' },
  ],
  Doctor: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/trips', label: 'Trips', icon: 'FiTruck' },
    { path: '/reports', label: 'Reports', icon: 'FiFileText' },
    { path: '/products', label: 'Products', icon: 'FiBox' },
    { path: '/settings', label: 'Settings', icon: 'FiSettings' },
  ],
  User: [
    { path: '/dashboard', label: 'Dashboard', icon: 'FiHome' },
    { path: '/trips', label: 'Trips', icon: 'FiTruck' },
    { path: '/products', label: 'Products', icon: 'FiBox' },
  ],
}

