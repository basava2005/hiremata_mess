import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Plan } from '../types'
import { mockDB } from '../mocks/db'

export const plansApi = {
  getPlans: async (): Promise<Plan[]> => {
    if (USE_MOCKS) {
      return mockDelay([mockDB.getPlan()])
    }
    const res = await apiClient.get<Plan[]>('/plans')
    return res.data
  },

  getPlanById: async (id: string): Promise<Plan | null> => {
    if (USE_MOCKS) {
      const plan = mockDB.getPlan()
      return mockDelay(plan.id === id ? plan : plan)
    }
    const res = await apiClient.get<Plan>(`/plans/${id}`)
    return res.data
  },
}

