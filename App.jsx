import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import InboxPage from './pages/InboxPage'

export default function App() {
  const [mode, setMode] = useState(null) // null | 'demo' | 'gmail'
  if (!mode) return <LoginPage onLogin={setMode} />
  return <InboxPage mode={mode} onLogout={() => setMode(null)} />
}
