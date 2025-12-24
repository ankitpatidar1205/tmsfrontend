import React from 'react'
import { useAuth } from '../../context/AuthContext'

const AgentProfile = () => {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Profile</h1>
        <p className="text-text-secondary">Manage your agent profile</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-text-primary font-medium mb-2 block">Name</label>
            <input
              type="text"
              className="input-field"
              defaultValue={user?.name || ''}
              placeholder="Your name"
              readOnly
            />
          </div>
          <div>
            <label className="text-text-primary font-medium mb-2 block">Email</label>
            <input
              type="email"
              className="input-field"
              defaultValue={user?.email || ''}
              placeholder="your.email@example.com"
              readOnly
            />
          </div>
          {user?.branch && (
            <div>
              <label className="text-text-primary font-medium mb-2 block">Branch</label>
              <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded border-2 border-blue-200 font-medium">
                {user.branch}
              </div>
            </div>
          )}
          <div>
            <label className="text-text-primary font-medium mb-2 block">Phone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="text-text-primary font-medium mb-2 block">Address</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Your address"
            />
          </div>
          <button className="btn-3d-primary px-4 py-2">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgentProfile

