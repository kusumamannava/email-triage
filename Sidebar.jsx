import { useEmailStore } from '../store/emailStore'
import { URGENCY_CONFIG } from '../utils/urgencyUtils'

const NAV = [
  { icon: '📥', label: 'Inbox', count: null, active: true },
  { icon: '⭐', label: 'Starred', count: null },
  { icon: '🕐', label: 'Snoozed', count: null },
  { icon: '📤', label: 'Sent', count: null },
  { icon: '📝', label: 'Drafts', count: 2 },
  { icon: '🛍️', label: 'Purchases', count: 15 },
]

export default function Sidebar({ onLogout, mode }) {
  const emails = useEmailStore(s => s.emails)

  const urgencyCounts = emails.reduce((acc, e) => {
    acc[e.urgency] = (acc[e.urgency] || 0) + (e.is_read ? 0 : 1)
    return acc
  }, {})

  return (
    <div className="w-64 flex-shrink-0 bg-[#f6f8fc] pt-2 flex flex-col h-full">
      {/* Compose */}
      <div className="px-4 mb-2">
        <button className="flex items-center gap-3 bg-[#c2e7ff] hover:bg-[#a8d8f8] text-[#001d35] rounded-2xl px-5 py-4 text-sm font-medium shadow-sm transition-colors w-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Compose
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2">
        {NAV.map(({ icon, label, count, active }) => (
          <div key={label} className={`sidebar-item flex items-center gap-4 px-4 py-1.5 cursor-pointer text-sm text-[#202124] ${active ? 'active' : ''}`}>
            <span className="text-base">{icon}</span>
            <span className="flex-1 font-medium">{label}</span>
            {count != null && <span className="text-xs text-[#202124]">{count}</span>}
          </div>
        ))}

        <div className="mt-2 mb-1 px-4">
          <div className="text-xs font-medium text-[#5f6368] uppercase tracking-wide">By Urgency</div>
        </div>

        {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => {
          const count = urgencyCounts[key] || 0
          return (
            <div key={key} className="sidebar-item flex items-center gap-3 px-4 py-1.5 cursor-pointer text-sm text-[#202124]">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
              <span className="flex-1">{cfg.label}</span>
              {count > 0 && <span className="text-xs font-semibold" style={{ color: cfg.color }}>{count}</span>}
            </div>
          )
        })}

        <div className="mt-2 mb-1 px-4">
          <div className="text-xs font-medium text-[#5f6368] uppercase tracking-wide">Labels</div>
        </div>
        {['Work','Personal','Finance','Newsletters'].map(l => (
          <div key={l} className="sidebar-item flex items-center gap-3 px-4 py-1.5 cursor-pointer text-sm text-[#202124]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#dadce0]"/>
            <span>{l}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#e0e0e0]">
        <div className="text-xs text-[#5f6368] mb-1">
          {mode === 'demo' ? '🎭 Demo Mode' : '📧 Gmail Connected'}
        </div>
        <div className="w-full bg-[#e0e0e0] rounded-full h-1 mb-1">
          <div className="bg-[#1a73e8] h-1 rounded-full" style={{ width: '64%' }}/>
        </div>
        <div className="text-xs text-[#5f6368]">9.6 GB of 15 GB used</div>
        <button onClick={onLogout} className="mt-2 text-xs text-[#1a73e8] hover:underline">Sign out</button>
      </div>
    </div>
  )
}
