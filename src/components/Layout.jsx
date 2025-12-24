import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AddOrderModal from './AddOrderModal'

const Layout = ({ children }) => {
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onAddOrderClick={() => setShowAddOrderModal(true)} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
      <AddOrderModal
        show={showAddOrderModal}
        onHide={() => setShowAddOrderModal(false)}
      />
    </div>
  )
}

export default Layout

