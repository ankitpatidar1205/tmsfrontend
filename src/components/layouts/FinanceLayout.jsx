import React, { useState } from 'react'
import FinanceSidebar from '../sidebars/FinanceSidebar'
import FinanceNavbar from '../navbars/FinanceNavbar'

const FinanceLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <FinanceSidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FinanceNavbar isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

export default FinanceLayout

