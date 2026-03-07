import { useState } from 'react'
import { login as loginUser } from '../api'

function Login({ tokenStorageKey, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await loginUser(username, password)

      localStorage.setItem(tokenStorageKey, data.token)
      onLoginSuccess(data.token)
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-panel">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

export default Login