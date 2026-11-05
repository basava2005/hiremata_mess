import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Subscription } from '../types'
import { mockDB } from '../mocks/db'

export const subscriptionsApi = {
  getSubscriptions: async (params?: { studentId?: string }): Promise<Subscription[]> => {
    if (USE_MOCKS) {
      let subs = mockDB.getSubscriptions()
      if (params?.studentId) {
        subs = subs.filter((s) => s.studentId === params.studentId)
      }
      return mockDelay([...subs])
    }

    const res = await apiClient.get<Subscription[]>('/subscriptions', { params })
    return res.data
  },

  getSubscriptionById: async (id: string): Promise<Subscription | null> => {
    if (USE_MOCKS) {
      return mockDelay(mockDB.getSubscriptionById(id))
    }
    const res = await apiClient.get<Subscription>(`/subscriptions/${id}`)
    return res.data
  },

  getStudentSubscription: async (studentId: string): Promise<Subscription | null> => {
    if (USE_MOCKS) {
      return mockDelay(mockDB.getSubscriptionByStudentId(studentId))
    }
    const res = await apiClient.get<Subscription>(`/subscriptions/student/${studentId}`)
    return res.data
  },

  createSubscription: async (studentId: string, startDate: string, durationDays = 30): Promise<Subscription> => {
    if (USE_MOCKS) {
      return mockDelay(mockDB.createSubscription(studentId, startDate, durationDays))
    }
    const res = await apiClient.post<Subscription>('/subscriptions', {
      studentId,
      startDate,
      durationDays,
    })
    return res.data
  },

  extendSubscription: async (subscriptionId: string, daysAdded: number) => {
    if (USE_MOCKS) {
      return mockDelay(mockDB.extendSubscription(subscriptionId, daysAdded))
    }
    const res = await apiClient.post(`/subscriptions/${subscriptionId}/extend`, { daysAdded })
    return res.data
  },
}

