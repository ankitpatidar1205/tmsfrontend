import React, { useState } from 'react'
import { FiPlus, FiEye, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi'
import Modal from '../components/Modal'
import { toast } from 'react-toastify'

const Members = () => {
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Agent', phone: '+91 9876543210' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Finance', phone: '+91 9876543211' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Agent', phone: '+91 9876543212' },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Agent',
    phone: '',
  })

  const handleCreate = () => {
    setFormData({ name: '', email: '', role: 'Agent', phone: '' })
    setShowCreateModal(true)
  }

  const handleView = (member) => {
    setSelectedMember(member)
    setShowViewModal(true)
  }

  const handleEdit = (member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone,
    })
    setShowEditModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter((member) => member.id !== id))
      toast.success('Member deleted successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (showCreateModal) {
      const newMember = { id: Date.now(), ...formData }
      setMembers([...members, newMember])
      toast.success('Member created successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    } else if (showEditModal) {
      setMembers(
        members.map((member) =>
          member.id === selectedMember.id ? { ...member, ...formData } : member
        )
      )
      toast.success('Member updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
    setShowCreateModal(false)
    setShowEditModal(false)
    setFormData({ name: '', email: '', role: 'Agent', phone: '' })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Members</h1>
          <p className="text-text-secondary">Manage team members</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-3d-primary flex items-center gap-2 px-4 py-2"
        >
          <FiPlus size={20} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Name</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Role</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Phone</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b-2 border-secondary hover:bg-background transition-colors"
              >
                <td className="py-4 px-4 text-text-primary font-medium">{member.name}</td>
                <td className="py-4 px-4 text-text-primary">{member.email}</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary">
                    {member.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-text-primary">{member.phone}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(member)}
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="View"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Member"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field-3d"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field-3d"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field-3d"
            >
              <option value="Agent">Agent</option>
              <option value="Finance">Finance</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field-3d"
              placeholder="+91 9876543210"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-3d-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-3d-primary px-4 py-2">
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Member Details"
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <p className="text-text-primary font-medium">{selectedMember.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <p className="text-text-primary">{selectedMember.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary bg-opacity-20 text-primary">
                {selectedMember.role}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
              <p className="text-text-primary">{selectedMember.phone}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-3d-primary px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Member"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field-3d"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field-3d"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field-3d"
            >
              <option value="Agent">Agent</option>
              <option value="Finance">Finance</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field-3d"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-3d-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-3d-primary px-4 py-2">
              Update Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Members

