import { apiClient, mockDelay, USE_MOCKS } from './client'
import { User } from '../types'
import { mockDB } from '../mocks/db'

export interface CreateStaffPayload {
  name: string
  mobile: string
  password?: string
}

export const staffApi = {
  getStaff: async (): Promise<User[]> => {
    if (USE_MOCKS) {
      const users = mockDB.getUsers().filter((u) => u.role === 'MESS_STAFF')
      return mockDelay([...users])
    }
    const res = await apiClient.get<User[]>('/staff')
    return res.data
  },

  createStaff: async (payload: CreateStaffPayload): Promise<User> => {
    if (USE_MOCKS) {
      const newStaff: User = {
        id: `staff-${Date.now()}`,
        branch_id: 'branch-main-01',
        mobile: payload.mobile,
        name: payload.name,
        role: 'MESS_STAFF',
        created_at: new Date().toISOString().split('T')[0],
      }
      mockDB.getUsers().push(newStaff)
      if (payload.password) {
        mockDB.updateUserPassword(payload.mobile, payload.password)
      }
      return mockDelay(newStaff)
    }

    const res = await apiClient.post<User>('/staff', payload)
    return res.data
  },

  deleteStaff: async (id: string): Promise<void> => {
    if (USE_MOCKS) {
      const idx = mockDB.getUsers().findIndex((u) => u.id === id)
      if (idx !== -1) {
        mockDB.getUsers().splice(idx, 1)
      }
      return mockDelay(undefined)
    }

    await apiClient.delete(`/staff/${id}`)
  },
}
