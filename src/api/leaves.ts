import { apiClient, mockDelay, USE_MOCKS } from './client'
import { LeaveRequest, LeaveStatus } from '../types'
import { mockDB } from '../mocks/db'

export interface CreateLeavePayload {
  studentId: string
  startDate: string
  endDate: string
  reason: string
  status?: LeaveStatus
  adminNote?: string
}

export const leavesApi = {
  getLeaves: async (params?: { studentId?: string; status?: LeaveStatus }): Promise<LeaveRequest[]> => {
    if (USE_MOCKS) {
      let list = mockDB.getLeaves()
      if (params?.studentId) {
        list = list.filter((l) => l.studentId === params.studentId)
      }
      if (params?.status) {
        list = list.filter((l) => l.status === params.status)
      }
      return mockDelay([...list])
    }

    const res = await apiClient.get<LeaveRequest[]>('/leaves', { params })
    return res.data
  },

  getLeaveById: async (id: string): Promise<LeaveRequest | null> => {
    if (USE_MOCKS) {
      const leave = mockDB.getLeaves().find((l) => l.id === id)
      return mockDelay(leave || null)
    }

    const res = await apiClient.get<LeaveRequest>(`/leaves/${id}`)
    return res.data
  },

  createLeave: async (payload: CreateLeavePayload): Promise<LeaveRequest> => {
    if (USE_MOCKS) {
      const newLeave = mockDB.createLeave({
        studentId: payload.studentId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
        status: payload.status || 'PENDING',
        adminNote: payload.adminNote,
      })
      return mockDelay(newLeave)
    }

    const res = await apiClient.post<LeaveRequest>('/leaves', payload)
    return res.data
  },

  updateLeaveStatus: async (
    id: string,
    status: LeaveStatus,
    adminNote?: string
  ): Promise<LeaveRequest | null> => {
    if (USE_MOCKS) {
      const updated = mockDB.updateLeaveStatus(id, status, adminNote)
      return mockDelay(updated)
    }

    const res = await apiClient.patch<LeaveRequest>(`/leaves/${id}/status`, { status, adminNote })
    return res.data
  },

  cancelLeave: async (id: string): Promise<LeaveRequest | null> => {
    if (USE_MOCKS) {
      const updated = mockDB.updateLeaveStatus(id, 'CANCELLED')
      return mockDelay(updated)
    }

    const res = await apiClient.post<LeaveRequest>(`/leaves/${id}/cancel`)
    return res.data
  },
}

