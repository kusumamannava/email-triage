import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [hovering, setHovering] = useState(null)

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col items-center justify-center">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          {/* Gmail M logo */}
          <svg width="40" height="40" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M6 40h6V22.5L2 16v20c0 2.2 1.8 4 4 4z"/>
            <path fill="#34A853" d="M36 40h6c2.2 0 4-1.8 4-4V16l-10 6.5z"/>
            <path fill="#FBBC04" d="M36 10l-12 7.8L12 10 2 16l22 14.3L46 16z"/>
            <path fill="#EA4335" d="M2 16l10 6.5V10L2 16z"/>
            <path fill="#C5221F" d="M46 16l-10 6.5V10L46 16z"/>
          </svg>
          <span className="text-3xl text-[#202124]" style={{fontFamily: "'Google Sans', sans-serif", fontWeight: 400}}>Gmail</span>
        </div>
        <p className="text-[#5f6368] text-sm mt-1">Intelligently sorted by urgency</p>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e0e0e0] p-10 w-[380px] flex flex-col items-center">
        <h2 className="text-xl text-[#202124] mb-1" style={{fontFamily: "'Google Sans'"}}>Sign in</h2>
        <p className="text-sm text-[#5f6368] mb-8 text-center">to continue to Gmail Triage</p>

        {/* Real Gmail button */}
        <button
          onMouseEnter={() => setHovering('gmail')}
          onMouseLeave={() => setHovering(null)}
          onClick={() => onLogin('gmail')}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-[#dadce0] text-sm font-medium text-[#3c4043] mb-3 transition-all duration-150"
          style={{ background: hovering === 'gmail' ? '#f8f9fa' : 'white' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M6 40h6V22.5L2 16v20c0 2.2 1.8 4 4 4z"/>
            <path fill="#34A853" d="M36 40h6c2.2 0 4-1.8 4-4V16l-10 6.5z"/>
            <path fill="#FBBC04" d="M36 10l-12 7.8L12 10 2 16l22 14.3L46 16z"/>
            <path fill="#EA4335" d="M2 16l10 6.5V10L2 16z"/>
            <path fill="#C5221F" d="M46 16l-10 6.5V10L46 16z"/>
          </svg>
          Continue with Gmail
        </button>

        <div className="flex items-center w-full my-2">
          <div className="flex-1 h-px bg-[#e0e0e0]"/>
          <span className="mx-3 text-xs text-[#5f6368]">or</span>
          <div className="flex-1 h-px bg-[#e0e0e0]"/>
        </div>

        {/* Demo button */}
        <button
          onMouseEnter={() => setHovering('demo')}
          onMouseLeave={() => setHovering(null)}
          onClick={() => onLogin('demo')}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full text-sm font-medium text-white mt-2 transition-all duration-150"
          style={{ background: hovering === 'demo' ? '#1a73e8' : '#1967d2' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Try Demo Mode
        </button>

        <p className="text-xs text-[#5f6368] mt-6 text-center leading-relaxed">
          Demo mode loads sample emails and lets you see live urgency sorting in action. No sign-in needed.
        </p>
      </div>

      <p className="text-xs text-[#5f6368] mt-8">
        Gmail Triage — AI-powered inbox prioritization
      </p>

      {/* Urgency legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-[#5f6368]">
        {[['#dc2626','CRITICAL'],['#ea580c','HIGH'],['#ca8a04','MODERATE'],['#6b7280','LOW']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{background: c}}/>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
