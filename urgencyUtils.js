export const URGENCY_CONFIG = {
  CRITICAL: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'CRITICAL', dot: '#dc2626', order: 0, sla: 'Respond NOW' },
  HIGH:     { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'HIGH',     dot: '#ea580c', order: 1, sla: 'Within 1 hour' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fde68a', label: 'MODERATE', dot: '#ca8a04', order: 2, sla: 'End of day' },
  LOW:      { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'LOW',      dot: '#9ca3af', order: 3, sla: 'No SLA' },
}

export function getUrgencyConfig(urgency) {
  return URGENCY_CONFIG[urgency] || URGENCY_CONFIG.LOW
}

export function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return '' }
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function getAvatarColor(name) {
  const colors = ['#1a73e8','#34a853','#ea4335','#fbbc04','#9334e8','#0f9d58','#e91e63','#ff6d00']
  let hash = 0
  for (const c of (name || '')) hash = hash * 31 + c.charCodeAt(0)
  return colors[Math.abs(hash) % colors.length]
}
