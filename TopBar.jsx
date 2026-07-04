import { useState } from 'react'
import { useEmailStore } from '../store/emailStore'

export default function TopBar({ mode, onLogout }) {
  const { generating, generateEmail } = useEmailStore()
  const [search, setSearch] = useState('')

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#f6f8fc] border-b border-[#e0e0e0]">
      {/* Hamburger */}
      <button className="p-2 rounded-full hover:bg-[#e8eaed] text-[#5f6368]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
        </svg>
      </button>

      {/* Gmail logo */}
      <div className="flex items-center gap-2 mr-2">
        <svg width="28" height="28" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M6 40h6V22.5L2 16v20c0 2.2 1.8 4 4 4z"/>
          <path fill="#34A853" d="M36 40h6c2.2 0 4-1.8 4-4V16l-10 6.5z"/>
          <path fill="#FBBC04" d="M36 10l-12 7.8L12 10 2 16l22 14.3L46 16z"/>
          <path fill="#EA4335" d="M2 16l10 6.5V10L2 16z"/>
          <path fill="#C5221F" d="M46 16l-10 6.5V10L46 16z"/>
        </svg>
        <span className="text-xl text-[#5f6368]" style={{fontFamily:"'Google Sans'"}}>Gmail</span>
        {mode === 'demo' && (
          <span className="text-xs bg-[#1a73e8] text-white px-2 py-0.5 rounded-full font-medium">DEMO</span>
        )}
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-2xl">
        <div className="flex items-center bg-[#eaf1fb] hover:bg-[#e2ecf9] rounded-full px-4 py-2 gap-3 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#5f6368" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search mail"
            className="flex-1 bg-transparent text-sm text-[#202124] outline-none placeholder-[#5f6368]"
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" stroke="#5f6368" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* ⚡ Generate Email button */}
        <button
          onClick={generateEmail}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 shadow-sm"
          style={{
            background: generating ? '#93c5fd' : 'linear-gradient(135deg, #1a73e8, #1557b0)',
            cursor: generating ? 'not-allowed' : 'pointer'
          }}
          title="Generate a random incoming email"
        >
          {generating ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Generate Email
            </>
          )}
        </button>

        {/* Help */}
        <button className="p-2 rounded-full hover:bg-[#e8eaed]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.501 3.501 0 1113 13.355z"/>
          </svg>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-full hover:bg-[#e8eaed]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.3.07-.62.07-.93s-.03-.64-.07-1l2.14-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.36-.07.73-.07 1.1 0 .36.03.74.07 1.1l-2.14 1.6c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.14-1.6z"/>
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-medium cursor-pointer" title="Account" onClick={onLogout}>
          K
        </div>
      </div>
    </div>
  )
}
