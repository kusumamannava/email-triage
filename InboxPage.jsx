import { useEffect, useRef } from 'react'
import { useEmailStore } from '../store/emailStore'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import EmailList from '../components/EmailList'
import ReadingPane from '../components/ReadingPane'
import ReminderBanner from '../components/ReminderBanner'

export default function InboxPage({ mode, onLogout }) {
  const { loadInbox, setMode, fetchReminders } = useEmailStore()
  const reminderInterval = useRef(null)

  useEffect(() => {
    setMode(mode)
    loadInbox()
    // Check reminders every 60 seconds
    fetchReminders()
    reminderInterval.current = setInterval(fetchReminders, 60000)
    return () => clearInterval(reminderInterval.current)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f6f8fc]">
      <TopBar mode={mode} onLogout={onLogout} />
      <ReminderBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar mode={mode} onLogout={onLogout} />
        <div className="flex flex-1 overflow-hidden bg-white rounded-tl-2xl shadow-sm border border-[#e0e0e0] border-b-0">
          {/* Tabs (Primary, Promotions, Social, Updates) */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex border-b border-[#e0e0e0] bg-white">
              {[
                { label: 'Primary', icon: '📥', active: true },
                { label: 'Promotions', icon: '🏷️', badge: '3 new', badgeColor: '#34a853' },
                { label: 'Social', icon: '👥', badge: '6 new', badgeColor: '#1a73e8' },
                { label: 'Updates', icon: 'ℹ️', badge: '6 new', badgeColor: '#ea4335' },
              ].map(({ label, icon, active, badge, badgeColor }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-5 py-3 cursor-pointer text-sm border-b-2 transition-colors ${
                    active
                      ? 'border-[#1a73e8] text-[#1a73e8] font-medium'
                      : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded text-white font-medium" style={{ background: badgeColor }}>
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <EmailList />
          </div>

          {/* Reading pane */}
          <div className="w-[45%] flex-shrink-0 overflow-hidden">
            <ReadingPane />
          </div>
        </div>
      </div>
    </div>
  )
}
