import React from 'react'

const FinanceSettings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Finance Settings</h1>
        <p className="text-text-secondary">Manage your finance account settings</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="text-text-primary font-medium mb-2 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="finance@example.com"
            />
          </div>
          <div>
            <label className="text-text-primary font-medium mb-2 block">Display Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Finance Manager"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceSettings

