import React, { useState } from 'react'
import AdminSidebar from '../sidebars/AdminSidebar'
import AdminNavbar from '../navbars/AdminNavbar'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

