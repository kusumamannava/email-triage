import { useEmailStore } from '../store/emailStore'
import { getUrgencyConfig, formatTime, getInitials, getAvatarColor } from '../utils/urgencyUtils'

export default function ReadingPane() {
  const { selectedEmail, toggleStar, snoozeEmail } = useEmailStore()

  if (!selectedEmail) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-[#5f6368] border-l border-[#e0e0e0]">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#dadce0">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <p className="mt-4 text-sm">No conversation selected</p>
      </div>
    )
  }

  const e = selectedEmail
  const cfg = getUrgencyConfig(e.urgency)
  const initials = getInitials(e.sender_name)
  const avatarColor = getAvatarColor(e.sender_name)

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#e0e0e0] overflow-hidden">
      {/* Email header */}
      <div className="px-6 pt-5 pb-3 border-b border-[#f1f3f4]">
        {/* Subject */}
        <div className="flex items-start gap-3 mb-3">
          <h2 className="flex-1 text-xl font-medium text-[#202124] leading-tight">{e.subject}</h2>
          <button onClick={ev => toggleStar(e.id, ev)} className="mt-0.5 flex-shrink-0">
            {e.is_starred
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dadce0" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            }
          </button>
        </div>

        {/* Urgency badge */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
          {e.sla_label && (
            <span className="text-xs text-[#5f6368]">SLA: {e.sla_label}</span>
          )}
          {e.action_required && (
            <span className="text-xs bg-[#fef9c3] text-[#854d0e] px-2 py-0.5 rounded-full border border-[#fde68a]">
              Action required
            </span>
          )}
        </div>

        {/* Sender row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: avatarColor }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[#202124]">{e.sender_name}</span>
              <span className="text-xs text-[#5f6368] truncate">&lt;{e.sender}&gt;</span>
            </div>
            <div className="text-xs text-[#5f6368]">to me · {formatTime(e.received_at)}</div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-full hover:bg-[#f1f3f4]" title="Reply">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
            </button>
            <button className="p-1.5 rounded-full hover:bg-[#f1f3f4]" title="Forward">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"/></svg>
            </button>
            <button className="p-1.5 rounded-full hover:bg-[#f1f3f4]" title="More">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary box */}
      {e.summary && (
        <div className="mx-6 mt-4 p-3 rounded-lg text-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill={cfg.color}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span className="font-medium text-xs" style={{ color: cfg.color }}>AI Summary</span>
          </div>
          <p className="text-[#202124] leading-relaxed">{e.summary}</p>
          {e.action_hint && (
            <p className="mt-1.5 font-medium" style={{ color: cfg.color }}>→ {e.action_hint}</p>
          )}
          {e.urgency_reason && (
            <p className="mt-1 text-xs text-[#5f6368]">{e.urgency_reason}</p>
          )}
        </div>
      )}

      {/* Email body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="text-sm text-[#202124] leading-relaxed whitespace-pre-wrap">
          {e.body}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-6 py-3 border-t border-[#f1f3f4] flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#dadce0] text-sm text-[#202124] hover:bg-[#f1f3f4] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
          Reply
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#dadce0] text-sm text-[#202124] hover:bg-[#f1f3f4] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"/></svg>
          Forward
        </button>
        <div className="flex-1"/>
        <div className="flex items-center gap-1">
          {[[15,'15m'],[30,'30m'],[60,'1h']].map(([m, label]) => (
            <button key={m} onClick={() => snoozeEmail(e.id, m)}
              className="px-3 py-1.5 rounded-full border border-[#dadce0] text-xs text-[#5f6368] hover:bg-[#f1f3f4]">
              Snooze {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
