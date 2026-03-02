import { useState, useEffect } from 'react'
import { bankAPI } from '../services/api'

export const useBanks = () => {
    const [banks, setBanks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchBanks = async () => {
        try {
            setLoading(true)
            const response = await bankAPI.getBanks()

            if (response.success) {
                setBanks(response.data)
            }
        } catch (err) {
            console.error('Error fetching banks:', err)
            setError(err.message || 'Failed to fetch banks')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanks()
    }, [])

    return { banks, loading, error, refetch: fetchBanks }
}
