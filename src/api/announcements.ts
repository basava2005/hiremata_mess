import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Announcement, AnnouncementType } from '../types'

export interface CreateAnnouncementPayload {
  title: string
  message: string
  type: AnnouncementType
  effectiveDate?: string
  createdBy?: string
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-init-1',
    branchId: 'branch-main-01',
    title: 'Sunday Special Holige Feast (ಹೋಳಿಗೆ ಊಟ)',
    message: 'All mess members are warmly invited for authentic hot Holige with desi ghee, chana saaru and special rice feast this Sunday dinner!',
    type: 'SPECIAL_DINNER',
    effectiveDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    createdBy: 'Admin Ramesh Sharma',
    createdAt: new Date().toISOString(),
  },
]

export const announcementsApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    if (USE_MOCKS) {
      return mockDelay([...mockAnnouncements])
    }
    const res = await apiClient.get<Announcement[]>('/announcements')
    return res.data
  },

  createAnnouncement: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
    if (USE_MOCKS) {
      const created: Announcement = {
        id: `ann-${Date.now()}`,
        branchId: 'branch-main-01',
        title: payload.title,
        message: payload.message,
        type: payload.type,
        effectiveDate: payload.effectiveDate,
        createdBy: payload.createdBy || 'Hiremat Mess Admin',
        createdAt: new Date().toISOString(),
      }
      mockAnnouncements.unshift(created)
      return mockDelay(created)
    }

    const res = await apiClient.post<Announcement>('/announcements', payload)
    return res.data
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    if (USE_MOCKS) {
      const idx = mockAnnouncements.findIndex((a) => a.id === id)
      if (idx !== -1) mockAnnouncements.splice(idx, 1)
      return mockDelay(undefined)
    }

    await apiClient.delete(`/announcements/${id}`)
  },
}
