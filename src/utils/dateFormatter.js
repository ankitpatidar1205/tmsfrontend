// Date formatting utility functions

/**
 * Format date from ISO string to readable format
 * @param {string} dateString - ISO date string (e.g., "2025-12-26T00:00:00.000Z")
 * @returns {string} - Formatted date (e.g., "26/12/2025" or "26 Dec 2025")
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Return original if invalid
    
    // Format: DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    return dateString
  }
}

/**
 * Format date with time
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (error) {
    return dateString
  }
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string} dateString - ISO date string
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

