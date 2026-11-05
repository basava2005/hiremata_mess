import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Notification } from '../types'
import { mockDB } from '../mocks/db'

export const notificationsApi = {
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    if (USE_MOCKS) {
      return mockDelay([...mockDB.getNotifications(userId)])
    }
    const res = await apiClient.get<Notification[]>('/notifications', { params: { userId } })
    return res.data
  },

  markAsRead: async (id: string): Promise<Notification | undefined> => {
    if (USE_MOCKS) {
      return mockDelay(mockDB.markNotificationAsRead(id))
    }
    const res = await apiClient.post<Notification>(`/notifications/${id}/read`)
    return res.data
  },

  markAllAsRead: async (userId?: string): Promise<{ success: boolean }> => {
    if (USE_MOCKS) {
      mockDB.markAllNotificationsAsRead(userId)
      return mockDelay({ success: true })
    }
    const res = await apiClient.post('/notifications/read-all', { userId })
    return res.data
  },
}

