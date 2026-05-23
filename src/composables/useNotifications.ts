import { ref } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'timestamp'>) => {
    const fullNotification: Notification = { ...notification, timestamp: Date.now() }
    notifications.value.unshift(fullNotification)
    // Auto-usuwanie po 5 sekundach
    setTimeout(() => removeNotification(notification.id), 5000)
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}

// Globalna funkcja do wywoływania powiadomień z dowolnego miejsca
export const notify = (title: string, message: string, type: Notification['type'] = 'info') => {
  const id = String(Date.now())
  const notification: Notification = {
    id,
    title,
    message,
    type,
    timestamp: Date.now()
  }
  notifications.value.unshift(notification)
  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) notifications.value.splice(index, 1)
  }, 5000)
}
