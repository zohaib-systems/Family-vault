import { useMemo, useState } from 'react'

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function randomInt(max) {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0] % max
}

function generatePassword(length, options) {
  const pool = [
    options.includeUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    options.includeLowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
    options.includeNumbers ? '0123456789' : '',
    options.includeSymbols ? SYMBOLS : '',
  ].join('')

  if (!pool) {
    return ''
  }

  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += pool[randomInt(pool.length)]
  }
  return result
}

function PasswordGenerator({ onGenerate }) {
  const [length, setLength] = useState(12)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copyState, setCopyState] = useState('')

  const hasAnyOption = useMemo(
    () => includeUppercase || includeLowercase || includeNumbers || includeSymbols,
    [includeUppercase, includeLowercase, includeNumbers, includeSymbols],
  )

  const handleGenerate = () => {
    const password = generatePassword(length, {
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    })

    if (!password) {
      setGeneratedPassword('')
      setCopyState('Choose at least one character type.')
      return
    }

    setGeneratedPassword(password)
    setCopyState('')
    if (onGenerate) {
      onGenerate(password)
    }
  }

  const handleCopy = async () => {
    if (!generatedPassword) {
      setCopyState('Generate a password first.')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopyState('Copied to clipboard.')
    } catch {
      setCopyState('Copy failed. Please copy manually.')
    }
  }

  return (
    <section className="panel">
      <h3>Password Generator</h3>

      <div className="generator-controls">
        <label htmlFor="lengthRange">Length: {length}</label>
        <input
          id="lengthRange"
          type="range"
          min="12"
          max="16"
          value={length}
          onChange={(event) => setLength(Number(event.target.value))}
        />
      </div>

      <div className="generator-options">
        <label>
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(event) => setIncludeUppercase(event.target.checked)}
          />
          Uppercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(event) => setIncludeLowercase(event.target.checked)}
          />
          Lowercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(event) => setIncludeNumbers(event.target.checked)}
          />
          Numbers
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(event) => setIncludeSymbols(event.target.checked)}
          />
          Symbols
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={handleGenerate} disabled={!hasAnyOption}>
          Generate Password
        </button>
        <button type="button" className="secondary" onClick={handleCopy}>
          Copy to Clipboard
        </button>
      </div>

      <label htmlFor="generatedPassword">Generated Password</label>
      <input id="generatedPassword" type="text" value={generatedPassword} readOnly />
      {copyState ? <p className="hint-text">{copyState}</p> : null}
    </section>
  )
}

export default PasswordGenerator