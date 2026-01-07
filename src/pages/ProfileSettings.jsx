import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiMapPin, FiBriefcase } from 'react-icons/fi'
import BaseUrl from '../utils/BaseUrl'

const ProfileSettings = () => {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    branch: '',
    profileImage: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        branch: user.branch || '',
        profileImage: user.profileImage || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const updateData = new FormData()
      updateData.append('name', formData.name)
      updateData.append('email', formData.email)
      updateData.append('phone', formData.phone)

      if (formData.password) {
        updateData.append('password', formData.password)
      }
      
      if (selectedFile) {
        updateData.append('profileImage', selectedFile)
      }

      const userId = user.id || user._id
      const response = await userAPI.updateUser(userId, updateData)
      
      // Update local storage user data to reflect changes immediately
      const storedUser = JSON.parse(localStorage.getItem('user'))
      if (storedUser) {
        // Ensure profileImage is updated in local storage
        const updatedUser = { ...storedUser, ...response }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // Force reload to update context and UI
        window.location.reload()
      } else {
        toast.success('Profile updated successfully')
      }

    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
        <p className="text-text-secondary">Manage your account information and preferences</p>
      </div>

      <div className="card p-4 sm:p-8">
        <form onSubmit={handleSubmit}>
          
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-3d mb-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : formData.profileImage ? (
                  <img 
                    src={formData.profileImage.startsWith('http') ? formData.profileImage : `${BaseUrl.replace('/api', '')}/${formData.profileImage.replace(/\\/g, '/')}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://ui-avatars.com/api/?name=' + (formData.name || 'User') + '&background=random'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                )}
              </div>
              <label 
                htmlFor="profile-upload" 
                className="absolute bottom-4 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-all border border-gray-200"
                title="Change Profile Photo"
              >
                <div className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-sm text-text-secondary">Click camera icon to update photo</p>
          </div>

          {/* Read-Only Info Section */}
          <div className="mb-8 p-4 bg-background-light rounded-lg border border-secondary border-dashed">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Account Details (Read-Only)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  <div className="flex items-center gap-2">
                    <FiBriefcase /> Role
                  </div>
                </label>
                <div className="text-lg font-semibold text-text-primary px-1">{formData.role}</div>
              </div>
              
              {formData.branch && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                     <div className="flex items-center gap-2">
                      <FiMapPin /> Branch
                    </div>
                  </label>
                  <div className="text-lg font-semibold text-text-primary px-1">{formData.branch}</div>
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <FiUser />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field-3d pl-10 w-full"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <FiMail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field-3d pl-10 w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <FiPhone />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field-3d pl-10 w-full"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 mt-8">Security</h3>
          <p className="text-xs text-text-secondary mb-4">Leave blank if you don't want to change your password.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <FiLock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field-3d pl-10 w-full"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <FiLock />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field-3d pl-10 w-full"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-secondary">
            <button
              type="submit"
              disabled={loading}
              className="btn-3d-primary flex items-center gap-2 px-8 py-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings
