import { apiClient } from './client'

export interface SendOtpResponse {
  success: boolean
  message: string
  mobile?: string
  whatsappUrl?: string
  expiresIn?: number
}

export interface VerifyOtpPayload {
  mobile: string
  otp: string
  newPassword: string
}

export interface SendReminderPayload {
  studentId?: string
  broadcast?: boolean
}

export interface SentReminderItem {
  studentId: string
  name: string
  mobile: string
  daysLeft: number
  whatsappUrl?: string
  reminderText?: string
}

export interface SendReminderResponse {
  success: boolean
  message: string
  reminders: SentReminderItem[]
}

export const remindersApi = {
  /**
   * Dispatches a real 6-digit OTP to the user's mobile via SMS / carrier
   */
  sendOtp: async (mobile: string, purpose: string = 'Password Reset'): Promise<SendOtpResponse> => {
    const { data } = await apiClient.post<SendOtpResponse>('/auth/otp/send', {
      mobile,
      purpose,
    })
    return data
  },

  /**
   * Verifies the OTP and resets the account password in PostgreSQL
   */
  verifyOtpAndResetPassword: async (payload: VerifyOtpPayload): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/auth/otp/verify-reset', payload)
    return data
  },

  /**
   * Sends renewal reminders via SMS, in-app notification & Firebase
   */
  sendReminder: async (payload: SendReminderPayload): Promise<SendReminderResponse> => {
    const { data } = await apiClient.post<SendReminderResponse>('/reminders/send', payload)
    return data
  },
}
