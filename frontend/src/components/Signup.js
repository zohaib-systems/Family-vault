import { useState } from 'react'
import { signup as signupUser } from '../api'

function Signup({ onSignupSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await signupUser(username, password)

      setSuccessMessage('Signup successful. You can log in now.')
      setUsername('')
      setPassword('')
      if (onSignupSuccess) {
        onSignupSuccess()
      }
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError.message || 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="signup-panel">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="signupUsername">Username</label>
        <input
          id="signupUsername"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label htmlFor="signupPassword">Password</label>
        <input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
    </section>
  )
}

export default Signup