import { useEffect, useState } from 'react'
import { addPassword as addPasswordApi } from '../api'

function AddPassword({ token, prefillPassword, onAdded }) {
  const [serviceName, setServiceName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState(prefillPassword || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (prefillPassword) {
      setPassword(prefillPassword)
    }
  }, [prefillPassword])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await addPasswordApi(token, { serviceName, username, password })

      setServiceName('')
      setUsername('')
      setPassword('')
      if (onAdded) {
        onAdded()
      }
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message || submitError.message || 'Failed to add password entry',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h3>Add Password</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="serviceName">Service Name</label>
        <input
          id="serviceName"
          type="text"
          value={serviceName}
          onChange={(event) => setServiceName(event.target.value)}
          placeholder="e.g. Gmail"
          required
        />

        <label htmlFor="serviceUsername">Username</label>
        <input
          id="serviceUsername"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="user@example.com"
          required
        />

        <label htmlFor="servicePassword">Password</label>
        <input
          id="servicePassword"
          type="text"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password or click Generate Password"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Save Password'}
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

export default AddPassword