import { useStore } from './use-store'
import { Notification } from '@/types'

// Hook for UI-related operations
export const useUIStore = () => {
  const store = useStore()

  // Create a notification
  const notify = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }
    
    store.addNotification(newNotification)
    
    // Auto-remove info notifications after 5 seconds
    if (notification.type === 'info') {
      setTimeout(() => {
        store.removeNotification(newNotification.id)
      }, 5000)
    }
    
    return newNotification.id
  }

  // Mark notification as read
  const markNotificationRead = (id: string) => {
    const notifications = store.notifications
    const notification = notifications.find(n => n.id === id)
    if (notification) {
      store.removeNotification(id)
      store.addNotification({ ...notification, read: true })
    }
  }

  // Get unread notification count
  const getUnreadCount = () => {
    return store.notifications.filter(n => !n.read).length
  }

  // Handle theme changes
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    store.setTheme(theme)
    
    // Apply theme to document
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }

  return {
    sidebarOpen: store.sidebarOpen,
    theme: store.theme,
    notifications: store.notifications,
    
    // Actions
    toggleSidebar: store.toggleSidebar,
    setSidebarOpen: store.setSidebarOpen,
    setTheme: applyTheme,
    notify,
    markNotificationRead,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    
    // Computed
    unreadCount: getUnreadCount(),
  }
}