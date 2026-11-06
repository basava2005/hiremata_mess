import { apiClient, mockDelay, tokenStorage, USE_MOCKS } from './client'
import { AuthResponse, User, PasswordResetRequest } from '../types'
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

      // Default credentials map for authorized administrators
      const defaultPasswords: Record<string, string> = {
        '8431413551': 'Chandu@143',
        '8073113562': 'Punith@143',
        '9353198281': 'Basava@143',
      }

      // Check password if custom password was set or matches default
      const rawPasswords = sessionStorage.getItem('messpro_passwords') || '{}'
      const registry = JSON.parse(rawPasswords)
      const expectedPassword = registry[user.mobile] || defaultPasswords[user.mobile] || 'password123'
      if (credentials.password && credentials.password !== expectedPassword) {
        throw new Error('Incorrect password. Please verify your credentials.')
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
    const res = await apiClient.post('/auth/password/change', {
      newPassword: _newPass,
    })
    return res.data
  },

  resetPassword: async (mobile: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCKS) {
      const raw = sessionStorage.getItem('messpro_passwords') || '{}'
      const registry = JSON.parse(raw)
      registry[mobile] = newPassword
      sessionStorage.setItem('messpro_passwords', JSON.stringify(registry))
      return mockDelay({ success: true, message: 'Password reset successfully!' })
    }
    const res = await apiClient.post('/auth/password/change', {
      mobile,
      newPassword,
    })
    return res.data
  },

  submitPasswordResetRequest: async (
    mobile: string,
    requestedPassword: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; requestId: string; whatsappUrl?: string; data?: PasswordResetRequest }> => {
    if (USE_MOCKS) {
      const user = mockDB.getUserByUsernameOrMobile(mobile)
      if (!user) {
        throw new Error('No registered account found with this mobile number.')
      }
      const rawReqs = sessionStorage.getItem('messpro_reset_requests') || '[]'
      const reqs: PasswordResetRequest[] = JSON.parse(rawReqs)
      const newReq: PasswordResetRequest = {
        id: `pw-req-${Date.now()}`,
        mobile,
        studentName: user.name,
        studentId: user.studentId || null,
        requestedPassword,
        status: 'PENDING',
        adminNote: reason || '',
        createdAt: new Date().toISOString(),
      }
      reqs.unshift(newReq)
      sessionStorage.setItem('messpro_reset_requests', JSON.stringify(reqs))
      const whatsappUrl = `https://api.whatsapp.com/send?phone=919353198281&text=${encodeURIComponent(
        `ನಮಸ್ಕಾರ Admin, I have submitted a password reset request for my Hiremat Mess account (+91 ${mobile}). Please verify and accept.`
      )}`
      return mockDelay({
        success: true,
        message: 'Password reset request submitted successfully! Awaiting Admin verification.',
        requestId: newReq.id,
        whatsappUrl,
        data: newReq,
      })
    }

    const res = await apiClient.post('/auth/password/reset-request', {
      mobile,
      requestedPassword,
      reason,
    })
    return res.data
  },

  getPasswordResetRequests: async (status?: string): Promise<PasswordResetRequest[]> => {
    if (USE_MOCKS) {
      const rawReqs = sessionStorage.getItem('messpro_reset_requests') || '[]'
      let reqs: PasswordResetRequest[] = JSON.parse(rawReqs)
      if (status) {
        reqs = reqs.filter((r) => r.status === status.toUpperCase())
      }
      return mockDelay(reqs, 50)
    }

    const res = await apiClient.get<PasswordResetRequest[]>('/auth/password/reset-requests', {
      params: status ? { status } : undefined,
    })
    return res.data
  },

  approvePasswordResetRequest: async (
    id: string,
    newPassword?: string,
    adminNote?: string
  ): Promise<{ success: boolean; message: string; whatsappUrl?: string; data?: PasswordResetRequest }> => {
    if (USE_MOCKS) {
      const rawReqs = sessionStorage.getItem('messpro_reset_requests') || '[]'
      const reqs: PasswordResetRequest[] = JSON.parse(rawReqs)
      const target = reqs.find((r) => r.id === id)
      if (!target) throw new Error('Request not found')
      target.status = 'APPROVED'
      target.approvedAt = new Date().toISOString()
      if (adminNote) target.adminNote = adminNote

      // update password registry
      const rawPasswords = sessionStorage.getItem('messpro_passwords') || '{}'
      const registry = JSON.parse(rawPasswords)
      const finalPwd = newPassword || target.requestedPassword || 'password123'
      registry[target.mobile] = finalPwd
      sessionStorage.setItem('messpro_passwords', JSON.stringify(registry))
      sessionStorage.setItem('messpro_reset_requests', JSON.stringify(reqs))

      const whatsappUrl = `https://api.whatsapp.com/send?phone=91${target.mobile}&text=${encodeURIComponent(
        `ನಮಸ್ಕಾರ ${target.studentName},\nYour Hiremat Mess password reset request has been APPROVED by Mess Admin.\nYour new password is: ${finalPwd}\n\n📍 BIET Rd, Davangere\n📞 9353198281`
      )}`

      return mockDelay({
        success: true,
        message: `Password updated successfully for ${target.studentName}!`,
        whatsappUrl,
        data: target,
      })
    }

    const res = await apiClient.post(`/auth/password/reset-requests/${id}/approve`, {
      newPassword,
      adminNote,
    })
    return res.data
  },

  rejectPasswordResetRequest: async (
    id: string,
    adminNote?: string
  ): Promise<{ success: boolean; message: string; data?: PasswordResetRequest }> => {
    if (USE_MOCKS) {
      const rawReqs = sessionStorage.getItem('messpro_reset_requests') || '[]'
      const reqs: PasswordResetRequest[] = JSON.parse(rawReqs)
      const target = reqs.find((r) => r.id === id)
      if (!target) throw new Error('Request not found')
      target.status = 'REJECTED'
      if (adminNote) target.adminNote = adminNote
      sessionStorage.setItem('messpro_reset_requests', JSON.stringify(reqs))
      return mockDelay({ success: true, message: 'Password reset request rejected.', data: target })
    }

    const res = await apiClient.post(`/auth/password/reset-requests/${id}/reject`, {
      adminNote,
    })
    return res.data
  },
}

