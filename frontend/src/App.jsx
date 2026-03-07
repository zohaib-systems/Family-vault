import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard.js'
import Login from './components/Login.js'
import Signup from './components/Signup.js'
import './App.css'

const TOKEN_STORAGE_KEY = 'familyVaultToken'

function App() {
  const [token, setToken] = useState('')
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const handleLoginSuccess = (jwtToken) => {
    setToken(jwtToken)
  }

  const handleSignupSuccess = () => {
    setAuthMode('login')
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Family Vault</h1>
      </header>
      {!token ? (
        <section className="panel">
          <div className="auth-switch-row">
            <button
              type="button"
              className={authMode === 'login' ? '' : 'secondary'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? '' : 'secondary'}
              onClick={() => setAuthMode('signup')}
            >
              Signup
            </button>
          </div>
          {authMode === 'login' ? (
            <Login tokenStorageKey={TOKEN_STORAGE_KEY} onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Signup onSignupSuccess={handleSignupSuccess} />
          )}
        </section>
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </main>
  )
}

export default App
