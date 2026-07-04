import { useEmailStore } from '../store/emailStore'
import { getUrgencyConfig } from '../utils/urgencyUtils'
import EmailRow from './EmailRow'
import ScanningRow from './ScanningRow'

const URGENCY_ORDER = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW']

const DIVIDER_LABELS = {
  CRITICAL: { icon: '🔴', label: 'Critical', desc: 'Respond immediately' },
  HIGH:     { icon: '🟠', label: 'High Priority', desc: 'Within 1 hour' },
  MODERATE: { icon: '🟡', label: 'Moderate', desc: 'End of day' },
  LOW:      { icon: '⚪', label: 'Low Priority', desc: 'When you have time' },
}

export default function EmailList() {
  const { emails, scanningEmails, selectedEmail, loading } = useEmailStore()

  // Group emails by urgency
  const grouped = URGENCY_ORDER.reduce((acc, u) => {
    acc[u] = emails.filter(e => e.urgency === u && !e.is_snoozed)
    return acc
  }, {})

  const unread = emails.filter(e => !e.is_read && !e.is_snoozed).length

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-4 py-3 border-b border-[#e0e0e0] text-sm text-[#5f6368]">
          Loading your inbox...
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-[#f1f3f4]">
            <div className="w-4 h-4 rounded shimmer-bar flex-shrink-0"/>
            <div className="w-4 h-4 rounded shimmer-bar flex-shrink-0"/>
            <div className="w-2.5 h-2.5 rounded-full shimmer-bar flex-shrink-0"/>
            <div className="w-8 h-8 rounded-full shimmer-bar flex-shrink-0"/>
            <div className="w-28 h-3 rounded shimmer-bar flex-shrink-0"/>
            <div className="flex-1 h-3 rounded shimmer-bar"/>
            <div className="w-16 h-3 rounded shimmer-bar flex-shrink-0"/>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e0e0e0] sticky top-0 bg-white z-10">
        <input type="checkbox" className="w-4 h-4 mr-1"/>
        <button className="p-1.5 rounded hover:bg-[#f1f3f4]" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6 6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        <button className="p-1.5 rounded hover:bg-[#f1f3f4]" title="More">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
        <div className="flex-1"/>
        <span className="text-xs text-[#5f6368]">
          {emails.length} emails · {unread} unread · sorted by urgency
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-[#f1f3f4]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button className="p-1.5 rounded hover:bg-[#f1f3f4]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      </div>

      {/* Scanning emails at top */}
      {scanningEmails.map(e => <ScanningRow key={e.id} email={e}/>)}

      {/* Urgency groups */}
      {URGENCY_ORDER.map(urgency => {
        const group = grouped[urgency]
        if (group.length === 0) return null
        const cfg = getUrgencyConfig(urgency)
        const info = DIVIDER_LABELS[urgency]
        const unreadCount = group.filter(e => !e.is_read).length

        return (
          <div key={urgency}>
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-4 py-1.5 border-b sticky z-[5]"
              style={{ background: cfg.bg, borderColor: cfg.border, top: '41px' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}/>
              <span className="text-xs font-semibold" style={{ color: cfg.color }}>{info.label}</span>
              <span className="text-xs text-[#5f6368]">— {info.desc}</span>
              <div className="flex-1"/>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.color, color: 'white' }}>
                  {unreadCount} unread
                </span>
              )}
              <span className="text-xs text-[#5f6368]">{group.length} emails</span>
            </div>

            {/* Email rows */}
            {group.map(email => (
              <EmailRow key={email.id} email={email} isSelected={selectedEmail?.id === email.id}/>
            ))}
          </div>
        )
      })}

      {emails.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-[#5f6368]">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#dadce0">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <p className="mt-4 text-sm">No emails yet — click Generate Email to add some!</p>
        </div>
      )}
    </div>
  )
}
