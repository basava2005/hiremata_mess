// OTP Verification & Password Management Service
import { sendFirebaseNotification } from './firebase'
import { mockDB } from '../mocks/db'

interface StoredOtp {
  mobile: string
  otp: string
  expiresAt: number
  attempts: number
}

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

export const otpService = {
  /**
   * Generates and dispatches a 6-digit OTP to the student's mobile number
   */
  sendOtp: async (
    mobile: string,
    purpose: 'PASSWORD_CHANGE' | 'PASSWORD_RESET' = 'PASSWORD_CHANGE'
  ): Promise<{ success: boolean; message: string; demoOtp: string }> => {
    // Generate secure 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + OTP_EXPIRY_MS

    const stored: StoredOtp = {
      mobile,
      otp,
      expiresAt,
      attempts: 0,
    }

    sessionStorage.setItem(`otp_${mobile}`, JSON.stringify(stored))

    const maskedMobile = `+91 ******${mobile.slice(-4)}`
    const purposeText = purpose === 'PASSWORD_RESET' ? 'Password Reset' : 'Password Change'
    const title = `Security OTP • Hiremat Mess`
    const body = `Your ${purposeText} OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`

    // Dispatch via Firebase Notification
    sendFirebaseNotification(title, body, {
      tag: 'hiremat-otp',
      type: 'SECURITY_OTP',
      otp,
    })

    return {
      success: true,
      message: `OTP sent successfully to ${maskedMobile}`,
      demoOtp: otp,
    }
  },

  /**
   * Verifies the entered OTP
   */
  verifyOtp: (mobile: string, enteredOtp: string): { valid: boolean; error?: string } => {
    const raw = sessionStorage.getItem(`otp_${mobile}`)
    if (!raw) {
      return { valid: false, error: 'No active OTP found. Please request a new OTP.' }
    }

    try {
      const stored: StoredOtp = JSON.parse(raw)

      if (Date.now() > stored.expiresAt) {
        sessionStorage.removeItem(`otp_${mobile}`)
        return { valid: false, error: 'OTP has expired. Please request a new one.' }
      }

      if (stored.attempts >= MAX_ATTEMPTS) {
        sessionStorage.removeItem(`otp_${mobile}`)
        return { valid: false, error: 'Maximum verification attempts exceeded. Request a new OTP.' }
      }

      if (stored.otp.trim() !== enteredOtp.trim()) {
        stored.attempts += 1
        sessionStorage.setItem(`otp_${mobile}`, JSON.stringify(stored))
        return {
          valid: false,
          error: `Incorrect OTP entered. (${MAX_ATTEMPTS - stored.attempts} attempts remaining)`,
        }
      }

      // Valid OTP
      sessionStorage.removeItem(`otp_${mobile}`)
      return { valid: true }
    } catch {
      return { valid: false, error: 'Invalid verification session.' }
    }
  },

  /**
   * Updates password after OTP verification
   */
  updatePasswordWithOtp: async (
    mobile: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Verify OTP
    const verification = otpService.verifyOtp(mobile, otp)
    if (!verification.valid) {
      throw new Error(verification.error || 'OTP verification failed.')
    }

    // 2. Validate Password Strength (Min 6 characters)
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    // 3. Update in mock database
    mockDB.updateUserPassword(mobile, newPassword)

    // 4. Send Firebase Confirmation
    sendFirebaseNotification(
      'Password Updated • Security Alert',
      'Your MessPro student account password was successfully updated via OTP verification.'
    )

    return {
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.',
    }
  },
}

