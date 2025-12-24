import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { FiUpload, FiImage, FiX } from 'react-icons/fi'

const Settings = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const acceptedFormats = ['.png', '.jpg', '.jpeg', '.svg']
  const acceptedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    // Reset previous error
    setError('')

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    const isValidFormat = acceptedFormats.includes(fileExtension)
    const isValidMimeType = acceptedMimeTypes.includes(file.type)

    if (!isValidFormat || !isValidMimeType) {
      setError(
        `Invalid file format. Please select one of the following: ${acceptedFormats.join(', ')}`
      )
      setSelectedFile(null)
      setPreview(null)
      e.target.value = '' // Reset input
      return
    }

    // Check file size (optional: limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File size exceeds 5MB. Please select a smaller file.')
      setSelectedFile(null)
      setPreview(null)
      e.target.value = ''
      return
    }

    // Store file
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Log file details
    console.log('File Details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified),
    })

    toast.success('File selected successfully!', {
      position: 'top-right',
      autoClose: 3000,
    })
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
    // Reset file input
    const fileInput = document.getElementById('file-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file first', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    // Here you would typically upload to a server
    // For now, we'll just log and show success
    console.log('Uploading file:', selectedFile)

    toast.success('File uploaded successfully!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // In a real application, you would do:
    // const formData = new FormData()
    // formData.append('file', selectedFile)
    // await fetch('/api/upload', { method: 'POST', body: formData })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your account settings and preferences</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold text-text-primary mb-4">File Upload</h2>

        {/* File Input */}
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="btn-3d-secondary inline-flex items-center gap-2 cursor-pointer px-4 py-2"
          >
            <FiUpload size={20} />
            Choose File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-text-muted text-sm mt-2">
            Accepted formats: PNG, JPG, JPEG, SVG (Max 5MB)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* File Preview */}
        {preview && selectedFile && (
          <div className="mb-4 p-4 bg-background rounded-lg border-2 border-secondary">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <FiImage className="text-primary" size={24} />
                <div>
                  <p className="text-text-primary font-medium">{selectedFile.name}</p>
                  <p className="text-text-muted text-sm">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-text-secondary hover:text-red-500 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Image Preview */}
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg border-2 border-secondary"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <button onClick={handleUpload} className="btn-3d-primary px-4 py-2">
            Upload File
          </button>
        )}
      </div>

      {/* Additional Settings Sections */}
      <div className="card max-w-2xl mt-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="text-text-primary font-medium mb-2 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="your.email@example.com"
              defaultValue="shivani.chauhan@example.com"
            />
          </div>
          <div>
            <label className="text-text-primary font-medium mb-2 block">Display Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Your name"
              defaultValue="Shivani Chauhan"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

