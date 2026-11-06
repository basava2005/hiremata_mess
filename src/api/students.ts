import { apiClient, mockDelay, USE_MOCKS } from './client'
import { Student } from '../types'
import { mockDB } from '../mocks/db'

export interface GetStudentsParams {
  search?: string
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
}

export const studentsApi = {
  getStudents: async (params?: GetStudentsParams): Promise<Student[]> => {
    if (USE_MOCKS) {
      let list = mockDB.getStudents()

      if (params?.search) {
        const q = params.search.toLowerCase()
        list = list.filter(
          (s) => s.name.toLowerCase().includes(q) || s.mobile.includes(q) || s.address.toLowerCase().includes(q)
        )
      }

      if (params?.status && params.status !== 'ALL') {
        if (params.status === 'ACTIVE') {
          list = list.filter((s) => s.isActive)
        } else if (params.status === 'INACTIVE') {
          list = list.filter((s) => !s.isActive)
        }
      }

      return mockDelay([...list])
    }

    const res = await apiClient.get<Student[]>('/students', { params })
    return res.data
  },

  getStudentById: async (id: string): Promise<Student | null> => {
    if (USE_MOCKS) {
      const student = mockDB.getStudentById(id)
      return mockDelay(student || null)
    }

    const res = await apiClient.get<Student>(`/students/${id}`)
    return res.data
  },

  createStudent: async (data: {
    name: string
    mobile: string
    address: string
    password?: string
    username?: string
    monthlyFee?: number
    category?: string
  }): Promise<Student> => {
    if (USE_MOCKS) {
      const newStudent = mockDB.addStudent(
        {
          name: data.name,
          mobile: data.mobile,
          address: data.address,
          monthlyFee: data.monthlyFee || 3500,
          category: data.category || 'STANDARD',
          isActive: true,
        },
        data.password,
        data.username
      )
      return mockDelay(newStudent)
    }

    const res = await apiClient.post<Student>('/students', data)
    return res.data
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<Student | null> => {
    if (USE_MOCKS) {
      const updated = mockDB.updateStudent(id, data)
      return mockDelay(updated)
    }

    const res = await apiClient.patch<Student>(`/students/${id}`, data)
    return res.data
  },

  deactivateStudent: async (id: string): Promise<Student | null> => {
    if (USE_MOCKS) {
      const updated = mockDB.updateStudent(id, { isActive: false })
      return mockDelay(updated)
    }

    const res = await apiClient.post<Student>(`/students/${id}/deactivate`)
    return res.data
  },

  activateStudent: async (id: string): Promise<Student | null> => {
    if (USE_MOCKS) {
      const updated = mockDB.updateStudent(id, { isActive: true })
      return mockDelay(updated)
    }

    const res = await apiClient.post<Student>(`/students/${id}/activate`)
    return res.data
  },
}

