import { apiClient, mockDelay, tokenStorage, USE_MOCKS } from './client'
import { AuthResponse, User } from '../types'
import { mockDB } from '../mocks/db'

export interface LoginCredentials {
  mobile: string
  password?: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCKS) {
      const user = mockDB.getUserByUsernameOrMobile(credentials.mobile)
      if (!user) {
        throw new Error('User with this mobile/username does not exist')
      }

      // Check password if custom password was set
      const rawPasswords = sessionStorage.getItem('messpro_passwords') || '{}'
      const registry = JSON.parse(rawPasswords)
      const expectedPassword = registry[user.mobile] || 'password123'
      if (
        credentials.password &&
        credentials.password !== expectedPassword &&
        credentials.password !== 'password123'
      ) {
        throw new Error('Incorrect password. Please verify or reset using OTP.')
      }

      // Generate a mock JWT
      const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`
      tokenStorage.set(mockToken)

      const student = user.studentId ? mockDB.getStudentById(user.studentId) : undefined

      return mockDelay({
        token: mockToken,
        user,
        student: student || undefined,
      })
    }

    const res = await apiClient.post<AuthResponse>('/auth/login', credentials)
    if (res.data.token) {
      tokenStorage.set(res.data.token)
    }
    return res.data
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = tokenStorage.get()
    if (!token) return null

    if (USE_MOCKS) {
      // Extract userId from mock token format "mock-jwt-token-{userId}-{ts}"
      const parts = token.split('-')
      if (parts.length >= 4) {
        const userId = `${parts[3]}-${parts[4]}`
        const user = mockDB.getUserById(userId) || mockDB.getUserById(parts[3])
        if (user) return mockDelay(user, 100)
      }
      // Fallback to first user or default admin/student
      return mockDelay(mockDB.getUsers()[0], 100)
    }

    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },

  logout: async (): Promise<void> => {
    tokenStorage.clear()
    if (!USE_MOCKS) {
      try {
        await apiClient.post('/auth/logout')
      } catch {}
    }
  },

  changePassword: async (_oldPass: string, _newPass: string): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCKS) {
      return mockDelay({ success: true, message: 'Password updated successfully' })
    }
    const res = await apiClient.post('/auth/change-password', {
      oldPassword: _oldPass,
      newPassword: _newPass,
    })
    return res.data
  },
}

