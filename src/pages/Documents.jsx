import React, { useState } from 'react'
import { FiUpload, FiFile, FiDownload, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'

const Documents = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'LR Sheet - TR001.pdf', type: 'LR Sheet', tripId: 'TR001', uploadedAt: '2024-01-15', status: 'Received' },
    { id: 2, name: 'Bill - TR045.pdf', type: 'Bill', tripId: 'TR045', uploadedAt: '2024-01-14', status: 'Pending' },
    { id: 3, name: 'LR Sheet - TR023.pdf', type: 'LR Sheet', tripId: 'TR023', uploadedAt: '2024-01-13', status: 'Received' },
  ])

  const [selectedFile, setSelectedFile] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setShowUploadModal(true)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      toast.success('Document uploaded successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
      setShowUploadModal(false)
      setSelectedFile(null)
    }
  }

  const handleMarkReceived = (id) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id ? { ...doc, status: 'Received' } : doc
      )
    )
    toast.success('Document marked as received!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter((doc) => doc.id !== id))
      toast.success('Document deleted successfully!', {
        position: 'top-right',
        autoClose: 2000,
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Documents</h1>
          <p className="text-text-secondary">Manage financial documents and LR Sheets</p>
        </div>
        <label className="btn-3d-primary flex items-center gap-2 px-4 py-2 cursor-pointer">
          <FiUpload size={20} />
          <span>Upload Document</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Documents Table */}
      <div className="card overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b-2 border-secondary">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Document Name</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Trip ID</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Uploaded At</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b-2 border-secondary hover:bg-background transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FiFile className="text-primary" size={18} />
                    <span className="text-text-primary font-medium">{doc.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-text-primary">{doc.type}</td>
                <td className="py-4 px-4 text-text-primary font-medium">{doc.tripId}</td>
                <td className="py-4 px-4 text-text-primary">{doc.uploadedAt}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'Received'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </button>
                    {doc.status === 'Pending' && (
                      <button
                        onClick={() => handleMarkReceived(doc.id)}
                        className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all shadow-3d hover:shadow-3d-hover"
                        title="Mark as Received"
                      >
                        <FiCheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
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

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-background-light border-2 border-secondary rounded-lg shadow-3d max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Upload Document</h2>
            <div className="mb-4">
              <p className="text-text-primary mb-2">File: {selectedFile.name}</p>
              <p className="text-text-muted text-sm">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                }}
                className="btn-3d-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button onClick={handleUpload} className="btn-3d-primary px-4 py-2">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents

