import { create } from 'zustand'
import axios from 'axios'

// Uses Vite proxy — no hardcoded localhost needed
const api = axios.create({ baseURL: '/api' })

function sortEmails(emails) {
  return [...emails].sort((a, b) => {
    if (a.urgency_order !== b.urgency_order) return a.urgency_order - b.urgency_order
    return new Date(b.received_at) - new Date(a.received_at)
  })
}

export const useEmailStore = create((set, get) => ({
  emails: [],
  scanningEmails: [],
  selectedEmail: null,
  reminders: [],
  loading: false,
  generating: false,
  mode: 'demo',

  setMode: (m) => set({ mode: m }),

  loadInbox: async () => {
    set({ loading: true })
    try {
      const check = await api.get('/emails')
      if (check.data.emails.length > 0) {
        set({ emails: sortEmails(check.data.emails), loading: false })
        return
      }
      // Load demo batch (runs in parallel on backend)
      const res = await api.post('/demo/load-inbox')
      set({ emails: sortEmails(res.data.emails), loading: false })
    } catch (err) {
      console.error('[Store] loadInbox failed:', err)
      set({ loading: false })
    }
  },

  generateEmail: async () => {
    if (get().generating) return
    set({ generating: true })

    const scanId = `scan_${Date.now()}`
    set(state => ({
      scanningEmails: [{ id: scanId, scanning: true }, ...state.scanningEmails]
    }))

    try {
      const res = await api.post('/demo/generate')
      const newEmail = { ...res.data, justArrived: true }

      set(state => ({
        scanningEmails: state.scanningEmails.filter(e => e.id !== scanId),
        // Add at top so animation is visible, then re-sort after delay
        emails: [newEmail, ...state.emails.filter(e => e.id !== newEmail.id)],
        generating: false,
      }))

      setTimeout(() => {
        set(state => ({
          emails: sortEmails(state.emails.map(e =>
            e.id === newEmail.id ? { ...e, justArrived: false } : e
          ))
        }))
      }, 1400)

    } catch (err) {
      console.error('[Store] generateEmail failed:', err)
      set(state => ({
        scanningEmails: state.scanningEmails.filter(e => e.id !== scanId),
        generating: false,
      }))
    }
  },

  selectEmail: async (email) => {
    set({ selectedEmail: email })
    if (!email.is_read) {
      try {
        await api.post(`/emails/${email.id}/read`)
        set(state => ({
          emails: state.emails.map(e =>
            e.id === email.id ? { ...e, is_read: true } : e
          ),
          selectedEmail: { ...email, is_read: true },
        }))
      } catch (_) {}
    }
  },

  clearSelected: () => set({ selectedEmail: null }),

  toggleStar: async (emailId, ev) => {
    ev?.stopPropagation()
    try {
      const res = await api.post(`/emails/${emailId}/star`)
      set(state => ({
        emails: state.emails.map(e =>
          e.id === emailId ? { ...e, is_starred: res.data.starred } : e
        ),
        selectedEmail: state.selectedEmail?.id === emailId
          ? { ...state.selectedEmail, is_starred: res.data.starred }
          : state.selectedEmail,
      }))
    } catch (_) {}
  },

  snoozeEmail: async (emailId, minutes) => {
    try {
      await api.post(`/emails/${emailId}/snooze`, { minutes })
      set(state => ({
        emails: state.emails.map(e =>
          e.id === emailId ? { ...e, is_snoozed: true } : e
        ),
        selectedEmail: state.selectedEmail?.id === emailId
          ? null : state.selectedEmail,
        reminders: state.reminders.filter(r => r.id !== emailId),
      }))
    } catch (_) {}
  },

  fetchReminders: async () => {
    try {
      const res = await api.get('/reminders')
      set({ reminders: res.data.reminders || [] })
    } catch (_) {}
  },

  dismissReminder: (emailId) =>
    set(state => ({ reminders: state.reminders.filter(r => r.id !== emailId) })),
}))
