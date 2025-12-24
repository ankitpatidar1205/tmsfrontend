import React, { useState } from 'react'
import AgentSidebar from '../sidebars/AgentSidebar'
import AgentNavbar from '../navbars/AgentNavbar'

const AgentLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AgentSidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AgentNavbar isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AgentLayout

