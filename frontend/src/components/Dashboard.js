import { useState } from 'react'
import AddPassword from './AddPassword'
import PasswordList from './PasswordList'
import PasswordGenerator from './PasswordGenerator'

function Dashboard({ token, onLogout }) {
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdded = () => {
    setRefreshKey((previous) => previous + 1)
  }

  const handlePasswordGenerated = (password) => {
    setGeneratedPassword(password)
    setShowAddPassword(true)
  }

  return (
    <section className="dashboard-panel">
      <div className="panel">
        <div className="dashboard-topbar">
          <h2>Dashboard</h2>
          <button type="button" className="secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
        <div className="button-row">
          <button type="button" onClick={() => setShowAddPassword((value) => !value)}>
            Add Password
          </button>
        </div>
        {generatedPassword ? (
          <p className="hint-text">Generated password ready in Add Password form.</p>
        ) : null}
      </div>

      <PasswordGenerator onGenerate={handlePasswordGenerated} />

      {showAddPassword ? (
        <AddPassword token={token} prefillPassword={generatedPassword} onAdded={handleAdded} />
      ) : null}

      <PasswordList token={token} refreshKey={refreshKey} />
    </section>
  )
}

export default Dashboard