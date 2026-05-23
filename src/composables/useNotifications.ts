import { ref, onMounted, onUnmounted } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

const notifications = ref<Notification[]>([])
let eventSource: EventSource | null = null

export function useNotifications() {
  const connect = () => {
    // Zamknij istniejące połączenie
    if (eventSource) {
      eventSource.close()
    }

    // Połącz z endpointem SSE
    eventSource = new EventSource('/api/notifications/stream')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addNotification({
          id: data.id || Date.now().toString(),
          title: data.title || 'Nowe powiadomienie',
          message: data.message || '',
          type: data.type || 'info'
        })
      } catch (err) {
        console.error('Błąd parsowania powiadomienia:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('Błąd SSE:', err)
      // Automatyczne ponowne połączenie za 5s
      setTimeout(() => connect(), 5000)
    }
  }

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

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    eventSource?.close()
  })

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
