import { useState, useEffect } from 'react'
import { useEmailStore } from '../store/emailStore'
import { getUrgencyConfig, formatTime, getInitials, getAvatarColor } from '../utils/urgencyUtils'

export default function EmailRow({ email, isSelected }) {
  const { selectEmail, toggleStar, snoozeEmail } = useEmailStore()
  const [showSnooze, setShowSnooze] = useState(false)
  const [hovered, setHovered] = useState(false)

  const cfg     = getUrgencyConfig(email.urgency)
  const initials = getInitials(email.sender_name)
  const avatarColor = getAvatarColor(email.sender_name)
  const isBold  = !email.is_read

  return (
    <div
      onClick={() => selectEmail(email)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSnooze(false) }}
      className={`relative flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-[#f1f3f4] transition-colors
        ${isSelected ? 'selected' : 'email-row'}
        ${email.justArrived ? 'email-slide-in email-scanning' : ''}
        ${email.urgency === 'CRITICAL' && !email.is_read ? 'bg-[#fff5f5]' : ''}
      `}
    >
      {/* Checkbox */}
      <input type="checkbox" className="w-4 h-4 flex-shrink-0" onClick={e => e.stopPropagation()} />

      {/* Star */}
      <button onClick={e => toggleStar(email.id, e)} className="flex-shrink-0">
        {email.is_starred
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4c7c5" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        }
      </button>

      {/* Urgency dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${email.justArrived ? 'badge-snap' : ''}`}
        style={{ background: isBold ? cfg.dot : '#c4c7c5' }}
        title={cfg.label}
      />

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
        style={{ background: avatarColor }}
      >
        {initials}
      </div>

      {/* Sender name */}
      <div className={`w-36 flex-shrink-0 truncate text-sm ${isBold ? 'font-semibold text-[#202124]' : 'font-normal text-[#444746]'}`}>
        {email.sender_name || email.sender}
      </div>

      {/* Subject + summary */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
        <span className={`text-sm truncate ${isBold ? 'font-semibold text-[#202124]' : 'text-[#202124]'}`}>
          {email.subject}
        </span>
        {email.summary && (
          <span className="text-[#5f6368] text-sm truncate flex-shrink min-w-0">
            &nbsp;—&nbsp;{email.summary}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {/* Action chip */}
        {email.action_required && !email.is_read && (
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            Action needed
          </span>
        )}

        {/* SLA label */}
        {['CRITICAL','HIGH'].includes(email.urgency) && (
          <span className="hidden md:inline text-xs font-medium whitespace-nowrap" style={{ color: cfg.color }}>
            {cfg.sla}
          </span>
        )}

        {/* Snooze button — visible on hover */}
        {hovered && (
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowSnooze(v => !v) }}
              className="p-1 rounded-full hover:bg-[#e8eaed]"
              title="Snooze"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#5f6368">
                <path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm.5-9.2V7h-1.5v5.2l3.3 3.3 1.1-1.1-2.9-2.9z"/>
              </svg>
            </button>
            {showSnooze && (
              <div
                className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 w-36"
                onClick={e => e.stopPropagation()}
              >
                {[[15,'15 minutes'],[30,'30 minutes'],[60,'1 hour'],[240,'4 hours']].map(([m, label]) => (
                  <button key={m}
                    onClick={() => { snoozeEmail(email.id, m); setShowSnooze(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4]">
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time */}
        <span className={`text-xs w-16 text-right flex-shrink-0 ${isBold ? 'font-semibold text-[#202124]' : 'text-[#5f6368]'}`}>
          {formatTime(email.received_at)}
        </span>
      </div>
    </div>
  )
}
