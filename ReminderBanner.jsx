import { useEmailStore } from '../store/emailStore'
import { getUrgencyConfig } from '../utils/urgencyUtils'

export default function ReminderBanner() {
  const { reminders, dismissReminder, snoozeEmail, selectEmail, emails } = useEmailStore()

  if (reminders.length === 0) return null

  const top = reminders[0]
  const cfg = getUrgencyConfig(top.urgency)
  const isCritical = top.urgency === 'CRITICAL'

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm border-b ${isCritical ? 'reminder-pulse' : ''}`}
      style={{ background: cfg.bg, borderColor: cfg.border, borderBottomColor: cfg.border }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
      <div className="flex-1 min-w-0">
        <span className="font-semibold" style={{ color: cfg.color }}>
          {isCritical ? '🚨 CRITICAL unread' : '⚠️ Unread ' + top.urgency}:{' '}
        </span>
        <span className="text-[#202124]">"{top.subject}"</span>
        <span className="text-[#5f6368] ml-1">from {top.sender_name}</span>
        {reminders.length > 1 && (
          <span className="text-[#5f6368] ml-1">+{reminders.length - 1} more</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => {
            const email = emails.find(e => e.id === top.id)
            if (email) selectEmail(email)
            dismissReminder(top.id)
          }}
          className="px-3 py-1 rounded text-xs font-medium text-white"
          style={{ background: cfg.color }}
        >
          Open
        </button>
        <button
          onClick={() => snoozeEmail(top.id, 30)}
          className="px-3 py-1 rounded text-xs font-medium border"
          style={{ color: cfg.color, borderColor: cfg.border, background: 'white' }}
        >
          Snooze 30m
        </button>
        <button
          onClick={() => dismissReminder(top.id)}
          className="p-1 rounded-full hover:bg-black/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
