import { useEffect, useState } from 'react'
import { listPasswords } from '../api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function PasswordList({ token, refreshKey }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [loadingPasswordId, setLoadingPasswordId] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await listPasswords(token)
        setEntries(data)
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError.message || 'Failed to fetch password list')
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [token, refreshKey])

  const handleViewPassword = async (entryId) => {
    setActionMessage('')
    if (revealedPasswords[entryId]) {
      setRevealedPasswords((previous) => {
        const next = { ...previous }
        delete next[entryId]
        return next
      })
      return
    }

    try {
      setLoadingPasswordId(entryId)
      const response = await fetch(`${API_BASE_URL}/retrieve/${entryId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to retrieve password')
      }

      setRevealedPasswords((previous) => ({
        ...previous,
        [entryId]: data.password,
      }))
    } catch (retrieveError) {
      setActionMessage(retrieveError.message)
    } finally {
      setLoadingPasswordId('')
    }
  }

  const handleCopyPassword = async (entryId) => {
    const password = revealedPasswords[entryId]
    if (!password) {
      setActionMessage('Click View Password first.')
      return
    }

    try {
      await navigator.clipboard.writeText(password)
      setActionMessage('Password copied to clipboard.')
    } catch {
      setActionMessage('Could not copy password.')
    }
  }

  return (
    <section className="panel">
      <h3>Stored Services</h3>
      {loading ? <p>Loading services...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {actionMessage ? <p className="hint-text">{actionMessage}</p> : null}
      {!loading && !error && entries.length === 0 ? <p>No saved services yet.</p> : null}

      <ul className="service-list">
        {entries.map((entry) => (
          <li key={entry._id || `${entry.serviceName}-${entry.username}`}>
            <div className="service-list-main">
              <strong>{entry.serviceName}</strong>
              <span>{entry.username}</span>
              <span className="password-preview">
                Password:{' '}
                {revealedPasswords[entry._id] ? revealedPasswords[entry._id] : '••••••••••'}
              </span>
            </div>
            <div className="service-list-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => handleViewPassword(entry._id)}
                disabled={loadingPasswordId === entry._id}
              >
                {loadingPasswordId === entry._id
                  ? 'Loading...'
                  : revealedPasswords[entry._id]
                    ? 'Hide Password'
                    : 'View Password'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => handleCopyPassword(entry._id)}
              >
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PasswordList