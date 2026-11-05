import { apiClient, mockDelay, USE_MOCKS } from './client'
import { LeaveExtension, Student, Subscription } from '../types'
import { mockDB } from '../mocks/db'
import { checkLeaveEligibility, EligibilityResult } from '../lib/eligibility'
import { getTodayIST } from '../lib/dates'

export interface EligibleStudentItem {
  student: Student
  subscription: Subscription
  eligibility: EligibilityResult
}

export interface ReviewExtensionPayload {
  studentId: string
  subscriptionId: string
  status: 'APPROVED' | 'REJECTED'
  daysAdded: number
  note?: string
  approvedByUserId?: string
}

export const extensionsApi = {
  getExtensions: async (params?: { studentId?: string }): Promise<LeaveExtension[]> => {
    if (USE_MOCKS) {
      let list = mockDB.getExtensions()
      if (params?.studentId) {
        list = list.filter((e) => e.studentId === params.studentId)
      }
      return mockDelay([...list])
    }

    const res = await apiClient.get<LeaveExtension[]>('/extensions', { params })
    return res.data
  },

  getEligibleStudents: async (): Promise<EligibleStudentItem[]> => {
    if (USE_MOCKS) {
      const students = mockDB.getStudents()
      const eligibleList: EligibleStudentItem[] = []
      const today = getTodayIST()

      for (const student of students) {
        const sub = mockDB.getSubscriptionByStudentId(student.id)
        if (!sub) continue

        const leaves = mockDB.getLeavesByStudentId(student.id)
        const eligibility = checkLeaveEligibility(
          { startDate: sub.startDate, lastDate: sub.lastDate },
          leaves,
          today
        )

        if (eligibility.isEligible) {
          eligibleList.push({
            student,
            subscription: sub,
            eligibility,
          })
        }
      }

      return mockDelay(eligibleList)
    }

    const res = await apiClient.get<EligibleStudentItem[]>('/extensions/eligible')
    return res.data
  },

  reviewExtension: async (payload: ReviewExtensionPayload): Promise<LeaveExtension> => {
    if (USE_MOCKS) {
      const sub = mockDB.getSubscriptionById(payload.subscriptionId)
      const oldLastDate = sub?.lastDate || ''
      const newLastDate =
        payload.status === 'APPROVED' && sub
          ? // Will be updated in db.createExtension
            oldLastDate
          : oldLastDate

      const ext = mockDB.createExtension({
        studentId: payload.studentId,
        subscriptionId: payload.subscriptionId,
        oldLastDate,
        newLastDate,
        daysAdded: payload.status === 'APPROVED' ? payload.daysAdded : 0,
        status: payload.status,
        note: payload.note,
        approvedByUserId: payload.approvedByUserId || 'user-admin',
      })

      return mockDelay(ext)
    }

    const res = await apiClient.post<LeaveExtension>('/extensions/review', payload)
    return res.data
  },
}

